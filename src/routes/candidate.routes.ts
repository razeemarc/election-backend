// src/routes/candidate.routes.ts
import { Router } from 'express';
import {  approveCandidate, getCurrentElections, getPendingCandidates, getUpcomingElections, rejectCandidate, submitCandidateForm } from '../controller/candidate.controller';

const router = Router();
router.patch('/approve/:memberId/:electionId', approveCandidate);
router.post('/submit', submitCandidateForm);
router.get('/elections/current', getCurrentElections);
router.get('/elections/upcoming', getUpcomingElections); // Add this new route
router.get('/pending', getPendingCandidates);



// DELETE /api/candidates/:memberId/:electionId/reject
router.delete('/reject/:memberId/:electionId', rejectCandidate);
export default router;
