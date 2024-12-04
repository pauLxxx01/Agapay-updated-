import { useEffect, useState } from "react";
import formatPhilippinePhoneNumber from "../../helper/phoneFormat";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const responderAccounts = () => {
  const [responders, setResponders] = useState([]);
  const [selectedResponder, setSelectedResponder] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setName(`${firstName} ${lastName}`.trim());
  }, [firstName, lastName]);

  const [phone, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchResponders = async () => {
      try {
        const response = await axios.get("/admin/responder/getResponder");
        console.log(response.data.data);
        setResponders(response.data.data);
      } catch (error) {
        console.error("Error fetching responders:", error);
      }
    };
    fetchResponders();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/responder/delete/${id}`);
      setResponders(responders.filter((e) => e.id !== id));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting responder:", error);
    }
  };

  const handleUpdate = async (id) => {
    const formattedPhoneNumber = formatPhilippinePhoneNumber(phone);
    try {
      await axios.put(`/admin/responder/update/${id}`, {
        name,
        firstName,
        lastName,
        phone: formattedPhoneNumber,
        role,
      });
      closeModal();
      window.location.reload();
    } catch (error) {
      console.error("Error updating responder:", error);
    }
  };

  // Function to handle modal open and close
  const openModal = (responder) => {
    setSelectedResponder(responder._id);
    setName(responder.name);
    setPhoneNumber(responder.phoneNumber);
    setRole(responder.role);

    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedResponder(null);
  };

  return (
    <div className="admin-accounts">
      <h2>Responder Accounts</h2>
      <button
        className="btn"
        onClick={() => navigate("/admin/responder/registration")}
      >
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
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a department
                  </option>
                  <option value="CCMS">School Resource Officer</option>
                  <option value="CENG">
                    Emergency Preparedness Coordinator
                  </option>
                  <option value="CAFA">First Aid Responders</option>
                  <option value="CIHTM">Evacuation Coordinator</option>
                  <option value="ABM">Crisis Management Team</option>
                  <option value="CE">Mental Health Support Staff</option>
                  <option value="CAS">Communication Officer</option>
                  <option value="CBA">Safety Patrols or Student Leaders</option>
                  <option value="CCJC">Facilities Manager</option>
                </select>
              </div>
              <button
                className="update-btn"
                onClick={() => handleUpdate(selectedAdmin)}
              >
                Update
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {responders.length > 0 ? (
          responders.map((responder) => (
            <div key={responder._id} className="admin-card">
              <div className="admin-info">
                <h3 className="admin-name">{responder.name}</h3>
                <p className="admin-phone">{responder.phone}</p>
                <p className="admin-phone">{responder.role}</p>
              </div>
              <button className="btn" onClick={() => openModal(responder)}>
                Update
              </button>
              <button
                className="btn"
                onClick={() => handleDelete(responder._id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="no-admins">No responder found.</p>
        )}
      </div>
    </div>
  );
};

export default responderAccounts;
