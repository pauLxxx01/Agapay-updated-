import { useEffect, useRef, useState } from "react";
import "./ongoing.scss";
import { useLocation, useParams } from "react-router-dom";
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

const Ongoing = () => {
  const { id } = useParams(); // Access the dynamic parameter
  const location = useLocation();
  const passedId = location.state?.id;
  const [message, setMessage] = useState([]);
  const { socket } = useSocket();
  const dialogContentRef = useRef(null);

  const [openChat, setOpenChat] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  console.log(socket, "socket");

  console.log("passed Id: ",passedId );

  const [parents, setParents] = useState([]);
  const [progress, setProgress] = useState("");

  //error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  if (!passedId) {
    return <div>No datass available.</div>;
  }

  //responder
  const [responder, setResponder] = useState([]);
  const [isOptionalEnabled, setIsOptionalEnabled] = useState(false);

  const [selectedResponderInfo, setSelectedResponderInfo] = useState(null);
  const [selectedResponderId, setSelectedResponderId] = useState("");

  const [selectedOptionalInfo, setSelectedOptionalInfo] = useState(null);
  const [selectedOptionalId, setSelectedOptionalId] = useState("");

  const [selectedOfficeInfo, setSelectedOfficeInfo] = useState(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState("");

  console.log(selectedOfficeId, "selectedOffice");

  const handleChangeDropdown = (e) => {
    const selectedId = e.target.value;
    setSelectedResponderId(selectedId);

    // Find the selected responder object based on the selected ID
    const selectedResponder = responder.find((res) => res._id === selectedId);
    setSelectedResponderInfo(selectedResponder); // Set the selected responder info
  };

  const handleChangeDropdownLocation = (e) => {
    setSelectedOptionalId("");

    setSelectedOptionalInfo(null);

    const selectedIdOffice = e.target.value;
    console.log("Selected Office ID:", selectedIdOffice); // Log the selected office ID
    setSelectedOfficeId(selectedIdOffice);

    const selectedOffice = responder.find(
      (res) => res.universityOffice === selectedIdOffice
    );
    setSelectedOfficeInfo(selectedOffice.universityOffice);
    console.log("Selected Office:", selectedOffice.universityOffice); // Log the office info
  };

  const handleChangeDropdownOptional = (e) => {
    const selectedOId = e.target.value;
    setSelectedOptionalId(selectedOId);

    // Find the selected optional responder based on their ID
    const selectedOptional = responder.find((res) => res._id === selectedOId);
    setSelectedOptionalInfo(selectedOptional); // Update optional responder info
    console.log(selectedOptional, "selected optional --->");
  };

  const clearSelection = () => {
    setSelectedResponderId("");
    setSelectedOptionalId("");
    setSelectedResponderInfo("");
    setSelectedOfficeInfo(null);

    setSelectedOptionalInfo(null);
    setIsOptionalEnabled(false);
  };

  const handleCheckboxChange = (event) => {
    setIsOptionalEnabled(event.target.checked);
    if (!event.target.checked) {
      setSelectedOptionalInfo(null);
      setSelectedOptionalId("");
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
  const [room, setRoom] = useState("");
  const [chat, setChat] = useState("");
  const [messages, setMessages] = useState([]);

  const [userChats, setUserChats] = useState([]);

  console.log(messages, "message details: ");
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const parentResponse = await axios.get(
          `/user/parent/specific/${passedId.parent}`
        );
        setParents(parentResponse.data.parent);
        console.log(parentResponse.data.parent, "parent response");

        const responderResponse = await axios.get(
          "/admin/responder/getResponder"
        );
        console.log(responderResponse.data.data, "responder response");
        setResponder(responderResponse.data.data);

        const messageResponse = await axios.get(`/user/message/specific/${id}`);
        console.log("message response: ", messageResponse.data.data);
        setMessages(messageResponse.data.data);

        const chatResponse = await axios.get(`/chats/${id}`);
        console.log("chats ", chatResponse.data.data);
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
        if (currentStep === 1) {
          setProgress(65);
        }
        if (currentStep === 2) {
          setProgress(85);
        }
        if (currentStep === 3) {
          setProgress(95);
        }
        if (currentStep === 4) {
          setProgress(100);
        }
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

  // Scroll to the bottom whenever the dialog opens or messages update
  const scrollToBottom = () => {
    if (dialogContentRef.current) {
      dialogContentRef.current.scrollTop =
        dialogContentRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    if (openChat) {
      console.log("helo");
      scrollToBottom();
    }
  }, [userChats, userChats]);

  const sendMessage = async () => {
    if (setChat) {
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
  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          flexDirection: "column",
        }}
      >
        <p>⚠️⚠️⚠️</p>
        <h3> {error}</h3>
      </div>
    );

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
  const handleUpdate = async (id) => {
    try {
      const data = {
        percentage: progress,
        userId: passedId._id,
        id: id,
      };
      const sendNotif = {
        to: `${passedId.pushToken}`,
        title: "New Notification",
        body: "Tap to see details!",
        data: {
          screen: "ShowProgress",
          details: message,
        },
      };
      await axios.post("/push-notification", sendNotif);
      await axios.put(`/user/message/update/${id}`, data);

      if (direction == "next" && currentStep < 5) {
        const newStep = currentStep + 1;
        setCurrentStep(newStep);
        localStorage.setItem(`currentStep_${id}`, newStep); // Save current step with ID
        localStorage.setItem(`processInfo_${id}`, JSON.stringify(processInfo)); // Save form data with ID
      } else if (direction === "previous" && currentStep > 1) {
        const newStep = currentStep - 1;
        setCurrentStep(newStep);
        localStorage.setItem(`currentStep_${id}`, newStep); // Save current step with ID
        localStorage.setItem(`processInfo_${id}`, JSON.stringify(processInfo)); // Save form data with ID
      }
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating progress:", error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Report submitted:", processInfo);

    // Clear stored step and data for this specific ID
    localStorage.removeItem(`currentStep_${id}`);
    localStorage.removeItem(`processInfo_${id}`);

    alert("Done Transaction!");
  };

  return (
    <div className="Ongoing-container">
      {passedId ? (
        parents ? (
          <div className="container-box-ongoing">
            <div className="header">
              <h1>REPORT</h1>
              <h4>{passedId.emergency}</h4>
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
                              {passedId.phone_number && (
                                <QRCode
                                  size={100}
                                  bgColor="transparent"
                                  fgColor="black"
                                  value={
                                    passedId.phone_number ||
                                    "No contact number found"
                                  }
                                />
                              )}
                            </div>
                            <div className="infobox user">
                              <div className="identify">
                                <p>{passedId.role}</p>
                              </div>
                              <div className="identity">
                                <span>{passedId.name}</span>
                                <span>{passedId.phone_number}</span>
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
                                Select a responder for {passedId.emergency}
                              </option>

                              {responder
                                .filter(
                                  (responderObj) =>
                                    responderObj.emergencyRole ===
                                    passedId.emergency
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
                                  value={selectedOfficeId}
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
                                  value={selectedOptionalId}
                                  onChange={handleChangeDropdownOptional}
                                  disabled={!isOptionalEnabled} // Disables if checkbox is not checked
                                >
                                  <option value="" disabled>
                                    Responder option
                                  </option>

                                  {responder
                                    .filter(
                                      (responderObj) =>
                                        responderObj.universityOffice ===
                                        selectedOfficeId
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
                              value={selectedResponderInfo.universityOffice}
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
                              value={selectedOptionalInfo.universityOffice}
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
                  <div className="form-group">
                    <label htmlFor="otw">On-The-Way</label>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="form-group">
                    <label htmlFor="ota">On-The-Air</label>
                  </div>
                )}
              </form>

              {/* button  */}

              <div className="button-group">
                <div className="buttons">
                  {currentStep > 1 && (
                    <button type="button" onClick={handlePrevious}>
                      Previous
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <button type="button" onClick={handleNext}>
                      Next
                    </button>
                  ) : (
                    <button type="submit">Submit</button>
                  )}
                </div>
              </div>

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
                  <Button onClick={() => handleUpdate(id)} color="success">
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
                  <span>{passedId.name} </span>
                  <span>{passedId.account_id}</span>
                </div>
              </DialogTitle>
              <DialogContent
                ref={dialogContentRef}
                sx={{ maxHeight: "400px", overflowY: "auto"}}
              >
                <div className="message-list">
                  {userChats.length > 0 ? (
                    userChats.map((msg, index) => (
                      <div
                        key={msg.id}
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
                    ))
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
