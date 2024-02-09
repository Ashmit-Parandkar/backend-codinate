const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const {createServer} = require('http');
const { Server } = require('socket.io');
const Room = require('./models/room')

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

const getInitialCode = async(roomId) =>{
  const currRoom = await Room.findOne({roomId: roomId})
  console.log("Checking... ",currRoom.code)
  return currRoom.code;
}

// Socket.io server handling
io.on('connection', (socket) => {
  console.log('Socket.io client connected');
  // socket.on('initialData', getInitialCode())
  
  // Send current code to the newly connected client
  //socket.emit('currentCode', currentCode);

  


  socket.on("addProjectRoom", (id) => {
    socket.join(id + "project");
    console.log(`he added in the room ${id}+"project"`);

  });
  
  socket.on('message', async (message) => {
    console.log(`Received message: ${message.roomId}, ${message.newCode}`);
      
      if(message.newCode === "") {
        const m0 = await getInitialCode(message.roomId);
        console.log("Checking22.... " , m0)
        socket.emit('currentCode', await getInitialCode(message.roomId))
      }
      else{
      currentCode = message;

      // Extract roomId from the message
      const { roomId, newCode } = message;
      console.log(roomId, newCode);

      // Update the code in the respective room in the database
      try {
        const updatedRoom = await Room.findOneAndUpdate(
          { roomId },
          { code: newCode },
          { new: true } // To return the updated document
        );
        // Broadcast the updated code to all connected clients in the room
        console.log(`Emitting currentCode event for room ${roomId}`);

        // io.to(roomId).emit('currentCode', updatedRoom.code);
        socket.broadcast.to(roomId + "project").emit("currentCode", updatedRoom.code);

        console.log(`Code updated for room ${roomId}, Updated Code : ${updatedRoom.code}`);
      } catch (error) {
        console.error(`Error updating code for room ${roomId}:`, error);
      }
    }
  });

  socket.on("chatMessage", ({ chatText, roomId, senderName, formattedTime }) => {
    
    socket.broadcast.to(roomId + "chat").emit("sendChatMessage", { chatText, roomId, senderName, formattedTime });
    console.log(chatText, roomId);
  });
  socket.on("addChatRoom", (roomId) => {
    socket.join(roomId + "chat");
    console.log(`he added in the room ${roomId}+"chat"`);
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
