import express from 'express'
import cookieParser from 'cookie-parser';
import helmet from 'helmet'
import cors from 'cors'

import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import ReportsRoutes from './routes/ReportsRoutes.js'
import AI_Routes from './routes/AI_Routes.js'
import alertRoutes from "./routes/alertRoutes.js"
import { errorHandler } from './middleware/errorMiddleware.js'

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

app.get("/", (req, res) => {
    res.status(200).json({ status: "success", message: "API is Working Perfectly!" });
});

app.use('/api', healthRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/reports', ReportsRoutes);
app.use('/api/ai/', AI_Routes);
app.use('/api/alerts/', alertRoutes)

app.use(errorHandler);

export default app;