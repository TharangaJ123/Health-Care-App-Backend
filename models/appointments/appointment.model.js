const {db} = require("../../config/firebase");
const collection = db.collection("appointments");

class Appointment {
  static computeStatus(appointmentDate, appointmentTime) {
    try {
      if (!appointmentDate || !appointmentTime) return "scheduled";
      const [y, m, d] = appointmentDate.split("-").map(Number);
      const [hh, mm] = appointmentTime.split(":" ).map(Number);
      const when = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
      const now = new Date();
      return when.getTime() <= now.getTime() ? "completed" : "scheduled";
    } catch {
      return "scheduled";
    }
  }

  static async create(data) {
    const toSave = {
      ...data,
      status: Appointment.computeStatus(data.appointmentDate, data.appointmentTime),
      createdAt: new Date().toISOString(),
    };
    const res = await collection.add(toSave);
    return { id: res.id, ...toSave };
  }

  static async getAll() {
    const snapshot = await collection.get();
    return snapshot.docs.map((doc) => {
      const raw = { id: doc.id, ...doc.data() };
      const status = Appointment.computeStatus(raw.appointmentDate, raw.appointmentTime);
      return { ...raw, status };
    });
  }

  static async getById(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    const raw = { id: doc.id, ...doc.data() };
    const status = Appointment.computeStatus(raw.appointmentDate, raw.appointmentTime);
    return { ...raw, status };
  }

  static async getByDoctorId(doctorId) {
    const snapshot = await collection.where("doctorId", "==", doctorId).get();
    return snapshot.docs.map((doc) => {
      const raw = { id: doc.id, ...doc.data() };
      const status = Appointment.computeStatus(raw.appointmentDate, raw.appointmentTime);
      return { ...raw, status };
    });
  }

  static async update(id, data) {
    // Recompute status if date/time are being changed
    const updates = { ...data };
    if ("appointmentDate" in updates || "appointmentTime" in updates) {
      const doc = await collection.doc(id).get();
      const existing = doc.exists ? doc.data() : {};
      const nextDate = updates.appointmentDate ?? existing.appointmentDate;
      const nextTime = updates.appointmentTime ?? existing.appointmentTime;
      updates.status = Appointment.computeStatus(nextDate, nextTime);
    }
    await collection.doc(id).update(updates);
    return { id, ...updates };
  }

  static async delete(id) {
    await collection.doc(id).delete();
    return { message: `Appointment with id ${id} deleted` };
  }
}

module.exports = Appointment;
