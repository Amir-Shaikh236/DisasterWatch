import { Router } from 'express';
import { deleteAlert, getAlerts } from '../controllers/AlertController.js';

const router = Router();

router.get('/getAlerts', getAlerts);
router.delete('/delete/:id', deleteAlert);

export default router;