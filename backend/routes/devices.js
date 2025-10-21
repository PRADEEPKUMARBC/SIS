import express from 'express';
import {
  getDevices,
  getDevice,
  addDevice,
  updateDevice,
  deleteDevice,
  sendCommandToDevice ,
  getDeviceStats
} from '../controllers/deviceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All device routes are protected
router.use(authenticate);

router.get('/', getDevices);
router.get('/stats', getDeviceStats);
router.get('/:id', getDevice);
router.post('/', addDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.post('/:id/command', sendCommandToDevice);

export default router;
