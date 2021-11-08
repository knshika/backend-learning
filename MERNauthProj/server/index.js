//MERN = MongoDB + Express + React.js + Node
//development => Node.js server + react.js server
//production => Node.js server + static react files

const express = require("express");
const User = require("./model/user");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://AuthDemo:authdemo123@cluster0.j3up3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  () => console.log("connected to db")
);

app.post("/api/register", async (req, res) => {
  console.log(req.body);
  try {
    const newPass = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: newPass,
    });
    //res.send(user)
    return res.json({ status: "ok" });
  } catch (error) {
    // res.status(400).send(error);
    res.json({ status: "error", error: "duplicate email" });
  }
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.send({ status: "error" }, { error: "Invalid email" });
  }

  const isValidPass = await bcrypt.compare(req.body.password, user.password);

  if (isValidPass) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      "secret123"
    );

    return res.json({ status: "ok", user: token });
  } else {
    return res.json({ status: "error", user: null });
  }
});

app.get("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decode = jwt.verify(token, "secret123");
    const email = decode.email;
    const user = await User.findOne({ email: email });

    return res.json({ status: "ok", quote: user.quote });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

app.post("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];
  try {
    const decode = jwt.verify(token, "secret123");
    const email = decode.email;
    await User.updateOne({ email: email }, { $set: { quote: req.body.quote } });

    return res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

app.listen(1337, () => {
  console.log("listening to port 1337");
});
