import { Router } from 'express';
import { getAllMembers } from '../controller/members.controller';


const router = Router();

router.get('/members', getAllMembers);

export default router;
