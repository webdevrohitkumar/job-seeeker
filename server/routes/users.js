import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  uploadResume, 
  deleteResume,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getAppliedJobs,
  getUserStats,
  getAllUsers,
  getAllRecruiters,
  approveRecruiter,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// User routes
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/resume', upload.single('resume'), uploadResume);
router.delete('/resume', deleteResume);
router.post('/save-job/:jobId', saveJob);
router.delete('/save-job/:jobId', unsaveJob);
router.get('/saved-jobs', getSavedJobs);
router.get('/applied-jobs', getAppliedJobs);
router.get('/stats', getUserStats);

// Admin routes
router.get('/admin/users', authorize('admin'), getAllUsers);
router.get('/admin/recruiters', authorize('admin'), getAllRecruiters);
router.put('/admin/recruiter/:recruiterId/approve', authorize('admin'), approveRecruiter);
router.delete('/admin/user/:userId', authorize('admin'), deleteUser);

export default router;