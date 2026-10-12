import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB FATAL] MONGODB_URI environment variable is missing.');
    console.error('[DB NOTICE] Please configure MONGODB_URI in .env (e.g., mongodb://127.0.0.1:27017/student_expense_db).');
    return null;
  }

  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Unified MongoDB Pool] Connected to ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Unified MongoDB Error] ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[Unified MongoDB Disconnected] Connection lost.');
    });

    return conn.connection;
  } catch (error) {
    console.error(`[Unified MongoDB Connection Failed] ${error.message}`);
    console.warn('[Decoupled Mode] Running without live database. Controllers will operate in memory-safe fallback mode.');
    return null;
  }
}

export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}
