const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const {createServer} = require('http');
const { Server } = require('socket.io');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let currentCode = "";

// Initialize server with express app
// const server = require('http').createServer(app);
const server = new createServer(app);
// const io = require('socket.io')(server);
const io = new Server(server,{
  cors:{
     origin:"http://localhost:5173", 
     method: ["GET","POST"],
     credentials:true,
  },
 });

// Socket.io server handling
io.on('connection', (socket) => {
  console.log('Socket.io client connected');

  // Send current code to the newly connected client
  socket.emit('currentCode', currentCode);

  socket.on('message', (message) => {
    console.log(`Received message: ${message}, ${message.data}`);
    if (message.data === "getInitialCode") {
      // If the message is a request for initial code, send the current code
      socket.emit('currentCode', currentCode);
    } else {
      // Update the current code with the received message
      currentCode = message;
      // Broadcast the updated code to all connected clients
      io.emit('currentCode', currentCode);
      console.log(currentCode);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.io client disconnected');
  });
});

// Config Database
mongoose
  .connect(process.env.MONGO_URI, {
  
  })
  .then(() => console.log("Database Connected!"))
  .catch((e) => console.log(e));

mongoose.connection.on("error", (err) => {
  console.log(`DB Connection error: ${err.message}`);
});

const PORT = process.env.PORT || 8080;

const roomRoutes = require("./routes/room");
const messageRoutes = require("./routes/messages");

app.use("/api", roomRoutes);
app.use("/api", messageRoutes);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
