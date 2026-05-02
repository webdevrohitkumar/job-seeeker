import express from 'express';
import { 
  applyForJob, 
  getMyApplications, 
  getApplication,
  updateApplicationStatus,
  scheduleInterview,
  withdrawApplication,
  rateApplicant,
  getApplicationStats
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.use(protect);

router.post('/job/:jobId', applyForJob);
router.get('/my-applications', getMyApplications);
router.get('/stats/me', getApplicationStats);
router.get('/:id', getApplication);
router.delete('/:id', withdrawApplication);

// Recruiter/Admin routes
router.put('/:id/status', authorize('recruiter', 'admin'), updateApplicationStatus);
router.post('/:id/schedule-interview', authorize('recruiter', 'admin'), scheduleInterview);
router.put('/:id/rating', authorize('recruiter', 'admin'), rateApplicant);

export default router;
