
import express from 'express';
import { getDashboardStats, getMonthlyElectionCounts } from '../controller/dashboard.controller';

const router = express.Router();

// Route for getting dashboard statistics (admin only)
router.get('/stats', getDashboardStats);

router.get('/monthly-elections', getMonthlyElectionCounts);


export default router;