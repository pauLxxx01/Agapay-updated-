import { useContext, useEffect, useRef, useState } from "react";
import "./ongoing.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Call from "@mui/icons-material/Call";

import Loading from "../../../../components/loading/loading";
import axios from "axios";
import MessageIcon from "@mui/icons-material/Message";
import QRCode from "react-qr-code";
import CustomTooltip from "../../../../components/ToolTip/CustomToolTip";

import Badge from "@mui/material/Badge"; // Import Badge for notification count
//dialog
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { useSocket } from "../../../../socket/Socket";
import { toast } from "react-toastify";
import Error from "../../../../components/error/error";
import { AuthContext } from "../../../../context/authContext";

import DialogCompleted from "../../../../components/dailogCompleted/dialog";

const Ongoing = () => {
  const { id } = useParams(); // Access the dynamic parameter

  const { socket } = useSocket();
  const navigate = useNavigate();

  const [, messages, users] = useContext(AuthContext);
  const [openChat, setOpenChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [parents, setParents] = useState([]);
  const [progress, setProgress] = useState("");

  //error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dialogContentRef = useRef(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //responder
  const [responder, setResponder] = useState([]);
  const [isOptionalEnabled, setIsOptionalEnabled] = useState(false);

  const [selectedResponderInfo, setSelectedResponderInfo] = useState("");
  const [selectedResponderId, setSelectedResponderId] = useState("");

  const [selectedOptionalInfo, setSelectedOptionalInfo] = useState("");
  const [selectedOptionalName, setSelectedOptionalName] = useState("");

  const [selectedResponders, setSelectedResponders] = useState([]);

  const [selectedOfficeInfo, setSelectedOfficeInfo] = useState("");
  const [selectedOfficeName, setSelectedOfficeId] = useState("");

  const filteredMessage = messages.find((msg) => msg._id === id);
  const filteredUser = users.find((user) => user.report_data.includes(id));
  const filteredResponder = responder.filter((res) =>
    filteredMessage.responder.includes(res._id)
  );

  const handleChangeDropdown = (e) => {
    const selectedId = e.target.value;
    setSelectedResponderId(selectedId);
    setSelectedResponders([selectedId]);

    // Find the selected responder object based on the selected ID
    const selectedResponder = responder.find((res) => res._id === selectedId);
    setSelectedResponderInfo(selectedResponder); // Set the selected responder info
  };

  const handleChangeDropdownLocation = (e) => {
    setSelectedOptionalName("");

    setSelectedOptionalInfo(null);

    const selectedIdOffice = e.target.value;

    setSelectedOfficeId(selectedIdOffice);

    const selectedOffice = responder.find(
      (res) => res.university_office === selectedIdOffice
    );
    if (!selectedOffice) {
      toast.info("No available Responder in selected office");
      console.warn(`No matching office found for ID: ${selectedIdOffice}`);
      setSelectedOfficeInfo("None");
    } else {
      setSelectedOfficeInfo(selectedOffice.university_office || "None");
    }
  };

  const handleChangeDropdownOptional = (e) => {
    const selectedOId = e.target.value;
    setSelectedOptionalName(selectedOId);
    setSelectedResponders((prev) => [...prev, selectedOId]);

    // Find the selected optional responder based on their ID
    const selectedOptional = responder.find((res) => res._id === selectedOId);
    setSelectedOptionalInfo(selectedOptional); // Update optional responder info
  };

  const clearSelection = () => {
    setSelectedResponderId("");
    setSelectedOptionalName("");
    setSelectedResponderInfo("");
    setSelectedOfficeInfo(null);

    setSelectedOptionalInfo(null);
    setIsOptionalEnabled(false);
  };

  const handleCheckboxChange = (event) => {
    setIsOptionalEnabled(event.target.checked);
    if (!event.target.checked) {
      setSelectedOptionalInfo(null);
      setSelectedOptionalName("");
    }
  };

  //steps
  const [openDialog, setOpenDialog] = useState(false);
  const [direction, setDirection] = useState(null); // 'next' or 'previous'
  const [currentStep, setCurrentStep] = useState(1);
  const [processInfo, setProcessInfo] = useState({
    responder: "",
    status: "",
    otw: false,
    ota: false,
  });
  const [chat, setChat] = useState("");

  const [userChats, setUserChats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const parentResponse = await axios.get(
          `/user/parent/specific/${filteredUser.parent}`
        );
        setParents(parentResponse.data.parent);

        const responderResponse = await axios.get(
          "/admin/responder/getResponder"
        );

        setResponder(responderResponse.data.data);

        const chatResponse = await axios.get(`/chats/${id}`);

        setUserChats(chatResponse.data?.data?.content || []);

        // Load saved step and process info from local storage based on ID
        const savedStep = localStorage.getItem(`currentStep_${id}`);
        const savedData = JSON.parse(localStorage.getItem(`processInfo_${id}`));
        if (savedStep) {
          setCurrentStep(Number(savedStep));
        }
        if (savedData) {
          setProcessInfo(savedData);
        }
        updateProgress(Number(savedStep));
      } catch (error) {
        setError(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentStep]);

  useEffect(() => {
    if (socket) {
      console.log("Socket initialized:", socket);

      // Handle incoming message
      socket.on("receiveMessage", (data) => {
        setUserChats((prev) => [...prev, data]);

        // Increment unread messages if chat is closed
        if (!openChat) {
          setUnreadMessages((prev) => prev + 1);
        }
      });

      // Join room if room ID is set
      if (id) {
        socket.emit("join-room", id);
        console.log(`Connected to room with ID: ${id}!`);
      }
    }

    // Cleanup on unmount or when socket or dependencies change
    return () => {
      if (socket) {
        socket.off("receiveMessage");
      }
    };
  }, [socket, id, openChat]);

  const updateProgress = (currentStep) => {
    switch (currentStep) {
      case 1:
        setProgress(40);
        break;
      case 2:
        setProgress(65);
        break;
      case 3:
        setProgress(85);
        break;
      default:
        setProgress(40);
        break;
    }
  };

  // Scroll to the bottom whenever the dialog opens or messages update
  const scrollToBottom = () => {
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTop =
        dialogContentRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (openChat) {
      scrollToBottom();
    }
  }, [userChats, userChats]);

  const sendMessage = async () => {
    if (chat) {
      const messageData = {
        room: id,
        message: chat,
        sender: "admin",
      };

      // Emit the message through the socket
      socket.emit("sendMessage", messageData);
      console.log("Message sent via socket:", messageData);

      // Clear the input field
      setChat("");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  const handlePrevious = () => {
    setDirection("previous");
    setOpenDialog(true);
  };

  const handleNext = () => {
    setDirection("next");
    setOpenDialog(true);
  };
  const handleCancel = () => {
    setOpenDialog(false);
  };

  const handleUpdate = async (id, user) => {
    try {
      console.log("new data", progress, user._id, id);
      const newData = {
        percentage: progress,
        userId: user._id,
        id: id,
      };
      const sendNotif = {
        to: `${user.pushToken}`,
        title: "New Notification",
        body: "Tap to see details!",
        data: {
          screen: "ShowProgress",
          details: newData,
        },
      };

      await axios.post("/push-notification", sendNotif);
      await axios.put(`/user/message/update/${id}`, newData);

      // if (direction == "next" && currentStep === 2) {
      //   const updateResponse = await axios.put(`/user/message/update/${id}`, {
      //     percentage: progress,
      //     userId: user._id,
      //     id: id,
      //     responderId: selectedResponders,
      //   });
      // }

      // if (direction == "next" && currentStep === 3) {
      //   const updateResponse = await axios.put(`/user/message/update/${id}`, {
      //     percentage: progress,
      //     userId: user._id,
      //     id: id,
      //     responderId: selectedResponders,
      //   });
      // }

      const newSteps =
        direction === "next"
          ? Math.min(currentStep + 1, 3)
          : Math.max(currentStep - 1, 1);
      setCurrentStep(newSteps);
      localStorage.setItem(`currentStep_${id}`, newSteps); // Save current step with ID
      localStorage.setItem(`processInfo_${id}`, JSON.stringify(processInfo)); // Save form data with ID
      updateProgress(newSteps);

      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updateResponse = await axios.put(`/user/message/update/${id}`, {
      percentage: 100,
      userId: filteredUser._id,
      respond: "completed",
      id: id,
    });
    console.log("id", id);
    console.log("Update response: ", updateResponse);

    toast.success("Done Transaction!");
    navigate(`/home/history`);
    // Clear stored step and data for this specific ID
    localStorage.removeItem(`currentStep_${id}`);
    localStorage.removeItem(`processInfo_${id}`);
  };

  return (
    <div className="Ongoing-container">
      {filteredUser ? (
        parents ? (
          <div className="container-box-ongoing">
            <div className="header">
              <h1>REPORT</h1>
              <h4>{filteredMessage.emergency}</h4>
            </div>
            <div className="box box0">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <div className="form-group">
                    <div className="form1">
                      <div className="user-container">
                        <div className="header-info">
                          <h2>call immediately!</h2>
                        </div>
                        <div className="icon">
                          <Call
                            style={{
                              fontSize: 90,
                              color: "white",
                              backgroundColor: "maroon",
                              borderRadius: "100%",
                              padding: "8px",
                              margin: "4px",
                            }}
                          />
                        </div>
                        <div className="info">
                          <div className="info-container">
                            <div className="qr-user">
                              {filteredUser.phone_number && (
                                <QRCode
                                  size={100}
                                  bgColor="transparent"
                                  fgColor="black"
                                  value={
                                    filteredUser.phone_number ||
                                    "No contact number found"
                                  }
                                />
                              )}
                            </div>
                            <div className="infobox user">
                              <div className="identify">
                                <p>{filteredUser.role}</p>
                              </div>
                              <div className="identity">
                                <span>{filteredUser.name}</span>
                                <span>{filteredUser.phone_number}</span>
                              </div>
                            </div>
                          </div>
                          <div className="info-container">
                            <div className="infobox parent">
                              <div className="identify">
                                <p>{parents.relationship} </p>
                              </div>
                              <div className="identity">
                                <span>{parents.name}</span>
                                <span>{parents.phone}</span>
                              </div>
                            </div>
                            <div className="qr-parent">
                              {parents.phone && (
                                <QRCode
                                  size={100}
                                  bgColor="transparent"
                                  fgColor="black"
                                  value={
                                    parents.phone || "No contact number found"
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="form2">
                      <div className="steps-container">
                        <h3>{progress}</h3>
                        <h2>STEP: {currentStep}</h2>
                        <p className="subtitle">
                          {" "}
                          - Call the user to confirm their identity & concerns
                        </p>
                        <p className="subtitle">
                          {" "}
                          - Call to inform the user's {parents.relationship} and
                          aware of the situation
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* step 2 */}
                {currentStep === 2 && (
                  <div className="form-group">
                    <div className="form1">
                      <div className="responder-container">
                        <div className="title">
                          <h2>RESPONDER</h2>
                          <p className="subtitle">Choose a responder to call</p>
                        </div>
                        {/* Responder Dropdown */}
                        <div className="dropdown-container">
                          <div className="dropdown">
                            <select
                              value={selectedResponderId}
                              onChange={handleChangeDropdown}
                            >
                              <option value="" disabled>
                                Select a responder for{" "}
                                {filteredMessage.emergency}
                              </option>

                              {responder
                                .filter(
                                  (responderObj) =>
                                    responderObj.emergency_role ===
                                    filteredMessage.emergency
                                )
                                .map((responderObj) => (
                                  <option
                                    key={responderObj._id}
                                    value={responderObj._id}
                                  >
                                    {responderObj.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          {/* Optional Checkbox */}
                          <div className="dropdown-optional">
                            <div className="container-optional">
                              <div className="checkbox-container-optional">
                                <input
                                  type="checkbox"
                                  checked={isOptionalEnabled}
                                  onChange={handleCheckboxChange}
                                />
                                <h5>OPTIONAL</h5>
                              </div>

                              {/* Optional */}
                              <div className="dropdown-container-optional">
                                <select
                                  value={selectedOfficeName}
                                  onChange={handleChangeDropdownLocation}
                                  disabled={!isOptionalEnabled} // Disables if checkbox is not checked
                                >
                                  <option value="" disabled>
                                    Select a University Office
                                  </option>
                                  <option value="Information & Communications Technology Department">
                                    Information & Communications Technology
                                    Department
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
                                </select>
                                <select
                                  value={selectedOptionalName}
                                  onChange={handleChangeDropdownOptional}
                                  disabled={!isOptionalEnabled} // Disables if checkbox is not checked
                                >
                                  <option value="" disabled>
                                    Responder option
                                  </option>

                                  {responder
                                    .filter(
                                      (responderObj) =>
                                        responderObj.university_office ===
                                        selectedOfficeName
                                    )
                                    .map((responderObj) => (
                                      <option
                                        key={responderObj._id}
                                        value={responderObj._id}
                                      >
                                        {responderObj.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Display Selected Responder Information */}

                        {selectedResponderInfo && (
                          <div className="info-container">
                            <h3>Responder Information</h3>

                            <CustomTooltip
                              title="Name"
                              value={selectedResponderInfo.name}
                            />
                            <CustomTooltip
                              title="Phone numuber"
                              value={selectedResponderInfo.phone}
                              qrValue={selectedResponderInfo.phone}
                            />
                            <CustomTooltip
                              title="Emergency Role"
                              value={selectedResponderInfo.emergencyRole}
                            />
                            <CustomTooltip
                              title="University Office"
                              value={selectedResponderInfo.university_office}
                            />
                          </div>
                        )}

                        {isOptionalEnabled && selectedOptionalInfo && (
                          <div className="info-container">
                            <h3>Optional Responder</h3>
                            <CustomTooltip
                              title="Name"
                              value={selectedOptionalInfo.name}
                            />
                            <CustomTooltip
                              title="Phone"
                              value={selectedOptionalInfo.phone}
                              qrValue={selectedOptionalInfo.phone}
                            />
                            <CustomTooltip
                              title="Emergency Role"
                              value={selectedOptionalInfo.emergencyRole}
                            />
                            <CustomTooltip
                              title="University Office"
                              value={selectedOptionalInfo.university_office}
                            />
                          </div>
                        )}

                        {/* Button to clear selection */}
                        <div className="buttons">
                          <button type="button" onClick={clearSelection}>
                            Clear Selection
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="form2">
                      <div className="steps-container">
                        <h3>{progress}</h3>
                        <h2>STEP: {currentStep}</h2>
                        <div className="stepInfo">
                          <p className="subtitle">
                            - Select a responder to call
                          </p>
                          <p className="subtitle">
                            {" "}
                            - When the optional checkbox is checked, it enables
                            the dropdown for selecting an optional responder
                            based on the selected university office.
                          </p>
                          <p className="subtitle">
                            {" "}
                            - After selecting an responder, it will be displayed
                            the information about the responders.
                          </p>
                          <p className="subtitle">
                            {" "}
                            - Click on the <strong>"Clear Selection" </strong>
                            button to reset the selection.
                          </p>
                          <p className="subtitle">
                            {" "}
                            - While hovering the information, it display
                            addtional information or QR Code depending on your
                            needs.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="form-group-report">
                    <div className="form1">
                      {filteredUser && (
                        <div className="reports-container">
                          <h3>User's Information</h3>
                          <div className="information-container">
                            <CustomTooltip
                              title="Name"
                              value={filteredUser.name}
                            />
                            <CustomTooltip
                              title="Account ID"
                              value={filteredUser.account_id}
                            />
                            <CustomTooltip
                              title="Phone numuber"
                              value={filteredUser.phone_number}
                              qrValue={filteredUser.phone_number}
                            />
                            <CustomTooltip
                              title="Phone number"
                              value={filteredUser.alt_phone_number}
                              qrValue={filteredUser.alt_phone_number}
                            />
                            <CustomTooltip
                              title="User's Department"
                              value={filteredUser.department}
                            />
                          </div>
                        </div>
                      )}
                      {parents && (
                        <div className="reports-container">
                          <h3>Parent's Information</h3>
                          <div className="information-container">
                            <CustomTooltip title="Name" value={parents.name} />
                            <CustomTooltip
                              title="Account ID"
                              value={filteredUser.account_id}
                            />
                            <CustomTooltip
                              title="Phone numuber"
                              value={parents.phone}
                              qrValue={parents.phone}
                            />
                            <CustomTooltip
                              title="Phone number"
                              value={parents.alt_phone}
                              qrValue={parents.alt_phone}
                            />
                            <CustomTooltip
                              title="Relationship"
                              value={parents.relationship}
                            />
                          </div>
                        </div>
                      )}

                      {filteredResponder.map((responder) => (
                        <div className="info" key={responder._id}>
                          <div className="reports-container">
                            <h3>Responder's Information</h3>
                            <div className="information-container">
                              <CustomTooltip
                                title="Name"
                                value={responder.name}
                              />
                              <CustomTooltip
                                title="Account ID"
                                value={responder.account_id}
                              />
                              <CustomTooltip
                                title="Phone numuber"
                                value={responder.phone}
                                qrValue={responder.phone}
                              />
                              <CustomTooltip
                                title="University Office"
                                value={responder.university_office}
                              />
                              <CustomTooltip
                                title="Role"
                                value={responder.emergency_role}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form2">
                      <div className="steps-container">
                        <h3>{progress}</h3>
                        <h2>STEP: {currentStep}</h2>
                        <p className="subtitle">
                          {" "}
                          - Call the user to confirm their identity & concerns
                        </p>
                        <p className="subtitle">
                          {" "}
                          - Call to inform the user's {parents.relationship} and
                          aware of the situation
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="form-group">
                    <label htmlFor="ota">On-The-Air</label>
                  </div>
                )}
                <div className="button-group">
                  <div className="buttons">
                    {currentStep > 1 && (
                      <button type="button" onClick={handlePrevious}>
                        Previous
                      </button>
                    )}

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={currentStep === 2 && !selectedResponderId}
                      >
                        Next
                      </button>
                    ) : (
                      <button type="submit">Submit</button>
                    )}
                  </div>
                </div>
              </form>

              {/* button  */}

              {/* Confirmation Dialog */}
              <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Navigation</DialogTitle>
                <DialogContent>
                  <Typography variant="body2" color="textSecondary">
                    Are you sure you want to go{" "}
                    {direction === "next"
                      ? "to the next"
                      : "back to the previous"}{" "}
                    step?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => handleCancel()} color="primary">
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      handleUpdate(filteredMessage._id, filteredUser)
                    }
                    color="success"
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </div>

            {/* Message Icon to Open Chat Modal */}
            <div
              className="chat-icon"
              onClick={() => {
                setOpenChat(true);
                setUnreadMessages(0);
              }}
            >
              <Badge badgeContent={unreadMessages} color="error">
                <MessageIcon
                  style={{ zIndex: 1000, fontSize: 30, cursor: "pointer" }}
                />
              </Badge>
            </div>

            <DialogCompleted
              messages={filteredMessage}
              users={filteredUser}
              parents={parents}
              responders={filteredResponder}
              isOpen={isDialogOpen}
              onClose={handleSubmit}
            />

            {/* Chat Modal */}
            <Dialog
              open={openChat}
              onClose={() => setOpenChat(false)}
              onEntered={scrollToBottom}
              sx={{ "& .MuiDialog-paper": { width: "700px" } }}
            >
              {" "}
              <DialogActions>
                <Button onClick={() => setOpenChat(false)} color="primary">
                  X
                </Button>
              </DialogActions>
              <DialogTitle>
                <div className="header-chat">
                  <span>{filteredUser.name} </span>
                  <span>{filteredUser.account_id}</span>
                </div>
              </DialogTitle>
              <DialogContent
                ref={dialogContentRef}
                sx={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <div className="message-list">
                  {userChats.length > 0 ? (
                    userChats.map((msg) => {
                      console.log(msg); // Log the message object
                      return (
                        <div
                          key={msg._id} // Ensure each message has a unique key using _id
                          className={
                            msg.sender.toLowerCase() === "admin"
                              ? "message-sent"
                              : "message-received"
                          }
                        >
                          <span
                            className={
                              msg.sender.toLowerCase() === "admin"
                                ? "message-sent"
                                : "message-received"
                            }
                          >
                            <span className="chatText">{msg.message}</span>
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-messages">No Messages</p>
                  )}
                </div>
              </DialogContent>
              <div className="message-input-container">
                <textarea
                  type="text"
                  placeholder="Type a message"
                  value={chat}
                  onChange={(e) => setChat(e.target.value)}
                  className="message-input"
                  rows={4}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chat.trim()}
                  className="send-button"
                >
                  Send
                </button>
              </div>
            </Dialog>

   
          </div>
        ) : (
          <p>No parents available</p>
        )
      ) : (
        <p>No user information available.</p>
      )}
    </div>
  );
};
export default Ongoing;
