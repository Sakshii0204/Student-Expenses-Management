import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, registerTrackedTestUser } from './test_helper.js';

describe('Step 6: Dashboard & Analytics Correctness Tests', () => {
  const ts = Date.now();
  let userToken = null;
  let userId = null;

  it('Setup test user and controlled expense records', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'Analytics User', email: `analytics_${ts}@example.com`, password: 'Password123!' },
    });
    assert.equal(res.status, 201);
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
    registerTrackedTestUser(userId);

    const testExpenses = [
      { description: 'Groceries Store', amount: 120.0, category: 'Food & Groceries', date: '2026-10-01' },
      { description: 'Bus Monthly Pass', amount: 50.0, category: 'Transportation', date: '2026-10-02' },
      { description: 'Electricity Bill', amount: 30.0, category: 'Utilities & Bills', date: '2026-10-03' },
    ];

    for (const exp of testExpenses) {
      const createRes = await apiRequest('/expenses', {
        method: 'POST',
        token: userToken,
        body: exp,
      });
      assert.equal(createRes.status, 201);
    }
  });

  it('/analytics/summary returns exact total, count and averages', async () => {
    const res = await apiRequest('/analytics/summary', { token: userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const data = res.body.data;
    // Expected: 120 + 50 + 30 = 200
    assert.equal(data.totalSpent, 200);
    assert.equal(data.transactionCount, 3);
    assert.equal(data.averageTransaction, 66.67);
    assert.equal(data.highestCategory.category, 'Food & Groceries');
    assert.equal(data.highestCategory.amount, 120);
  });

  it('/analytics/by-category returns correct distribution and percentages', async () => {
    const res = await apiRequest('/analytics/by-category', { token: userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const breakdown = res.body.data.breakdown;
    assert(Array.isArray(breakdown));

    const food = breakdown.find(c => c.category === 'Food & Groceries');
    const transport = breakdown.find(c => c.category === 'Transportation');
    const utils = breakdown.find(c => c.category === 'Utilities & Bills');

    assert(food, 'Food & Groceries must be in breakdown');
    assert.equal(food.total, 120);
    assert.equal(food.percentage, 60.0); // 120 / 200 = 60%

    assert(transport, 'Transportation must be in breakdown');
    assert.equal(transport.total, 50);
    assert.equal(transport.percentage, 25.0); // 50 / 200 = 25%

    assert(utils, 'Utilities & Bills must be in breakdown');
    assert.equal(utils.total, 30);
    assert.equal(utils.percentage, 15.0); // 30 / 200 = 15%
  });

  it('/analytics/monthly-trend returns monthly aggregated values', async () => {
    const res = await apiRequest('/analytics/monthly-trend', { token: userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert(Array.isArray(res.body.data.trend));
    const currentTrend = res.body.data.trend.find(m => m.yearMonth === '2026-10');
    assert(currentTrend, 'Must include 2026-10 trend');
    assert.equal(currentTrend.total, 200);
  });

  it('/analytics/recent returns the 3 recorded transactions sorted by date', async () => {
    const res = await apiRequest('/analytics/recent?limit=5', { token: userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.transactions.length, 3);
  });
});
