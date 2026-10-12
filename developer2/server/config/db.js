import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB WARNING] MONGODB_URI not configured for Developer 2.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Developer 2: MongoDB Connected] Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Developer 2: DB Connection Error] ${error.message}`);
    console.warn('[Developer 2] Operating in isolated developer mode.');
  }
}
