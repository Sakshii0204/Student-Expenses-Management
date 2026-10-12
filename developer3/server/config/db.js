import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB WARNING] MONGODB_URI not set for Developer 3.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Developer 3: MongoDB Connected] Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Developer 3: DB Connection Error] ${error.message}`);
    console.warn('[Developer 3] Operating in isolated developer mode.');
  }
}
