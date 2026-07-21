import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGO_URI; 

if (!MONGODB_URI) {
  throw new Error('MONGO_URI environment variable is not set');
}

// Use a global variable to cache the connection in serverless environments
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // If the connection is already active, reuse it instantly
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt hasn't been made, start one
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false, 
      serverSelectionTimeoutMS: 5000, 
    }).then((mongoose) => {
      console.log("MongoDB connected successfully");
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
};