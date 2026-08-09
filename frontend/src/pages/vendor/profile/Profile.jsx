import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getVendorProfile } from "../../../apis/services/user-service"; // Import service
import { toast, ToastContainer } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '••••••••',
    phoneNo: '',
    address: '',
    companyName: '',
    gstNo: '',
    panNo: ''
  });

  const [loading, setLoading] = useState(true);

  // Fetch real profile data from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getVendorProfile();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          password: '••••••••', // Never display real password back
          phoneNo: data.phoneNo || '',
          address: data.address || '',
          companyName: data.companyName || '',
          gstNo: data.gstNo || '',
          panNo: data.panNo || ''
        });
      } catch (error) {
        toast.error("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
// Helper to generate initials (e.g., "Suman Mondal" -> "SM")
  const getInitials = (name) => {
    if (!name) return 'V';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  if (loading) {
    return <div className="text-center py-5 fw-bold">Loading profile...</div>;
  }
  

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          
          <div className="card border-0 shadow-sm p-4 p-md-5 bg-white">
         <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between pb-4 mb-4 border-bottom">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold me-3 shadow-sm"
                  style={{ width: '48px', height: '48px', fontSize: '1rem' }}
                >
                  {getInitials(formData.name)}
                </div>
                <div>
                  <h2 className="fw-bold text-dark mb-0 fs-4">{formData.name || "Vendor"}</h2>
                  <p className="text-muted m-0 small">Vendor</p>
                </div>
              </div>
              <div className="mt-3 mt-sm-0">
                <span className="badge bg-dark px-3 py-2 fs-6 fw-semibold rounded">
                  PAN: {formData.panNo}
                </span>
              </div>
            </div>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Full Name</label>
                <input type="text" className="form-control bg-light" value={formData.name} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Phone Number</label>
                <input type="text" className="form-control bg-light" value={formData.phoneNo} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Email Address</label>
                <input type="email" className="form-control bg-light" value={formData.email} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Account Password</label>
                <input type="text" className="form-control bg-light text-muted" value={formData.password} readOnly />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-secondary small">Legal Business Name (Company)</label>
                <input type="text" className="form-control bg-light fw-semibold text-dark" value={formData.companyName} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">GSTIN / Tax Registration</label>
                <input type="text" className="form-control bg-light font-monospace" value={formData.gstNo} readOnly />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">PAN Number</label>
                <input type="text" className="form-control bg-light" value={formData.panNo} readOnly />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold text-secondary small">Registered Operational Address</label>
                <textarea className="form-control bg-light" rows="2" value={formData.address} readOnly />
              </div>

              <div className="col-12 pt-3 border-top d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-primary px-5 fw-bold shadow-sm"
                  onClick={() => navigate('/vendor/profile/edit')}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          

        </div>
      </div>
    </div>
  );
};

export default Profile;