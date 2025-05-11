// src/routes/election.routes.ts
import { Router } from 'express';
import { createElection, getAllElections } from '../controller/election.controller';


const router = Router();

// POST endpoint to create an election
router.post('/election', async (req, res) => {
  try {
    const result = await createElection(req, res);
     result;
  } catch (error) {
     res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/elections', getAllElections);


export default router;