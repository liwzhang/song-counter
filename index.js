const express = require("express");
const app = express();
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

app.get("/", (req, res) => {
  console.log("Hello world!");
});
