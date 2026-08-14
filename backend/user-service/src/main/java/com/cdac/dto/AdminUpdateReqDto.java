package com.cdac.dto;

import jakarta.validation.constraints.Email;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
  @Getter
 @Setter
 @NoArgsConstructor
public class AdminUpdateReqDto {
	 @NotNull(message = "ID is required")
		@Positive(message = "Id must be positive ")
		private  Long id;
	 @NotNull(message = "name is required")
    @Size(
        min = 3,
        max = 30,
        message = "Name must be between 3 and 30 characters"
    )
	 private String name;
	
	
	
	
        
	 @NotNull(message = "phoneNo is required")
    @Pattern(
        regexp = "^[0-9]{10}$",
        message = "Phone number must contain exactly 10 digits"
    )
		    private String phoneNo;
	
	
	 @NotNull(message = "phoneNo is required")
	    @Size(
	        max = 100,
	        message = "Address cannot exceed 100 characters"
	    )
	    private String address;
	

		

}
