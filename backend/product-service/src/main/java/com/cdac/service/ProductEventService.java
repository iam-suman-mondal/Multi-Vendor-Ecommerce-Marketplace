package com.cdac.service;


import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.cdac.config.RabbitMQConfig;
import com.cdac.dto.ProductEventDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductEventService {

    private final RabbitTemplate rabbitTemplate;

    public void sendProductCreated(Long productId) {

        ProductEventDto event =
                new ProductEventDto(
                        "PRODUCT_CREATED",
                        productId
                );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.QUEUE_NAME,
                event
        );
    }

    public void sendProductUpdated(Long productId) {

        ProductEventDto event =
                new ProductEventDto(
                        "PRODUCT_UPDATED",
                        productId
                );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.QUEUE_NAME,
                event
        );
    }

    public void sendProductDeleted(Long productId) {

        ProductEventDto event =
                new ProductEventDto(
                        "PRODUCT_DELETED",
                        productId
                );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.QUEUE_NAME,
                event
        );
    }
}