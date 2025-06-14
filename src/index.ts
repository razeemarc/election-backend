import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import route files
import authRoutes from './routes/authRoutes';
import memberRoutes from './routes/memberRoutes';
import electionRoutes from './routes/election.routes';
import candidateRoutes from './routes/candidate.routes';
import voteRoutes from './routes/vote.routes';
import dashboardRoutes from './routes/dashboard.routes';
import resultRoutes from './routes/result.routes';

const app = express();

// 🔐 Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://voting-system-eight-lovat.vercel.app',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', memberRoutes);
app.use('/api/admin', electionRoutes);
app.use('/api/user', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/results', resultRoutes);

// Server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
