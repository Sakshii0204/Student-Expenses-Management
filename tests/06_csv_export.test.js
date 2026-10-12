import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, registerTrackedTestUser } from './test_helper.js';

describe('Step 8: CSV Export Security & Content Tests', () => {
  const ts = Date.now();
  let user1 = { email: `csvexport1_${ts}@example.com`, token: null, id: null };
  let user2 = { email: `csvexport2_${ts}@example.com`, token: null, id: null };

  it('Setup two users and insert test expenses including CSV formula injection vectors', async () => {
    const res1 = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'CSV User 1', email: user1.email, password: 'Password123!' },
    });
    user1.token = res1.body.data.token;
    user1.id = res1.body.data.user.id;
    registerTrackedTestUser(user1.id);

    const res2 = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'CSV User 2', email: user2.email, password: 'Password123!' },
    });
    user2.token = res2.body.data.token;
    user2.id = res2.body.data.user.id;
    registerTrackedTestUser(user2.id);

    // User 1 expense with formula triggers & special characters
    await apiRequest('/expenses', {
      method: 'POST',
      token: user1.token,
      body: {
        description: '@danger, "quoted",\nmultiline', // Formula trigger '@', comma, quote, newline
        amount: 45.0,
        category: 'Tuition & Books',
        date: '2026-10-01',
      },
    });

    await apiRequest('/expenses', {
      method: 'POST',
      token: user1.token,
      body: {
        description: '-10% student discount', // Formula trigger '-'
        amount: 15.0,
        category: 'Food & Groceries',
        date: '2026-10-02',
      },
    });

    // User 2 expense (must never leak into User 1 export)
    await apiRequest('/expenses', {
      method: 'POST',
      token: user2.token,
      body: {
        description: 'Secret User 2 Expense',
        amount: 999.0,
        category: 'Entertainment & Leisure',
        date: '2026-10-03',
      },
    });
  });

  it('CSV export requires authentication (rejects unauthenticated)', async () => {
    const res = await apiRequest('/expenses/export/csv');
    assert.equal(res.status, 401);
  });

  it('CSV export returns proper Content-Type and Content-Disposition headers', async () => {
    const res = await apiRequest('/expenses/export/csv', { token: user1.token });
    assert.equal(res.status, 200);
    assert(res.headers.get('content-type').includes('text/csv'));
    assert(res.headers.get('content-disposition').includes('attachment; filename="student-expenses-'));
  });

  it('CSV export contains RFC-4180 headers and only User 1 records', async () => {
    const res = await apiRequest('/expenses/export/csv', { token: user1.token });
    const text = res.rawText;

    // Check headers
    assert(text.includes('"Date","Category","Amount (USD)","Description","Payment Method","Record ID"'));

    // Check User 1 expenses present
    assert(text.includes('45.00'));
    assert(text.includes('15.00'));

    // Check User 2 expenses strictly excluded
    assert(!text.includes('Secret User 2 Expense'));
    assert(!text.includes('999.00'));
  });

  it('Dangerous formula injection prefixes are neutralized with single quote prefix', async () => {
    const res = await apiRequest('/expenses/export/csv', { token: user1.token });
    const text = res.rawText;

    // Description starting with '@' must become "'@danger..."
    assert(text.includes("''@danger") || text.includes("'\@danger") || text.includes("'@danger"));
    // Description starting with '-' must become "'-10%..."
    assert(text.includes("'-10% student discount"));
  });

  it('Quotes and commas are properly escaped without malforming CSV structure', async () => {
    const res = await apiRequest('/expenses/export/csv', { token: user1.token });
    const text = res.rawText;

    // Internal quotes must be escaped as ""
    assert(text.includes('""quoted""'));
  });

  it('CSV export respects active category filters', async () => {
    const encodedCategory = encodeURIComponent('Tuition & Books');
    const res = await apiRequest(`/expenses/export/csv?category=${encodedCategory}`, { token: user1.token });
    assert.equal(res.status, 200);
    const text = res.rawText;

    assert(text.includes('Tuition & Books'));
    assert(text.includes('45.00'));

    // Food & Groceries should NOT be in this filtered export
    assert(!text.includes('Food & Groceries'));
    assert(!text.includes('15.00'));
  });
});
