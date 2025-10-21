import express from 'express';
import {
  startIrrigation,
  stopIrrigation,
  getIrrigationHistory,
  getIrrigationStats,
  emergencyStopAll,
  getActiveIrrigations
} from '../controllers/irrigationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All irrigation routes are protected
router.use(authenticate);

router.get('/history', getIrrigationHistory);
router.get('/stats', getIrrigationStats);
router.get('/active', getActiveIrrigations);
router.post('/emergency-stop', emergencyStopAll);
router.post('/:deviceId/start', startIrrigation);
router.post('/:deviceId/stop', stopIrrigation);

export default router;