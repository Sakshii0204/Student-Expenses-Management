import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, registerTrackedTestUser } from './test_helper.js';

describe('Step 7: Monthly Budgets & Threshold Tests', () => {
  const ts = Date.now();
  let userToken = null;
  let userId = null;
  const currentMonth = new Date().toISOString().slice(0, 7);
  let expenseIdToModify = null;

  it('Setup test user for budget testing', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'Budget Tester', email: `budget_${ts}@example.com`, password: 'Password123!' },
    });
    assert.equal(res.status, 201);
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
    registerTrackedTestUser(userId);
  });

  it('Zero budget returns status normal, utilization 0, budget 0', async () => {
    const res = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.budgetAmount, 0);
    assert.equal(res.body.data.spentAmount, 0);
    assert.equal(res.body.data.utilizationPercent, 0);
    assert.equal(res.body.data.status, 'normal');
    assert.equal(res.body.data.isWarning, false);
    assert.equal(res.body.data.isExceeded, false);
  });

  it('Sets budget of 1000 for current month', async () => {
    const res = await apiRequest('/budgets', {
      method: 'POST',
      token: userToken,
      body: { amount: 1000, month: currentMonth },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.budgetAmount, 1000);
    assert.equal(res.body.data.month, currentMonth);
  });

  it('Updating budget in same month upserts and does not create duplicate', async () => {
    const res = await apiRequest('/budgets', {
      method: 'POST',
      token: userToken,
      body: { amount: 500, month: currentMonth },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.budgetAmount, 500);

    const check = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(check.status, 200);
    assert.equal(check.body.data.budgetAmount, 500);
  });

  it('Tests Below 80% utilization: spending 300 / 500 = 60% -> normal', async () => {
    const expRes = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: {
        description: 'Initial Expense',
        amount: 300,
        category: 'Housing & Rent',
        date: new Date().toISOString(),
      },
    });
    assert.equal(expRes.status, 201);
    expenseIdToModify = expRes.body.data._id;

    const check = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(check.status, 200);
    assert.equal(check.body.data.spentAmount, 300);
    assert.equal(check.body.data.remainingAmount, 200);
    assert.equal(check.body.data.utilizationPercent, 60.0);
    assert.equal(check.body.data.status, 'normal');
    assert.equal(check.body.data.isWarning, false);
    assert.equal(check.body.data.isExceeded, false);
  });

  it('Tests Exactly 80% utilization: spending 400 / 500 = 80.0% -> warning status', async () => {
    // Add 100 more
    await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: '80% Booster', amount: 100, category: 'Food & Groceries', date: new Date().toISOString() },
    });

    const check = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(check.status, 200);
    assert.equal(check.body.data.spentAmount, 400);
    assert.equal(check.body.data.remainingAmount, 100);
    assert.equal(check.body.data.utilizationPercent, 80.0);
    assert.equal(check.body.data.status, 'warning');
    assert.equal(check.body.data.isWarning, true);
    assert.equal(check.body.data.isExceeded, false);
  });

  it('Tests Above 80% but below 100%: spending 450 / 500 = 90.0% -> warning status', async () => {
    await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: '90% Booster', amount: 50, category: 'Transportation', date: new Date().toISOString() },
    });

    const check = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(check.status, 200);
    assert.equal(check.body.data.spentAmount, 450);
    assert.equal(check.body.data.remainingAmount, 50);
    assert.equal(check.body.data.utilizationPercent, 90.0);
    assert.equal(check.body.data.status, 'warning');
    assert.equal(check.body.data.isWarning, true);
    assert.equal(check.body.data.isExceeded, false);
  });

  it('Tests Exactly 100% utilization: spending 500 / 500 = 100.0% -> exceeded status', async () => {
    await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: '100% Breaker', amount: 50, category: 'Utilities & Bills', date: new Date().toISOString() },
    });

    const check = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(check.status, 200);
    assert.equal(check.body.data.spentAmount, 500);
    assert.equal(check.body.data.remainingAmount, 0);
    assert.equal(check.body.data.utilizationPercent, 100.0);
    assert.equal(check.body.data.status, 'exceeded');
    assert.equal(check.body.data.isWarning, false);
    assert.equal(check.body.data.isExceeded, true);
  });

  it('Tests Above 100% overspending: spending 600 / 500 = 120.0% -> exceeded status', async () => {
    await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: 'Overspend Item', amount: 100, category: 'Entertainment & Leisure', date: new Date().toISOString() },
    });

    const check = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(check.status, 200);
    assert.equal(check.body.data.spentAmount, 600);
    assert.equal(check.body.data.remainingAmount, 0);
    assert.equal(check.body.data.utilizationPercent, 120.0);
    assert.equal(check.body.data.status, 'exceeded');
    assert.equal(check.body.data.isExceeded, true);
  });

  it('Expense updates dynamically adjust budget utilization calculations', async () => {
    // Delete the initial 300 expense
    await apiRequest(`/expenses/${expenseIdToModify}`, {
      method: 'DELETE',
      token: userToken,
    });

    // 600 - 300 = 300 spent on 500 budget = 60.0%
    const check = await apiRequest('/budgets/current', { token: userToken });
    assert.equal(check.status, 200);
    assert.equal(check.body.data.spentAmount, 300);
    assert.equal(check.body.data.remainingAmount, 200);
    assert.equal(check.body.data.utilizationPercent, 60.0);
    assert.equal(check.body.data.status, 'normal');
    assert.equal(check.body.data.isWarning, false);
    assert.equal(check.body.data.isExceeded, false);
  });
});
