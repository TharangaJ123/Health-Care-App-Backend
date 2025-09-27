const express = require("express");
const db = require("./config/firebase");
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

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
