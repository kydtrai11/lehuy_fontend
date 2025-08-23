import mongoose from 'mongoose';

export async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Please define MONGODB_URI environment variable');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err;
  }
}
