import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import memberRoutes from './routes/memberRoutes';
import electionRoutes from './routes/election.routes';
import candidateRoutes from './routes/candidate.routes';
import voteRoutes from './routes/vote.routes';

const app = express();

// 🔐 Allow CORS
app.use(cors({
  origin: 'http://localhost:3000', // your frontend origin
  credentials: true, // allow cookies / credentials if needed
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', memberRoutes);
app.use('/api/admin', electionRoutes);
app.use('/api/user', candidateRoutes);
app.use('/api/vote',voteRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
