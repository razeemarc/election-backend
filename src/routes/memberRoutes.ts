import { Router } from 'express';
import { getAllMembers, blockOrUnblockCandidate } from '../controller/members.controller';

const router = Router();

router.get('/members', getAllMembers);
router.patch('/candidate/block/:memberId', blockOrUnblockCandidate);

export default router;
