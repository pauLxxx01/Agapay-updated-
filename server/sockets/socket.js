// sockets/socket.js
const JWT = require("jsonwebtoken");
const { Server } = require("socket.io");
const colors = require("colors");
const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel");
const messageModel = require("../model/messageModel");
const reportModel = require("../model/reportModel");

let activeSockets = []; // Object to store sockets by user ID

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
  socket.on("register", () => {
    activeSockets[socket.user._id] = socket;
    console.log(`Registered socket for user: ${socket.user._id}`);
  });

  // Example of emitting an event after a successful connection
  socket.emit("userConnected", {
    userId: socket.user._id,
    name: socket.user.name,
  });

  //chat room
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(`${socket.user.name} joined room: ${roomName}`);
  });

  socket.on("sendMessage", async ({ room, message, sender }) => {
    // Validate the incoming data
    if (!room || !message || !sender) {
      console.error(
        "Invalid data received. Room, message, or sender is missing."
      );
      return;
    }

    console.log(`Message in room ${room} ~ sender ${sender} : ${message}`);

    try {
      const newMessage = { sender, message, timestamp: new Date() };

      // Update the room with the new message
      const updatedRoom = await messageModel.findOneAndUpdate(
        { room },
        { $push: { content: newMessage } },
        { new: true }
      );

      if (!updatedRoom) {
        console.error(`Room not found for ID: ${room}`);
        return;
      }

      // Emit the message to all clients in the room
      io.to(room).emit("receiveMessage", newMessage);
      console.log(`Message sent to room ${room}:`, newMessage);
    } catch (error) {
      console.error("Error updating room messages:", error);
    }
  });

  socket.on("notification", (notif) => {
    console.log("Notification from server socket: " + notif);
  });
  socket.emit("receive-notification", (notif) => {
    console.log("Notification received:", notif);
  });

  socket.on("update-hide-status", (announcement) => {
    io.emit("hide-status", announcement);
  });

  socket.on("disconnect", () => {
    console.log(
      `User disconnected: ${socket.user._id} - ${socket.user.name} - ${socket.id}`
        .bgRed.white
    );
    delete activeSockets[socket.user._id]; // Remove from activeSockets
  });
};

async function sendReport(
  emergency,
  location,
  message,
  senderId,
  percentage,
  img,
  respond,
  createdAt,
  user
) {
  try {
    const updateReport = await reportModel.findOneAndUpdate({});

    const admins = await adminModel.find({ role: "admin" });

    admins.forEach((admin) => {
      const socket = activeSockets[admin._id]; // or admin.name depending on your key

      if (socket) {
        socket.emit("report", {
          messages: {
            emergency,
            location,
            message,
            senderId,
            percentage,
            img,
            respond,
            createdAt,
          },
          users: user,
        });

        // Send detailed report

        console.log(`Report sent to admin ${admin.name} --- ${senderId}`);
        console.log(`Respond progress: ${respond} / ${percentage}`);
      } else {
        console.log(`Admin ${admin.name} is not connected`);
      }
    });
  } catch (error) {
    console.error("Error sending report to admins:", error);
  }
}

async function sendAnnouncementToUser(
  _id,
  title,
  topic,
  description,
  date,
  department,
  duration,
  hiddenBy,
  createdAt
) {
  try {
    global.io.emit("announcement", {
      _id,
      title,
      topic,
      description,
      date,
      department,
      duration,
      hiddenBy,
      createdAt,
    }); // Send announcement
    console.log(
      `id: ${_id} title: ${title} topic: ${topic} description: ${description} date: ${date} duration: ${duration}`
    );
    console.log(
      `hiddenBy: ${hiddenBy} createdAt: ${createdAt} department: ${department}`
    );
  } catch (error) {
    console.error("Error sending announcement to users:", error);
  }
}

async function updatedAnnouncement(announcement) {
  try {
    global.io.emit("hide-status", announcement);
    console.log(`Announcement update ${announcement}`);
  } catch (error) {
    console.error("Error updating announcement:", error);
  }
}

async function sendMessages(message, sender, senderId, room) {
  try {
    const socket = activeSockets[senderId];
    if (socket) {
      socket.emit("chat", {
        senderId,
        sender,
        message,
        room,
      });
      console.log(`Socket: ${socket}`);
      console.log(
        `Room: ${room} ~ Message sent: ${senderId} & ${sender} ~ Message: ${message}`
      );
    } else {
      console.log(`Client ${senderId} is not connected`);
    }
  } catch (error) {
    console.error("Error sending message", error);
  }
}
async function updateProgress(updatedMessage, user) {
  try {
    // Emit the progress update to the specific user
    global.io.emit("progressUpdate", {
      messages: updatedMessage,
      users: user,
    });
    console.log(`Progress update completed successfully`);
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

module.exports = {
  initializeSocket,
  sendReport,
  updateProgress,
  sendAnnouncementToUser,
  sendMessages,
  updatedAnnouncement,
};
