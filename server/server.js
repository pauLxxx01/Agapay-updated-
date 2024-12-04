const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDb = require('./config/db')
const { initializeSocket } = require("./sockets/socket");

//rest object
const app = express();

//dotenv
dotenv.config();

//mongodb connection
connectDb();

//middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('public'))



// Define port
const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = require("http").createServer(app);

// Initialize WebSocket server and attach it to the HTTP server
initializeSocket(server);

// Routes
app.use("/admin/auth", require("./routes/routes"));

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`.bgCyan.white);
});

process.on('SIGINT', () => {
  server.close(() => {
      console.log('Server closed');
      process.exit(0);
  });
});