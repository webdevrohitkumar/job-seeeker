/**
 * AI Service with Groq/Gemini Integration
 * Supports Groq API for fast responses and Google Gemini as backup
 */

import axios from 'axios';

// Initialize Groq API
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq';

// Groq API client with timeout and retry
const groqClient = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Gemini API client
const geminiClient = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

const buildCareerSystemPrompt = (userProfile = {}) => {
  const skills = userProfile?.skills?.length
    ? userProfile.skills.slice(0, 8).join(', ')
    : 'not provided yet';
  const name = userProfile?.name || 'User';

  return `You are an expert career counselor and resume coach for Indian job seekers and professionals.

**User Profile:**
- Name: ${name}
- Skills: ${skills}

**Your Role:**
Give practical, specific, actionable career advice. Always consider the Indian IT/Tech job market.
- Answer directly to the user's latest question
- Provide concrete examples and actionable steps
- Use INR for salary discussions (₹)
- Be conversational but professional
- Give specific numbers, timelines, and resources when asked

**Guidelines:**
- Each response should be 2-3 paragraphs maximum
- Start with the most important point
- Provide 1-3 concrete actionable steps
- Use bullet points for clarity
- Include relevant salary ranges for roles
- Consider fresher, mid-level, and senior roles
- Adapt to Indian salary expectations

**Avoid:**
- Generic responses
- Repetition
- Long-winded explanations
- Irrelevant career advice`;
};

/**
 * Call Groq API for AI responses
 */
