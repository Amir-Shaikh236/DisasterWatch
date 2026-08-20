import { Router } from 'express';
import { getAlerts } from '../controllers/AlertController.js';

const router = Router();

router.get('/getAlerts', getAlerts);

export default router;