const express = require("express");
// const { nanoid } = await import("nanoid");
const { createId } = require('@paralleldrive/cuid2');
const RoomModel = require("../models/room");

exports.createRoom = async (req, res) => {
  const { userName, roomName, password } = req.body;
  if (!userName || !roomName || !password) {
    res.status(422).json({ error: "please add all field" });
    return;
  }
  const userId = req.cookies.userId || createId();

  const newRoom = new RoomModel({
    roomId: createId(),
    members: [{ userId: userId, name: userName }],
    roomName,
    password,
  });

  try {
    const savedRoom = await newRoom.save();
    res.cookie('userId', userId);
    res.status(200).json({ room: savedRoom, redirectUrl: '/code' });
    console.log(savedRoom);
    console.log(req.cookies.userId);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getRoomsOfUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const room = await RoomModel.find({
      "members.userId": userId,
    });

    res.status(200).json(room);
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.joinRoom = async (req, res) => {
    const { userName, roomId, password } = req.body;
    let userId = req.cookies.userId;
    console.log("Joining room...")
  
    if (!userId) {
      // If userId is not present in the cookie, create a new one
      userId = createId();
    }
  
    if (!userName || !roomId || !password) {
      res.status(422).json({ error: "Please add all fields" });
    } else {
      console.log("Every value given, roomid - ", roomId)
      try {
        const savedRoom = await RoomModel.findOne({ roomId: roomId });
  
        if (!savedRoom) {
          res.status(422).json({ error: "Invalid Room Id or password" });
        } else if (savedRoom?.password === password) {
          // Check if the user has already entered the room
          const existingUser = savedRoom.members.find((member) => member.userId === userId);
  
          if (!existingUser) {
            // User hasn't entered the room, add the user
            const newUser = { userId, name: userName };
            await RoomModel.updateOne(
              { _id: savedRoom._id },
              { $push: { members: newUser } },
              { new: true }
            );
  
            res.cookie('userId', userId);
  
            res.status(200).json({
              UserId: userId,
              UserName: userName,
              RoomId: roomId,
              RoomName: savedRoom.roomName,
              password: savedRoom.password,
              Message: 'User entered the room for the first time.',
            });
          } else {
            // User has already entered the room
            res.status(200).json({
              UserId: userId,
              UserName: userName,
              RoomId: roomId,
              RoomName: savedRoom.roomName,
              password: savedRoom.password,
              Message: 'User has already entered the room.',
            });
          }
        } else {
          res.status(422).json({ error: "Invalid room id or password" });
        }
      } catch (error) {
        res.status(422).json({ error: error.message });
      }
    }
  };
  

exports.codeSave = async (req, res) => {
    const { roomId, code } = req.body;
    try{
        const savedRoom = await RoomModel.findOneAndUpdate(
                                { roomId: roomId },
                                { $set: { code: code } },
                                { new: true }
                            );
                        
        res.status(200).json({
            RoomId: roomId,
            RoomName: savedRoom.roomName,
            code: code,
            Message: 'Code saved successfully'
        });
    }
    catch(error){
        res.status(422).json({ error: error.message });
    }
};
