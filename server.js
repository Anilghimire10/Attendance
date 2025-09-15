require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./configs/dbConfig");
const app = require("./app");
const handleAttendanceSockets = require("./sockets/attendanceHandler");

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Setup socket handlers
handleAttendanceSockets(io);

// Start server
const PORT = process.env.PORT || 3000;
server
  .listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
