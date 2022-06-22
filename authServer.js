require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

//because we haven't created databse yet, it will store here
var users = [];
var refreshTokens = [];

const app = express();

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

app.use(express.json());

app.get("/users", (req, res) => {
  res.json(users);
});
app.get("/tokens", (req, res) => {
  res.json(refreshTokens);
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
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      refreshTokens.push(refreshToken);
      res.json({ accessToken, refreshToken });
    } else {
      res.status(401).send("Not Allowed");
    }
  } catch {
    res.status(500).json({ message: "Error while try to log in" });
  }
});

app.post("/refresh-token", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken == null) {
    return res.sendStatus(401).send("Not Allowed1");
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(401).send("Not Allowed2");
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(401).send("Not Allowed3");
    } else {
      const payload = { username: user.username };
      return res.json({
        accessToken: generateAccessToken(payload),
      });
    }
  });
});

app.delete("/sign-out", (req, res) => {
  refreshTokens = refreshTokens.filter(
    (token) => token !== req.body.refreshToken
  );
  res.sendStatus(204);
});

app.listen(4000, () => {
  console.log("Application Running on Port 4000");
});
