// Mock data for testing the Speaker Persona App
// This file contains sample data for speakers, sessions, and users

export const mockSpeakers = [
  {
    id: 'speaker-1',
    fullName: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'speaker',
    phone: '+1-555-0101',
    organization: 'TechCorp Inc.',
    bio: 'Full-stack developer with 8 years of experience in React, Node.js, and cloud architecture. Passionate about building scalable web applications and mentoring junior developers.',
    profileImage: '',
    isActive: true,
    availabilityConfirmed: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'speaker-2',
    fullName: 'Marcus Johnson',
    email: 'marcus.johnson@example.com',
    role: 'speaker',
    phone: '+1-555-0102',
    organization: 'Design Studio Co.',
    bio: 'UX/UI Designer specializing in mobile-first design and user research. Former design lead at major tech companies with a focus on accessibility and inclusive design.',
    profileImage: '',
    isActive: true,
    availabilityConfirmed: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'speaker-3',
    fullName: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    role: 'speaker',
    phone: '+1-555-0103',
    organization: 'AI Research Lab',
    bio: 'Machine Learning researcher and data scientist with PhD in Computer Science. Expert in natural language processing and computer vision applications.',
    profileImage: '',
    isActive: true,
    availabilityConfirmed: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: 'speaker-4',
    fullName: 'Alex Kim',
    email: 'alex.kim@example.com',
    role: 'speaker',
    phone: '+1-555-0104',
    organization: 'StartupXYZ',
    bio: 'Serial entrepreneur and product manager. Founded 3 successful startups and currently leading product strategy at a high-growth SaaS company.',
    profileImage: '',
    isActive: true,
    availabilityConfirmed: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-30')
  }
];

export const mockEventManagers = [
  {
    id: 'manager-1',
    fullName: 'Jennifer Wu',
    email: 'jennifer.wu@vibeathon.com',
    role: 'event_manager',
    phone: '+1-555-0201',
    organization: 'Vibeathon Team',
    bio: 'Event coordinator with 5 years of experience managing tech conferences and hackathons. Passionate about creating inclusive and engaging events.',
    profileImage: '',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-10')
  }
];

