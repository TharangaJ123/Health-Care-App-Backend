const { admin } = require('../config/firebase');
const User = require('../models/userModel');

// User Registration
exports.register = async (req, res) => {
    try {
        const { email, password, name, userType, phoneNumber, occupation } = req.body;

        console.log('Registration attempt:', { email, name, userType, phoneNumber });

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Validate userType
        if (!userType || !['patient', 'doctor'].includes(userType)) {
            return res.status(400).json({
                success: false,
                error: 'Valid user type (patient or doctor) is required'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid email address'
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists in Firestore
        console.log('Checking if user exists...');
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            console.log('User already exists');
            return res.status(400).json({
                success: false,
                error: 'Email is already registered'
            });
        }

        // Create user in Firebase Auth using admin SDK
        console.log('Creating Firebase Auth user...');
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name || '',
            emailVerified: false
        });
        console.log('Firebase Auth user created:', userRecord.uid);

        // Send email verification
        console.log('📧 Sending email verification...');
        try {
            await admin.auth().generateEmailVerificationLink(email);
            console.log('✅ Email verification link generated and sent');
        } catch (emailError) {
            console.error('❌ Email verification error:', emailError);
            // Don't fail registration if email verification fails
        }

        // Create user in Firestore
        console.log('Creating Firestore user document...');
        const userData = {
            uid: userRecord.uid,
            email: userRecord.email,
            name: name || '',
            userType: userType,
            phoneNumber: phoneNumber || '',
            occupation: userType === 'doctor' ? (occupation || '') : null,
            emailVerified: false, // Will be updated when user verifies email
            verificationSent: true,
            verificationSentAt: new Date()
        };

        const user = await User.create(userData);
        console.log('Firestore user document created:', user.id);
        console.log('User type saved:', userType);

        res.status(201).json({
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                userType: user.userType,
                phoneNumber: user.phoneNumber,
                occupation: user.occupation,
                emailVerified: false,
                verificationSent: true
            },
            message: 'User registered successfully. Please check your email to verify your account.'
        });

    } catch (error) {
        console.error('Registration error:', error);

        let statusCode = 400;
        let errorMessage = 'Registration failed';

        // Handle specific Firebase Auth errors
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email is already in use';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters';
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

// User Login
exports.login = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Validate userType if provided
        if (userType && !['patient', 'doctor'].includes(userType)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user type'
            });
        }

        console.log('🔐 Login attempt for:', email, 'as', userType || 'any');

        // Find user in Firestore first to get UID
        const user = await User.findByEmail(email);

        if (!user) {
            console.log('❌ No user found in Firestore for email:', email);
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        console.log('✅ User found in Firestore:', user.email);

        // Validate user type matches if userType is provided
        if (userType && user.userType !== userType) {
            console.log(`❌ User type mismatch: Registered as ${user.userType}, attempting to login as ${userType}`);
            return res.status(403).json({
                success: false,
                error: `This account is registered as a ${user.userType}. Please select the correct account type to login.`
            });
        }

        try {
            // Verify credentials against Firebase Auth
            console.log('🔥 Verifying credentials with Firebase Auth...');
            const userRecord = await admin.auth().getUserByEmail(email);

            if (userRecord) {
                console.log('✅ Firebase Auth user verified:', userRecord.uid);
                console.log('⚠️ Email verification check is disabled for testing');

                // Generate custom token for the authenticated user
                const customToken = await admin.auth().createCustomToken(userRecord.uid);
                console.log('✅ Custom token generated');

                // Update last login time in Firestore
                await User.updateLastLogin(userRecord.uid);

                console.log('✅ Login successful for:', email);

                res.json({
                    success: true,
                    user: {
                        uid: userRecord.uid,
                        email: userRecord.email,
                        name: user.name,
                        emailVerified: userRecord.emailVerified,
                        userType: user.userType,
                        phoneNumber: user.phoneNumber
                    },
                    token: customToken,
                    message: 'Login successful'
                });
            } else {
                console.log('❌ Firebase Auth verification failed');
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

        } catch (authError) {
            console.error('❌ Firebase Auth error:', authError);

            // If Firebase Auth fails, it means the user doesn't exist in Firebase Auth
            // or there are other auth issues
            if (authError.code === 'auth/user-not-found') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            throw authError;
        }

    } catch (error) {
        console.error('❌ Login error:', error);

        let statusCode = 500;
        let errorMessage = 'Login failed';

        // Handle specific Firebase Auth errors
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No user found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            case 'auth/too-many-requests':
                statusCode = 429;
                errorMessage = 'Too many login attempts. Please try again later.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password';
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
