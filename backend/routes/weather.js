import express from 'express';
import { getCurrentWeather, getWeatherForecast, getWeatherHistory } from '../controllers/weatherController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);
router.get('/history', getWeatherHistory);

export default router;