export const mockSessions = [
  {
    id: 'session-1',
    title: 'Building Scalable React Applications with Modern Patterns',
    abstract: 'Learn how to build large-scale React applications using modern patterns like Context API, custom hooks, and component composition. We\'ll explore performance optimization techniques, state management strategies, and how to structure your codebase for maintainability. This session includes live coding examples and real-world case studies from production applications.',
    type: 'talk',
    track: 'technology',
    duration: 45,
    targetAudience: 'intermediate',
    requirements: 'Basic knowledge of React and JavaScript',
    tags: ['React', 'JavaScript', 'Frontend', 'Performance'],
    speakerId: 'speaker-1',
    speakerName: 'Sarah Chen',
    speakerEmail: 'sarah.chen@example.com',
    speakerBio: 'Full-stack developer with 8 years of experience in React, Node.js, and cloud architecture.',
    speakerOrganization: 'TechCorp Inc.',
    status: 'approved',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-01'),
    reviewedAt: new Date('2024-02-01'),
    reviewedBy: 'Jennifer Wu',
    scheduledAt: new Date('2024-03-15T10:00:00'),
    room: 'Main Hall'
  },
  {
    id: 'session-2',
    title: 'Design Systems: Creating Consistency at Scale',
    abstract: 'Discover how to build and maintain design systems that scale across multiple products and teams. This workshop covers component libraries, design tokens, and the tools and processes needed to keep your design system healthy. Attendees will learn practical techniques for documenting components, managing versions, and ensuring adoption across organizations.',
    type: 'workshop',
    track: 'design',
    duration: 90,
    targetAudience: 'intermediate',
    requirements: 'Figma account and basic design experience',
    tags: ['Design Systems', 'UI/UX', 'Component Library', 'Figma'],
    speakerId: 'speaker-2',
    speakerName: 'Marcus Johnson',
    speakerEmail: 'marcus.johnson@example.com',
    speakerBio: 'UX/UI Designer specializing in mobile-first design and user research.',
    speakerOrganization: 'Design Studio Co.',
    status: 'approved',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-02-03'),
    reviewedAt: new Date('2024-02-03'),
    reviewedBy: 'Jennifer Wu',
    scheduledAt: new Date('2024-03-15T14:00:00'),
    room: 'Workshop Room A'
  },
  {
    id: 'session-3',
    title: 'Introduction to Machine Learning for Web Developers',
    abstract: 'Bridge the gap between web development and machine learning in this comprehensive introduction. Learn how to integrate ML models into web applications using TensorFlow.js, understand the basics of neural networks, and explore practical applications like image recognition and natural language processing in the browser.',
    type: 'talk',
    track: 'technology',
    duration: 60,
    targetAudience: 'beginner',
    requirements: 'JavaScript knowledge, curiosity about AI',
    tags: ['Machine Learning', 'TensorFlow.js', 'AI', 'Web Development'],
    speakerId: 'speaker-3',
    speakerName: 'Dr. Emily Rodriguez',
    speakerEmail: 'emily.rodriguez@example.com',
    speakerBio: 'Machine Learning researcher and data scientist with PhD in Computer Science.',
    speakerOrganization: 'AI Research Lab',
    status: 'submitted',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'session-4',
    title: 'From Idea to IPO: Lessons from Building a Tech Startup',
    abstract: 'A candid look at the journey of building a tech startup from initial idea to successful exit. Learn about product-market fit, scaling challenges, fundraising strategies, and the common pitfalls that can derail promising startups. This session includes real examples, metrics, and actionable insights for aspiring entrepreneurs.',
    type: 'keynote',
    track: 'business',
    duration: 30,
    targetAudience: 'all',
    requirements: 'None',
    tags: ['Entrepreneurship', 'Startup', 'Business', 'Product Management'],
    speakerId: 'speaker-4',
    speakerName: 'Alex Kim',
    speakerEmail: 'alex.kim@example.com',
    speakerBio: 'Serial entrepreneur and product manager. Founded 3 successful startups.',
    speakerOrganization: 'StartupXYZ',
    status: 'approved',
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-02-05'),
    reviewedAt: new Date('2024-02-05'),
    reviewedBy: 'Jennifer Wu',
    scheduledAt: new Date('2024-03-15T09:00:00'),
    room: 'Main Hall'
  },
  {
    id: 'session-5',
    title: 'Advanced CSS Grid and Flexbox Techniques',
    abstract: 'Master modern CSS layout with advanced Grid and Flexbox techniques. This hands-on session covers complex layouts, responsive design patterns, and performance considerations. Learn how to create beautiful, maintainable layouts without relying on CSS frameworks.',
    type: 'talk',
    track: 'design',
    duration: 45,
    targetAudience: 'intermediate',
    requirements: 'Solid CSS fundamentals',
    tags: ['CSS', 'Grid', 'Flexbox', 'Responsive Design'],
    speakerId: 'speaker-2',
    speakerName: 'Marcus Johnson',
    speakerEmail: 'marcus.johnson@example.com',
    speakerBio: 'UX/UI Designer specializing in mobile-first design and user research.',
    speakerOrganization: 'Design Studio Co.',
    status: 'hold',
    feedback: 'Great topic! Would like to see more focus on accessibility considerations in the abstract.',
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-06'),
    reviewedAt: new Date('2024-02-06'),
    reviewedBy: 'Jennifer Wu'
  },
  {
    id: 'session-6',
    title: 'Microservices Architecture: When and How to Break the Monolith',
    abstract: 'Explore when and how to transition from monolithic to microservices architecture. This session covers the trade-offs, challenges, and best practices for designing, implementing, and maintaining microservices. Learn from real-world examples of successful and failed microservices implementations.',
    type: 'talk',
    track: 'technology',
    duration: 45,
    targetAudience: 'advanced',
    requirements: 'Experience with backend development and system design',
    tags: ['Microservices', 'Architecture', 'Backend', 'System Design'],
    speakerId: 'speaker-1',
    speakerName: 'Sarah Chen',
    speakerEmail: 'sarah.chen@example.com',
    speakerBio: 'Full-stack developer with 8 years of experience in React, Node.js, and cloud architecture.',
    speakerOrganization: 'TechCorp Inc.',
    status: 'rejected',
    feedback: 'Topic is too advanced for our target audience this year. Consider submitting a more beginner-friendly version next time.',
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-07'),
    reviewedAt: new Date('2024-02-07'),
    reviewedBy: 'Jennifer Wu'
  }
];

// Helper functions to work with mock data
export const getMockUserByEmail = (email) => {
  const allUsers = [...mockSpeakers, ...mockEventManagers];
  return allUsers.find(user => user.email === email);
};

export const getMockSessionsBySpeaker = (speakerId) => {
  return mockSessions.filter(session => session.speakerId === speakerId);
};

export const getMockApprovedSessions = () => {
  return mockSessions.filter(session => session.status === 'approved');
};

export const getMockSessionsByStatus = (status) => {
  return mockSessions.filter(session => session.status === status);
};

// Test credentials for quick access
export const testCredentials = {
  speaker: {
    email: 'sarah.chen@example.com',
    password: 'password123'
  },
  eventManager: {
    email: 'jennifer.wu@vibeathon.com',
    password: 'password123'
  }
};

// Function to populate Firestore with mock data (for development)
export const populateMockData = async (db) => {
  try {
    const { collection, doc, setDoc } = await import('firebase/firestore');
    
    // Add mock users
    const allUsers = [...mockSpeakers, ...mockEventManagers];
    for (const user of allUsers) {
      await setDoc(doc(collection(db, 'users'), user.id), user);
    }
    
    // Add mock sessions
    for (const session of mockSessions) {
      await setDoc(doc(collection(db, 'sessions'), session.id), session);
    }
    
    console.log('Mock data populated successfully');
  } catch (error) {
    console.error('Error populating mock data:', error);
  }
};

export default {
  mockSpeakers,
  mockEventManagers,
  mockSessions,
  testCredentials,
  getMockUserByEmail,
  getMockSessionsBySpeaker,
  getMockApprovedSessions,
  getMockSessionsByStatus,
  populateMockData
};