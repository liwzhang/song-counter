// set up
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const query = require("query-string");
const cron = require("node-cron");
const { LocalStorage } = require("node-localstorage");

// config
const PORT = process.env.PORT || 8000;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = `http://localhost:${PORT}/api/user`;
const localStorage = new LocalStorage("./scratch");

const app = express();

app.use(cors());

let songs = [];
let auth = {};

// app routes
app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api/login", (req, res) => {
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

app.get("/api/user", (req, res) => {
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
    .then((authRes) => {
      //console.log(authRes.data);
      let { access_token, refresh_token } = authRes.data;
      auth = { Authorization: "Bearer " + access_token };
      axios
        .get("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
        .then((dataRes) => {
          let name = dataRes.data.item.name;
          let artist = dataRes.data.item.artists[0].name;
          let img = dataRes.data.item.album.images[1].url;
          console.log(dataRes.data.item.album);
          //res.send(`<img src="${img}"/>`);
          songs.push({ name, artist, img });
          res.redirect("/songs");
        });
    })
    .catch((err) => {
      console.log(err.response);
    });
});

app.get("/songs", (req, res) => {
  res.status(200).json(songs);
});

app.get("/refresh", (req, res) => {
  console.log(auth);
  axios
    .get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: auth,
    })
    .then((dataRes) => {
      let name = dataRes.data.item.name;
      let artist = dataRes.data.item.artists[0].name;
      let img = dataRes.data.item.album.images[1].url;
      console.log(dataRes.data.item.album);
      songs.push({ name, artist, img });
      res.redirect("/songs");
    })
    .catch(() => {
      console.log("err occured");
    });
});

const job = cron.schedule(
  "*/1 * * * *",
  () => {
    console.log("running every 1 minutes ", Date());
    axios.get("http://localhost:8800/login").then((res) => {
      console.log(res);
    });
  },
  { scheduled: false }
);

// start server
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
  console.log(Date());
});
