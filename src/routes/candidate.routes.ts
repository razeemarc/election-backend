// src/routes/candidate.routes.ts
import { Router } from 'express';
import {  getCurrentElections, getPendingCandidates, getUpcomingElections, submitCandidateForm } from '../controller/candidate.controller';

const router = Router();

router.post('/submit', submitCandidateForm);
router.get('/elections/current', getCurrentElections);
router.get('/elections/upcoming', getUpcomingElections); // Add this new route
router.get('/pending', getPendingCandidates);

export default router;
