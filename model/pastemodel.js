let mongoose = require("mongoose");

let pasteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    maxViews: {
      type: Number,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

let Paste = mongoose.model("paste", pasteSchema);
module.exports = Paste;
