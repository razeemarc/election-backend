// src/routes/candidate.routes.ts
import { Router } from 'express';
import { submitCandidateForm } from '../controller/candidate.controller';

const router = Router();

router.post('/submit', submitCandidateForm);

export default router;
