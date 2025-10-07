const express = require("express");
const { db } = require("./config/firebase");
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check route
const testConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    // Test Firebase connection
    await db.collection('test').limit(1).get();
    console.log("✅ Firebase connected successfully");
  } catch (err) {
    console.error("❌ Firebase connection failed:", err.message);
    console.error("Full error:", err);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

testConnection();
