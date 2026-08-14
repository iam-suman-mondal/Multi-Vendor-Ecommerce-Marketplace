package com.cdac.service;

import java.util.List;

import org.apache.catalina.mapper.Mapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdac.customExceptions.ResourceNotFoundException;
import com.cdac.dto.AddProductDto;
import com.cdac.dto.ApiResponse;
import com.cdac.dto.UpdateRequestDto;
import com.cdac.entities.Category;
import com.cdac.entities.Product;
import com.cdac.entities.ProductSales;
import com.cdac.repository.ProductRepository;
import com.cdac.repository.ProductSalesRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {
	private final ProductRepository productRepository;
	private final ModelMapper mapper;
	private final CentralLoggerService centralLogger;
	private final ProductEventService eventProducer;
	
	@Override
	@Transactional
	public ApiResponse addProduct(AddProductDto dto, String userRole) {
		
		Product product=mapper.map(dto, Product.class);
		Product newProduct=productRepository.save(product);
		centralLogger.info(
	            userRole,
	            dto.getVendorId(),
	            "Product added successfully"
	    );
		 eventProducer.sendProductCreated(
	                newProduct.getProductId()
	      );
		return new ApiResponse("Success", "Product Added Successfully");
	}
	
	@Override
	public Product getProductById(Long productId) {
		return productRepository.findById(productId).orElseThrow(()->new ResourceNotFoundException("Invalid Product Id"));
	}

	@Override
	public List<Product> getProductsByCategory(Category category) {
		int stock = 0;
		return productRepository.findByCategoryAndAvailableQuantityGreaterThan(category, stock);
	}

	@Override
	public List<Product> getAllProducts(Long vendorId) {
		return productRepository.findByVendorId(vendorId);
	}

	@Override
	@Transactional
	public Product updateProduct(Long vendorId,String userRole, UpdateRequestDto dto) {
		Product product= productRepository.findByProductIdAndVendorId(dto.getProductId(), vendorId).orElseThrow(()->new ResourceNotFoundException("Invalid Update"));
		  product.setName(dto.getName());
		    product.setDescription(dto.getDescription());
		    product.setPrice(dto.getPrice());
		    product.setImage(dto.getImage());
		    product.setCategory(dto.getCategory());
		    product.setAvailableQuantity(dto.getQuantity());
		   // product.setIsPublished(dto.getIsPublished());
		    
		    Product updatedProduct=productRepository.save(product);
		    centralLogger.info(
		            userRole,
		            vendorId,
		            "Product added successfully"
		    );
		    
		    eventProducer.sendProductUpdated(
	                updatedProduct.getProductId()
	      );
		return updatedProduct;
	}

	@Override
	@Transactional
	public void deleteProductById(Long userId,String userRole, Long productId) {
		
		Product product = productRepository
	            .findByProductId(productId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "Product not found"
	                    ));
		
		if(userRole.equals("ROLE_VENDOR") && product.getVendorId().equals(userId)) {
				productRepository.delete(product);
				centralLogger.info(
			            userRole,
			            userId,
			            "Product "+productId+" deleted successfully"
			    );
				
				 eventProducer.sendProductDeleted(
			               productId
			      );
				
		}
		else if(userRole.equals("ROLE_ADMIN")) {
		productRepository.delete(product);
		centralLogger.info(
	            userRole,
	            userId,
	            "Product "+productId+" deleted successfully"
	    );
		
		 eventProducer.sendProductDeleted(
	               productId
	      );}
		else {
			throw new RuntimeException(
                    "Vendor is not authorized to delete this product");
		}
	}

	@Override
	@Transactional
	public void togglePublishStatus(Long vendorId, Long productId) {
		Product product = productRepository
	            .findByProductIdAndVendorId(productId, vendorId)
	            .orElseThrow(() ->
	                    new ResourceNotFoundException(
	                            "Product not found"
	                    ));
		product.setIsPublished(!product.getIsPublished());
		productRepository.save(product);
	}

	@Override
	public Long getMyProductCount(Long vendorId) {
		return productRepository.countByVendorId(vendorId);
	}

	@Override
	public List<Product> getByProductName(String keyword) {
		return productRepository.findByNameContainingIgnoreCase(keyword);
	}

	@Override
	public List<Product> getAllProduct() {
		return productRepository.findAll();
	}
	

}
