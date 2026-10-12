import test, { describe } from 'node:test';
import { setupTestEnvironment, teardownTestEnvironment } from './test_helper.js';

console.log('[Test Suite Initializing] Booting test server on port 5055 and connecting MongoDB...');
await setupTestEnvironment();

// Execute all test suites in strict sequence
await import('./01_auth_security.test.js');
await import('./02_data_isolation.test.js');
await import('./03_expense_crud.test.js');
await import('./04_analytics_dashboard.test.js');
await import('./05_monthly_budget.test.js');
await import('./06_csv_export.test.js');
await import('./07_persistence_restart.test.js');
await import('./08_system_health_integration.test.js');

test('Final Cleanup & Teardown: purge test accounts and close server', async () => {
  console.log('[Test Teardown] Purging test accounts and disconnecting MongoDB pool...');
  await teardownTestEnvironment();
  console.log('[Test Teardown] Complete. All test records safely purged.');
});
