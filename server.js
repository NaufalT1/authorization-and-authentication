require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const users = [];

const posts = [
  {
    username: "Joe",
    title: "My first post",
  },
  {
    username: "Mey",
    title: "My second post",
  },
];

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.find((post) => post.username === req.user.username));
});

app.post("/login", (req, res) => {
  //only authorization
  const username = req.body.username;
  const user = { username: username }; //this contain information of our user. We can add expir etc here

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken });
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/user", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);
    res.status(201).json(user);
  } catch {
    res.status(500).json({ message: "Error while creating user" });
  }
});
app.post("/user/login", async (req, res) => {
  const user = users.find((user) => user.name === req.body.name);
  if (user == null) {
    return res.status(401).json({ message: "Not Allowed" });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.status(200).send("Success");
    } else {
      res.status(401).send("Not Allowed");
    }
  } catch {
    res.status(500).json({ message: "Error while try to log in" });
  }
});

app.listen(3000, () => {
  console.log("Application Running on Port 3000");
});
