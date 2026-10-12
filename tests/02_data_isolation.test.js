import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, registerTrackedTestUser } from './test_helper.js';

describe('Step 4: Multi-User Data Isolation Tests', () => {
  const ts = Date.now();
  let userA = { email: `user_a_${ts}@example.com`, token: null, id: null };
  let userB = { email: `user_b_${ts}@example.com`, token: null, id: null };
  let expenseA = null;

  it('Setup two independent test accounts User A and User B', async () => {
    const resA = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'User A', email: userA.email, password: 'Password123!' },
    });
    assert.equal(resA.status, 201);
    userA.token = resA.body.data.token;
    userA.id = resA.body.data.user.id;
    registerTrackedTestUser(userA.id);

    const resB = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'User B', email: userB.email, password: 'Password123!' },
    });
    assert.equal(resB.status, 201);
    userB.token = resB.body.data.token;
    userB.id = resB.body.data.user.id;
    registerTrackedTestUser(userB.id);

    assert.notEqual(userA.id, userB.id);
  });

  it('User A creates an expense successfully', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userA.token,
      body: {
        description: 'User A Laptop Repair',
        amount: 250,
        category: 'Electronics & Gadgets',
        date: new Date().toISOString(),
        paymentMethod: 'Credit Card',
      },
    });

    assert.equal(res.status, 201);
    expenseA = res.body.data;
    assert.equal(expenseA.description, 'User A Laptop Repair');
    assert(expenseA._id);
  });

  it('User B cannot view User A expense by ID (Isolation Read)', async () => {
    const res = await apiRequest(`/expenses/${expenseA._id}`, {
      token: userB.token,
    });
    // Must return 404 Not Found to prevent ID enumeration
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  it('User B cannot update User A expense (Isolation Mutation)', async () => {
    const res = await apiRequest(`/expenses/${expenseA._id}`, {
      method: 'PUT',
      token: userB.token,
      body: { description: 'Hacked by User B', amount: 10, category: 'Electronics & Gadgets', date: new Date().toISOString() },
    });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);

    // Verify Expense A was NOT modified
    const verify = await apiRequest(`/expenses/${expenseA._id}`, {
      token: userA.token,
    });
    assert.equal(verify.body.data.description, 'User A Laptop Repair');
  });

  it('User B cannot delete User A expense (Isolation Deletion)', async () => {
    const res = await apiRequest(`/expenses/${expenseA._id}`, {
      method: 'DELETE',
      token: userB.token,
    });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);

    // Verify Expense A still exists for User A
    const verify = await apiRequest(`/expenses/${expenseA._id}`, {
      token: userA.token,
    });
    assert.equal(verify.status, 200);
  });

  it('User B expense list does not include User A expenses', async () => {
    const res = await apiRequest('/expenses', { token: userB.token });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.expenses.length, 0);
  });

  it('Forged user ID in request body does NOT override authenticated ownership', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userB.token,
      body: {
        description: 'Attempted Impersonation',
        amount: 50,
        category: 'Food & Groceries',
        date: new Date().toISOString(),
        user: userA.id, // Forged ID
        userId: userA.id,
      },
    });

    assert.equal(res.status, 201);
    const created = res.body.data;
    assert.equal(String(created.user), String(userB.id), 'Owner must strictly be User B');
  });

  it('User A and User B budgets are isolated', async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    // User A sets budget 600
    const setA = await apiRequest('/budgets', {
      method: 'POST',
      token: userA.token,
      body: { amount: 600, month: currentMonth },
    });
    assert.equal(setA.status, 200);

    // User B checks current budget (should be 0 or separate)
    const checkB = await apiRequest('/budgets/current', { token: userB.token });
    assert.equal(checkB.status, 200);
    assert.equal(checkB.body.data.budgetAmount, 0, 'User B must not see User A budget');
  });

  it('Analytics aggregations are isolated per user', async () => {
    const summaryA = await apiRequest('/analytics/summary', { token: userA.token });
    const summaryB = await apiRequest('/analytics/summary', { token: userB.token });

    assert.equal(summaryA.status, 200);
    assert.equal(summaryB.status, 200);

    assert(summaryA.body.data.totalSpent >= 250);
    assert.equal(summaryB.body.data.totalSpent, 50); // Only User B's 50
  });
});
