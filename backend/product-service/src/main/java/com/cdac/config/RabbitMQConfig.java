package com.cdac.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String LOG_QUEUE = "central-logs";
    public static final String QUEUE_NAME = "ai.product.events";

    @Bean
    public Queue aiProductQueue() {
        return new Queue(QUEUE_NAME, true);
    }

    @Bean
    public Queue logQueue() {
        return new Queue(LOG_QUEUE, true);
    }
    
//    @Bean
//    public Queue notificationQueue() {
//    	
//    	return new Queue(NOTIFICATION_QUEUE, true);
//    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }


    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter
    ) {

        RabbitTemplate rabbitTemplate =
                new RabbitTemplate(connectionFactory);

        rabbitTemplate.setMessageConverter(messageConverter);

        return rabbitTemplate;
    }
}