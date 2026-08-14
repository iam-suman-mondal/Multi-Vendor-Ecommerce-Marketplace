package com.cdac.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cdac.entities.Category;
import com.cdac.entities.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{

	List<Product> findByCategoryAndAvailableQuantityGreaterThan(Category category, int quantity);

	List<Product> findByVendorId(Long vendorId);

	Optional<Product> findByProductIdAndVendorId(Long productId, Long vendorId);

	Optional<Product> findByProductId(Long productId);

	Long countByVendorId(Long vendorId);

	List<Product> findByNameContainingIgnoreCase(String keyword);
	
	List<Product> findByProductIdIn(List<Long> ids);

}
