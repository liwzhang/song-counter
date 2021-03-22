// set up
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const query = require("query-string");
const PORT = process.env.PORT || 8000;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = "http://localhost:3000/user";

const app = express();

app.use(cors());

// app routes
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/login", (req, res) => {
  let scopes = "user-read-currently-playing";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      clientId +
      "&scope=" +
      encodeURIComponent(scopes) +
      "&redirect_uri=" +
      encodeURIComponent(redirectUri)
  );
});

app.get("/user", (req, res) => {
  res.send("You are logged in.");
  let code = req.query.code || null;
  let reqBody = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
  };
  axios
    .post("https://accounts.spotify.com/api/token", query.stringify(reqBody), {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer(clientId + ":" + clientSecret).toString("base64"),
      },
    })
    .then((res) => {
      console.log(res.data);
      let { access_token, refresh_token } = res.data;
      axios
        .get("ttps://api.spotify.com/v1/me/player/currently-playing", {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
        .then((res) => {
          console.log(res.data);
          console.log(res.data.item.album);
        });
    })
    .catch((err) => {
      console.log(err.response);
    });
});

app.get("/songs", (req, res) => {
  res.send("Your Spotify songs.");
});

// start server
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
