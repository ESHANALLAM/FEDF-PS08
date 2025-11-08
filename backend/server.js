const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, "data", "reports.json");

// GET all reports
app.get("/api/reports", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  res.json(data);
});

// POST new report
app.post("/api/reports", (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const newReport = { id: Date.now(), ...req.body };
  data.push(newReport);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.json({ message: "Report added!", report: newReport });
});

// Example route for role-based messages
app.get("/api/message/:role", (req, res) => {
  const role = req.params.role;
  let message = "";
  if (role === "citizen") message = "Welcome Citizen! You can report issues.";
  else if (role === "politician") message = "Welcome Politician! View and resolve issues.";
  else if (role === "admin") message = "Admin dashboard loaded.";
  else if (role === "moderator") message = "Moderator controls active.";
  else message = "Unknown role.";
  res.json({ message });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));