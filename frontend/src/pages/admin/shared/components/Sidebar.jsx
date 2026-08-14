import { useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { logout } from "../../../../redux/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // handle logout function
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Successfully logged out")
    navigate('/')
  } 

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        className="btn btn-dark d-md-none m-3 position-absolute z-3"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#adminSidebar"
        aria-controls="adminSidebar"
      >
        ☰ Menu
      </button>

      {/* Responsive Offcanvas Sidebar */}
      <aside
        className="offcanvas-md offcanvas-start bg-white border-end d-flex flex-column shadow-sm"
        tabIndex="-1"
        id="adminSidebar"
        aria-labelledby="adminSidebarLabel"
        style={{ width: "250px" }}
      >
        {/* Mobile Header */}
        <div className="offcanvas-header d-md-none border-bottom">
          <h5 className="offcanvas-title" id="adminSidebarLabel">
            <Link to='/admin' className="text-decoration-none" style={{'cursor': 'pointer'}}>IndiaMart</Link>
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            data-bs-target="#adminSidebar"
            aria-label="Close"
          ></button>
        </div>

        {/* Sidebar Body */}
        <div className="offcanvas-body d-flex flex-column p-3 h-100">
          {/* Desktop Header */}
          <h4 className="d-none d-md-block border-bottom pb-3 mb-3 fw-bold">
            <Link to='/admin' className="text-decoration-none" style={{'cursor': 'pointer'}}>IndiaMart</Link>
          </h4>

          {/* Navigation Links */}
          <nav className="flex-fill">
            <ul className="nav nav-pills flex-column gap-2 mb-auto">
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  end // active only when admin on dashboard
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : "link-dark"}`
                  }
                >
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/admin/customers"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : "link-dark"}`
                  }
                >
                  Customers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/admin/vendors"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : "link-dark"}`
                  }
                >
                  Vendors
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/admin/products"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : "link-dark"}`
                  }
                >
                  Products
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/admin/orders"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : "link-dark"}`
                  }
                >
                  Orders
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/admin/payments"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : "link-dark"}`
                  }
                >
                  Payments
                </NavLink>
              </li>
            </ul>
          </nav>

          <hr />
          {/* Footer Profile & Logout */}
          <div className="mt-auto">
            {/* Profile Section */}
            <Link to="/admin/profile" className="d-flex text-decoration-none align-items-center gap-2 mb-3 px-2">
              <div className="position-relative">
                <img
                  src="https://ui-avatars.com/api/?name=Suman+Mondal&background=random"
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
                {/* Green Status Dot */}
                <span
                  className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                  style={{
                    width: "10px",
                    height: "10px",
                    transform: "translate(-20%, -20%)",
                  }}
                ></span>
              </div>

              <div className="d-flex flex-column lh-1">
                <span
                  className="fw-bold text-dark"
                  style={{ fontSize: "0.9rem" }}
                >
                  Suman Mondal
                </span>
                <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Admin
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button className="btn btn-outline-danger w-100" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
