const Appointment = require('../models/appointment.model');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res) => {
  try {
    const appointmentData = req.body;
    
    // Basic validation
    if (!appointmentData.patientId || !appointmentData.doctorId || !appointmentData.date || !appointmentData.time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: patientId, doctorId, date, and time'
      });
    }

    const appointment = await Appointment.create(appointmentData);
    
    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get appointments by patient ID
// @route   GET /api/appointments/patient/:patientId
// @access  Public
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const appointments = await Appointment.findByPatientId(patientId);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
