import { Router } from 'express';
import { submitVote } from '../controller/vote.controller';


const router = Router();

router.post('/', submitVote);

export default router;