import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { apiRequest, registerTrackedTestUser } from './test_helper.js';

describe('Step 3: Authentication & Security Tests', () => {
  const timestamp = Date.now();
  const testEmail = `auth_test_${timestamp}@example.com`;
  const testPassword = 'Password123!';
  let authToken = null;
  let testUserId = null;

  it('Health endpoint reports healthy database status', async () => {
    const res = await apiRequest('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.database.status, 'connected');
    assert.equal(res.body.database.configured, true);
  });

  it('Registration validates missing name, email, and password', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: {},
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert(Array.isArray(res.body.errors));
    assert(res.body.errors.some(e => e.field === 'name'));
    assert(res.body.errors.some(e => e.field === 'email'));
    assert(res.body.errors.some(e => e.field === 'password'));
  });

  it('Registration rejects invalid email format', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'Valid Name', email: 'invalid-email-format', password: 'Password123!' },
    });
    assert.equal(res.status, 400);
    assert(res.body.errors.some(e => e.field === 'email'));
  });

  it('Registration rejects password shorter than 8 characters', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'Valid Name', email: `short_${timestamp}@example.com`, password: 'short' },
    });
    assert.equal(res.status, 400);
    assert(res.body.errors.some(e => e.field === 'password'));
  });

  it('Successful registration creates account, returns token and safe user (no password)', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        name: 'Auth Test Student',
        email: testEmail,
        password: testPassword,
        college: 'Engineering Institute',
        currency: 'USD',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert(res.body.data.token, 'Token must be provided in response');
    assert(res.body.data.user, 'User object must be returned');
    assert.equal(res.body.data.user.email, testEmail);
    assert.equal(res.body.data.user.password, undefined, 'Password must not be in user response');
    assert.equal(res.body.data.user.passwordHash, undefined, 'PasswordHash must not be in user response');

    testUserId = res.body.data.user.id;
    authToken = res.body.data.token;
    registerTrackedTestUser(testUserId);
  });

  it('Password in MongoDB is bcrypt-hashed and not plaintext', async () => {
    const userInDb = await mongoose.connection.collection('users').findOne({ email: testEmail });
    assert(userInDb, 'User must exist in database');
    assert(userInDb.password, 'Password hash must be present in db record');
    assert.notEqual(userInDb.password, testPassword, 'Password must NOT be stored in plaintext');
    assert(userInDb.password.startsWith('$2'), 'Password must be bcrypt hash starting with $2');
  });

  it('Duplicate registration with same email returns 409 Conflict', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Student',
        email: testEmail,
        password: testPassword,
      },
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  it('Login with correct credentials returns 200, JWT token, and user info', async () => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert(res.body.data.token);
    assert.equal(res.body.data.user.email, testEmail);
    assert.equal(res.body.data.user.password, undefined);
  });

  it('Login with incorrect password returns 401 Unauthorized', async () => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'WrongPassword!',
      },
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('Login with non-existent email returns 401 Unauthorized', async () => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email: `nonexistent_${timestamp}@example.com`,
        password: testPassword,
      },
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('Protected endpoint /api/auth/me rejects requests without token with 401', async () => {
    const res = await apiRequest('/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('Protected endpoint rejects malformed token with 401', async () => {
    const res = await apiRequest('/auth/me', { token: 'invalid.token.structure' });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('Protected endpoint succeeds with valid token', async () => {
    const res = await apiRequest('/auth/me', { token: authToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, testEmail);
  });

  it('Logout endpoint succeeds for authenticated user', async () => {
    const res = await apiRequest('/auth/logout', { method: 'POST', token: authToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
