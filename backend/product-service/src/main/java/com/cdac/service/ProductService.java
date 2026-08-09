package com.cdac.service;

import java.net.URI;
import java.util.List;

import org.jspecify.annotations.Nullable;

import com.cdac.dto.AddProductDto;
import com.cdac.dto.ApiResponse;
import com.cdac.dto.UpdateRequestDto;
import com.cdac.entities.Category;
import com.cdac.entities.Product;

public interface ProductService {

	ApiResponse addProduct(AddProductDto dto, String userId);

	Product getProductById(Long productId);
	
	List<Product> getProductsByCategory(Category category);

	List<Product> getAllProducts(Long vendorId);

	Product updateProduct(Long vendorId,String userRole, UpdateRequestDto dto);

	void deleteProductById(Long vendorId,String userRole, Long productId);

	void togglePublishStatus(Long vendorId, Long productId);

	Long getMyProductCount(Long vendorId);

	List<Product> getByProductName(String productName);

	List<Product> getAllProduct();
	

}
