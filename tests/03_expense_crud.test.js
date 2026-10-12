import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, registerTrackedTestUser } from './test_helper.js';

describe('Step 5: Expense CRUD, Validation & Pagination Tests', () => {
  const ts = Date.now();
  let userToken = null;
  let userId = null;
  let createdExpenseId = null;

  it('Setup test user for CRUD operations', async () => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: { name: 'CRUD User', email: `crud_${ts}@example.com`, password: 'Password123!' },
    });
    assert.equal(res.status, 201);
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
    registerTrackedTestUser(userId);
  });

  it('Rejects zero amount', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: 'Zero Item', amount: 0, category: 'Food & Groceries', date: '2026-10-01' },
    });
    assert.equal(res.status, 400);
    assert(res.body.errors.some(e => e.field === 'amount'));
  });

  it('Rejects negative amount', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: 'Negative Item', amount: -25, category: 'Food & Groceries', date: '2026-10-01' },
    });
    assert.equal(res.status, 400);
    assert(res.body.errors.some(e => e.field === 'amount'));
  });

  it('Rejects invalid non-numeric amount', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: 'NaN Item', amount: 'abc', category: 'Food & Groceries', date: '2026-10-01' },
    });
    assert.equal(res.status, 400);
  });

  it('Rejects invalid category', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: { description: 'Invalid Category', amount: 50, category: 'Space Travel', date: '2026-10-01' },
    });
    assert.equal(res.status, 400);
    assert(res.body.errors.some(e => e.field === 'category'));
  });

  it('Rejects invalid payment method', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: {
        description: 'Invalid Payment',
        amount: 50,
        category: 'Food & Groceries',
        date: '2026-10-01',
        paymentMethod: 'Bitcoin',
      },
    });
    assert.equal(res.status, 400);
    assert(res.body.errors.some(e => e.field === 'paymentMethod'));
  });

  it('Creates valid expense', async () => {
    const res = await apiRequest('/expenses', {
      method: 'POST',
      token: userToken,
      body: {
        description: 'Calculus Textbook',
        amount: 85.5,
        category: 'Tuition & Books',
        date: '2026-10-05T10:00:00.000Z',
        paymentMethod: 'Debit Card',
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.description, 'Calculus Textbook');
    assert.equal(res.body.data.amount, 85.5);
    createdExpenseId = res.body.data._id;
  });

  it('Reads single expense by ID', async () => {
    const res = await apiRequest(`/expenses/${createdExpenseId}`, { token: userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.description, 'Calculus Textbook');
  });

  it('Updates existing expense amount and description', async () => {
    const res = await apiRequest(`/expenses/${createdExpenseId}`, {
      method: 'PUT',
      token: userToken,
      body: {
        description: 'Calculus Textbook (Used)',
        amount: 60.0,
        category: 'Tuition & Books',
        date: '2026-10-05T10:00:00.000Z',
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.description, 'Calculus Textbook (Used)');
    assert.equal(res.body.data.amount, 60.0);
  });

  it('Creates multiple expenses to test search, filters, sorting and pagination', async () => {
    const items = [
      { description: 'Campus Lunch', amount: 12.0, category: 'Food & Groceries', date: '2026-10-06', paymentMethod: 'Cash' },
      { description: 'Subway Pass', amount: 45.0, category: 'Transportation', date: '2026-10-07', paymentMethod: 'Debit Card' },
      { description: 'Notebooks and Pens', amount: 15.0, category: 'Tuition & Books', date: '2026-10-08', paymentMethod: 'Cash' },
      { description: 'Chemistry Lab Manual', amount: 35.0, category: 'Tuition & Books', date: '2026-10-09', paymentMethod: 'Debit Card' },
      { description: 'Dorm Wi-Fi Share', amount: 20.0, category: 'Utilities & Bills', date: '2026-10-10', paymentMethod: 'Bank Transfer' },
    ];

    for (const item of items) {
      const res = await apiRequest('/expenses', {
        method: 'POST',
        token: userToken,
        body: item,
      });
      assert.equal(res.status, 201);
    }
  });

  it('Searches expenses by description keyword', async () => {
    const res = await apiRequest('/expenses?search=Manual', { token: userToken });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.expenses.length, 1);
    assert.equal(res.body.data.expenses[0].description, 'Chemistry Lab Manual');
  });

  it('Filters expenses by category', async () => {
    const res = await apiRequest(`/expenses?category=${encodeURIComponent('Tuition & Books')}`, { token: userToken });
    assert.equal(res.status, 200);
    // Textbook + Notebooks + Lab Manual = 3
    assert.equal(res.body.data.expenses.length, 3);
  });

  it('Filters expenses by date range', async () => {
    const res = await apiRequest('/expenses?startDate=2026-10-07&endDate=2026-10-09', { token: userToken });
    assert.equal(res.status, 200);
    assert(res.body.data.expenses.length >= 2);
  });

  it('Sorts expenses by amount descending', async () => {
    const res = await apiRequest('/expenses?sort=amount_desc', { token: userToken });
    assert.equal(res.status, 200);
    const expenses = res.body.data.expenses;
    for (let i = 0; i < expenses.length - 1; i++) {
      assert(expenses[i].amount >= expenses[i + 1].amount, 'Must be sorted in descending order of amount');
    }
  });

  it('Paginates properly and matches pagination metadata', async () => {
    const page1 = await apiRequest('/expenses?page=1&limit=3', { token: userToken });
    assert.equal(page1.status, 200);
    assert.equal(page1.body.data.expenses.length, 3);
    assert.equal(page1.body.data.pagination.page, 1);
    assert.equal(page1.body.data.pagination.limit, 3);
    assert.equal(page1.body.data.pagination.total, 6);
    assert.equal(page1.body.data.pagination.totalPages, 2);

    const page2 = await apiRequest('/expenses?page=2&limit=3', { token: userToken });
    assert.equal(page2.status, 200);
    assert.equal(page2.body.data.expenses.length, 3);
    assert.equal(page2.body.data.pagination.page, 2);

    const pageOutOfRange = await apiRequest('/expenses?page=99&limit=3', { token: userToken });
    assert.equal(pageOutOfRange.status, 200);
    assert.equal(pageOutOfRange.body.data.expenses.length, 0);
  });

  it('Deletes expense and verifies it no longer exists', async () => {
    const delRes = await apiRequest(`/expenses/${createdExpenseId}`, {
      method: 'DELETE',
      token: userToken,
    });
    assert.equal(delRes.status, 200);

    const checkRes = await apiRequest(`/expenses/${createdExpenseId}`, { token: userToken });
    assert.equal(checkRes.status, 404);
  });
});
