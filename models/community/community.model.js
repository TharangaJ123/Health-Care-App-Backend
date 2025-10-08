const db = require("../../config/firebase");

const requestsCollection = db.collection("community_requests");

const defaultGroups = [
  { id: "district-colombo", level: "district", name: "Colombo District" },
  { id: "district-gampaha", level: "district", name: "Gampaha District" },
  { id: "village-maharagama", level: "village", name: "Maharagama" },
  { id: "village-nugegoda", level: "village", name: "Nugegoda" },
];

class Community {
  // Groups can be served statically for now (matches frontend defaults)
  static async getGroups() {
    return defaultGroups;
  }

  static async createRequest(data) {
    const toSave = {
      status: "pending",
      verified: false,
      responses: [],
      createdAt: new Date().toISOString(),
      ...data,
    };
    const res = await requestsCollection.add(toSave);
    return { id: res.id, ...toSave };
  }

  static async getRequests() {
    const snapshot = await requestsCollection.get();
    // newest first (client sorts, but keep rough order by createdAt desc)
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  static async addResponse(id, response) {
    const docRef = requestsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const data = doc.data();
    const newResponse = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...response,
    };
    const responses = Array.isArray(data.responses) ? data.responses : [];
    responses.push(newResponse);
    await docRef.update({ responses });
    const updated = { id: doc.id, ...data, responses };
    return updated;
  }

  static async toggleVerify(id) {
    const docRef = requestsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const data = doc.data();
    const verified = !Boolean(data.verified);
    await docRef.update({ verified });
    return { id: doc.id, ...data, verified };
  }

  static async removeRequest(id) {
    await requestsCollection.doc(id).delete();
    return { message: `Request ${id} deleted` };
  }
}

module.exports = Community;
