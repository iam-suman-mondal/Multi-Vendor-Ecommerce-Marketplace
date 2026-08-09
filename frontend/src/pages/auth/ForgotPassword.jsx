import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { toast } from "react-toastify";
import { forgetPassword } from "../../apis/services/user-service";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const sendOtp = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
       const response = await forgetPassword({
      email,
    });

    toast.success(response.message || "OTP sent to your email");

    navigate("/auth/resetPassword", {
      state: { email },
    });

      toast.success(response.data);

      navigate("/auth/resetPassword", {
        state: { email },
      });
    } catch (error) {
      toast.error(
        error.response?.data || "Unable to send OTP"
      );
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex justify-content-center align-items-center"
    //   
    style={{
      minHeight: "100vh",
      backgroundColor: "#1a1a2e",
    }}
    >
      <div
        className="row shadow-lg rounded-4 overflow-hidden"
        style={{
          maxWidth: "1000px",
          width: "100%",
          backgroundColor: "#2b2638",
        }}
      >
        {/* Left Side Image */}
        <div className="col-lg-5 p-0">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
            alt="Forgot Password"
            className="img-fluid h-100 w-100"
            style={{
              objectFit: "cover",
              minHeight: "550px",
            }}
          />
        </div>

        {/* Right Side */}
        <div className="col-lg-7 p-5 text-white d-flex align-items-center">
          <div className="w-100">

            <h2 className="fw-bold mb-2">
              Forgot Password
            </h2>

            <p className="text-secondary mb-4">
              Enter your registered email to receive an OTP.
            </p>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Email Address
              </label>

              <input
                type="email"
                className="form-control text-white border-secondary"
                style={{ backgroundColor: "#3b3448" }}
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn w-100 py-3 fw-bold mb-3"
              style={{
                background: "#8b5cf6",
                color: "white",
                border: "none",
              }}
              onClick={sendOtp}
            >
              Send OTP
            </button>

            <button
              type="button"
              className="btn btn-outline-light w-100"
              onClick={() => navigate("/auth/login")}
            >
              Back to Login
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;