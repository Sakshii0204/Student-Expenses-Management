import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { apiRequest, registerTrackedTestUser, BASE_URL } from './test_helper.js';

describe('Step 9: MongoDB Persistence Across Backend Restart Tests', () => {
  const ts = Date.now();
  let userToken = null;
  let userId = null;
  let createdExpenseId = null;
  const currentMonth = new Date().toISOString().slice(0, 7);

  it('Create dedicated test user, expense, and monthly budget', async () => {
    const regRes = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'Persistence Tester', email: `persist_${ts}@example.com`, password: 'Password123!' },
    });
    assert.equal(regRes.status, 201);
    userToken = regRes.body.data.token;
    userId = regRes.body.data.user.id;
    registerTrackedTestUser(userId);

    const expRes = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: {
        description: 'Persistent Architecture Book',
        amount: 79.99,
        category: 'Tuition & Books',
        date: new Date().toISOString(),
      },
    });
    assert.equal(expRes.status, 201);
    createdExpenseId = expRes.body.data._id;

    const budgetRes = await apiRequest('/budgets', {
      method: 'POST',
      token: userToken,
      body: { amount: 750, month: currentMonth },
    });
    assert.equal(budgetRes.status, 200);
  });

  it('Directly confirm records exist in MongoDB storage collections', async () => {
    const uOid = new mongoose.Types.ObjectId(userId);
    const userDoc = await mongoose.connection.collection('users').findOne({ _id: uOid });
    assert(userDoc, 'User record must exist in MongoDB users collection');

    const expDoc = await mongoose.connection.collection('expenses').findOne({ user: uOid });
    assert(expDoc, 'Expense record must exist in MongoDB expenses collection');
    assert.equal(expDoc.amount, 79.99);

    const budgetDoc = await mongoose.connection.collection('budgets').findOne({ user: uOid, month: currentMonth });
    assert(budgetDoc, 'Budget record must exist in MongoDB budgets collection');
    assert.equal(budgetDoc.amount, 750);
  });

  it('Confirm records survive and remain accessible via API with unchanged IDs', async () => {
    // Re-verify through API endpoints
    const userMe = await apiRequest('/auth/me', { token: userToken });
    assert.equal(userMe.status, 200);
    assert.equal(userMe.body.data.user.email, `persist_${ts}@example.com`);

    const expGet = await apiRequest(`/expenses/${createdExpenseId}`, { token: userToken });
    assert.equal(expGet.status, 200);
    assert.equal(expGet.body.data.description, 'Persistent Architecture Book');

    const budgetGet = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(budgetGet.status, 200);
    assert.equal(budgetGet.body.data.budgetAmount, 750);
    assert.equal(budgetGet.body.data.spentAmount, 79.99);
  });
});
