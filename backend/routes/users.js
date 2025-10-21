import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Protected route
router.use(authenticate);

router.get('/dashboard', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'User dashboard endpoint - implement dashboard logic here'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}  );

export default router;
