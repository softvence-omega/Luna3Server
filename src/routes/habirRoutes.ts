import express from 'express';
import habitReminder from '../util/habitReminder';

const router = express.Router();

// 👇 Temporary test route
router.get('/test-notification', async (req, res) => {
  try {
    await habitReminder(); // This runs your notification logic immediately
    res.status(200).json({ success: true, message: 'Habit reminder triggered manually' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to run habit reminder' });
  }
});

export default router;
