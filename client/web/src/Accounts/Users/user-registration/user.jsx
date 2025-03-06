import React, { useEffect, useState } from "react";
import formatPhilippinePhoneNumber from "../../helper/phoneFormat";
import axios from "axios";
import { toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import styles
import { motion } from "framer-motion";
import "./user.scss";
import { useNavigate } from "react-router-dom";
import { zoomIn } from "../../../variants";
import ConfirmDialog from "../../../components/confirmDialog/confirmDialog";

const User = ({ isUpdate = false, initialData = {} }) => {
  const [parent, setParent] = useState([]);

  const [readOnly, setReadOnly] = useState(isUpdate);

  const toggleReadOnly = () => {
    if (isUpdate) {
      setReadOnly(!readOnly);
    } 
  };

  useEffect(() => {
    if (isUpdate) {
      const fetchData = async () => {
        try {
          const parentsResponse = await axios.get("/user/parent/getParent");
          const parents = parentsResponse.data.parents;

          if (parents && initialData.parent) {
            const userParent = parents.find(
              (p) => p._id.toString() === initialData.parent.toString()
            );
            setParent(userParent);
          } else {
            console.log("No parents data or initialData.parent available.");
            setParent(null); // or setParent({}) depending on your needs
          }
        } catch (error) {
          console.error("Error fetching parents:", error);
          toast.error("Failed to load parents data.");
          setParent(null); // or setParent({}) depending on your needs
        }
      };
      fetchData();
    }
  }, [initialData.parent, isUpdate]);

  const navigate = useNavigate();
  // for user
  const [role, setRole] = useState(initialData.role || "");
  const [name, setName] = useState(initialData.name || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [password, setPassword] = useState(initialData.password || "");
  const [accountId, setAccountId] = useState(initialData.account_id || "");
  const [phoneNumber, setPhoneNumber] = useState(
    initialData.phone_number || ""
  );
  const [department, setDepartment] = useState(initialData.department || "");
  const [address, setAddress] = useState(initialData.address || "");

  const [altPhoneNumber, setAltPhoneNumber] = useState(
    initialData.alt_phone_number || ""
  );
  const [altAddress, setAltAddress] = useState(initialData.alt_address || "");
  const [degree, setDegree] = useState(initialData.degree || "");
  const [schoolYear, setSchoolYear] = useState(initialData.school_year || "");

  // For parent
  const [parentName, setParentName] = useState(parent.name || "");
  const [parentPhone, setParentPhone] = useState(parent.phone || "");
  const [parentAddress, setParentAddress] = useState(parent.address || "");
  const [parentRelationship, setParentRelationship] = useState(
    parent.relationship || ""
  );

  const [parentAltPhone, setParentAltPhone] = useState(parent.alt_phone || "");
  const [parentAltAddress, setParentAltAddress] = useState(
    parent.alt_address || ""
  );

  // Handle role selection
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
  };

  useEffect(() => {
    if (isUpdate) {
      setParentName(parent.name);
      setParentPhone(parent.phone);
      setParentAddress(parent.address);
      setParentRelationship(parent.relationship);
      setParentAltAddress(parent.alt_address);
      setParentAltPhone(parent.alt_phone);
    }
  }, [isUpdate, parent]);
  const handleUpload = (e) => {
    e.preventDefault();

    // Validate phone numbers
    if (!/^\d+$/.test(phoneNumber)) {
      toast.error(
        "Please enter a valid phone number consisting of digits only."
      );
      return;
    }
    if (!/^\d+$/.test(altPhoneNumber)) {
      toast.error(
        "Please enter a valid phone number consisting of digits only."
      );
      return;
    }
    if (!/^\d+$/.test(parentAltPhone)) {
      toast.error(
        "Please enter a valid phone number consisting of digits only."
      );
      return;
    }

    if (!/^\d+$/.test(parentPhone)) {
      toast.error(
        "Please enter a valid parent phone number consisting of digits only."
      );
      return;
    }

    const endpoint = isUpdate
      ? `/userUpdate/parentUpdate/${initialData._id}`
      : `/user/register`;
    const method = isUpdate ? "put" : "post";

    axios({
      method: method,
      url: endpoint,
      data: {
        role: role,
        name,
        email,
        password,
        account_id: accountId,
        phone_number: phoneNumber,

        alt_phone_number: altPhoneNumber,
        degree: degree,
        school_year: schoolYear,
        alt_address: altAddress,

        department,
        address,

        parentName,
        parentAddress,
        parentRelationship,
        parentPhone: parentPhone,

        parentAltPhone: parentAltPhone,
        parentAltAddress: parentAltAddress,
      },
    })
      .then((res) => {
        // Show success toast

        toast.success(
          isUpdate
            ? "Profile updated successfully!"
            : "Registration successful!"
        );
        // Reset fields after successful registration
        if (!isUpdate) {
          setRole("");
          setName("");
          setEmail("");
          setPassword("");
          setAccountId("");
          setPhoneNumber("");
          setDepartment("");

          setDegree("");
          setAltPhoneNumber("");
          setSchoolYear("");
          setAltAddress("");

          setAddress("");

          setParentName("");
          setParentPhone("");
          setParentAddress("");
          setParentRelationship("");
          setParentAltPhone("");
          setParentAltAddress("");
        }
        navigate("/home/accounts");
        console.log(res);
      })
      .catch((error) => {
        if (error.response) {
          console.error("Error response: ", error.response.data);
          toast.error(error.response.data.message || "Registration failed");
        } else {
          console.error("Error message:", error.message);
          toast.error("An error occurred. Please try again.");
        }
      });
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  console.log(initialData.report_data);

  const handleDelete = async (id) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Delete user and parent concurrently
      await Promise.all([
        axios.delete(`/user/delete/${idToDelete}`),
        axios.delete(`/user/parent/delete/${initialData.parent.toString()}`),
      ]);

      // Check if report_data exists and delete messages concurrently
      if (
        Array.isArray(initialData.report_data) &&
        initialData.report_data.length > 0
      ) {
        await Promise.all(
          initialData.report_data.map((id) =>
            axios.delete(`/user/message/delete/${id}`)
          )
        );
      }

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

  const handleClear = () => {
    setRole("");
    setName("");
    setEmail("");
    setPassword("");
    setAccountId("");
    setPhoneNumber("");
    setDepartment("");
    setAddress("");
    setAltPhoneNumber("");
    setAltAddress("");
    setDegree("");
    setSchoolYear("");
    setParentName("");
    setParentPhone("");
    setParentAddress("");
    setParentRelationship("");
    setParentAltPhone("");
    setParentAltAddress("");
  };

  return (
    <motion.div
      variants={zoomIn(0.1)}
      initial="hidden"
      whileInView="show"
      className="form-container-user"
    >
      <div className="btn-top-container">
        {isUpdate && (
          <button
            className={readOnly ? "btn-en" : "btn-dis"}
            onClick={toggleReadOnly}
          >
            {readOnly ? "Edit" : "Read only"}
          </button>
        )}

        {isUpdate && !readOnly && (
          <button className="btn-clear" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      <form onSubmit={handleUpload} className="user-form">
        <div className="header-container">
          <h2>
            {isUpdate
              ? `Update ${initialData.name}'s Profile `
              : "User Registration"}
          </h2>
        </div>

        <div className="grid-container">
          <div className="user-info">
            <h3>User Information</h3>
            <div className="form-group">
              <label>Role</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="Professor"
                    checked={role === "Professor"}
                    onChange={handleRoleChange}
                    readOnly={readOnly}
                  />
                  Professor
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="Student"
                    checked={role === "Student"}
                    onChange={handleRoleChange}
                    readOnly={readOnly}
                  />
                  Student
                </label>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                placeholder="Name"
                value={name}
                readOnly={readOnly}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                readOnly={readOnly}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                readOnly={readOnly}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="accountId">User ID</label>
              <input
                type="text"
                placeholder="University Account ID"
                id="accountId"
                value={accountId}
                readOnly={readOnly}
                onChange={(e) => setAccountId(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="schoolYear">School Year</label>
              <select
                id="schoolYear"
                value={schoolYear}
                readOnly={readOnly}
                disabled={readOnly}
                onChange={(e) => setSchoolYear(e.target.value)}
                required={readOnly ? false : true} // Disable required when disabled
              >
                <option value="" disabled>
                  Year
                </option>
                <option value="1st ">1st Year</option>
                <option value="2nd ">2nd Year</option>
                <option value="3rd ">3nd Year</option>
                <option value="4th ">4th Year</option>
              </select>
            </div>
          </div>

          <div className="user-info">
            <div className="form-group">
              <label htmlFor="degree">Degree</label>
              <select
                id="degree"
                value={degree}
                readOnly={readOnly}
                onChange={(e) => setDegree(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a Degree
                </option>
                <option value="Bachelor of Science in Information Technology">
                  Bachelor of Science in Information Technology
                </option>
                <option value="Bachelor of Science in Civil Engineering">
                  Bachelor of Science in Civil Engineering
                </option>
                <option value="Bachelor of Science in Architecture">
                  Bachelor of Science in Architecture
                </option>
                <option value="Bachelor of Science in International Travel and Tourism Management">
                  Bachelor of Science in International Travel and Tourism
                  Management
                </option>
                <option value="Bachelor of Science in Business Administration">
                  Bachelor of Science in Business Administration
                </option>
                <option value="Bachelor of Secondary Education">
                  Bachelor of Secondary Education
                </option>
                <option value="Bachelor of Science in Biochemistry">
                  Bachelor of Science in Biochemistry
                </option>
                <option value="Bachelor of Science in Business Administration">
                  Bachelor of Science in Business Administration
                </option>
                <option value="Bachelor of Science in Criminology">
                  Bachelor of Science in Criminology
                </option>
                <option value="Bachelor of Science in Marine Engineering">
                  Bachelor of Science in Marine Engineering
                </option>
                <option value="Bachelor of Science in Nursing">
                  Bachelor of Science in Nursing
                </option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                value={department}
                readOnly={readOnly}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a department
                </option>
                <option value="CCMS">CCMS</option>
                <option value="CENG">CENG</option>
                <option value="CAFA">CAFA</option>
                <option value="CIHTM">CIHTM</option>
                <option value="ABM">ABM</option>
                <option value="CE">CE</option>
                <option value="CAS">CAS</option>
                <option value="CBA">CBA</option>
                <option value="CCJC">CCJC</option>
                <option value="CME">CME</option>
                <option value="CNAHS">CNAHS</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="text"
                id="phoneNumber"
                readOnly={readOnly}
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneSecondaryNumber">
                Secondary Phone Number
              </label>
              <input
                type="text"
                id="phoneSecondaryNumber"
                readOnly={readOnly}
                placeholder="Secondary Phone Number"
                value={altPhoneNumber}
                onChange={(e) => setAltPhoneNumber(e.target.value)}
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
              <label htmlFor="Secondaryaddress">Secondary Address</label>
              <input
                type="text"
                id="Secondaryaddress"
                placeholder="Address"
                readOnly={readOnly}
                value={altAddress}
                onChange={(e) => setAltAddress(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="parent-info">
            <h3>Parent Information</h3>
            <div className="form-group">
              <label htmlFor="parentName">Parent Name</label>
              <input
                type="text"
                id="parentName"
                readOnly={readOnly}
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentPhone">Phone Number</label>
              <input
                type="text"
                id="parentPhone"
                readOnly={readOnly}
                placeholder="Phone Number"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentAltPhone">Secondary Phone Number</label>
              <input
                type="text"
                id="parentAltPhone"
                readOnly={readOnly}
                placeholder="Secondary Phone Number"
                value={parentAltPhone}
                onChange={(e) => setParentAltPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentAddress">Parent's Address</label>
              <input
                type="text"
                id="parentAddress"
                placeholder="Address"
                readOnly={readOnly}
                value={parentAddress}
                onChange={(e) => setParentAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="parentAltAddress">
                Secondary Parent's Address
              </label>
              <input
                type="text"
                id="parentAltAddress"
                readOnly={readOnly}
                placeholder="Secondary Address"
                value={parentAltAddress}
                onChange={(e) => setParentAltAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="parentRelationship">Relationship</label>
              <select
                id="parentRelationship"
                readOnly={readOnly}
                value={parentRelationship}
                onChange={(e) => setParentRelationship(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a relationship
                </option>
                <option value="Mother">MOTHER</option>
                <option value="Father">FATHER</option>
                <option value="Guardian">GUARDIAN</option>
              </select>
            </div>
          </div>
          <div className="btn-container-user">
            <button
              onClick={() => navigate("/home/accounts")}
              className="cancel-button-register"
            >
              Cancel
            </button>
            <button
              className="delete-button-register"
              onClick={() => handleDelete(initialData._id)}
            >
              Delete
            </button>
            {!readOnly && (
              <button type="submit" className="submit-button-register">
                {isUpdate ? "Update" : "Register"}
              </button>
            )}
          </div>
        </div>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
};

export default User;
