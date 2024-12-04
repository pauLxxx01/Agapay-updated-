// sockets/socket.js
const JWT = require("jsonwebtoken");
const { Server } = require("socket.io");
const colors = require("colors");
const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel");

let activeSockets = {}; // Object to store sockets by user ID

// WebSocket authentication middleware
const socketIoMiddleware = (socket, next) => {
  const token = socket.handshake.query.token;

  if (!token) {
    return next(new Error("Authentication error: Token is missing"));
  }

  // Verify token
  JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Unauthorized"));
    }

    console.log("Decoded Token: ", decoded);

    activeSockets[decoded._id] = socket;

    // Attach decoded user info to the socket object
    socket.user = decoded;

    next(); // Proceed with the connection
  });
};

// WebSocket connection logic
const socketConnection = (socket) => {
  console.log(
    `User Connected: ${socket.user._id} - ${socket.user.name} - ${socket.id} `
      .bgCyan.white
  );

  // Example of emitting an event after a successful connection
  socket.emit("userConnected", {
    userId: socket.user._id,
    name: socket.user.name,
  });

  socket.on("notification", (notif) => {
    console.log("Notification from server socket: " + notif);
  });

  socket.emit("receive-notification", (notif) => {
    console.log("Notification received:", notif);
  });

  socket.on("disconnect", () => {
    console.log(
      `User disconnected: ${socket.user._id} - ${socket.user.name} - ${socket.id}`
        .bgRed.white
    );
  });
};

async function sendReport(
  emergency,
  location,
  message,
  senderId,
  percentage,
  img
) {
  try {
    const admins = await adminModel.find({ role: "admin" });

    admins.forEach((admin) => {
      const socket = activeSockets[admin._id]; // or admin.name depending on your key

      if (socket) {
        socket.emit("report", {
          emergency,
          location,
          message,
          senderId,
          percentage,
          img,
        }); // Send detailed report
        console.log(`Socket: ${socket}`)
        console.log(`Report sent to admin ${admin.name} --- ${senderId}`);
      } else {
        console.log(`Admin ${admin.name} is not connected`);
      }
    });
  } catch (error) {
    console.error("Error sending report to admins:", error);
  }
}

async function sendAnnouncementToUser(
  title, description, date, department, duration
){
  try {
    const users = await userModel.find();
    users.forEach((user) => {
      const socket = activeSockets[user._id]; 
      if (socket) {
        socket.emit("announcement", {
          title,
          description,
          date,
          department,
          duration,
        }); // Send announcement
        console.log(`Socket: ${socket}`)
        console.log(`Announcement sent to user ${user.name}`);
      } else {
        console.log(`User ${user.name} is not connected`);
      }
    });
  } catch (error) {
    console.error("Error sending announcement to users:", error);
  }
}

async function updateProgress(userId, percentage, id) {
  try {
    // Find the socket for the specific user
    const socket = activeSockets[userId];

    if (socket) {
      // Emit the progress update to the specific user
      socket.emit("progressUpdate", {userId, percentage, id});
      console.log(`Progress updated for user ${userId} messageId: ${id}  ~~ percent: ${percentage}`);
    } else {
      console.log(`No active socket found for user ${userId}`);
    }
  } catch (error) {
    console.error("Error updating progress:", error);
  }
}


// Initialize and configure WebSocket server
const initializeSocket = (server) => {
  const io = new Server(server, { cors: { origin: "*" } });

  // Use authentication middleware for WebSocket connections
  io.use(socketIoMiddleware);

  // Handle WebSocket connection
  io.on("connection", socketConnection);

  global.io = io;
};

module.exports = { initializeSocket, sendReport, updateProgress, sendAnnouncementToUser };
