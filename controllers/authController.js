const { auth } = require('../../config/firebase');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const User = require('../models/userModel');

// User Registration
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
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
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email is already registered'
            });
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Create user in Firestore
        const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: name || '',
            emailVerified: firebaseUser.emailVerified
        };
        
        const user = await User.create(userData);
        
        // Generate token
        const token = await firebaseUser.getIdToken();
        
        res.status(201).json({
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified
            },
            token
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
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Sign in user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update last login time
        await User.updateLastLogin(firebaseUser.uid);
        
        // Get user data from Firestore
        const user = await User.findById(firebaseUser.uid);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Generate token
        const token = await firebaseUser.getIdToken();
        
        res.json({
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified
            },
            token
        });
        
    } catch (error) {
        console.error('Login error:', error);
        
        let statusCode = 401;
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
