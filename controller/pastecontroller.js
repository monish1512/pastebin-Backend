let Paste = require("../model/pastemodel");
let getNow = (req) => {
  if (process.env.TEST_MODE == "1" && req.headers["x-test-now-ms"]) {
    return new Date(Number(req.headers["x-test-now-ms"]));
  }
  return new Date();
};

let createPaste = async (req, res) => {
  try {
    let { content, ttl_seconds, max_views } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ error: "Invalid content" });
    }

    let expiresAt = null;
    if (ttl_seconds) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return res.status(400).json({ error: "Invalid ttl_seconds" });
      }
      expiresAt = new Date(Date.now() + ttl_seconds * 1000);
    }

    if (max_views && (!Number.isInteger(max_views) || max_views < 1)) {
      return res.status(400).json({ error: "Invalid max_views" });
    }

    let data = new Paste({
      content,
      expiresAt,
      maxViews: max_views || null,
    });

    await data.save();

    res.status(201).json({
      id: data._id,
    });
  } catch {
    res.status(500).json({ error: "Error creating paste" });
  }
};

let getPaste = async (req, res) => {
  try {
    let obj = await Paste.findById(req.params.id);
    if (!obj) {
      return res.status(404).json({ error: "Paste not found" });
    }

    let now = getNow(req);

    if (obj.expiresAt && now > obj.expiresAt) {
      return res.status(404).json({ error: "Paste expired" });
    }

    if (obj.maxViews !== null && obj.views >= obj.maxViews) {
      return res.status(404).json({ error: "View limit exceeded" });
    }

    obj.views = obj.views + 1;
    await obj.save();

    res.status(200).json({
      content: obj.content,
      remaining_views: obj.maxViews === null ? null : obj.maxViews - obj.views,
      expires_at: obj.expiresAt,
    });
  } catch {
    res.status(500).json({ error: "Error fetching paste" });
  }
};

let viewPaste = async (req, res) => {
  try {
    let obj = await Paste.findById(req.params.id);
    if (!obj) {
      return res.status(404).send("Not Found");
    }

    let now = getNow(req);

    if (obj.expiresAt && now > obj.expiresAt) {
      return res.status(404).send("Not Found");
    }

    if (obj.maxViews !== null && obj.views >= obj.maxViews) {
      return res.status(404).send("Not Found");
    }

    obj.views = obj.views + 1;
    await obj.save();

    let safeContent = obj.content.replace(/</g, "&lt;");

    res.send(`
            <html>
                <body>
                    <pre>${safeContent}</pre>
                </body>
            </html>
        `);
  } catch {
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createPaste,
  getPaste,
  viewPaste,
};
