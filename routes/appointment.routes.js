const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getPatientAppointments
} = require('../controllers/appointment.controller');

// @route   POST /api/appointments
// @desc    Create a new appointment
router.post('/', createAppointment);

// @route   GET /api/appointments/patient/:patientId
// @desc    Get appointments by patient ID
router.get('/patient/:patientId', getPatientAppointments);

module.exports = router;
