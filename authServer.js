const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

app.listen(4000, () => {
  console.log("Application Running on Port 4000");
});
