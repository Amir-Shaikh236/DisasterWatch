import mongoose from "mongoose";

export const connectDB = async () => {

  const Test = process.env.NODE_ENV === 'test';
  try {
    const mongoUri = Test ? process.env.TEST_MONGO_URI : process.env.MONGO_URI

    if (!mongoUri) {
      throw new Error("Data Layer Error: MONGO_URI environment is missing.");
    }

    // Enterprise Mongoose connection tuning parameters
    const options = {
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production for performance
      maxPoolSize: 10,                                  // Maintain up to 10 concurrent socket connections
      serverSelectionTimeoutMS: 5000,                  // Fail fast after 5 seconds instead of hanging
      socketTimeoutMS: 45000,                           // Close inactive sockets after 45 seconds
    };

    const conn = await mongoose.connect(mongoUri, options);
    console.log("MongoDB Connected Safely", conn.connection.host);

  } catch (error) {

    console.error(`Critical Core Failure - Database Connection Error: ${error.message}`);
    process.exit(1);

  }
};
