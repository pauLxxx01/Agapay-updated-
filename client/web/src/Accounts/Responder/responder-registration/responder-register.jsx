import { useEffect, useState } from "react";
import formatPhilippinePhoneNumber from "../../helper/phoneFormat";
import { responsibilities } from "../../../newData";
import "./responder.scss";
import axios from "axios";
const Responder = () => {
  const [name, setName] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    setName(`${firstName} ${lastName}`.trim());
  }, [firstName, lastName]);

  const [phone, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");

  const [visibleIndex, setVisibleIndex] = useState(null);

  // Function to toggle visibility of the dropdown
  const toggleVisibility = (index) => {
    setVisibleIndex(visibleIndex === index ? null : index);
  };

  const formattedPhoneNumber = formatPhilippinePhoneNumber(phone);

  const handleUpload = (e) => {
    e.preventDefault();

    console.log(name, phone, role);
    axios
      .post("/admin/responder/register", {
        name,
        phone: formattedPhoneNumber,
        role,
      })
      .then((res) => {
        console.log("Data sent: ", {
          name,
          phone,
          role,
        });
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setRole("");
        console.log(res);
       
      })
      .catch((error) => {
        if (error.response) {
          console.error("Error response: ", error.response.data);
          alert(error.response.data.message);
          window.location.reload();
        } else {
          console.error("Error message:", error.message);
        }
      });
  };

  return (
    <div className="container-form-responder">
      
      <div className="register">
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
              <button type="submit" className="btn-primary">
                Register
              </button>
             
            </form>
          </div>
        </div>
      </div>
      <div className="role">
        <div className="card">
          <div className="card-header">Role</div>
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
      </div>
    </div>
  );
};
export default Responder;
