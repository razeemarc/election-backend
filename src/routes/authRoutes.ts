import { Router } from 'express';
import { signup } from '../controller/signup';
import { login } from '../controller/login';


const router = Router();

router.post('/signup', signup); 
router.post('/login',login)


export default router;
