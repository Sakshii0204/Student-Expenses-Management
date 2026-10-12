import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TEST_PORT = 5055;
export const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

let serverInstance = null;
export const createdTestUserIds = new Set();

export async function setupTestEnvironment() {
  process.env.PORT = String(TEST_PORT);
  process.env.NODE_ENV = 'test';

  const { connectDB } = await import('../integration/server/config/db.js');
  await connectDB();

  // Import app and server
  const serverModule = await import('../integration/server/server.js');
  serverInstance = serverModule.server;

  return { baseUrl: BASE_URL };
}

export async function teardownTestEnvironment() {
  // Clean up only accounts and data created by our automated tests
  if (createdTestUserIds.size > 0) {
    const userObjectIds = Array.from(createdTestUserIds).map(id => new mongoose.Types.ObjectId(id));
    await mongoose.connection.collection('users').deleteMany({ _id: { $in: userObjectIds } });
    await mongoose.connection.collection('expenses').deleteMany({ user: { $in: userObjectIds } });
    await mongoose.connection.collection('budgets').deleteMany({ user: { $in: userObjectIds } });
  }

  if (serverInstance && typeof serverInstance.close === 'function') {
    if (typeof serverInstance.closeAllConnections === 'function') {
      serverInstance.closeAllConnections();
    }
    await new Promise((resolve) => serverInstance.close(resolve));
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function apiRequest(endpoint, { method = 'GET', body = null, token = null, headers = {} } = {}) {
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: reqHeaders,
  };

  if (body) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // raw text response (e.g. CSV)
  }

  return {
    status: res.status,
    headers: res.headers,
    body: json,
    rawText: text,
  };
}

export function registerTrackedTestUser(userId) {
  if (userId) {
    createdTestUserIds.add(String(userId));
  }
}
