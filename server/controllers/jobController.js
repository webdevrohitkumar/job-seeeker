import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// Create job (Recruiter)
export const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiter: req.user._id
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all jobs (with filters)
export const getJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      jobType, 
      workMode, 
      location,
      salaryMin,
      salaryMax,
      skills,
      sort = '-createdAt'
    } = req.query;

    const query = { status: 'active' };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (jobType) {
      query.jobType = jobType;
    }
    if (workMode) {
      query.workMode = workMode;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (salaryMin) {
      query['salary.max'] = { $gte: parseInt(salaryMin) };
    }
    if (salaryMax) {
      query['salary.min'] = { $lte: parseInt(salaryMax) };
    }
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillList };
    }

    const jobs = await Job.find(query)
      .populate('recruiter', 'name company')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
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

// Get single job
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name email company location');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job (Recruiter)
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete job (Recruiter)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    
    // Delete related applications
    await Application.deleteMany({ job: req.params.id });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recruiter's jobs
export const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { recruiter: req.user._id };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    // Get application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicationCount };
      })
    );

    res.json({
      success: true,
      jobs: jobsWithCounts,
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

// Get job applicants (Recruiter)
export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const query = { job: jobId };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('user', 'name email phone location skills resume')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applicants: applications
      },
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

// Get all jobs (Admin)
export const getAllJobsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
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

// Get dashboard stats (Admin/Recruiter)
export const getDashboardStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let stats = {};

    if (req.user.role === 'admin') {
      const [totalUsers, totalRecruiters, totalJobs, totalApplications, recentUserCount, recentJobCount, recentUsers, recentJobs] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'recruiter' }),
        Job.countDocuments(),
        Application.countDocuments(),
        User.countDocuments({ role: 'user', createdAt: { $gte: startDate } }),
        Job.countDocuments({ createdAt: { $gte: startDate } }),
        User.find({ role: 'user' }).select('name email createdAt').sort('-createdAt').limit(5),
        Job.find().populate('recruiter', 'name email').sort('-createdAt').limit(5)
      ]);

      stats = {
        totalUsers,
        totalRecruiters,
        totalJobs,
        totalApplications,
        recentUsers: recentUserCount,
        recentJobs: recentJobCount,
        activeJobs: await Job.countDocuments({ status: 'active' }),
        pendingRecruiters: await User.countDocuments({ role: 'recruiter', isApproved: false })
      };

      return res.json({
        success: true,
        stats,
        recentUsers,
        recentJobs
      });
    } else {
      // Recruiter stats
      const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id title company status applications createdAt');
      const jobIds = recruiterJobs.map(job => job._id);
      const [totalApplications, recentApplications, recentApplicants] = await Promise.all([
        Application.countDocuments({ job: { $in: jobIds } }),
        Application.countDocuments({ job: { $in: jobIds }, createdAt: { $gte: startDate } }),
        Application.find({ job: { $in: jobIds } })
          .populate('user', 'name email')
          .populate('job', 'title company')
          .sort('-createdAt')
          .limit(5)
      ]);

      stats = {
        totalJobs: recruiterJobs.length,
        totalApplications,
        totalApplicants: totalApplications,
        recentApplications,
        pendingReview: await Application.countDocuments({ job: { $in: jobIds }, status: { $in: ['applied', 'reviewing'] } }),
        activeJobs: await Job.countDocuments({ recruiter: req.user._id, status: 'active' })
      };

      return res.json({
        success: true,
        stats,
        recentJobs: recruiterJobs.slice(0, 5),
        recentApplicants
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
