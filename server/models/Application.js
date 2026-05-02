import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resume: {
    url: String,
    filename: String
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'rejected', 'selected'],
    default: 'applied'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'rejected', 'selected']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  interviewDate: Date,
  interviewNotes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ user: 1, job: 1 }, { unique: true });

// Virtual for applicant details
applicationSchema.virtual('applicant', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

applicationSchema.virtual('jobDetails', {
  ref: 'Job',
  localField: 'job',
  foreignField: '_id',
  justOne: true
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;