import mongoose from 'mongoose';

const resumeReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeFilename: {
    type: String,
    required: true
  },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    skills: [String],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: String,
      endDate: String,
      grade: String
    }],
    experience: [{
      company: String,
      title: String,
      location: String,
      startDate: String,
      endDate: String,
      description: String,
      isCurrent: Boolean
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      url: String
    }],
    certifications: [String],
    languages: [String]
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  atsAnalysis: {
    keywordsFound: [String],
    keywordsMissing: [String],
    formattingScore: Number,
    contentScore: Number,
    readabilityScore: Number,
    experienceScore: Number
  },
  predictedRole: {
    type: String,
    default: ''
  },
  roleConfidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  salaryPrediction: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    basedOn: [String]
  },
  suggestions: {
    overall: [String],
    skills: [String],
    experience: [String],
    education: [String],
    projects: [String],
    summary: [String]
  },
  companySuggestions: [{
    name: String,
    logo: String,
    industry: String,
    openRoles: Number,
    matchScore: Number
  }],
  recommendedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
}, {
  timestamps: true
});

const ResumeReport = mongoose.model('ResumeReport', resumeReportSchema);

export default ResumeReport;
