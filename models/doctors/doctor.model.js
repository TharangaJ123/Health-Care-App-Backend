const {db} = require("../../config/firebase");
const collection = db.collection("doctors");

class Doctor {
  static async create(data) {
    const toSave = {
      name: data.name,
      specialization: data.specialization,
      bio: data.bio || "",
      phone: data.phone || "",
      email: data.email || "",
      location: data.location || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await collection.add(toSave);
    return { id: res.id, ...toSave };
  }

  static async getAll() {
    const snapshot = await collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async update(id, data) {
    const patch = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await collection.doc(id).update(patch);
    const doc = await collection.doc(id).get();
    return { id, ...doc.data() };
  }

  static async delete(id) {
    await collection.doc(id).delete();
    return { message: `Doctor with id ${id} deleted` };
  }
}

module.exports = Doctor;
