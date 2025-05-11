import express from 'express';
import { getAllElectionResults } from '../controller/result.controller';

const router = express.Router();

// GET /api/election-results - Get all election results with candidates and vote counts
router.get('/', getAllElectionResults);

export default router;