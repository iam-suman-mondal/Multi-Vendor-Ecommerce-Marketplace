package com.cdac.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class ProductEventDto {
	@NotNull
    private String eventType;
	@NotNull
    private Long productId;

}