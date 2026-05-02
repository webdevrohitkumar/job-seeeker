import express from 'express';
import { 
  parseResume,
  getResumeReport,
  checkATSScore,
  getRolePrediction,
  getSalaryPrediction,
  getCompanySuggestions,
  getInterviewFeedback,
  careerChatbot,
  getJobRecommendations,
  analyzeAgainstJob
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

// Resume parsing
router.post('/parse-resume', upload.single('resume'), parseResume);
router.get('/resume-report', getResumeReport);

// ATS Score
router.post('/ats-score', checkATSScore);
router.get('/job/:jobId/analyze', analyzeAgainstJob);

// Role prediction
router.post('/role-prediction', getRolePrediction);

// Salary prediction
router.post('/salary-prediction', getSalaryPrediction);

// Company suggestions
router.post('/company-suggestions', getCompanySuggestions);

// Interview feedback
router.post('/interview-feedback', getInterviewFeedback);

// Career chatbot
router.post('/chatbot', careerChatbot);

// Job recommendations
router.get('/job-recommendations', getJobRecommendations);

export default router;
