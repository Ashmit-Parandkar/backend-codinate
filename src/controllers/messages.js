const express = require("express");
const MessageModel = require("../models/Message");

exports.createNewMessage = async (req, res) => {

    const { roomId, senderId, senderName, text } = req.body;

  // Validate that roomId and text are present
  if (!roomId || !text) {
    return res.status(422).json({ error: "roomId and text are required" });
  }

  const newMessage = new MessageModel({
    roomId,
    senderId,
    senderName,
    text,
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await MessageModel.find({
      roomId: req.params.roomId,
    });

    res.status(200).json(messages);
  } catch (e) {
    res.status(500).json(e);
  }
};
