import React from 'react'
import { useNavigate,Link } from "react-router";

import { useState } from 'react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ForgotPassword from './ForgotPassword';
import { customerSignup } from '../../apis/services/user-service';


const CustomerSignup = () => {

  // useState
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  phoneNo: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
});
  const navigate = useNavigate();

  // Common handler for all fields
   const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
   // Submit form
  const signupHandler = async(e) => {
    e.preventDefault();

    const {
      name,
      email,
      password,
      phoneNo,
      city,
      state,
      pincode,
      address,
    } = formData;



    // validation on field 
    if (
      !name ||
      !email ||
      !password ||
      !phoneNo||
      !city ||
      !state ||
      !pincode ||
      !address
    ) {
      toast.error("Please fill all fields");
      return;
    }
    try {

       console.log(formData);

   const response = await customerSignup(formData);

    // alert(response.data);
   

    toast.success(response.message);


    // Go to OTP page
    navigate("/auth/customer/verifysignup", {
      state: {
        email: formData.email,
      },
    });

  } catch (error) {
    toast.error("Customer Already Exit/ Invalid Otp")
  console.log(error);
  console.log(error.response);
  console.log(error.response?.status);
  console.log(error.response?.data);
}

  

  

  
 
  }
  return (
     <div
  // className="row shadow-lg rounded-4 overflow-hidden"
  // style={{
  //   width: "1100px",
  //   backgroundColor: "#2b2638",
  // }}
  className="container-fluid d-flex justify-content-center align-items-center"
    style={{
      minHeight: "100vh",
      backgroundColor: "#1a1a2e",
    }}
>
  <div
      className="row shadow-lg rounded-4 overflow-hidden"
      style={{
        width: "1100px",
        maxWidth: "95%",
        backgroundColor: "#2b2638",
      }}
    >
  
  {/* Left Side */}
  <div className="col-md-5 p-0">
    <img
      src="https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800"
      alt="Signup"
      className="img-fluid h-100 w-100"
      style={{
        objectFit: "cover",
      }}
    />
  </div>

  {/* Right Side */}
  <div className="col-md-7 p-5 text-white">

    <h2 className="fw-bold mb-3 text-center" >
      Customer Signup
    </h2>

    

    {/* PASTE YOUR EXISTING <form> HERE */}

   <form onSubmit={signupHandler}>
  {/* Name */}
  <div className="row mb-3">
    <label className="col-md-3 col-form-label fw-bold">
      Name
    </label>
    <div className="col-md-9">
      <input
        type="text"
        className="form-control"
        placeholder="Enter Name"
        value={formData.name}
        onChange={handleChange}
        name="name"
      />
    </div>
  </div>

  {/* Email */}
  <div className="row mb-3">
    <label className="col-md-3 col-form-label fw-bold">
      Email
    </label>
    <div className="col-md-9">
      <input
        type="email"
        className="form-control"
        placeholder="Enter Email"
        value={formData.email}
        onChange={handleChange}
        name="email"
      />
    </div>
  </div>

  {/* Password */}
  <div className="row mb-3">
    <label className="col-md-3 col-form-label fw-bold">
      Password
    </label>
    <div className="col-md-9">
      <input
        type="password"
        className="form-control"
        placeholder="Enter Password"
        value={formData.password}
        onChange={handleChange}
        name="password"
      />
    </div>
  </div>

  {/* Phone */}
  <div className="row mb-3">
    <label className="col-md-3 col-form-label fw-bold">
      Phone
    </label>
    <div className="col-md-9">
      <input
        type="text"
        className="form-control"
        placeholder="Enter Phone Number"
        value={formData.phoneNo}
        onChange={handleChange}
        name="phoneNo"
      />
    </div>
  </div>

  
  {/* Address */}
  <div className="row mb-4">
    <label className="col-md-3 col-form-label fw-bold">
      Address
    </label>
    <div className="col-md-9">
      <textarea
        className="form-control"
        rows="3"
        value={formData.address}
        onChange={handleChange}
        placeholder="Enter Address"
        name="address"
      ></textarea>
    </div>
  </div>

  
  
    <div className="row mb-4">

  {/* City */}
  <div className="col-md-6">
    <div className="row align-items-center">
      <label className="col-md-6 col-form-label fw-bold">
        Pincode
      </label>

      <div className="col-md-6">
        <input
          type="text"
          className="form-control"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          placeholder="Pincode"
           maxLength={6}
  pattern="[0-9]{6}"
  
        />
      </div>
    </div>
  </div>

  {/* State */}
  <div className="col-md-6">
    <div className="row align-items-center ms-2">
      <label className="col-md-3 col-form-label fw-bold">
        State
      </label>

      <div className="col-md-9 ">
        <select
          className="form-control"
          name="state"
          value={formData.state}
          onChange={handleChange}
        >
          <option value="">Select State</option>
          <option>Maharashtra</option>
          <option>Delhi</option>
          <option>Karnataka</option>
          <option>Uttar Pradesh</option>
          <option>Gujarat</option>
          <option>Tamil Nadu</option>
        </select>
      </div>
    </div>
  </div>

</div>
<div className="row mb-3">
    <label className="col-md-3 col-form-label fw-bold">
      City
    </label>
    <div className="col-md-6">
      <input
        type="text"
        className="form-control"
        
        value={formData.city}
        onChange={handleChange}
         placeholder="Enter City"
        name="city"
      />
    </div>
  </div>

 
  {/* Submit Button */}
  <div className="d-grid gap-2 mt-4">
    <button
      type="submit"
      className="btn btn-success btn-lg"
      style={{
                background: "#8b5cf6",
                color: "#fff",
                border: "none",
              }}
    >
      Sign Up
    </button>

    <p className="text-center mb-0 mt-3  text-white mb-4">
      Already have an account?
      <Link
        to="/auth/customer/login"
        className="text-decoration-none fw-semibold ms-1"
      >
        Log In
      </Link>
    </p>
  </div>
</form>
  </div>
  </div>

</div>
  )
}

export default CustomerSignup