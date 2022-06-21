require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const users = [];

const app = express();

app.use(express.json());

app.post("/login", (req, res) => {
  //only authorization
  const username = req.body.username;
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/sign-up", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword };
    users.push(user);
    res.status(201).json(user);
  } catch {
    res.status(500).json({ message: "Error while creating user" });
  }
});
app.post("/sign-in", async (req, res) => {
  const user = users.find((user) => user.username === req.body.username);
  if (user == null) {
    return res.status(401).json({ message: "Not Allowed" });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const payload = { username: user.username };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken });
    } else {
      res.status(401).send("Not Allowed");
    }
  } catch {
    res.status(500).json({ message: "Error while try to log in" });
  }
});

app.listen(4000, () => {
  console.log("Application Running on Port 4000");
});
