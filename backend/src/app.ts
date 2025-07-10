import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from "./routes/auth.route";
import protectedRoutes from './routes/protected.route';
import commentRoutes from './routes/comment.route';
import notificationRoutes from './routes/notification.route';
import './config/db'; // Ensure the database connection is established
// import commentRoutes from './routes/comment.routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRouter);
app.use('/api/protected', protectedRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

export default app;
