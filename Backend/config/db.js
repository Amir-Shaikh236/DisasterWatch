import mongoose from "mongoose";

export const connectDB = async () => {

  const Test = process.env.NODE_ENV === 'test';
  try {
    const mongoUri = Test ? process.env.TEST_MONGO_URI : process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error("Data Layer Error: MONGO_URI environment is missing.");
    }


    const options = {
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production for performance
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoUri, options);
    console.log("MongoDB Connected Safely", conn.connection.host);

  } catch (error) {

    console.error(`Critical Core Failure - Database Connection Error: ${error.message}`);
    process.exit(1);

  }
};
