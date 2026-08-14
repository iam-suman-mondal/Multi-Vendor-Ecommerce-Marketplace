package com.cdac.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cashfree.pg.ApiException;
import com.cashfree.pg.ApiResponse;
import com.cashfree.pg.Cashfree;
import com.cashfree.pg.Cashfree.CFEnvironment;
import com.cashfree.pg.model.CreateOrderRequest;
import com.cashfree.pg.model.CustomerDetails;
import com.cashfree.pg.model.OrderEntity;
import com.cashfree.pg.model.OrderMeta;
import com.cdac.client.OrderServiceClient;
import com.cdac.config.CashfreeProperties;
import com.cdac.dto.CashfreeWebhookDto;
import com.cdac.dto.PaymentRequestDto;
import com.cdac.entity.Payment;
import com.cdac.entity.PaymentStatus;
import com.cdac.enums.OrderStatus;
import com.cdac.exception.ResourceNotFoundException;
import com.cdac.repository.PaymentRepository;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final CashfreeProperties cashfreeProperties;

	private final Cashfree cashfree;
	private final PaymentRepository paymentRepository;
	private final ObjectMapper objectMapper;
	private final OrderServiceClient orderServiceClient;
	private final CentralLoggerService loggerService;
	

    PaymentServiceImpl(
    		CashfreeProperties cashfreeProperties,
    		PaymentRepository paymentRepository, 
    		ObjectMapper objectMapper, 
    		OrderServiceClient orderServiceClient, 
    		CentralLoggerService loggerService) {
    	
    		this.cashfree = new Cashfree(
    				CFEnvironment.SANDBOX, 
    				cashfreeProperties.getClientId(), 
    				cashfreeProperties.getClientSecret(), 
    				null, null, null);
    		
    		this.paymentRepository = paymentRepository;
    		this.objectMapper = objectMapper;
    		this.orderServiceClient = orderServiceClient;
    		this.loggerService = loggerService;
    		this.cashfreeProperties = cashfreeProperties;
    }
	
	@Override
	@Transactional
	public String createPayment(PaymentRequestDto dto) {
		
		/*
		 * Create Cashfree Order
		 */
		CustomerDetails customerDetails = new CustomerDetails();
		customerDetails.setCustomerId(dto.getCustomerId().toString());
		customerDetails.setCustomerName(dto.getCustomerName());
		customerDetails.setCustomerEmail(dto.getCustomerEmail());
		customerDetails.setCustomerPhone(dto.getCustomerPhoneNo());

		OrderMeta orderMeta = new OrderMeta();
		orderMeta.setReturnUrl("https://indiamart-marketplace.vercel.app/customer/process-payment?orderId=" + dto.getOrderId());
        orderMeta.setNotifyUrl(cashfreeProperties.getBackendUrl() + "/api/payments/webhook");
		
        CreateOrderRequest request = new CreateOrderRequest();
        request.setOrderAmount(dto.getAmount());
        request.setOrderCurrency("INR");
        request.setOrderId(dto.getOrderId().toString());
        request.setCustomerDetails(customerDetails);
        request.setOrderMeta(orderMeta);

        String paymentSessionId = null;
		try {
		    ApiResponse<OrderEntity> response = cashfree.PGCreateOrder(request, null, null, null);
		    paymentSessionId = response.getData().getPaymentSessionId();
		} catch (ApiException e) { // Checked Exception
		    throw new RuntimeException(e);
		}
		
		if(paymentSessionId == null) {
			throw new RuntimeException("Payment Gateway Error");
		}
		
		/*
		 * Save Payment Details
		 */
		Payment newPayment = Payment.builder()
				.orderId(dto.getOrderId())
				.customerId(dto.getCustomerId())
				.customerPhoneNo(dto.getCustomerPhoneNo())
				.customerName(dto.getCustomerName())
				.customerEmail(dto.getCustomerEmail())
				.amount(dto.getAmount())
				.status(PaymentStatus.PENDING)
				.paymentSessionId(paymentSessionId)
				.build();
		
		paymentRepository.save(newPayment);
		
		/*
		 * Generate Log: Payment Initiated
		 */
		loggerService.info(
	            "ROLE_CUSTOMER",
	            dto.getCustomerId(),
	            "Payment Initiated"
	    );
		
		return paymentSessionId;
	}
	
	@Override
	@Transactional
	public void processWebhook(String rawBody,
	                           String signature,
	                           String timestamp) {
	
	    try {
	
	        // Verify webhook signature
	        cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
	
	        // Parse JSON
	        JsonNode root = objectMapper.readTree(rawBody);
	
	        // Extract required fields
	        CashfreeWebhookDto dto = CashfreeWebhookDto.builder()
	                .orderId(UUID.fromString(
	                        root.path("data")
	                                .path("order")
	                                .path("order_id")
	                                .asString()))
	                .cfPaymentId(root.path("data")
	                        .path("payment")
	                        .path("cf_payment_id")
	                        .asString())
	                .paymentStatus(root.path("data")
	                        .path("payment")
	                        .path("payment_status")
	                        .asString())
	                .paymentGroup(root.path("data")
	                        .path("payment")
	                        .path("payment_group")
	                        .asString())
	                .build();
	
	        Payment payment = paymentRepository.findByOrderId(dto.getOrderId())
	                .orElseThrow(() ->
	                        new ResourceNotFoundException("Payment not found"));
	
	        // Idempotency
	        if (payment.getStatus() == PaymentStatus.SUCCESS) {
	            return;
	        }
	
	        payment.setCfPaymentId(dto.getCfPaymentId());
	        payment.setPaymentMethod(dto.getPaymentGroup());
	
	        if ("SUCCESS".equals(dto.getPaymentStatus())) {
	            payment.setStatus(PaymentStatus.SUCCESS);
	
	            // Calling product service to CONFIRM reserved stock
	            orderServiceClient.updateOrderStatus(dto.getOrderId(), OrderStatus.CONFIRMED);
	        } else if ("FAILED".equals(dto.getPaymentStatus())) {
	            payment.setStatus(PaymentStatus.FAILED);
	
	            // Calling product service to RELEASE reserved stock
	            //orderServiceClient.updateOrderStatus(dto.getOrderId(), OrderStatus.CANCELLED);
	            
	        }
	
	        paymentRepository.save(payment);
	    } catch (ApiException e) {
			// Invalid webhook signature
	    		e.printStackTrace();
	    } catch (Exception e) {
	        throw new RuntimeException(e);
	    }
	}

	@Override
	public List<Payment> getRecentPayments() {
		return paymentRepository.findTop10ByOrderByUpdatedAtDesc();
	}

	@Override
	public Payment gePaymentsDetails(String cfPaymentId) {
		return paymentRepository.findByCfPaymentId(cfPaymentId)
				.orElseThrow(() -> new ResourceNotFoundException("Payment details not found"));
	}

}
