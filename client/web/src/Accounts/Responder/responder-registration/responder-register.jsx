import { useContext, useEffect, useState } from "react";
import formatPhilippinePhoneNumber from "../../helper/phoneFormat";
import { responsibilities } from "../../../newData";
import "./responder.scss";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../variants";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../../../components/confirmDialog/confirmDialog";
import Loading from "../../../components/loading/loading";
import "../../Users/user-registration/user.scss";

import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import HomeIcon from "@mui/icons-material/Home";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MapsHomeWorkIcon from "@mui/icons-material/MapsHomeWork";
import SchoolIcon from "@mui/icons-material/School";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import MessageTable from "./../../Users/user-registration/table";
import { viewReportTable } from "../../../newData";
import { AuthContext } from "../../../context/authContext";

const Responder = ({ isUpdate = false, initialData = {} }) => {
  const [name, setName] = useState("");

  const [readOnly, setReadOnly] = useState(isUpdate);

  const [, messages] = useContext(AuthContext);
  const [filteredSelectedUserData, setFilteredSelectedUserData] = useState([]);

  useEffect(() => {
    if (isUpdate) {
      const filteredUserData = messages.filter((user) =>
        initialData.report.includes(user._id)
      );
      setFilteredSelectedUserData(filteredUserData);
    }
    console.log(initialData);
  }, [isUpdate, messages, initialData]); // Add dependencies!

  const toggleReadOnly = () => {
    if (isUpdate) {
      setReadOnly(!readOnly);
    }
  };
  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEmergency_role("");
    setAccount_id("");
    setUniversity_office("");
    setEmail("");
    setAddress("");
    setAltAddress("");
    setBirthdate("");
    setAltPhone("");
  };

  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  useEffect(() => {
    setName(`${firstName} ${lastName}`.trim());
  }, [firstName, lastName]);

  const [phone, setPhoneNumber] = useState(initialData.phone || "");

  const [account_id, setAccount_id] = useState(initialData.account_id || "");
  const [university_office, setUniversity_office] = useState(
    initialData.university_office || ""
  );
  const [emergency_role, setEmergency_role] = useState(
    initialData.emergency_role || ""
  );

  const [email, setEmail] = useState(initialData.email || "");
  const [address, setAddress] = useState(initialData.address || "");
  const [alt_address, setAltAddress] = useState(initialData.alt_address || "");
  const [birthdate, setBirthdate] = useState(initialData.birthdate || "");
  const [alt_phone, setAltPhone] = useState(initialData.alt_phone || "");

  const [visibleIndex, setVisibleIndex] = useState(null);
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (isUpdate) {
      const nameParts = initialData.name.trim().split(" ");

      console.log(nameParts);
      const firstN = nameParts[0];
      const lastN = nameParts[nameParts.length - 1];

      setFirstName(firstN);
      setLastName(lastN);
      setPhoneNumber(initialData.phone);
      setAccount_id(initialData.account_id);
      setUniversity_office(initialData.university_office);
      setEmergency_role(initialData.emergency_role);
    }
  }, [isUpdate, initialData]);

  // Function to toggle visibility of the dropdown
  const toggleVisibility = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };
  const generateAccountId = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newAccountId = `R01-${randomDigits}`;
    setAccount_id(newAccountId);
  };
  const handleUpload = (e) => {
    e.preventDefault();

    console.log(name, account_id, phone, emergency_role, university_office);
    const endpoint = isUpdate
      ? `/admin/responder/update/${initialData._id}`
      : "/admin/responder/register";
    const method = isUpdate ? "put" : "post";

    axios({
      method: method,
      url: endpoint,
      data: {
        name,
        account_id,
        phone,
        emergency_role,
        university_office,
        email,
        address,
        alt_address,
        birthdate,
        alt_phone,
      },
    })
      .then((res) => {
        toast.success(
          isUpdate
            ? "Profile updated successfully!"
            : "Registration successful!"
        );

        if (!isUpdate) {
          setFirstName("");
          setLastName("");
          setPhoneNumber("");
          setEmergency_role("");
          setAccount_id("");

          setUniversity_office("");
          setEmail("");
          setAddress("");
          setAltAddress("");
          setBirthdate("");
          setAltPhone("");
        }

        navigate("/home/accounts");

        console.log(res);
      })

      .catch((error) => {
        if (error.response) {
          console.error("Error response: ", error.response.data);
          toast(error.response.data.message);
        } else {
          console.error("Error message:", error.message);
        }
      });
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const handleDelete = async (id) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `/admin/responder/delete/${idToDelete}`
      );
      toast.success("Responder deleted successfully!");
      navigate("/home/accounts");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || error.response.statusText);
      } else {
        toast.error(error.message);
      }
    } finally {
      setConfirmOpen(false);
    }
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  return (
    <div className="form-container-user">
      <div className="btn-top-container">
        {isUpdate && (
          <div className="edit-back-btn">
            {isUpdate && readOnly && (
              <button
                className="btn-back"
                onClick={() => navigate("/home/accounts")}
              >
                <ArrowBackIcon />
              </button>
            )}

            <button
              className={readOnly ? "btn-en" : "btn-dis"}
              onClick={toggleReadOnly}
            >
              {readOnly ? "Edit" : "Read only"}
            </button>
          </div>
        )}

        {isUpdate && !readOnly && (
          <button className="btn-clear" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      {!readOnly ? (
        <div className="profile-container-edit">
          <motion.div
            variants={zoomIn(0.1)}
            initial="hidden"
            whileInView="show"
            className="register"
          >
            <div className="card">
              <div className="card-header">
                {isUpdate
                  ? `Update ${initialData.name}'s Profile `
                  : "Responder Registration"}
              </div>
              <div className="card-body">
                <form
                  className="form-container-responder"
                  onSubmit={handleUpload}
                >
                  <div className="form-grid-container-responder">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        autoComplete="firstName"
                        type="text"
                        name="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter First Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        autoComplete="lastName"
                        type="text"
                        name="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter Last Name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        autoComplete="email"
                        type="text"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Birthdate</label>
                      <input
                        autoComplete="birthdate"
                        type="date"
                        name="birthdate"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        placeholder="Enter Email"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Full Address</label>
                      <input
                        type="text"
                        id="address"
                        readOnly={readOnly}
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="Secondaryaddress">
                        Secondary Address
                      </label>
                      <input
                        type="text"
                        id="Secondaryaddress"
                        placeholder="Secondary Address"
                        readOnly={readOnly}
                        value={alt_address}
                        onChange={(e) => setAltAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="account_id">Account ID</label>
                      <input
                        type="text"
                        name="account_id"
                        value={account_id}
                        readOnly // Makes the input read-only since it's auto-generated
                        placeholder="Generated Account ID"
                      />
                      <button
                        type="button"
                        className="generate"
                        onClick={generateAccountId}
                      >
                        Generate
                      </button>
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Secondary Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={alt_phone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        placeholder="Enter phone number"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="role">Role</label>
                      <select
                        id="role"
                        value={emergency_role}
                        onChange={(e) => setEmergency_role(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select a department
                        </option>
                        <option value="Fire Emergency">Fire Emergency</option>
                        <option value="Natural Hazard">Natural Hazard</option>
                        <option value="Biological Hazard">
                          Biological Hazard
                        </option>
                        <option value="Medical Assistance">
                          Medical Assistance
                        </option>
                        <option value="Facility Failure">
                          Facility Failure
                        </option>
                        <option value="Crime & Violence">
                          Crime & Violence
                        </option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="UniversityOffice">
                        University Office
                      </label>
                      <select
                        id="UniversityOffice"
                        value={university_office}
                        onChange={(e) => setUniversity_office(e.target.value)}
                      >
                        <option value="" disabled>
                          Select a University Office
                        </option>
                        <option value="Information & Communications Technology Department">
                          Information & Communications Technology Department
                        </option>
                        <option value="Health and Safety Office">
                          Health and Safety Office
                        </option>
                        <option value="Accounting Department">
                          Accounting Department
                        </option>
                        <option value="Admission Office">
                          Admission Office
                        </option>
                        <option value="Auditing Department">
                          Auditing Department
                        </option>
                        <option value="Community Relations Department">
                          Community Relations Department
                        </option>
                        <option value="Corporate Planning and Development Office">
                          Corporate Planning and Development Office
                        </option>
                        <option value="Data Protection Office">
                          Data Protection Office
                        </option>
                        <option value="General Services Department">
                          General Services Department
                        </option>
                        <option value="Medical and Dental Services">
                          Medical and Dental Services
                        </option>
                        <option value="Human Resource Department">
                          Human Resource Department
                        </option>
                        <option value="Office of Student Affairs & Services">
                          Office of Student Affairs & Services
                        </option>
                        <option value="Group of security">
                          Group of security
                        </option>
                      </select>
                    </div>
                  </div>
                </form>
                <div className="btn-container">
                  <button
                    className="btn-primary cancel"
                    onClick={() => navigate("/home/accounts")}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary delete"
                    onClick={() => handleDelete(initialData._id)}
                  >
                    Delete
                  </button>
                  <button onClick={handleUpload} className="btn-primary update">
                    {isUpdate ? "Update" : "Register"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-grid">
            <div className="profile-info-user">
              <div className="name-description-main">
                <p className="highlight-text">{initialData.name}</p>
                <p className="highlight-subtext">
                  {initialData.university_office}
                </p>
              </div>
              <div className="profile-info-details">
                <p>
                  <ContactMailIcon style={{ marginRight: "8px" }} />
                  {initialData.account_id}
                </p>
                <p>
                  <ContactPhoneIcon style={{ marginRight: "8px" }} />
                  {initialData.phone}
                </p>

                <p>
                  <EmailIcon style={{ marginRight: "8px" }} />
                  {initialData.email}
                </p>
                <p>
                  <SettingsIcon style={{ marginRight: "8px" }} />
                  {initialData.emergency_role}
                </p>
                <p>
                  <HomeIcon style={{ marginRight: "8px" }} />
                  {initialData.address}
                </p>
                <p>
                  <MapsHomeWorkIcon style={{ marginRight: "8px" }} />
                  {initialData.alt_address}
                </p>
              </div>
            </div>
           
          </div>

        
            <MessageTable
              tableFormat={viewReportTable}
              filteredMessages={filteredSelectedUserData}
            />
         
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
export default Responder;
