const express = require("express");
const db = require("./config/firebase");
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config();

const appointmentRoutes = require("./routes/appointments/appointment.routes")
const communityRoutes = require("./routes/community/community.routes")
const doctorRoutes = require("./routes/doctors/doctor.routes")
const activityRoutes = require("./routes/activities/activity.routes")

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/appointments", appointmentRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/activities", activityRoutes);

const testConnection = async () => {
  try {
    console.log("Firebase connected successfully ✅");
  } catch (err) {
    console.error("Firebase connection failed ❌", err.message);
  }
};

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

testConnection();
