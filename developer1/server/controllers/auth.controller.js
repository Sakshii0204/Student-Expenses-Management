import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { validateRegisterInput, validateLoginInput } from '../validators/auth.validator.js';

function isDBReady() {
  return mongoose.connection.readyState === 1;
}

function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user.id || user._id?.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'student',
    },
    secret,
    { expiresIn }
  );
}

export async function register(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. User registration cannot be persisted.',
        timestamp: new Date().toISOString(),
      });
    }

    const { name, email, password, college, currency } = req.body;

    const validation = validateRegisterInput({ name, email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Validation failed for registration input.',
        errors: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: 'An account with this email address already exists.',
        errors: [{ field: 'email', message: 'Email is already registered' }],
        timestamp: new Date().toISOString(),
      });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      college: college ? college.trim() : '',
      currency: currency || 'USD',
    });

    const safeUser = newUser.toSafeJSON();
    const token = generateToken(safeUser);

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Student account successfully registered and persisted.',
      data: {
        user: safeUser,
        token,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to process student registration.',
      errors: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function login(req, res) {
  try {
    if (!isDBReady()) {
      return res.status(503).json({
        success: false,
        statusCode: 503,
        message: 'Authoritative database is not connected. Cannot authenticate against persistent storage.',
        timestamp: new Date().toISOString(),
      });
    }

    const { email, password } = req.body;

    const validation = validateLoginInput({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Please provide valid email and password.',
        errors: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid email or password credentials.',
        timestamp: new Date().toISOString(),
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: 'Invalid email or password credentials.',
        timestamp: new Date().toISOString(),
      });
    }

    const safeUser = user.toSafeJSON();
    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Authentication successful.',
      data: {
        user: safeUser,
        token,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to authenticate user.',
      errors: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Active student profile retrieved successfully.',
    data: {
      user: req.user,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'User logged out successfully. Discard client token.',
    data: null,
    timestamp: new Date().toISOString(),
  });
}
