import axios from "axios";
import React, { useEffect, useState } from "react";

import "./accounts.scss";
import formatPhilippinePhoneNumber from "../../helper/phoneFormat";
import { useNavigate } from "react-router-dom";

const Accounts = () => {
  const [admins, setAdmin] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("/getAdmin");
      
        const adminData = response.data.admin;
        console.log("API Response:", adminData);
        setAdmin(adminData || []);

      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };

    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/deleteAdmin/${id}`);
      setAdmin(admins.filter((e) => e._id !== id));
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleUpdate = async (id) => {
    const formattedPhoneNumber = formatPhilippinePhoneNumber(phoneNumber);

    try {
      await axios.put(`/updateAdmin/${id}`, {
        email,
        name,
        password,
        phoneNumber: formattedPhoneNumber,
      });
      closeUpdateModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  const openUpdateModal = (admin) => {

    setSelectedAdmin(admin._id); // Store selected admin's ID
    setName(admin.name); // Set the name for the modal
    setEmail(admin.email);
  
    setPhoneNumber(admin.phoneNumber); // Set the phone number for the modal
    setModalOpen(true);
  };

  const closeUpdateModal = () => {
    setModalOpen(false);
    setSelectedAdmin(null); // Reset selected admin
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible); // Step 2
  };

  return (
    <div className="admin-accounts">
      <h2>Admin Accounts</h2>
      <button className="btn" onClick={() => navigate("/admin/registration")}>
        Create Account
      </button>
      <div className="admin-list">
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>Update Admin</h2>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="password-container">
                <input
                  type={isPasswordVisible ? "text" : "password"} // Step 3
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={togglePasswordVisibility}>
                  {isPasswordVisible ? "Hide" : "Show"} {/* Step 4 */}
                </button>
              </div>
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button
                className="update-btn"
                onClick={() => handleUpdate(selectedAdmin)}
              >
                Update
              </button>
              <button className="cancel-btn" onClick={closeUpdateModal}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {admins.length > 0 ? (
          admins.map((admin) => (
            <div key={admin._id} className="admin-card">
              <div className="admin-info">
                <h3 className="admin-name">{admin.name}</h3>
                <p className="admin-phone">{admin.phoneNumber}</p>
              </div>
              <button className="btn" onClick={() => openUpdateModal(admin)}>
                Update
              </button>
              <button className="btn" onClick={() => handleDelete(admin._id)}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="no-admins">No admins found.</p>
        )}
      </div>
    </div>
  );
};

export default Accounts;
