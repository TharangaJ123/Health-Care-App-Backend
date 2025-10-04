const express = require("express");
const db = require("./config/firebase");
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();

const goalRoutes = require("./routes/goalRoutes")

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/goals", goalRoutes);

const testConnection = async () => {
  try {
    console.log("Firebase connected successfully ✅");
  } catch (err) {
    console.error("Firebase connection failed ❌", err.message);
  }
};

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

testConnection();
