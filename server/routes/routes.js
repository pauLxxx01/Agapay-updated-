const express = require("express");
//for admin
const {
  registerController,
  loginControllers,
  getAdmin,
  deleteAdmin,
  updateAdmin,
} = require("../controller/adminController");

//for users
const {
  registerUserController,
  getUser,
  deleteUser,
  deleteParent,
  getParent,
  getSpecificUser,
  updateAccounts,
  loginController,
  getSpecificParent,
  getToken,
} = require("../controller/usersController");

//for messages
const {
  sendReportToAdmin,
  getReportMessages,
  getSpecificReportMessage,
  updateReportMessage,
  deleteReportMessage,
} = require("../controller/reportController");

//for responder
const {
  registerResponder,
  getResponder,
  updateResponder,
  deleteResponder,
} = require("../controller/responderController");

const { verifyToken, sendingToken } = require("../controller/otpController");

//for image
const path = require("path");
const multer = require("multer");
const { sendPush } = require("../controller/notificationController");
const { sendFeedback } = require("../controller/feedbackController");
const {
  sendAnnouncement,
  getAnnouncement,
  toggleHide,
} = require("../controller/announcementController");
const { sendMessage, getMessage } = require("../controller/messageController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploads = multer({
  storage: storage,
});

//router objects
const router = express.Router();

//Routes for (user)
router.post("/user/register", registerUserController);
router.get("/user/getUser", getUser);
router.get("/user/account/specific/:id", getSpecificUser);
router.delete("/user/delete/:id", deleteUser);

//Routes for user (mobile)
router.post("/mobile/user/login", loginController);

//Routes for update (user and parent)
router.put("/userUpdate/parentUpdate/:id", updateAccounts);
router.put("/save-token/:id", getToken);

//Routes for (parents)
router.get("/user/parent/getParent", getParent);
router.get("/user/parent/specific/:id", getSpecificParent);
router.delete("/user/parent/delete/:id", deleteParent);

//sendingOTP
router.get("/request-otp/:id", sendingToken);
router.post("/verify/request-otp/", verifyToken);

//Routes for (admin)
router.post("/register", registerController);
router.get("/getAdmin", getAdmin);
router.get("/findAdmin/:id");
router.delete("/deleteAdmin/:id", deleteAdmin);
router.put("/updateAdmin/:id", updateAdmin);
router.post("/login", loginControllers);

//Routes for message  (web)
router.get("/user/messages", getReportMessages);
router.get("/user/message/specific/:id", getSpecificReportMessage);
router.put("/user/message/update/:id", updateReportMessage);
router.delete("/user/message/delete/:id", deleteReportMessage);

router.post("/send-report", uploads.single("img"), sendReportToAdmin);

//reponder
router.post("/admin/responder/register", registerResponder);
router.get("/admin/responder/getResponder", getResponder);
router.put("/admin/responder/update/:id", updateResponder);
router.delete("/admin/responder/delete/:id", deleteResponder);

//sending to mobile
router.post("/push-notification", sendPush);

//feedbacks
router.post("/user/feedback", sendFeedback);

//chat
router.post("/chats", sendMessage);
router.get("/chats/:id", getMessage);

//announcement
router.post("/send-announcement", sendAnnouncement);
router.get("/get-announcement", getAnnouncement);
router.put("/announcement/toggle-hide/:id", toggleHide);

module.exports = router;
