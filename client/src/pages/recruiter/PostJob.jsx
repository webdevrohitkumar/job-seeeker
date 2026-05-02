import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'full-time',
    experience: '0-2',
    salary: {
      min: '',
      max: '',
      currency: 'INR'
    },
    description: '',
    requirements: '',
    responsibilities: '',
    skills: [],
    remote: false,
    status: 'active'
  });
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('salary.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        salary: { ...prev.salary, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !formData.skills.includes(skill)) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skill]
        }));
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const [experienceMin, experienceMax] = formData.experience === '10+'
        ? [10, 20]
        : formData.experience.split('-').map(Number);

      const jobData = {
        ...formData,
        workMode: formData.remote ? 'remote' : 'onsite',
        requirements: formData.requirements.split('\n').map(item => item.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split('\n').map(item => item.trim()).filter(Boolean),
        experience: {
          min: experienceMin || 0,
          max: experienceMax || experienceMin || 0
        },
        salary: {
          min: parseInt(formData.salary.min) || 0,
          max: parseInt(formData.salary.max) || 0,
          currency: formData.salary.currency
        }
      };

      await jobAPI.createJob(jobData);
      navigate('/recruiter/manage-jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    }

    setLoading(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post New Job</h1>
        <p className="text-gray-600">Create a new job listing</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="e.g., Tech Corp"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type *
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level *
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="0-2">Entry Level (0-2 years)</option>
              <option value="2-5">Mid Level (2-5 years)</option>
              <option value="5-10">Senior (5-10 years)</option>
              <option value="10+">Executive (10+ years)</option>
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Min (INR)
            </label>
            <input
              type="number"
              name="salary.min"
              value={formData.salary.min}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., 300000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Max (INR)
            </label>
            <input
              type="number"
              name="salary.max"
              value={formData.salary.max}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., 800000"
            />
          </div>

          {/* Remote */}
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="remote"
                checked={formData.remote}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Remote Position</span>
            </label>
          </div>

          {/* Skills */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="input-field w-full mb-2"
              placeholder="Type a skill and press Enter"
            />
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="input-field w-full"
              placeholder="Describe the role, team culture, and what makes this opportunity exciting..."
            />
          </div>

          {/* Requirements */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements *
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              rows={4}
              className="input-field w-full"
              placeholder="List the required qualifications, skills, and experience..."
            />
          </div>

          {/* Responsibilities */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Responsibilities *
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              required
              rows={4}
              className="input-field w-full"
              placeholder="List the key responsibilities and duties..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/recruiter/manage-jobs')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
