const db = require('../config/firebase');

class Appointment {
  static collection = db.collection('appointments');

  static async create(appointmentData) {
    try {
      const docRef = await this.collection.add({
        ...appointmentData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...appointmentData };
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  static async findByPatientId(patientId) {
    try {
      const snapshot = await this.collection
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error finding appointments:', error);
      throw error;
    }
  }
}

module.exports = Appointment;
