let express = require("express");
const {
  createPaste,
  getPaste,
  viewPaste,
} = require("../controller/pastecontroller");

const rt = express.Router();
rt.get("/healthz", (req, res) => res.json({ ok: true }));
rt.post("/pastes", createPaste);
rt.get("/pastes/:id", getPaste);
rt.get("/p/:id", viewPaste);
module.exports = rt;
