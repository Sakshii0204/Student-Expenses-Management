import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[DB WARNING] MONGODB_URI is not set. Database operations will require active connection string.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.warn('[MongoDB Notice] Server running in decoupled mode. Ensure MongoDB is running on provided URI.');
  }
}
