const Doctor = require("../../models/doctors/doctor.model");
const Appointment = require("../../models/appointments/appointment.model");

exports.createDoctor = async (req, res) => {
  try {
    console.log("[Doctors] createDoctor payload:", JSON.stringify(req.body, null, 2));
    console.log("[Doctors] createDoctor headers:", req.headers['content-type']);
    const doctor = await Doctor.create(req.body);
    console.log("[Doctors] created:", doctor?.id);
    res.status(201).json(doctor);
  } catch (err) {
    console.error("[Doctors] createDoctor error:", err);
    res.status(500).json({ error: err.message || "Failed to create doctor" });
  }
};

exports.getDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.getAll();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.getById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.getById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const appointments = await Appointment.getByDoctorId(req.params.id);
    const profile = {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      bio: doctor.bio || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      location: doctor.location || "",
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
      appointments,
    };
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to fetch doctor profile" });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.update(req.params.id, req.body);
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const msg = await Doctor.delete(req.params.id);
    return res.json(msg);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
