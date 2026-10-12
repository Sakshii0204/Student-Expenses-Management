export function validateRegisterInput({ name, email, password }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'A valid email address is required.' });
  }

  if (!password || password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLoginInput({ email, password }) {
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required.' });
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
