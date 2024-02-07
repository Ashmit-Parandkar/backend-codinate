const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
