package com.cdac.service;

import com.cdac.dto.AdminRespDto;
import com.cdac.dto.AdminUpdateReqDto;
import com.cdac.dto.ApiResponse;

public interface AdminService {

	AdminRespDto getAdminDetails(Long id);

	ApiResponse updateAdminProfile( AdminUpdateReqDto request);

}
