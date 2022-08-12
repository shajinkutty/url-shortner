const express = require("express");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const path = require("path");
const shortid = require("shortid");
const ShortUrl = require("./model/Shorturl");

require("dotenv").config();

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get("/", async (req, res, next) => {
  res.render("index");
});

app.post("/", async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      throw createHttpError.BadRequest("Provide a valid url");
    }
    const urlExists = await ShortUrl.findOne({ url });
    if (urlExists) {
      res.render("index", {
        // short_url: `${req.hostname}/${urlExists.shortId}`,
        output: `${req.headers.host}/${urlExists.shortUrl}`,
        short_url: urlExists.shortUrl,
      });
      return;
    }

    const newUrl = await ShortUrl.create({ url, shortUrl: shortid.generate() });
    res.render("index", {
      // short_url: `${req.headers.host}/${newUrl.shortUrl}`,
      // short_url: `${req.hostname}/${newUrl.shortUrl}`,
      output: `${req.headers.host}/${newUrl.shortUrl}`,
      short_url: newUrl.shortUrl,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/:shortId", async (req, res, next) => {
  const shortId = req.params.shortId;

  try {
    const result = await ShortUrl.findOne({ shortUrl: shortId });
    if (!result) {
      throw createHttpError.NotFound("Short url does not exist");
    }

    res.redirect(result.url);
  } catch (error) {
    next(createHttpError.NotFound());
  }
});

// Error handling

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render("index", { error: err.message });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo DB connected");
    app.listen(5000, () => {
      console.log("Server running port 5000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
