// routes/farmRoutes.js
import express from 'express';
import {
  getFarms,
  getFarm,
  addFarm,
  updateFarm,
  deleteFarm,
  getFarmStats,
  getUserFarmStats,
  searchFarms
} from '../controllers/farmController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getFarms);
router.get('/stats', getUserFarmStats);
router.get('/search', searchFarms);
router.get('/:id', getFarm);
router.get('/:id/stats', getFarmStats);
router.post('/', addFarm);
router.put('/:id', updateFarm);
router.delete('/:id', deleteFarm);

export default router;