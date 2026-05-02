import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';

dotenv.config();

const demoJobs = [
  {
    title: 'Frontend Developer Intern',
    company: 'TechNova Solutions',
    location: 'Pune, Maharashtra',
    jobType: 'internship',
    workMode: 'hybrid',
    salary: { min: 180000, max: 300000, currency: 'INR' },
    experience: { min: 0, max: 1 },
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
    requirements: ['Basic React knowledge', 'Good understanding of responsive UI', 'GitHub project link preferred'],
    responsibilities: ['Build reusable UI components', 'Fix layout bugs across devices', 'Connect frontend screens with REST APIs']
  },
  {
    title: 'MERN Stack Developer',
    company: 'BrightStack Labs',
    location: 'Bengaluru, Karnataka',
    jobType: 'full-time',
    workMode: 'onsite',
    salary: { min: 450000, max: 900000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'REST API'],
    requirements: ['Experience with MERN projects', 'Knowledge of authentication and CRUD APIs', 'Ability to debug production issues'],
    responsibilities: ['Develop full-stack features', 'Write clean API endpoints', 'Coordinate with UI and QA teams']
  },
  {
    title: 'Junior Backend Developer',
    company: 'CodeCraft Technologies',
    location: 'Noida, Uttar Pradesh',
    jobType: 'full-time',
    workMode: 'onsite',
    salary: { min: 350000, max: 650000, currency: 'INR' },
    experience: { min: 0, max: 2 },
    skills: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Postman'],
    requirements: ['Strong JavaScript basics', 'Understanding of API status codes', 'Database query knowledge'],
    responsibilities: ['Create backend APIs', 'Maintain database models', 'Handle bug fixes and API testing']
  },
  {
    title: 'React UI Developer',
    company: 'PixelMint Studio',
    location: 'Remote',
    jobType: 'contract',
    workMode: 'remote',
    salary: { min: 500000, max: 850000, currency: 'INR' },
    experience: { min: 1, max: 4 },
    skills: ['React', 'Tailwind CSS', 'Figma', 'JavaScript', 'Responsive Design'],
    requirements: ['Portfolio with live UI work', 'Good eye for spacing and visual hierarchy', 'Comfortable with component-based development'],
    responsibilities: ['Convert designs into responsive pages', 'Improve existing UI screens', 'Optimize frontend performance']
  },
  {
    title: 'Data Analyst Trainee',
    company: 'InsightEdge Analytics',
    location: 'Gurugram, Haryana',
    jobType: 'internship',
    workMode: 'onsite',
    salary: { min: 200000, max: 360000, currency: 'INR' },
    experience: { min: 0, max: 1 },
    skills: ['Excel', 'SQL', 'Python', 'Power BI', 'Data Analysis'],
    requirements: ['Good analytical thinking', 'Basic SQL queries', 'Ability to prepare reports'],
    responsibilities: ['Clean data sets', 'Build dashboards', 'Prepare weekly business reports']
  },
  {
    title: 'QA Automation Engineer',
    company: 'TestGrid Systems',
    location: 'Hyderabad, Telangana',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: { min: 420000, max: 800000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    skills: ['Selenium', 'Java', 'Manual Testing', 'API Testing', 'Jira'],
    requirements: ['Manual and automation testing knowledge', 'Bug reporting experience', 'Basic Java skills'],
    responsibilities: ['Create test cases', 'Automate regression flows', 'Log and verify bugs']
  },
  {
    title: 'Python Django Developer',
    company: 'CloudAxis Software',
    location: 'Chennai, Tamil Nadu',
    jobType: 'full-time',
    workMode: 'onsite',
    salary: { min: 400000, max: 850000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    skills: ['Python', 'Django', 'REST API', 'PostgreSQL', 'Git'],
    requirements: ['Django project experience', 'REST framework knowledge', 'Database design basics'],
    responsibilities: ['Build Django APIs', 'Write model and serializer logic', 'Deploy and maintain backend services']
  },
  {
    title: 'Java Spring Boot Developer',
    company: 'FinCore Digital',
    location: 'Mumbai, Maharashtra',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: { min: 550000, max: 1100000, currency: 'INR' },
    experience: { min: 2, max: 5 },
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST API', 'Microservices'],
    requirements: ['Strong Java fundamentals', 'Spring Boot API development', 'SQL query optimization basics'],
    responsibilities: ['Develop backend services', 'Integrate third-party APIs', 'Participate in code reviews']
  },
  {
    title: 'UI/UX Designer',
    company: 'DesignLoop Creative',
    location: 'Ahmedabad, Gujarat',
    jobType: 'full-time',
    workMode: 'onsite',
    salary: { min: 300000, max: 700000, currency: 'INR' },
    experience: { min: 0, max: 2 },
    skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'UI Design'],
    requirements: ['Figma portfolio required', 'Understanding of web and mobile layouts', 'Basic design system knowledge'],
    responsibilities: ['Create wireframes and mockups', 'Improve product flows', 'Work with developers on handoff']
  },
  {
    title: 'DevOps Engineer',
    company: 'InfraScale Technologies',
    location: 'Bengaluru, Karnataka',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: { min: 700000, max: 1500000, currency: 'INR' },
    experience: { min: 2, max: 5 },
    skills: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
    requirements: ['Linux command-line knowledge', 'Docker deployment experience', 'Basic cloud infrastructure understanding'],
    responsibilities: ['Maintain CI/CD pipelines', 'Monitor deployments', 'Manage cloud resources']
  },
  {
    title: 'Mobile App Developer',
    company: 'AppWorks India',
    location: 'Indore, Madhya Pradesh',
    jobType: 'full-time',
    workMode: 'onsite',
    salary: { min: 380000, max: 850000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    skills: ['React Native', 'JavaScript', 'Android', 'Firebase', 'REST API'],
    requirements: ['React Native app experience', 'Understanding of mobile navigation', 'API integration knowledge'],
    responsibilities: ['Build mobile screens', 'Integrate APIs', 'Fix app performance issues']
  },
  {
    title: 'Cloud Support Associate',
    company: 'NimbusOps',
    location: 'Kochi, Kerala',
    jobType: 'full-time',
    workMode: 'remote',
    salary: { min: 320000, max: 600000, currency: 'INR' },
    experience: { min: 0, max: 2 },
    skills: ['AWS', 'Linux', 'Networking', 'Troubleshooting', 'Customer Support'],
    requirements: ['Basic cloud concepts', 'Good communication skills', 'Willingness to work in shifts'],
    responsibilities: ['Handle support tickets', 'Troubleshoot cloud issues', 'Document repeated problems']
  },
  {
    title: 'Machine Learning Intern',
    company: 'AIMinds Research',
    location: 'Remote',
    jobType: 'internship',
    workMode: 'remote',
    salary: { min: 180000, max: 360000, currency: 'INR' },
    experience: { min: 0, max: 1 },
    skills: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-learn'],
    requirements: ['ML mini-project required', 'Python data handling knowledge', 'Basic model evaluation understanding'],
    responsibilities: ['Prepare datasets', 'Train baseline models', 'Summarize experiment results']
  },
  {
    title: 'Technical Support Engineer',
    company: 'SecureNet Services',
    location: 'Jaipur, Rajasthan',
    jobType: 'full-time',
    workMode: 'onsite',
    salary: { min: 250000, max: 500000, currency: 'INR' },
    experience: { min: 0, max: 2 },
    skills: ['Networking', 'Windows', 'Linux', 'Troubleshooting', 'Communication'],
    requirements: ['Basic OS and network knowledge', 'Good written communication', 'Ticket handling awareness'],
    responsibilities: ['Resolve technical tickets', 'Guide customers through fixes', 'Escalate recurring issues']
  },
  {
    title: 'Product Management Associate',
    company: 'MarketPilot',
    location: 'Delhi NCR',
    jobType: 'full-time',
    workMode: 'hybrid',
    salary: { min: 500000, max: 950000, currency: 'INR' },
    experience: { min: 1, max: 3 },
    skills: ['Product Management', 'Analytics', 'Agile', 'Roadmap', 'Communication'],
    requirements: ['Understanding of product lifecycle', 'Ability to write clear requirements', 'Basic analytics knowledge'],
    responsibilities: ['Write user stories', 'Coordinate with engineering and design', 'Track product metrics']
  }
];

const seedJobs = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobseeker_ai');

  const recruiter = await User.findOneAndUpdate(
    { email: 'recruiter@demo.com' },
    {
      name: 'Demo Recruiter',
      email: 'recruiter@demo.com',
      password: 'password123',
      role: 'recruiter',
      isApproved: true
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  for (const job of demoJobs) {
    await Job.findOneAndUpdate(
      { title: job.title, company: job.company },
      {
        ...job,
        recruiter: recruiter._id,
        status: 'active',
        applications: 0,
        views: 0
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const total = await Job.countDocuments({ recruiter: recruiter._id, status: 'active' });
  console.log(`Seeded ${demoJobs.length} demo jobs. Active jobs for demo recruiter: ${total}`);
  await mongoose.disconnect();
};

seedJobs().catch(async (error) => {
  console.error('Failed to seed jobs:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
