// Import required modules
import 'dotenv/config';
import { createServer } from "http";

// Import app and database connection
import app from './app.js';
import { connectDB } from './config/db.js'

// Import Redis connection and Socket initialization
import { connectRedis } from './config/redis.js';
import { InitializeSocket } from './services/socket/socket.js';

const PORT = Number(process.env.PORT) || 5000

async function startServer() {
  try {
    await connectDB();
    await connectRedis();

    const server = createServer(app);
    InitializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Disasterwatch Starts Running in ${process.env.NODE_ENV || 'Development'} mode on port: ${PORT}`);
    });

  } catch (error) {
    console.error(`Failed to Start Server: ${error}`)
    process.exit(1);

  }
}

startServer();

