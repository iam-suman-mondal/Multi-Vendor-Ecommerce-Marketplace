package com.cdac.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cdac.custom_exceptions.ResourceNotFoundException;
import com.cdac.dto.AdminRespDto;
import com.cdac.dto.AdminUpdateReqDto;
import com.cdac.dto.ApiResponse;
import com.cdac.entities.User;
import com.cdac.repository.AdminRepository;
import com.cdac.repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@Transactional
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
private final AdminRepository adminRepo;
private final UserRepository userRepo;
	@Override 
	public  AdminRespDto getAdminDetails(Long id) {
		// TODO Auto-generated method stub
		User entity=userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invalid Admin ID"));
		AdminRespDto responseDto = new AdminRespDto(entity.getName(),entity.getEmail(),entity.getPhoneNo(),entity.getAddress()
		,entity.getIsActive());
		return responseDto;
		
	}
	@Override
	public ApiResponse updateAdminProfile(AdminUpdateReqDto request) {
		// TODO Auto-generated method stub
		User admin = userRepo.findById(request.getId())
	            .orElseThrow(() ->
	                new ResourceNotFoundException("Customer not found"));

	    admin.setName(request.getName());
	    admin.setPhoneNo(request.getPhoneNo());
	    admin.setAddress(request.getAddress());
	    

	    userRepo.save(admin);
		
		return new ApiResponse("success","updated");
	
	}
	
}
