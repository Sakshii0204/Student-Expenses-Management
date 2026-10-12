import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest } from './test_helper.js';

describe('Step 10: System Integration & Health Monitoring Tests', () => {
  it('GET /api/health returns HTTP 200 with healthy status and connected database', async () => {
    const res = await apiRequest('/health');
    assert.equal(res.status, 200, 'Health endpoint must return HTTP 200');
    assert.equal(res.body.status, 'healthy', 'System status must report healthy');
    assert.equal(res.body.database.status, 'connected', 'Database status must report connected');
    assert.equal(res.body.database.configured, true, 'Database configured flag must be true');
    assert.ok(res.body.timestamp, 'Health response must contain ISO timestamp');

    // Confirm all modular domain services are mounted
    assert.equal(res.body.services.auth, 'mounted (/api/auth)');
    assert.equal(res.body.services.expenses, 'mounted (/api/expenses)');
    assert.equal(res.body.services.analytics, 'mounted (/api/analytics)');
    assert.equal(res.body.services.budgets, 'mounted (/api/budgets)');
  });

  it('GET non-existent API route triggers centralized 404 handler with structured JSON', async () => {
    const res = await apiRequest('/non-existent-endpoint');
    assert.equal(res.status, 404, 'Unknown routes must return HTTP 404');
    assert.ok(res.body, 'Response body must be JSON');
    assert.equal(res.body.success, false, 'Failed request must specify success: false');
    assert.ok(res.body.message.includes('not found'), 'Message must indicate endpoint not found');
  });

  it('CORS headers allow multi-origin development and container networking', async () => {
    const res = await apiRequest('/health', {
      headers: {
        Origin: 'http://localhost:5173',
      },
    });
    assert.equal(res.status, 200);
    const allowOrigin = res.headers.get('access-control-allow-origin');
    assert.ok(
      allowOrigin === '*' || allowOrigin === 'http://localhost:5173',
      'CORS header must permit client origin'
    );
  });
});
