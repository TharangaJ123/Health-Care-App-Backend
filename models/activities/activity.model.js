const {db} = require("../../config/firebase");
const collection = db.collection("activities");

class Activity {
  static async log({ action, appointment }) {
    const toSave = {
      action, // 'created' | 'updated' | 'deleted'
      appointmentId: appointment?.id || appointment?.appointmentId || null,
      doctorId: appointment?.doctorId || null,
      patientName: appointment?.patientName || null,
      details: {
        doctorName: appointment?.doctorName || null,
        doctorSpecialization: appointment?.doctorSpecialization || null,
        appointmentDate: appointment?.appointmentDate || null,
        appointmentTime: appointment?.appointmentTime || null,
        reason: appointment?.reason ?? null,
        price: appointment?.price ?? null,
        messageToDoctor: appointment?.messageToDoctor ?? null,
        status: appointment?.status || null,
      },
      createdAt: new Date().toISOString(),
    };
    const res = await collection.add(toSave);
    return { id: res.id, ...toSave };
  }

  static async getAll() {
    const snapshot = await collection.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = Activity;
