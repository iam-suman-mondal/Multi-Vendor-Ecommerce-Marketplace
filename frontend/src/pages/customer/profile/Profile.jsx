import React, { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const [user, setUser] = useState({
    name: "Prathamesh Rayke Gajanan",
    email: "prathameshrayke1@gmail.com",
    phone: "9119629523",
    address: "Ghorkpur",
  });
const handlerSave = () => {
  setIsEditing(false);
  toast.success("Profile Updated Successfully");
};
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
    toast.success("Update Profile Successful");
  };

  return (
    <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow p-4" style={{ width: "500px" }}>
        <div className="text-center mb-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            width="100"
          />
          <h2 className="mt-2">Customer Profile</h2>
        </div>

        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Name</th>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={user.name}
                    onChange={handleChange}
                  />
                ) : (
                  user.name
                )}
              </td>
            </tr>

            <tr>
              <th>Email</th>
              <td>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={user.email}
                    onChange={handleChange}
                  />
                ) : (
                  user.email
                )}
              </td>
            </tr>

            <tr>
              <th>Phone</th>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={user.phone}
                    onChange={handleChange}
                  />
                ) : (
                  user.phone
                )}
              </td>
            </tr>

            <tr>
              <th>Address</th>
              <td>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={user.address}
                    onChange={handleChange}
                  />
                ) : (
                  user.address
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="d-grid gap-2">
          {isEditing ? (
            <button
              className="btn btn-success"
              onClick={handlerSave}
            >
              Save
            </button>
          ) : (
            <button
              className="btn btn-warning"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}

          <button
            className="btn btn-info"
            onClick={() => navigate("/customer/orders")}
          >
            Order History
          </button>

          <button
            className="btn btn-danger"
            onClick={() => navigate("/auth/customer/login")}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;