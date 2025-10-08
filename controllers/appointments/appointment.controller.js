const Appointment = require("../../models/appointments/appointment.model");
const Activity = require("../../models/activities/activity.model");

exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    try { await Activity.log({ action: 'created', appointment }); } catch (_) {}
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.getAll();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.getById(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const updated = await Appointment.update(req.params.id, req.body);
    // get full record to include computed fields
    const fresh = await Appointment.getById(req.params.id);
    try { await Activity.log({ action: 'updated', appointment: fresh || updated }); } catch (_) {}
    res.json(fresh || updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const existing = await Appointment.getById(req.params.id);
    const msg = await Appointment.delete(req.params.id);
    try { await Activity.log({ action: 'deleted', appointment: existing || { appointmentId: req.params.id } }); } catch (_) {}
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
