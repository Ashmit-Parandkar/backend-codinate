const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const WebSocket = require("ws");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let currentCode = "";

const server = http.createServer(app); // Create an HTTP server

// Initialize WebSocket server with the HTTP server instance
const wss = new WebSocket.Server({ port: 9090 });

// WebSocket server handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.send(currentCode);

  
ws.on("message", (message) => {
  console.log(`Received message: ${message}, ${message.data}`);
  if (message.data === "getInitialCode") {
    // If the message is a request for initial code, send the current code
    ws.send(currentCode);
  } else {
    // Update the current code with the received message
    currentCode = message;
    // Broadcast the updated code to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(currentCode);
        console.log(currentCode)
      }
    });
  }
});

  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
