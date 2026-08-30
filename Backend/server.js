import 'dotenv/config';
import express from 'express'
import cookieParser from 'cookie-parser';
import helmet from 'helmet'
import cors from 'cors'
import { connectDB } from './config/db.js'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import ReportsRoutes from './routes/ReportsRoutes.js'
import AI_Routes from './routes/AI_Routes.js'
import alertRoutes from "./routes/alertRoutes.js"
import { errorHandler } from './middleware/errorMiddleware.js'
import { createServer } from "http";
import { Server } from 'socket.io';
import { InitializeSocket } from './services/socket/socket.js';
import { connectRedis } from './config/redis.js';
import { pathToFileURL } from 'url';

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const server = createServer(app);
InitializeSocket(server);

await connectDB();
await connectRedis()

const PORT = Number(process.env.PORT) || 5000;
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is Working Perfectly!" });
});

app.use('/api', healthRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/reports', ReportsRoutes);
app.use('/api/ai/', AI_Routes);
app.use('/api/alerts/', alertRoutes)

app.use(errorHandler);

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  server.listen(PORT, () => console.log(`Server is Running on ${PORT}`));
}

export default app;
