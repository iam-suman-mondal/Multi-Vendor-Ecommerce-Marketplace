package com.cdac.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminRespDto {
private String name;
    
    private String email;

    private String phoneNo;

    private String address;
    private Boolean isActive;

	public AdminRespDto(String name, String email, String phoneNo, String address,Boolean isActive) {
		super();
		this.name = name;
		this.email = email;
		this.phoneNo = phoneNo;
		this.address = address;
		this.isActive=isActive;
		
	}

	

   
    
//   
    

}
