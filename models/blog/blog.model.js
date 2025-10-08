const db = require("../../config/firebase");
const collection = db.collection("blogs");

class Blog {
  static async create(data) {
    const res = await collection.add(data);
    return { id: res.id, ...data };
  }

  static async getAll() {
    const snapshot = await collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getById(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  static async update(id, data) {
    await collection.doc(id).update(data);
    return { id, ...data };
  }

  static async delete(id) {
    await collection.doc(id).delete();
    return { message: `Goal with id ${id} deleted` };
  }
}

module.exports = Blog;
