package com.cdac.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cdac.dto.AdminDashboardAnalyticsDto;
import com.cdac.dto.ApiResponse;
import com.cdac.dto.CustomerProfileDTO;
import com.cdac.dto.VendorDto;
import com.cdac.service.AdminService;
import com.cdac.service.AuthService;
import com.cdac.service.CustomerService;
import com.cdac.service.VendorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
	private final CustomerService customerService;
	private final AuthService authService;
	private final VendorService vendorService;
	private final AdminService adminService;
	
	@GetMapping("/profile")
	public ResponseEntity<?> getAdminProfile(@RequestHeader("X-User-Id") Long adminId) {
		return ResponseEntity.ok(adminService.getAdminDetails(adminId));
	}
	
    // Customer-related API
    @GetMapping("/customers/{id}")
    @Validated
    public ResponseEntity<?> getCustomerDetailsById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerDetails(id));
    }

    // Only Admin can access this
    @GetMapping("/customers/all")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllCustomerDetails() {

        return ResponseEntity.ok(
                customerService.getAllCustomerDetails()
        );
    }
    @PutMapping("/customers/profile")
    public ResponseEntity<?> updateCustomerProfile(@Valid @RequestBody CustomerProfileDTO request) {
     
    	
        // update database 

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
               .body(customerService.updateProfile(request));

    
    }
    
    @PatchMapping("/ban-unban")
    public ResponseEntity<?> banUnban(
            @RequestHeader("X-User-Id") Long adminId,
            @RequestHeader("X-User-Email") String adminEmail,
            @RequestParam Long userId) {

        authService.banUnban(
                adminId,
                adminEmail,
                userId
        );

        return ResponseEntity.ok(
                "User ban/unban status updated successfully"
        );
    }
    
//    @PatchMapping("/update-password")
//    public ResponseEntity<?> updatePassword(
//            @RequestBody passwordDTO request) {
//
//        ApiResponse response = customerService.updatePassword(request);
//
//        return ResponseEntity.ok(response);
//    }
    
    // Only for Admin (returns customer and vendor count)
    @GetMapping("/dashboard/analytics")
    public ResponseEntity<AdminDashboardAnalyticsDto> getVendorDashboardAnalytics(@RequestParam String param) {
        Long totalCustomers = customerService.getCustomerCount();
        Long totalVendors = vendorService.getVendorCount();
        AdminDashboardAnalyticsDto res = new AdminDashboardAnalyticsDto(totalCustomers, totalVendors);
    	return ResponseEntity.ok(res);
    }
    
    //vendor endpoints
    
    //Get All Vendors
    @GetMapping("/vendors/all")
    public ResponseEntity<?> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }
    
    
    
    //Update Vendor by Admin using Path Variable
    @PutMapping("/update-vendor/{id}")
    public ResponseEntity<ApiResponse> updateVendor(
            @PathVariable Long id, 
            @Valid @RequestBody VendorDto vendorDto) {
        
        ApiResponse response = vendorService.updateVendor(id, vendorDto);
        return ResponseEntity.ok(response);
    }
    
    
 // Delete Vendor by Admin using Path Variable
    @DeleteMapping("/delete-vendor/{id}")
    public ResponseEntity<ApiResponse> deleteVendor(@PathVariable Long id) {
        ApiResponse response = vendorService.deleteVendor(id);
        return ResponseEntity.ok(response);
    }
    
    
    
}
