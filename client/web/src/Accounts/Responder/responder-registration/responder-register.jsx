import { useEffect, useState } from "react";
import formatPhilippinePhoneNumber from "../../helper/phoneFormat";
import { responsibilities } from "../../../newData";
import "./responder.scss";
import axios from "axios";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../../../variants";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
const Responder = () => {
  const [name, setName] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setName(`${firstName} ${lastName}`.trim());
  }, [firstName, lastName]);

  const [phone, setPhoneNumber] = useState("");

  const [account_id, setAccount_id] = useState("");
  const [university_office, setUniversity_office] = useState("");
  const [emergency_role, setEmergency_role] = useState("");

  const [visibleIndex, setVisibleIndex] = useState(null);

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
    axios
      .post("/admin/responder/register", {
        name,
        account_id,
        phone,
        emergency_role,
        university_office,
      })
      .then((res) => {
        console.log("Data sent: ", {
          name,
          account_id,
          phone,
          emergency_role,
          university_office,
        });
        toast.success("Registration successfully!");
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setEmergency_role("");
        setAccount_id("");
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


  return (
    <div className="container-form-responder">
      <motion.div
        variants={zoomIn( 0.1)}
        initial="hidden"
        whileInView="show"
        className="register"
      >
        <div className="card">
          <div className="card-header">Responder Registration</div>
          <div className="card-body">
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  className="form-control"
                  autoComplete="firstName"
                  type="text"
                  name="firstName"
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter First Name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  className="form-control"
                  autoComplete="lastName"
                  type="text"
                  name="lastName"
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter Last Name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="account_id">Account ID</label>
                <input
                  className="form-control"
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
                  className="form-control"
                  name="phone"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhoneNumber(e.target.value)}
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
                  <option value="Biological Hazard">Biological Hazard</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="Facility Failure">Facility Failure</option>
                  <option value="Crime & Violence">Crime & Violence</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="UniversityOffice">University Office</label>
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
                  <option value="Admission Office">Admission Office</option>
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
                  <option value="Group of security">Group of security</option>
                </select>
              </div>
              <div className="btn-container">
                <button
                  className="btn-primary"
                  onClick={() => navigate("/home/accounts")}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
      <motion.div 
       variants={zoomIn( 0.1)}
       initial="hidden"
       whileInView="show"
      
      className="role">
        <div className="card">
          <div className="card-header">University Office</div>
          <div className="card-body">
            {responsibilities.map((item, index) => (
              <div key={index}>
                <p
                  className="title-roles"
                  onClick={() => toggleVisibility(index)}
                >
                  {item.title}
                </p>
                {visibleIndex === index && (
                  <ul>
                    <li>{item.description}</li>
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Responder;
