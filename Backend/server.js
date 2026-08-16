import express from 'express'
import cookieParser from 'cookie-parser';
import helmet from 'helmet'
import cors from 'cors'
import { connectDB } from './config/db.js'
import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import ReportsRoutes from './routes/ReportsRoutes.js'
import AI_Routes from './routes/AI_Routes.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import dotenv from 'dotenv'
dotenv.config();

const app = express();

app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(helmet());
app.use(cookieParser());
connectDB();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is Working Perfectly!" });
});

app.use('/api', healthRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/reports', ReportsRoutes);
app.use('/api/ai/', AI_Routes);

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server is Running on ${PORT}`));

export default app;
