// src/routes/election.routes.ts
import { Router } from 'express';
import { createElection, deleteElection, getAllElections, updateElection } from '../controller/election.controller';


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
// Update election endpoint
router.put('/election/:id', async (req, res) => {
  try {
    await updateElection(req, res);
  } catch (error) {
    console.error('Error updating election:', error);
    res.status(500).json({ error: 'Failed to update election' });
  }
});

// Delete election endpoint
router.delete('/election/:id', async (req, res) => {
  try {
    await deleteElection(req, res);
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ error: 'Failed to delete election' });
  }
});


export default router;