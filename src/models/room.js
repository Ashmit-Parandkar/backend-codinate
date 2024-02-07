const { model, Schema } = require("mongoose");

const roomSchema = new Schema(
  {
    roomName: {
      type: String,
      require: true,
    },
    roomId: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    code: {
      type: String,
      default: "",
    },
    members: {
      type: Array,
      userId: {
        type: String,
      },
      name: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = model("Room", roomSchema);
