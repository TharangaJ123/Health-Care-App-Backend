const { admin } = require('../../config/firebase');
const db = admin.firestore();
const usersCollection = db.collection('users');

class User {
    // Create a new user in Firestore
    static async create(userData) {
        try {
            const userRef = usersCollection.doc(userData.uid);
            await userRef.set({
                email: userData.email,
                emailVerified: userData.emailVerified || false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                ...userData // Include any additional user data
            });
            
            const userDoc = await userRef.get();
            return { id: userDoc.id, ...userDoc.data() };
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    // Find user by UID
    static async findById(uid) {
        try {
            const userDoc = await usersCollection.doc(uid).get();
            if (!userDoc.exists) {
                return null;
            }
            return { id: userDoc.id, ...userDoc.data() };
        } catch (error) {
            console.error('Error finding user:', error);
            throw new Error('Failed to find user');
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const snapshot = await usersCollection
                .where('email', '==', email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return null;
            }

            const userDoc = snapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() };
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error('Failed to find user by email');
        }
    }

    // Update user data
    static async update(uid, updateData) {
        try {
            const userRef = usersCollection.doc(uid);
            await userRef.update({
                ...updateData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            const updatedDoc = await userRef.get();
            return { id: updatedDoc.id, ...updatedDoc.data() };
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    // Update last login timestamp
    static async updateLastLogin(uid) {
        try {
            await usersCollection.doc(uid).update({
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating last login:', error);
            throw new Error('Failed to update last login');
        }
    }

    // Delete user (soft delete)
    static async delete(uid) {
        try {
            await usersCollection.doc(uid).update({
                deleted: true,
                deletedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }
}

module.exports = User;
