const express = require("express");
const { createNewMessage, getMessages } = require("../controllers/messages");
const router = express.Router();

// add
router.post("/messages", createNewMessage);

// get
router.get("/messages/:roomId", getMessages);

module.exports = router;
