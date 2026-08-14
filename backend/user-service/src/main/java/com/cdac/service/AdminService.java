package com.cdac.service;

import org.jspecify.annotations.Nullable;

import com.cdac.dto.AdminRespDto;
import com.cdac.dto.AdminUpdateReqDto;
import com.cdac.dto.ApiResponse;

import jakarta.validation.Valid;

public interface AdminService {

//	@Nullable
	AdminRespDto getAdminDetails(Long id);

//	@Nullable
	ApiResponse updateAdminProfile( AdminUpdateReqDto request);

}
