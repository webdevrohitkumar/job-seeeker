import express from 'express';
import { 
  createJob, 
  getJobs, 
  getJob, 
  updateJob, 
  deleteJob, 
  getMyJobs,
  getJobApplicants,
  getAllJobsAdmin,
  getDashboardStats
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);

// Job CRUD
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

// Recruiter routes
router.get('/recruiter/dashboard', protect, authorize('recruiter', 'admin'), getDashboardStats);
router.get('/recruiter/my-jobs', protect, authorize('recruiter', 'admin'), getMyJobs);
router.get('/recruiter/:jobId/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllJobsAdmin);
router.get('/admin/stats', protect, authorize('admin', 'recruiter'), getDashboardStats);

router.get('/:id', getJob);

export default router;
