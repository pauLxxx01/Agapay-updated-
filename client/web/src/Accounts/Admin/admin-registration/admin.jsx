import React, { useState } from "react";
import axios from "axios";
import "./admin.scss";
import { useNavigate } from "react-router-dom";
import formatPhilippinePhoneNumber from "../../helper/phoneFormat";

const Admin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const navigate = useNavigate();

  const handleUpload = (e) => {
    e.preventDefault();

    // Format the phone number before sending to the database
    const formattedPhoneNumber = formatPhilippinePhoneNumber(phoneNumber);
    console.log(formattedPhoneNumber);

    axios
      .post("http://localhost:8080/admin/auth/register", {
        email,
        name,
        password,
        phoneNumber: formattedPhoneNumber,
      })
      .then((res) => {
        console.log("Data sent: ", {
          email,
          name,
          password,
          phoneNumber: formattedPhoneNumber,
        });
        console.log(res);
        navigate("/login");
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
    <div className="container-form">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Admin Registration</div>
            <div className="card-body">
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label htmlFor="name">Username</label>
                  <input
                    className="form-control"
                    autoComplete="name"
                    type="text"
                    name="name"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    className="form-control"
                    autoComplete="email"
                    type="text"
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
