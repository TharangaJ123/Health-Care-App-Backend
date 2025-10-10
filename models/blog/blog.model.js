const {db} = require("../../config/firebase");
const collection = db.collection("blogs");

class Blog {
  static async create(data) {
    const toSave = {
      likes: Array.isArray(data.likes) ? data.likes : [],
      comments: Array.isArray(data.comments) ? data.comments : [],
      ...data,
    };
    const res = await collection.add(toSave);
    return { id: res.id, ...toSave };
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
    const doc = await collection.doc(id).get();
    return { id, ...doc.data() };
  }

  static async delete(id) {
    await collection.doc(id).delete();
    return { message: `Goal with id ${id} deleted` };
  }

  static async toggleLike(id, userId) {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const blog = { id: doc.id, ...doc.data() };
    const likes = Array.isArray(blog.likes) ? blog.likes : [];
    const has = likes.includes(userId);
    const nextLikes = has ? likes.filter((u) => u !== userId) : [...likes, userId];
    await ref.update({ likes: nextLikes });
    return { ...blog, likes: nextLikes };
  }

  static async addComment(id, comment) {
    const ref = collection.doc(id);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const blog = { id: doc.id, ...doc.data() };
    const comments = Array.isArray(blog.comments) ? blog.comments : [];
    const toAdd = {
      id: String(Date.now()),
      text: String(comment.text || ''),
      userId: String(comment.userId || ''),
      userName: String(comment.userName || ''),
      createdAt: new Date().toISOString(),
    };
    const next = [...comments, toAdd];
    await ref.update({ comments: next });
    return toAdd;
  }

  static async getComments(id) {
    const doc = await collection.doc(id).get();
    if (!doc.exists) return [];
    const blog = { id: doc.id, ...doc.data() };
    return Array.isArray(blog.comments) ? blog.comments : [];
  }
}

module.exports = Blog;
