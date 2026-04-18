const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());


app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  // res.send("hi")
});


mongoose
  .connect("mongodb://127.0.0.1:27017/crime_portal")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const ReportSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  crimeType: String,
  details: String,
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const Report = mongoose.model("Report", ReportSchema);




app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await User.create({ username, password: hashed });
    res.json({ message: "Registered successfully" });
  } catch {
    res.status(400).json({ message: "User exists" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: "Invalid login" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Invalid login" });
  res.json({ message: "Login success", userId: user._id });
});

app.post("/report", async (req, res) => {
  const { userId, crimeType, details } = req.body;
  await Report.create({ userId, crimeType, details });
  res.json({ message: "Report saved" });
});

app.get("/reports/:userId", async (req, res) => {
  const reports = await Report.find({ userId: req.params.userId });
  res.json(reports);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));




