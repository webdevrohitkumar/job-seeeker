import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedJobs')
      .populate({
        path: 'resumeReport',
        select: '-__v'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location, bio, skills },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        resume: {
          url: resumeUrl,
          filename: req.file.originalname,
          uploadedAt: new Date()
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      user,
      resume: user.resume
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resume: { url: '', filename: '', uploadedAt: null } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save job
export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(req.user._id);
    
    if (user.savedJobs.some(id => id.toString() === jobId)) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    user.savedJobs.push(jobId);
    await user.save();

    res.json({
      success: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unsave job
export const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const user = await User.findById(req.user._id);
    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();

    res.json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedJobs');

    res.json({
      success: true,
      jobs: user.savedJobs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applied jobs
export const getAppliedJobs = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('job')
      .sort('-createdAt');

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user stats
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const appliedCount = await Application.countDocuments({ user: req.user._id });
    const savedCount = user.savedJobs.length;
    const shortlistedCount = await Application.countDocuments({ 
      user: req.user._id,
      status: { $in: ['shortlisted', 'interview_scheduled', 'selected'] }
    });

    res.json({
      success: true,
      stats: {
        appliedJobs: appliedCount,
        savedJobs: savedCount,
        shortlisted: shortlistedCount,
        hasResume: !!user.resume?.url,
        hasProfile: !!(user.bio || user.skills.length > 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    } else {
      query.role = { $in: ['user', 'recruiter', 'admin'] };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all recruiters (Admin)
export const getAllRecruiters = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isApproved } = req.query;

    const query = { role: 'recruiter' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    const recruiters = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      recruiters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve recruiter (Admin)
export const approveRecruiter = async (req, res) => {
  try {
    const { recruiterId } = req.params;

    const recruiter = await User.findByIdAndUpdate(
      recruiterId,
      { isApproved: true },
      { new: true }
    );

    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    res.json({
      success: true,
      message: 'Recruiter approved successfully',
      recruiter
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related data
    await Application.deleteMany({ user: userId });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
