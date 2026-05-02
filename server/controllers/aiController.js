import User from '../models/User.js';
import Job from '../models/Job.js';
import ResumeReport from '../models/ResumeReport.js';
import aiService from '../utils/aiService.js';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const getResumeText = async (filePath, file) => {
  if (file.mimetype === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  return fs.readFileSync(filePath, 'utf-8');
};

// Parse resume and generate report
export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file' });
    }

    // Read file content
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
    const text = await getResumeText(filePath, req.file);

    // Parse resume using AI service
    const parsedData = await aiService.parseResume(text);

    // Calculate ATS score
    const atsAnalysis = await aiService.calculateATSScore(parsedData);

    // Predict role
    const rolePrediction = await aiService.predictRole(parsedData.skills);

    // Predict salary
    const salaryPrediction = await aiService.predictSalary(parsedData.skills, 0, '');

    // Get company suggestions
    const companySuggestions = await aiService.getCompanySuggestions(parsedData.skills);

    // Get resume suggestions
    const suggestions = await aiService.getResumeSuggestions(parsedData, atsAnalysis);

    // Get job recommendations
    const allJobs = await Job.find({ status: 'active' }).limit(50).lean();
    const recommendedJobs = await aiService.getJobRecommendations({ skills: parsedData.skills }, allJobs);

    // Create or update resume report
    let resumeReport = await ResumeReport.findOne({ user: req.user._id });

    if (resumeReport) {
      resumeReport = await ResumeReport.findByIdAndUpdate(
        resumeReport._id,
        {
          resumeFilename: req.file.originalname,
          parsedData,
          atsScore: atsAnalysis.atsScore,
          atsAnalysis,
          predictedRole: rolePrediction.predictedRole,
          roleConfidence: rolePrediction.confidence,
          salaryPrediction,
          suggestions,
          companySuggestions,
          recommendedJobs: recommendedJobs.slice(0, 5).map(j => j._id)
        },
        { new: true }
      );
    } else {
      resumeReport = await ResumeReport.create({
        user: req.user._id,
        resumeFilename: req.file.originalname,
        parsedData,
        atsScore: atsAnalysis.atsScore,
        atsAnalysis,
        predictedRole: rolePrediction.predictedRole,
        roleConfidence: rolePrediction.confidence,
        salaryPrediction,
        suggestions,
        companySuggestions,
        recommendedJobs: recommendedJobs.slice(0, 5).map(j => j._id)
      });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;

    // Update user's resume, skills, and report pointer
    const user = await User.findByIdAndUpdate(req.user._id, {
      resume: {
        url: resumeUrl,
        filename: req.file.originalname,
        uploadedAt: new Date()
      },
      skills: parsedData.skills,
      resumeReport: resumeReport._id
    }, { new: true });

    res.json({
      success: true,
      user,
      report: resumeReport
    });
  } catch (error) {
    console.error('Resume parsing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get resume report
export const getResumeReport = async (req, res) => {
  try {
    const report = await ResumeReport.findOne({ user: req.user._id })
      .populate('recommendedJobs');

    if (!report) {
      return res.status(404).json({ message: 'No resume report found. Please upload a resume first.' });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ATS score for existing resume against job
export const checkATSScore = async (req, res) => {
  try {
    const { jobId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user.resume?.url) {
      return res.status(400).json({ message: 'Please upload a resume first' });
    }

    const report = await ResumeReport.findOne({ user: req.user._id });
    if (!report) {
      return res.status(400).json({ message: 'No resume report found' });
    }

    let jobRequirements = null;
    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        jobRequirements = { skills: job.skills };
      }
    }

    const atsAnalysis = await aiService.calculateATSScore(report.parsedData, jobRequirements);

    res.json({
      success: true,
      atsScore: atsAnalysis.atsScore,
      analysis: atsAnalysis
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get role prediction
export const getRolePrediction = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const skills = req.body.skills || user.skills || [];

    if (skills.length === 0) {
      return res.status(400).json({ message: 'No skills found. Please upload a resume or add skills to your profile.' });
    }

    const prediction = await aiService.predictRole(skills);

    res.json({
      success: true,
      ...prediction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get salary prediction
export const getSalaryPrediction = async (req, res) => {
  try {
    const { skills, experience, companyName } = req.body;
    const user = await User.findById(req.user._id);
    
    const userSkills = skills || user.skills || [];
    const experienceYears = experience || 0;

    if (userSkills.length === 0) {
      return res.status(400).json({ message: 'No skills found' });
    }

    const prediction = await aiService.predictSalary(userSkills, experienceYears, companyName || '');

    res.json({
      success: true,
      ...prediction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company suggestions
export const getCompanySuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const skills = req.body.skills || user.skills || [];

    if (skills.length === 0) {
      return res.status(400).json({ message: 'No skills found' });
    }

    const suggestions = await aiService.getCompanySuggestions(skills);

    res.json({
      success: true,
      companies: suggestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate mock interview
export const generateMockInterview = async (req, res) => {
  try {
    const { role, jobTitle } = req.body;
    const targetRole = role || jobTitle;

    if (!targetRole) {
      return res.status(400).json({ message: 'Please provide a role' });
    }

    const interview = await aiService.generateMockInterview(targetRole);
    const questions = [
      ...interview.hrQuestions,
      ...interview.technicalQuestions,
      ...interview.behavioralQuestions
    ];

    res.json({
      success: true,
      interview,
      questions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate interview feedback
export const getInterviewFeedback = async (req, res) => {
  try {
    const { questions = [] } = req.body;
    const answered = questions.filter(item => item.answer?.trim()).length;
    const completionScore = questions.length ? Math.round((answered / questions.length) * 100) : 70;

    res.json({
      success: true,
      feedback: {
        overallScore: Math.max(60, Math.min(92, completionScore)),
        strengths: [
          'Clear effort to structure answers around the question.',
          'Good coverage of role-specific topics.'
        ],
        improvements: [
          'Add more measurable outcomes and examples from projects.',
          'Keep answers concise with situation, action, and result.'
        ],
        tips: [
          'Practice two-minute answers for common HR questions.',
          'Prepare one technical story for each major skill on your resume.'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// AI Career Chatbot
export const careerChatbot = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a message' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('Chatbot Request from user:', user.name);
    
    // Pass conversation history to the service
    const result = await aiService.careerChatbot(
      message.trim(),
      {
        skills: user.skills || [],
        name: user.name
      },
      history || []
    );

    res.json({
      success: true,
      data: {
        response: result.response,
        suggestions: result.suggestions
      }
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to get AI response. Please try again.'
    });
  }
};

// Get job recommendations
export const getJobRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('resumeReport');
    
    const skills = user.skills || [];
    const jobs = await Job.find({ status: 'active' }).limit(100).lean();

    const recommendations = await aiService.getJobRecommendations({ skills }, jobs);

    res.json({
      success: true,
      jobs: recommendations,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Analyze resume against job
export const analyzeAgainstJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const user = await User.findById(req.user._id);
    const report = await ResumeReport.findOne({ user: req.user._id });
    const job = await Job.findById(jobId);

    if (!report) {
      return res.status(400).json({ message: 'No resume report found' });
    }

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const atsAnalysis = await aiService.calculateATSScore(report.parsedData, {
      skills: job.skills
    });

    const rolePrediction = await aiService.predictRole([
      ...report.parsedData.skills,
      ...job.skills
    ]);

    res.json({
      success: true,
      atsScore: atsAnalysis.atsScore,
      analysis: atsAnalysis,
      matchScore: Math.round((atsAnalysis.atsScore + rolePrediction.confidence) / 2),
      matchedSkills: job.skills.filter(s => 
        report.parsedData.skills.map(ss => ss.toLowerCase()).includes(s.toLowerCase())
      ),
      missingSkills: job.skills.filter(s => 
        !report.parsedData.skills.map(ss => ss.toLowerCase()).includes(s.toLowerCase())
      )
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