const callGroqAPI = async (message, conversationHistory = [], userProfile = {}) => {
  try {
    // Validate API key
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured. Check .env file.');
    }

    // Build messages array
    const messages = [
      {
        role: 'system',
        content: buildCareerSystemPrompt(userProfile)
      }
    ];

    // Add conversation history (keep last 6 messages for context)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-6);
      recentHistory.forEach(msg => {
        if (msg && msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    console.log('Groq API Call - Messages:', messages.length, 'Total tokens approx:', messages.length * 50);

    const response = await groqClient.post('/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid Groq API response format');
    }

    const content = response.data.choices[0].message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    console.log('Groq API Response received successfully');
    return content.trim();
  } catch (error) {
    console.error('Groq API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

/**
 * Call Gemini API for AI responses
 */
const callGeminiAPI = async (message, conversationHistory = [], userProfile = {}) => {
  try {
    const historyText = conversationHistory
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');

    const fullPrompt = `${buildCareerSystemPrompt(userProfile)}

${historyText ? 'Previous conversation:\n' + historyText + '\n\n' : ''}User: ${message}`;

    const response = await geminiClient.post(
      `/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ]
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error('Failed to get response from AI');
  }
};

/**
 * Get AI response based on selected provider with retry logic
 */
const getAIResponse = async (message, conversationHistory = [], userProfile = {}) => {
  let lastError = null;

  // Try Groq first (primary provider)
  if (GROQ_API_KEY) {
    try {
      console.log('Attempting Groq API...');
      return await callGroqAPI(message, conversationHistory, userProfile);
    } catch (error) {
      console.log('Groq API failed, will try fallback');
      lastError = error;
    }
  }

  // Try Gemini as backup
  if (GEMINI_API_KEY && AI_PROVIDER === 'gemini') {
    try {
      console.log('Attempting Gemini API as backup...');
      return await callGeminiAPI(message, conversationHistory, userProfile);
    } catch (error) {
      console.log('Gemini API failed');
      lastError = error;
    }
  }

  // If both APIs fail, throw error (controller will use fallback)
  throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

// Common skills database for matching
const SKILLS_DATABASE = {
  frontend: ['javascript', 'typescript', 'react', 'vue', 'angular', 'html', 'css', 'next.js', 'redux', 'tailwind', 'bootstrap', 'jquery', 'sass', 'less', 'webpack', 'vite'],
  backend: ['node.js', 'express', 'python', 'django', 'flask', 'java', 'spring', 'c#', '.net', 'php', 'laravel', 'ruby', 'rails', 'go', 'rust', 'graphql', 'rest api'],
  database: ['mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite', 'firebase', 'dynamodb', 'cassandra', 'elasticsearch'],
  devops: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'linux', 'nginx', 'apache'],
  data: ['python', 'r', 'sql', 'tableau', 'power bi', 'excel', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'machine learning', 'data analysis', 'data visualization'],
  mobile: ['react native', 'flutter', 'android', 'ios', 'swift', 'kotlin', 'java', 'xamarin'],
  soft: ['leadership', 'communication', 'teamwork', 'problem-solving', 'agile', 'scrum', 'project management', 'time management']
};

// Job roles and their required skills
const JOB_ROLES = {
  'Frontend Developer': { skills: ['javascript', 'react', 'html', 'css', 'typescript'], salaryRange: { min: 300000, max: 900000 } },
  'Backend Developer': { skills: ['node.js', 'python', 'java', 'sql', 'rest api'], salaryRange: { min: 400000, max: 1100000 } },
  'Full Stack Developer': { skills: ['javascript', 'react', 'node.js', 'mongodb', 'sql'], salaryRange: { min: 450000, max: 1200000 } },
  'Data Analyst': { skills: ['python', 'sql', 'excel', 'tableau', 'data analysis'], salaryRange: { min: 300000, max: 800000 } },
  'Data Scientist': { skills: ['python', 'machine learning', 'tensorflow', 'sql', 'data analysis'], salaryRange: { min: 600000, max: 1600000 } },
  'DevOps Engineer': { skills: ['docker', 'kubernetes', 'aws', 'jenkins', 'linux'], salaryRange: { min: 600000, max: 1500000 } },
  'Mobile Developer': { skills: ['react native', 'flutter', 'android', 'ios'], salaryRange: { min: 400000, max: 1100000 } },
  'Java Developer': { skills: ['java', 'spring', 'mysql', 'hibernate', 'rest api'], salaryRange: { min: 400000, max: 1000000 } },
  'Python Developer': { skills: ['python', 'django', 'flask', 'mysql', 'rest api'], salaryRange: { min: 350000, max: 950000 } },
  'UI/UX Designer': { skills: ['figma', 'adobe xd', 'sketch', 'prototyping', 'user research'], salaryRange: { min: 300000, max: 850000 } },
  'Product Manager': { skills: ['agile', 'scrum', 'product management', 'roadmap', 'analytics'], salaryRange: { min: 800000, max: 2000000 } },
  'QA Engineer': { skills: ['selenium', 'testing', 'automation', 'manual testing', 'jira'], salaryRange: { min: 280000, max: 750000 } },
  'Cloud Engineer': { skills: ['aws', 'azure', 'gcp', 'docker', 'kubernetes'], salaryRange: { min: 600000, max: 1500000 } },
  'Software Engineer': { skills: ['programming', 'data structures', 'algorithms', 'sql', 'git'], salaryRange: { min: 400000, max: 1200000 } },
  'Machine Learning Engineer': { skills: ['python', 'tensorflow', 'pytorch', 'machine learning', 'sql'], salaryRange: { min: 700000, max: 1800000 } }
};

// Company suggestions database
const COMPANIES = [
  { name: 'Google', industry: 'Tech', openRoles: 500, matchScore: 95 },
  { name: 'Microsoft', industry: 'Tech', openRoles: 400, matchScore: 92 },
  { name: 'Amazon', industry: 'E-commerce', openRoles: 600, matchScore: 90 },
  { name: 'Meta', industry: 'Social Media', openRoles: 300, matchScore: 88 },
  { name: 'Apple', industry: 'Tech', openRoles: 250, matchScore: 87 },
  { name: 'Netflix', industry: 'Entertainment', openRoles: 100, matchScore: 85 },
  { name: 'Salesforce', industry: 'SaaS', openRoles: 200, matchScore: 83 },
  { name: 'Adobe', industry: 'Software', openRoles: 150, matchScore: 82 },
  { name: 'IBM', industry: 'Tech', openRoles: 180, matchScore: 80 },
  { name: 'Oracle', industry: 'Tech', openRoles: 160, matchScore: 78 },
  { name: 'TCS', industry: 'IT Services', openRoles: 1000, matchScore: 75 },
  { name: 'Infosys', industry: 'IT Services', openRoles: 800, matchScore: 73 },
  { name: 'Wipro', industry: 'IT Services', openRoles: 700, matchScore: 71 },
  { name: 'Accenture', industry: 'Consulting', openRoles: 500, matchScore: 70 },
  { name: 'Deloitte', industry: 'Consulting', openRoles: 400, matchScore: 68 }
];

/**
 * Parse resume text and extract structured data
 */
export const parseResume = async (text) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';
  
  // Extract phone
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/);
  const phone = phoneMatch ? phoneMatch[0] : '';
  
  // Extract skills (case-insensitive matching)
  const allSkills = Object.values(SKILLS_DATABASE).flat();
  const foundSkills = [];
  const textLower = text.toLowerCase();
  
  allSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  // Extract education (simple pattern matching)
  const education = [];
  const eduKeywords = ['university', 'college', 'bachelor', 'master', 'phd', 'degree', 'b.tech', 'm.tech', 'b.e', 'm.e', 'b.sc', 'm.sc'];
  lines.forEach(line => {
    const lineLower = line.toLowerCase();
    if (eduKeywords.some(kw => lineLower.includes(kw))) {
      education.push({
        institution: line,
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        grade: ''
      });
    }
  });
  
  // Extract experience
  const experience = [];
  const expKeywords = ['company', 'inc', 'llc', 'ltd', 'pvt', 'technologies', 'solutions', 'services'];
  lines.forEach(line => {
    const lineLower = line.toLowerCase();
    if (expKeywords.some(kw => lineLower.includes(kw)) && line.length > 10) {
      experience.push({
        company: line,
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrent: false
      });
    }
  });

  // Extract name (usually first non-empty line)
  const name = lines[0] || '';

  return {
    name,
    email,
    phone,
    location: '',
    summary: '',
    skills: [...new Set(foundSkills)],
    education: education.slice(0, 3),
    experience: experience.slice(0, 5),
    projects: [],
    certifications: [],
    languages: ['English']
  };
};

/**
 * Calculate ATS score based on resume content and job requirements
 */
export const calculateATSScore = async (parsedData, jobRequirements = null) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const scores = {
    keywordsFound: [],
    keywordsMissing: [],
    formattingScore: 85,
    contentScore: 70,
    readabilityScore: 80,
    experienceScore: 60
  };

  // Check skills match
  const userSkills = parsedData.skills.map(s => s.toLowerCase());
  const requiredSkills = jobRequirements?.skills || [];
  
  requiredSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (userSkills.includes(skillLower)) {
      scores.keywordsFound.push(skill);
    } else {
      scores.keywordsMissing.push(skill);
    }
  });

  // Calculate content score based on completeness
  let contentPoints = 0;
  if (parsedData.name) contentPoints += 10;
  if (parsedData.email) contentPoints += 10;
  if (parsedData.phone) contentPoints += 10;
  if (parsedData.skills.length > 0) contentPoints += 20;
  if (parsedData.education.length > 0) contentPoints += 20;
  if (parsedData.experience.length > 0) contentPoints += 20;
  if (parsedData.summary) contentPoints += 10;
  scores.contentScore = contentPoints;

  // Calculate experience score
  scores.experienceScore = Math.min(100, parsedData.experience.length * 20);

  // Calculate overall ATS score
  const atsScore = Math.round(
    (scores.formattingScore * 0.2) +
    (scores.contentScore * 0.3) +
    (scores.readabilityScore * 0.2) +
    (scores.experienceScore * 0.3)
  );

  return {
    atsScore,
    ...scores
  };
};

/**
 * Predict best job role based on skills
 */
export const predictRole = async (skills) => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const userSkills = skills.map(s => s.toLowerCase());
  let bestRole = 'Software Engineer';
  let highestScore = 0;
  const roleScores = [];

  Object.entries(JOB_ROLES).forEach(([role, data]) => {
    const requiredSkills = data.skills;
    let matchCount = 0;
    
    requiredSkills.forEach(skill => {
      if (userSkills.includes(skill.toLowerCase())) {
        matchCount++;
      }
    });
    
    const score = (matchCount / requiredSkills.length) * 100;
    roleScores.push({ role, score: Math.round(score) });
    
    if (score > highestScore) {
      highestScore = score;
      bestRole = role;
    }
  });

  // Sort by score descending
  roleScores.sort((a, b) => b.score - a.score);

  return {
    predictedRole: bestRole,
    confidence: Math.round(highestScore),
    alternativeRoles: roleScores.slice(1, 4)
  };
};

/**
 * Predict salary based on skills, experience and target company
 */
export const predictSalary = async (skills, experienceYears = 0, companyName = '') => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const userSkills = skills.map(s => s.toLowerCase());
  let salaryRange = { min: 350000, max: 850000 };
  let matchedRole = 'Software Engineer';

  // Find matching role for salary data
  let highestMatch = 0;
  Object.entries(JOB_ROLES).forEach(([role, data]) => {
    const requiredSkills = data.skills;
    let matchCount = 0;
    
    requiredSkills.forEach(skill => {
      if (userSkills.includes(skill.toLowerCase())) {
        matchCount++;
      }
    });
    
    const matchRatio = matchCount / requiredSkills.length;
    if (matchRatio > highestMatch) {
      highestMatch = matchRatio;
      matchedRole = role;
      salaryRange = { ...data.salaryRange };
    }
  });

  // Adjust for experience
  const experienceMultiplier = 1 + (experienceYears * 0.12); // 12% increase per year
  let adjustedMin = Math.round(salaryRange.min * experienceMultiplier);
  let adjustedMax = Math.round(salaryRange.max * experienceMultiplier);

  // Company specific adjustments (Tiers)
  if (companyName) {
    const name = companyName.toLowerCase();
    
    // Tier 1: Big Tech / Product (Google, Amazon, etc)
    const tier1 = ['google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber', 'goldman sachs', 'atlassian', 'adobe'];
    // Tier 2: Mid-range Product / Top Service (Zomato, Paytm, Accenture, etc)
    const tier2 = ['accenture', 'tcs', 'infosys', 'wipro', 'hcl', 'cognizant', 'capgemini', 'zomato', 'paytm', 'ola', 'swiggy', 'flipkart'];

    if (tier1.some(c => name.includes(c))) {
      adjustedMin = Math.round(adjustedMin * 2.2);
      adjustedMax = Math.round(adjustedMax * 2.5);
    } else if (tier2.some(c => name.includes(c))) {
      adjustedMin = Math.round(adjustedMin * 1.3);
      adjustedMax = Math.round(adjustedMax * 1.5);
    } else {
      // Default small/mid company adjustment
      adjustedMin = Math.round(adjustedMin * 0.9);
      adjustedMax = Math.round(adjustedMax * 1.1);
    }
  }

  return {
    min: adjustedMin,
    max: adjustedMax,
    currency: 'INR',
    role: matchedRole,
    company: companyName || 'Market Average',
    basedOn: skills.slice(0, 5)
  };
};

/**
 * Get company suggestions based on skills
 */
export const getCompanySuggestions = async (skills) => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const userSkills = skills.map(s => s.toLowerCase());
  
  // Score each company based on skill match
  const scoredCompanies = COMPANIES.map(company => {
    let matchScore = company.matchScore;
    
    // Adjust based on skill relevance
    if (userSkills.some(s => ['aws', 'azure', 'gcp', 'docker', 'kubernetes'].includes(s))) {
      if (['Google', 'Microsoft', 'Amazon', 'Azure'].includes(company.name)) {
        matchScore += 5;
      }
    }
    
    return {
      ...company,
      matchScore: Math.min(100, matchScore)
    };
  });

  // Sort by match score
  scoredCompanies.sort((a, b) => b.matchScore - a.matchScore);

  return scoredCompanies.slice(0, 8);
};

/**
 * Generate resume improvement suggestions
 */
export const getResumeSuggestions = async (parsedData, atsAnalysis) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const suggestions = {
    overall: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    summary: []
  };

  // Overall suggestions
  if (atsAnalysis.atsScore < 70) {
    suggestions.overall.push('Your resume needs improvement to pass ATS systems');
  } else if (atsAnalysis.atsScore < 90) {
    suggestions.overall.push('Good resume! A few more optimizations could help');
  } else {
    suggestions.overall.push('Excellent resume! Well optimized for ATS');
  }

  // Skills suggestions
  if (parsedData.skills.length < 5) {
    suggestions.skills.push('Add more relevant skills to increase visibility');
  }
  if (atsAnalysis.keywordsMissing.length > 0) {
    suggestions.skills.push(`Consider adding: ${atsAnalysis.keywordsMissing.slice(0, 5).join(', ')}`);
  }

  // Experience suggestions
  if (parsedData.experience.length === 0) {
    suggestions.experience.push('Add work experience to strengthen your profile');
  } else if (parsedData.experience.length < 2) {
    suggestions.experience.push('Consider adding more detailed work experience');
  }

  // Education suggestions
  if (parsedData.education.length === 0) {
    suggestions.education.push('Add your educational background');
  }

  // Projects suggestions
  if (parsedData.projects.length === 0) {
    suggestions.projects.push('Add relevant projects to showcase your skills');
  }

  // Summary suggestions
  if (!parsedData.summary) {
    suggestions.summary.push('Add a professional summary (2-3 sentences)');
  } else if (parsedData.summary.length < 50) {
    suggestions.summary.push('Expand your professional summary');
  }

  return suggestions;
};

/**
 * AI Chatbot for career guidance - With Groq/Gemini Integration
 */
export const careerChatbot = async (message, userProfile, conversationHistory = []) => {
  try {
    if (!message || message.trim().length === 0) {
      return {
        response: "I'm here to help with your career! Ask me anything about resume, interviews, job search, salary, or skills.",
        suggestions: ['How do I improve my resume?', 'What skills should I learn?', 'How do I prepare for interviews?']
      };
    }

    // Convert chat history to API format
    const apiHistory = (conversationHistory || [])
      .filter(msg => msg && msg.role && msg.content)
      .map(msg => ({
        role: msg.role || 'user',
        content: String(msg.content || '').slice(0, 2000)
      }));

    console.log('Chatbot Request:', {
      message: message.slice(0, 50),
      historyLength: apiHistory.length,
      userSkills: userProfile?.skills?.length || 0
    });

    // Get response from AI
    const response = await getAIResponse(message, apiHistory, userProfile);

    return {
      response: response || 'I couldn\'t generate a response. Please try again.',
      suggestions: getFollowUpSuggestions(message)
    };
  } catch (error) {
    console.error('Chatbot Error:', error.message);

    // Use intelligent fallback response
    const fallbackResponse = getLocalCareerResponse(message, userProfile, conversationHistory);
    
    return {
      response: fallbackResponse,
      suggestions: getFollowUpSuggestions(message)
    };
  }
};

const getLocalCareerResponse = (message, userProfile = {}, conversationHistory = []) => {
  const text = String(message || '').toLowerCase().trim();
  const skills = userProfile?.skills?.length ? userProfile.skills.slice(0, 5).join(', ') : 'your skills';
  
  // Extract topic from message
  const resumeKeywords = ['resume', 'cv', 'ats', 'bullet', 'experience', 'format', 'improve', 'write'];
  const interviewKeywords = ['interview', 'question', 'mock', 'technical', 'coding', 'prepare', 'hr'];
  const salaryKeywords = ['salary', 'package', 'ctc', 'compensation', 'pay', 'wage', 'negotiate'];
  const skillKeywords = ['skill', 'learn', 'technology', 'course', 'training', 'study', 'upskill'];
  const jobKeywords = ['job', 'apply', 'placement', 'company', 'role', 'position', 'internship'];

  const hasResumeTopic = resumeKeywords.some(k => text.includes(k));
  const hasInterviewTopic = interviewKeywords.some(k => text.includes(k));
  const hasSalaryTopic = salaryKeywords.some(k => text.includes(k));
  const hasSkillTopic = skillKeywords.some(k => text.includes(k));
  const hasJobTopic = jobKeywords.some(k => text.includes(k));

  if (hasResumeTopic) {
    return `**Resume Optimization Tips:**

1. **Add Metrics** - Instead of "Built a login system", write "Built JWT authentication reducing unauthorized access by 100%"
2. **Format Clearly** - Use ${skills} in a dedicated skills section
3. **Project Focus** - Highlight your strongest 3-4 projects with tech stack clearly mentioned
4. **ATS Friendly** - Use standard fonts, avoid images, use keywords from job descriptions

**Action:** Review your resume on this portal's ATS analyzer to see your current score. Every 5% improvement increases your chances significantly.`;
  }

  if (hasInterviewTopic) {
    return `**Interview Preparation Strategy:**

1. **Technical** - Practice 10-15 problems on your strongest skill (${skills})
2. **Project Walk-through** - Pick your best project. Be ready to explain every decision
3. **Behavioral** - Prepare 3 stories: a challenge you overcame, a conflict you resolved, and something you learned
4. **Company Research** - Spend 15 mins on company GitHub, recent news, tech stack

**Pro Tip:** Practice speaking your answers out loud. Most candidates only read solutions.`;
  }

  if (hasSalaryTopic) {
    return `**Salary Discussion in Indian Market:**

**Fresher Levels (0-1 year):**
- Tier 1 (Google, Amazon): ₹20-40 LPA
- Top Product Cos: ₹12-25 LPA  
- Good Service Companies: ₹5-10 LPA

**Your Approach:**
1. Research Glassdoor & AmbitionBox for your exact role
2. Say: "Based on my skills and the role, I'm expecting a competitive market-rate package"
3. Don't quote first. Let them make an offer
4. When negotiating, ask for performance bonus breakdown

**Remember:** Your first job's salary affects future salaries for 5 years.`;
  }

  if (hasSkillTopic) {
    return `**Strategic Skill Development:**

1. **Deepen Current Skills** - Master your strongest skill (${skills}) before jumping to new ones
2. **Add One Complementary** - If you know React, add Node.js or GraphQL
3. **Build Projects** - 1 good complete project beats 10 half-finished tutorials
4. **Get Certified** - Optional but helps with ATS filtering. Git certification or cloud cert helps

**12-Week Plan:** Learn for 4 weeks, build 1 project for 4 weeks, polish portfolio for 4 weeks.`;
  }

  if (hasJobTopic) {
    return `**Smart Job Application Strategy:**

1. **Quality Over Quantity** - Apply to 5 well-matched jobs vs 50 random ones
2. **Match Keywords** - Copy keywords from job description into your resume
3. **Follow-up** - After 5-7 days, reach out on LinkedIn if you found the recruiter
4. **Track Everything** - Use this portal to track all your applications

**Golden Rule:** A recruiter spends 6 seconds on your resume. Make those 6 seconds count.`;
  }

  // Generic response
  return `I can help you with:
- **Resume Optimization** - ATS optimization and bullet improvement
- **Interview Prep** - Technical, behavioral, and company-specific prep
- **Salary Negotiation** - Market rates and negotiation tactics
- **Skill Development** - Learning roadmap for your tech stack
- **Job Search** - Application strategy and company suggestions

**What specific challenge are you facing?** Tell me your skill set and I'll give targeted advice.`;
};

const getFollowUpSuggestions = (message) => {
  const text = String(message || '').toLowerCase();

  if (text.includes('resume') || text.includes('cv')) {
    return ['Show me a resume example', 'How to improve ATS score?', 'What keywords to add?'];
  }

  if (text.includes('interview')) {
    return ['Ask me a mock question', 'How do I explain my project?', 'Tell me behavioral tips'];
  }

  if (text.includes('salary') || text.includes('package')) {
    return ['Market rate for my skills?', 'How do I negotiate?', 'Salary by role?'];
  }

  if (text.includes('learn') || text.includes('skill')) {
    return ['Best path for frontend?', 'Backend learning roadmap?', 'Data science path?'];
  }

  if (text.includes('job') || text.includes('apply')) {
    return ['Companies hiring freshers?', 'How to stand out?', 'Application tips?'];
  }

  return ['How do I improve my resume?', 'What skills should I learn?', 'Companies hiring now?'];
};

/**
 * Get job recommendations based on user profile
 */
export const getJobRecommendations = async (userProfile, jobs) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const userSkills = (userProfile?.skills || []).map(s => s.toLowerCase());
  
  const scoredJobs = jobs.map(job => {
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());
    let matchCount = 0;
    
    jobSkills.forEach(skill => {
      if (userSkills.includes(skill)) {
        matchCount++;
      }
    });
    
    const matchScore = jobSkills.length > 0 
      ? Math.round((matchCount / jobSkills.length) * 100) 
      : 50;
    
    return {
      ...job,
      matchScore,
      matchedSkills: jobSkills.filter(s => userSkills.includes(s))
    };
  });

  // Sort by match score
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  return scoredJobs.slice(0, 10);
};

export default {
  parseResume,
  calculateATSScore,
  predictRole,
  predictSalary,
  getCompanySuggestions,
  getResumeSuggestions,
  careerChatbot,
  getJobRecommendations
};
