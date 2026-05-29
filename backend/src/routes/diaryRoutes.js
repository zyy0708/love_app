import express from 'express';
import * as diaryController from '../controllers/diaryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, diaryEntrySchema } from '../utils/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', validate(diaryEntrySchema), diaryController.createEntry);
router.get('/', diaryController.getEntries);
router.get('/timeline', diaryController.getTimeline);
router.get('/ai-summary', diaryController.getAISummary);
router.get('/:entryId', diaryController.getEntry);
router.put('/:entryId', diaryController.updateEntry);
router.delete('/:entryId', diaryController.deleteEntry);

export default router;
