import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendApplicationConfirmation, sendStatusUpdateEmail } from '../utils/email.js';

// Apply for job
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      user: req.user._id,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Get user's resume
    const user = await User.findById(req.user._id);

    // Create application
    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      resume: user.resume,
      coverLetter,
      statusHistory: [{
        status: 'applied',
        changedAt: new Date(),
        note: 'Application submitted'
      }]
    });

    // Update job application count
    job.applications += 1;
    await job.save();

    // Create notification for recruiter
    await Notification.create({
      user: job.recruiter,
      type: 'application_status',
      title: 'New Application',
      message: `${user.name} applied for ${job.title}`,
      link: `/recruiter/applicants/${jobId}`
    });

    // Send confirmation email
    sendApplicationConfirmation(user, job).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'recruiter',
          select: 'name email'
        }
      })
      .sort('-createdAt');

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single application
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('user', 'name email phone location skills resume')
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    const isOwner = application.user._id.toString() === req.user._id.toString();
    const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRecruiter && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status (Recruiter)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, interviewDate } = req.body;

    const application = await Application.findById(id)
      .populate('user')
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiter && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      note: notes,
      changedBy: req.user._id
    });

    if (interviewDate) {
      application.interviewDate = interviewDate;
    }

    if (notes) {
      application.notes = notes;
    }

    await application.save();

    // Create notification for applicant
    const statusMessages = {
      reviewing: 'Your application is being reviewed',
      shortlisted: 'Congratulations! You have been shortlisted',
      interview_scheduled: 'Interview scheduled',
      rejected: 'Application status update',
      selected: 'Congratulations! You have been selected'
    };

    await Notification.create({
      user: application.user._id,
      type: 'application_status',
      title: 'Application Status Update',
      message: `Your application for ${application.job.title} - ${statusMessages[status]}`,
      link: '/dashboard/applied-jobs'
    });

    // Send email notification
    sendStatusUpdateEmail(application.user, application.job, status).catch(console.error);

    res.json({
      success: true,
      message: 'Application status updated',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Schedule interview (Recruiter)
export const scheduleInterview = async (req, res) => {
  try {
    req.body.status = 'interview_scheduled';
    req.body.notes = req.body.notes || 'Interview scheduled';
    return updateApplicationStatus(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw application (User)
export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['rejected', 'selected'].includes(application.status)) {
      return res.status(400).json({ message: 'Cannot withdraw application with this status' });
    }

    await Application.findByIdAndDelete(req.params.id);

    // Update job application count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applications: -1 }
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rate applicant (Recruiter)
export const rateApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const application = await Application.findById(id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const isRecruiter = application.job.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRecruiter && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.rating = rating;
    await application.save();

    res.json({
      success: true,
      message: 'Rating saved',
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get application stats
export const getApplicationStats = async (req, res) => {
  try {
    const userId = req.user.role === 'user' ? req.user._id : null;
    const recruiterId = req.user.role === 'recruiter' ? req.user._id : null;

    let matchQuery = {};
    if (userId) {
      matchQuery.user = userId;
    } else if (recruiterId) {
      const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id').lean();
      matchQuery.job = { $in: recruiterJobs.map(job => job._id) };
    }

    const stats = await Application.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        applied: statusCounts.applied || 0,
        reviewing: statusCounts.reviewing || 0,
        shortlisted: statusCounts.shortlisted || 0,
        interview_scheduled: statusCounts.interview_scheduled || 0,
        rejected: statusCounts.rejected || 0,
        selected: statusCounts.selected || 0,
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
