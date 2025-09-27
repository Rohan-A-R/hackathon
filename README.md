# Speaker Persona App

A comprehensive full-stack application for managing speakers and sessions at hackathons and conferences like Vibeathon. Built with React, Firebase, and Netlify Functions.

## 🚀 Features

### For Speakers
- **User Registration & Authentication** - Role-based access control
- **Session Management** - Submit, track, and manage session proposals
- **AI-Powered Enhancement** - Improve titles and abstracts with OpenAI
- **Availability Confirmation** - Confirm attendance and upload materials
- **QR Code Generation** - Download QR codes for check-in and t-shirt collection
- **Real-time Updates** - Get notified of session status changes
- **Profile Management** - Update bio, organization, and contact information

### For Event Managers
- **Session Review** - Approve, reject, or put sessions on hold
- **Speaker Management** - View and manage all registered speakers
- **Agenda Building** - Schedule sessions and build event agenda
- **Communication Tools** - Send automated email notifications
- **Analytics Dashboard** - Track submissions and speaker confirmations
- **Bulk Operations** - Manage multiple sessions efficiently

### Technical Features
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Real-time Database** - Firebase Firestore for live updates
- **Serverless Functions** - Netlify Functions for email and QR generation
- **File Storage** - Firebase Storage for presentations and documents
- **AI Integration** - OpenAI GPT for content enhancement
- **Email Notifications** - SendGrid integration for automated emails
- **Role-based Security** - Secure access control and data validation

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Serverless**: Netlify Functions
- **AI**: OpenAI GPT-3.5 Turbo
- **Email**: SendGrid
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Firebase account and project
- Netlify account
- SendGrid account (for email notifications)
- OpenAI API key (for AI features)
- Git installed

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/speaker-persona-app.git
cd speaker-persona-app
```

### 2. Install Dependencies

```bash
# Install main app dependencies
npm install

# Install function dependencies
cd netlify/functions
npm install
cd ../..
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication with Email/Password
4. Create a Firestore database in production mode
5. Enable Storage
6. Go to Project Settings > General > Your apps
7. Add a web app and copy the config

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Optional: Configure AI and Email features
OPENAI_API_KEY=your_openai_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# App Configuration
REACT_APP_APP_NAME=Speaker Persona App
REACT_APP_EVENT_NAME=Vibeathon 2024
```

### 5. Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Event managers can read all users
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'event_manager';
    }
    
    // Sessions rules
    match /sessions/{sessionId} {
      // Speakers can read/write their own sessions
      allow read, write: if request.auth != null && 
        resource.data.speakerId == request.auth.uid;
      // Event managers can read/write all sessions
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'event_manager';
      // Everyone can read approved sessions for agenda
      allow read: if resource.data.status == 'approved';
    }
  }
}
```

### 6. Run the Application

```bash
# Start development server
npm start
```

The app will be available at `http://localhost:3000`

## 🚀 Deployment to Netlify

### 1. Build the App

```bash
npm run build
```

### 2. Deploy to Netlify

#### Option A: Netlify CLI (Recommended)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy --prod --dir=build
```

#### Option B: GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository in Netlify Dashboard
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variables in Netlify Dashboard

### 3. Configure Environment Variables in Netlify

In Netlify Dashboard > Site Settings > Environment Variables, add:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

OPENAI_API_KEY=your_openai_key
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_from_email

REACT_APP_APP_NAME=Your App Name
REACT_APP_EVENT_NAME=Your Event Name
```

### 4. Functions Configuration

The Netlify Functions are automatically deployed with your site. Make sure:

1. Functions are in `netlify/functions/` directory
2. `netlify.toml` is properly configured
3. Function dependencies are listed in `netlify/functions/package.json`

## 🗂️ Project Structure

```
speaker-persona-app/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable components
│   │   ├── Footer.js
│   │   ├── LoadingSpinner.js
│   │   ├── Modal.js
│   │   ├── Navbar.js
│   │   └── SessionForm.js
│   ├── contexts/            # React contexts
│   │   └── AuthContext.js
│   ├── firebase/            # Firebase configuration
│   │   ├── auth.js
│   │   └── config.js
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   │   ├── Agenda.js
│   │   ├── EventManagerDashboard.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   ├── Register.js
│   │   └── SpeakerDashboard.js
│   ├── utils/               # Utility functions
│   │   └── index.js
│   ├── App.js               # Main app component
│   ├── index.css           # Tailwind CSS
│   └── index.js            # App entry point
├── netlify/
│   └── functions/          # Serverless functions
│       ├── ai-enhance.js
│       ├── generate-qr.js
│       ├── send-email.js
│       └── package.json
├── .env.example            # Environment variables template
├── netlify.toml           # Netlify configuration
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎯 Usage Guide

### For Speakers

1. **Register** - Create an account with role "Speaker"
2. **Complete Profile** - Add bio, organization, and contact info
3. **Submit Sessions** - Create session proposals with AI assistance
4. **Track Status** - Monitor submission status in dashboard
5. **Confirm Availability** - Confirm attendance when sessions are approved
6. **Download QR Codes** - Get QR codes for event day activities

### For Event Managers

1. **Register** - Create an account with role "Event Manager"
2. **Review Sessions** - Approve, reject, or hold session proposals
3. **Manage Speakers** - View speaker profiles and confirmations
4. **Build Agenda** - Schedule approved sessions
5. **Send Communications** - Automated email notifications
6. **Monitor Analytics** - Track submissions and confirmations

## 🔧 API Endpoints (Netlify Functions)

### Email Notifications
- **POST** `/.netlify/functions/send-email`
- Sends automated emails for session status updates

### QR Code Generation
- **POST** `/.netlify/functions/generate-qr`
- Generates QR codes for check-in and t-shirt collection

### AI Enhancement
- **POST** `/.netlify/functions/ai-enhance`
- Improves session titles and abstracts using OpenAI

## 🎨 Customization

### Branding
- Update `REACT_APP_APP_NAME` and `REACT_APP_EVENT_NAME` in environment variables
- Modify colors in `tailwind.config.js`
- Replace logo and favicon in `public/` directory

### Email Templates
- Customize email templates in `netlify/functions/send-email.js`
- Add your branding and event-specific content

### Session Types and Tracks
- Modify options in `src/utils/index.js`
- Update `SESSION_TYPES` and `TRACKS` constants

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test with Mock Data
The app includes built-in mock data for testing. Create test accounts:

1. **Speaker Account**: test-speaker@example.com / password123
2. **Event Manager Account**: test-manager@example.com / password123

## 🐛 Troubleshooting

### Common Issues

#### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project settings
- Ensure Firestore rules are properly configured

#### Function Deployment Issues
- Check function dependencies in `netlify/functions/package.json`
- Verify environment variables in Netlify dashboard
- Check function logs in Netlify dashboard

#### Email Not Sending
- Verify SendGrid API key and from email
- Check SendGrid domain verification
- Review function logs for errors

#### AI Features Not Working
- Verify OpenAI API key is valid
- Check API usage limits and billing
- Review function logs for errors

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SendGrid API](https://docs.sendgrid.com/)
- [OpenAI API](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for hackathons and conferences
- Inspired by the need for better speaker management tools
- Thanks to the open-source community for amazing tools and libraries

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@example.com
- Documentation: [GitHub Wiki](https://github.com/yourusername/speaker-persona-app/wiki)

---

**Happy Hacking! 🚀**

Built with ❤️ for the hackathon community.