/**
 * Authentication Contract
 * Governs User entities and JWT token conventions.
 */

export const AuthContract = {
  headerName: 'Authorization',
  tokenPrefix: 'Bearer ',
  jwtPayloadFields: ['userId', 'email', 'name', 'role'],

  userValidation: {
    name: {
      minLength: 2,
      maxLength: 50,
      required: true,
    },
    email: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: true,
    },
    password: {
      minLength: 8,
      maxLength: 64,
      required: true,
      patternDescription: 'Minimum 8 characters with at least one letter and one number',
    },
    college: {
      maxLength: 100,
      required: false,
    },
  },

  sanitizeUser(user) {
    if (!user) return null;
    return {
      id: user._id?.toString() || user.id,
      name: user.name,
      email: user.email,
      college: user.college || '',
      currency: user.currency || 'USD',
      createdAt: user.createdAt,
    };
  },
};
