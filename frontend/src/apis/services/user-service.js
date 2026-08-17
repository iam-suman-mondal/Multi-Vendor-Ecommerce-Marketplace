import api from "../config/interceptors";

// =========================================================================
// 1. AUTH SERVICE API CALLS (Login, Signup, Password Resets, Token Refresh)
// =========================================================================

/**
 * Authenticates a user using email/username and password.
 * @param {Object} credentials - Contains login details (e.g., { email, password })
 * @returns {Promise} - Returns JWT tokens and user role data
 */
export const login = async (credentials) => {
  const response = await api.post(`/auth/login`, credentials);
  return response.data;
};

/**
 * Requests a new access token using the stored refresh token.
 * @param {String} refreshToken - The long-lived refresh token
 * @returns {Promise} - Returns a new access token
 */
export const refreshTokenApi = async (refreshToken) => {
  const response = await api.post(`/auth/refresh`, null, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  return response.data;
};

/**
 * Initiates customer registration by triggering an OTP generation[cite: 3].
 * @param {Object} payload - Customer details (e.g., name, email, password)[cite: 3]
 */
export const customerSignup = async (payload) => {
  const response = await axios.post(`/auth/customers/signup`, payload);
  return response.data;
};

/**
 * Verifies the OTP and completes the customer registration process[cite: 3].
 * @param {Object} payload - Contains email and the entered OTP
 */
export const verifyCustomerSignup = async (payload) => {
  const response = await api.post(`/auth/customers/verify-signup`, payload);
  return response.data;
};

/**
 * Initiates vendor registration by sending an OTP to the vendor's email[cite: 3].
 * @param {Object} payload - Vendor details (business name, email, etc.)[cite: 3]
 */
export const vendorSignup = async (payload) => {
  const response = await api.post(`/auth/vendor-signup`, payload);
  return response.data;
};

/**
 * Verifies vendor OTP and finalizes their registration[cite: 3].
 * @param {Object} payload - Contains email and OTP
 */
export const verifyVendorSignup = async (payload) => {
  const response = await api.post(`/auth/verify-vendor-signup`, payload);
  return response.data;
};

/**
 * Updates the user's password while logged in[cite: 3].
 * @param {Object} payload - Contains old and new password fields
 */
export const updatePassword = async (payload) => {
  const response = await api.patch(`/auth/update-password`, payload);
  return response.data;
};

/**
 * Triggers a password reset email/OTP if the user forgot their password[cite: 3].
 * @param {Object} payload - Contains user email
 */
export const forgetPassword = async (payload) => {
  const response = await api.post(`/auth/forget-password`, payload);
  return response.data;
};

/**
 * Resets the password using the token/OTP received from forget password[cite: 3].
 * @param {Object} payload - Contains email, OTP/token, and new password
 */
export const resetPassword = async (payload) => {
  const response = await api.post(`/auth/reset-password`, payload);
  return response.data;
};


// =========================================================================
// 2. CUSTOMER SERVICE API CALLS
// =========================================================================

/**
 * Deletes the currently logged-in customer's profile[cite: 4].
 */
export const deleteCustomerProfile = async () => {
  const response = await api.delete(`/customers/profile`);
  return response.data;
};

/**
 * Fetches the currently logged-in customer's profile.
 */
export const getCustomerProfile = async () => {
  const response = await api.get(`/customers/profile`);
  return response.data;
};


/**
 * Updates the currently logged-in customer's profile.
 * @param {Object} payload - Updated customer details
 */
export const updateCustomerProfile = async (payload) => {
  const response = await api.put(`/customers/profile`, payload);
  return response.data;
};



// =========================================================================
// 3. VENDOR SERVICE API CALLS
// =========================================================================

/**
 * Fetches the profile information for the currently logged-in vendor[cite: 6].
 */
export const getVendorProfile = async () => {
  const response = await api.get(`/vendor/profile`);
  return response.data;
};

/**
 * Updates the currently logged-in vendor's profile information[cite: 6].
 * @param {Object} payload - Updated vendor details
 */
export const updateVendorProfile = async (payload) => {
  const response = await api.put(`/vendor/profile`, payload);
  return response.data;
};

/**
 * Deletes the currently logged-in vendor's profile[cite: 6].
 */
export const deleteVendorProfile = async () => {
  const response = await api.delete(`/vendor/profile`);
  return response.data;
};


// =========================================================================
// 4. ADMIN SERVICE API CALLS
// =========================================================================

/*
 * Fetches Admin Profile 
 */
export const getAdminProfile = async () => {
  const response = await api.get(`/admin/profile`);
  return response.data;
} 

/**
 * Fetches a specific customer's details by their database ID (Admin only).
 * @param {Number} id - Customer ID
 */
export const getCustomerDetailsById = async (id) => {
  const response = await api.get(`/admin/customers/${id}`);
  return response.data;
};

/**
 * Fetches a list of all registered customers (Admin only)[cite: 2].
 */
export const getAllCustomerDetails = async () => {
  const response = await api.get(`/admin/customers/all`);
  return response.data;
};

/**
 * Updates a customer profile as an administrator[cite: 2].
 * @param {Object} payload - Customer profile DTO data[cite: 2]
 */
export const updateCustomerProfileByAdmin = async (payload) => {
  const response = await api.put(`/admin/customers/profile`, payload);
  return response.data;
};

/**
 * Bans or unbans a user account[cite: 2].
 * @param {Number} userId - ID of the user to toggle status
 */
export const banUnbanUser = async (userId) => {
  const response = await api.patch(`/admin/ban-unban?userId=${userId}`);
  return response.data;
};

/**
 * Retrieves a list of all vendors in the system (Admin only)[cite: 2].
 */
export const getAllVendorsByAdmin = async () => {
  const response = await api.get(`/admin/vendors/all`);
  return response.data;
};

/**
 * Get Customer and Vendor Count
 */
export const getAllCustomerAndVendorCount = async () => {
  const response = await api.get(`/admin/dashboard/analytics?param=_temp`);
  return response.data;
};

/**
 * Updates vendor details via admin control[cite: 2].
 * @param {Number} id - Vendor ID[cite: 2]
 * @param {Object} payload - Vendor DTO data[cite: 2]
 */
export const updateVendorByAdmin = async (id, payload) => {
  const response = await api.put(`/admin/update-vendor/${id}`, payload);
  return response.data;
};

/**
 * Deletes a vendor account by ID (Admin only)[cite: 2].
 * @param {Number} id - Vendor ID[cite: 2]
 */
export const deleteVendorByAdmin = async (id) => {
  const response = await api.delete(`/admin/delete-vendor/${id}`);
  return response.data;
};