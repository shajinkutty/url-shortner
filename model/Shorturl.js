const mongoose = require("mongoose");
const URLSchema = new mongoose.Schema({
  url: String,
  shortUrl: String,
});

const ShortUrl = mongoose.model("url", URLSchema);

module.exports = ShortUrl;
