import { Router } from 'express';
import { deleteAlert, getAlerts } from '../controllers/AlertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/getAlerts', protect, getAlerts);
router.delete('/delete/:id', protect, deleteAlert);

export default router;