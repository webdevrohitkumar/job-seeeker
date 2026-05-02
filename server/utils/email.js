import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"JobSeeker AI" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${options.email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error.message);
    return false;
  }
};

export const sendWelcomeEmail = async (user) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Welcome to JobSeeker AI!</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for registering with JobSeeker AI. We're excited to help you find your dream job!</p>
      <p>With your account, you can:</p>
      <ul>
        <li>Upload your resume and get AI-powered analysis</li>
        <li>Search and apply for jobs</li>
        <li>Get personalized job recommendations</li>
        <li>Prepare for interviews with mock tests</li>
      </ul>
      <p>Get started by completing your profile and uploading your resume.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Go to Dashboard</a>
      <p style="margin-top: 24px; color: #666; font-size: 12px;">Best regards,<br>The JobSeeker AI Team</p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to JobSeeker AI!',
    message
  });
};

export const sendApplicationConfirmation = async (user, job) => {
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Job Application Received</h2>
      <p>Hi ${user.name},</p>
      <p>Your application for <strong>${job.title}</strong> at <strong>${job.company}</strong> has been submitted successfully!</p>
      <p>We'll notify you when the recruiter reviews your application.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/applied-jobs" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Applications</a>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `Application Submitted - ${job.title}`,
    message
  });
};

export const sendStatusUpdateEmail = async (user, job, status) => {
  const statusMessages = {
    reviewing: 'Your application is being reviewed',
    shortlisted: 'Congratulations! You have been shortlisted',
    interview_scheduled: 'Interview scheduled - Check your dashboard for details',
    rejected: 'Application status update',
    selected: 'Congratulations! You have been selected'
  };

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Application Status Update</h2>
      <p>Hi ${user.name},</p>
      <p>${statusMessages[status] || 'Your application status has been updated'}</p>
      <p><strong>Position:</strong> ${job.title}<br><strong>Company:</strong> ${job.company}</p>
      <a href="${process.env.FRONTEND_URL}/dashboard/applied-jobs" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Details</a>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `Application Update - ${job.title}`,
    message
  });
};

export const sendJobAlertEmail = async (user, jobs) => {
  const jobList = jobs.map(job => `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 8px 0;">
      <h3 style="margin: 0 0 8px 0;">${job.title}</h3>
      <p style="margin: 0; color: #666;">${job.company} • ${job.location}</p>
      <a href="${process.env.FRONTEND_URL}/jobs/${job._id}" style="color: #4F46E5;">View Job</a>
    </div>
  `).join('');

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">New Jobs Matching Your Profile</h2>
      <p>Hi ${user.name},</p>
      <p>We found ${jobs.length} new jobs that match your profile:</p>
      ${jobList}
      <a href="${process.env.FRONTEND_URL}/dashboard/search-jobs" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View All Jobs</a>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `New Job Matches - ${jobs.length} Jobs Found`,
    message
  });
};