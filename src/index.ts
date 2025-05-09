import express from 'express';
import authRoutes from './routes/authRoutes';
import memberRoutes from './routes/memberRoutes';
import electionRoutes from './routes/election.routes';


const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes); // ✅ Route usage
app.use('/api',memberRoutes);
app.use('/api/admin',electionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
