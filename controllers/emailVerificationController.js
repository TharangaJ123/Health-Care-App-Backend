const { admin } = require('../config/firebase');
const User = require('../models/userModel');

// Email Verification
exports.verifyEmail = async (req, res) => {
    try {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        console.log('📧 Verifying email for user:', uid);

        // Update email verification status in Firebase Auth
        await admin.auth().updateUser(uid, {
            emailVerified: true
        });

        // Update email verification status in Firestore
        await User.updateEmailVerification(uid, true);

        console.log('✅ Email verified successfully for user:', uid);

        res.json({
            success: true,
            message: 'Email verified successfully. You can now login to your account.'
        });

    } catch (error) {
        console.error('❌ Email verification error:', error);

        let statusCode = 500;
        let errorMessage = 'Email verification failed';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'User not found';
                break;
            default:
                statusCode = 500;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
};

// Check email verification status
exports.checkEmailVerification = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        console.log('🔍 Checking email verification status for:', email);

        // Find user in Firestore
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get current verification status from Firebase Auth
        const userRecord = await admin.auth().getUser(user.uid);

        res.json({
            success: true,
            emailVerified: userRecord.emailVerified,
            verificationSent: user.verificationSent || false
        });

    } catch (error) {
        console.error('❌ Check email verification error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to check email verification status'
        });
    }
};
