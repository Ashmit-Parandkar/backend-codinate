const { model, Schema } = require("mongoose");

const messageSchema = new Schema(
  {
    roomId: {
      type: String,
      require: true,
    },
    senderName: {
      type: String,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Message", messageSchema);
