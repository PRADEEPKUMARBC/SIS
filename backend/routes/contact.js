import express from 'express';
import {
  submitContactForm,
  getAllContacts,
  getContactById,
  updateContactStatus,
  getContactStats,
  healthCheck
} from '../controllers/contactController.js';

const router = express.Router();

// Submit contact form
router.post('/', submitContactForm);

// Get all contacts (admin)
router.get('/contacts', getAllContacts);

// Get contact by ID
router.get('/contacts/:id', getContactById);

// Update contact status
router.patch('/contacts/:id/status', updateContactStatus);

// Get contact statistics
router.get('/stats', getContactStats);

// Health check
router.get('/health', healthCheck);

export default router;
