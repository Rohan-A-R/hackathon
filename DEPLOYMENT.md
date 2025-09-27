# Deployment Guide

This document provides a comprehensive guide for deploying the Speaker Persona App to production.

## 🚀 Pre-Deployment Checklist

### Frontend Configuration
- [ ] Environment variables configured in `.env`
- [ ] Firebase project created and configured
- [ ] Firestore security rules updated
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firebase Storage enabled
- [ ] App name and event name configured
- [ ] Tailwind CSS properly configured
- [ ] All dependencies installed and updated

### Backend Services
- [ ] SendGrid account created and API key obtained
- [ ] OpenAI API key obtained (optional)
- [ ] Netlify account created
- [ ] Function dependencies installed in `netlify/functions/`
- [ ] `netlify.toml` configuration file present

### Security
- [ ] Firestore security rules restrict access properly
- [ ] Environment variables do not contain sensitive data in source code
- [ ] CORS properly configured for API endpoints
- [ ] Authentication flows tested

## 📋 Environment Variables

### Required Variables
```env
# Firebase Configuration (Required)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# App Configuration (Required)
REACT_APP_APP_NAME=Speaker Persona App
REACT_APP_EVENT_NAME=Vibeathon 2024
```

### Optional Variables
```env
# Email Service (Optional but recommended)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# AI Features (Optional)
OPENAI_API_KEY=your_openai_api_key
```

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing
3. Enable Google Analytics (optional)
4. Wait for project creation

### 2. Enable Authentication
1. Go to Authentication > Get started
2. Click "Sign-in method" tab
3. Enable "Email/Password"
4. Optionally configure authorized domains for production

### 3. Create Firestore Database
1. Go to Firestore Database > Create database
2. Choose "Start in production mode"
3. Select your preferred location
4. Update security rules (see below)

### 4. Enable Storage
1. Go to Storage > Get started
2. Review security rules (default is fine for most cases)
3. Choose your storage location

### 5. Get Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > Web
4. Register your app
5. Copy the configuration object

## 🛡️ Firestore Security Rules

Replace the default rules with the following secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Helper function to check if user is event manager
    function isEventManager() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'event_manager';
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read/write their own data
      allow read, write: if isOwner(userId);
      // Event managers can read all users
      allow read: if isEventManager();
    }
    
    // Sessions collection
    match /sessions/{sessionId} {
      // Speakers can read/write their own sessions
      allow read, write: if isAuthenticated() && 
        resource.data.speakerId == request.auth.uid;
      // Event managers can read/write all sessions
      allow read, write: if isEventManager();
      // Everyone can read approved sessions (for public agenda)
      allow read: if resource.data.status == 'approved';
    }
    
    // Additional collections can be added here
    match /feedback/{feedbackId} {
      allow read, write: if isEventManager();
      allow create: if isAuthenticated();
    }
  }
}
```

## 🌐 Netlify Deployment

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   # First deployment
   netlify deploy --dir=build
   
   # Production deployment
   netlify deploy --prod --dir=build
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `build`

3. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete

### 3. Configure Environment Variables in Netlify

In Netlify Dashboard:
1. Go to Site Settings > Environment variables
2. Add all required environment variables
3. Click "Save"
4. Trigger a new deploy

## 📧 SendGrid Setup (Optional)

### 1. Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for free account
3. Verify your email address

### 2. Create API Key
1. Go to Settings > API Keys
2. Click "Create API Key"
3. Choose "Restricted Access"
4. Grant "Mail Send" permissions
5. Copy the API key

### 3. Domain Authentication (Recommended)
1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow DNS setup instructions
4. Wait for verification

### 4. Configure From Email
- Use a verified email address or domain
- Set `SENDGRID_FROM_EMAIL` environment variable

## 🤖 OpenAI Setup (Optional)

### 1. Create OpenAI Account
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Add billing information

### 2. Create API Key
1. Go to API Keys section
2. Click "Create new secret key"
3. Copy the key immediately (it won't be shown again)
4. Set usage limits to prevent unexpected charges

### 3. Configure Environment Variable
```env
OPENAI_API_KEY=sk-your-secret-key-here
```

## 🔍 Testing Deployment

### 1. Automated Tests
```bash
# Run tests before deployment
npm test

# Run build to check for errors
npm run build
```

### 2. Manual Testing Checklist
- [ ] Home page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Speaker dashboard accessible
- [ ] Event manager dashboard accessible
- [ ] Session submission works
- [ ] Session review works (event manager)
- [ ] Email notifications work (if configured)
- [ ] QR code generation works
- [ ] AI enhancement works (if configured)
- [ ] Agenda page displays approved sessions
- [ ] Mobile responsive design works
- [ ] All navigation links work
- [ ] Logout functionality works

### 3. Performance Testing
- [ ] Lighthouse audit score > 90
- [ ] Page load time < 3 seconds
- [ ] Mobile performance acceptable
- [ ] Database queries optimized

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Function Deployment Issues
- Ensure `netlify/functions/package.json` exists
- Check function dependencies are installed
- Verify environment variables in Netlify dashboard
- Check function logs in Netlify dashboard

#### Firebase Connection Issues
- Verify all environment variables are correct
- Check Firebase project settings
- Ensure domain is added to authorized domains
- Check browser console for detailed errors

#### Email Not Sending
- Verify SendGrid API key is valid
- Check from email is verified
- Review function logs for errors
- Test with SendGrid API directly

## 📊 Monitoring and Analytics

### Performance Monitoring
- Set up Netlify Analytics (optional paid feature)
- Use Google Analytics or similar
- Monitor Core Web Vitals

### Error Tracking
- Integrate Sentry or similar service for error tracking
- Monitor Firebase logs
- Check Netlify function logs regularly

### User Analytics
- Track user registrations
- Monitor session submissions
- Analyze popular session topics
- Track email engagement rates

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Build
      run: npm run build
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './build'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🏃‍♀️ Production Optimizations

### Performance
- Enable gzip compression in Netlify
- Configure caching headers
- Optimize images and assets
- Use React.lazy for code splitting

### Security
- Add security headers in `netlify.toml`
- Implement rate limiting for functions
- Regular security audits
- Keep dependencies updated

### SEO
- Add meta tags and Open Graph tags
- Create sitemap.xml
- Configure robots.txt
- Add structured data markup

## 📋 Post-Deployment Tasks

### 1. Test Everything
- Complete manual testing checklist
- Test with real user accounts
- Verify all integrations work

### 2. Set Up Monitoring
- Configure uptime monitoring
- Set up error alerts
- Monitor performance metrics

### 3. Documentation
- Update README with production URLs
- Document any custom configurations
- Create user guides if needed

### 4. Backup and Recovery
- Set up Firebase backups
- Document recovery procedures
- Test backup restoration

## 🎯 Go-Live Checklist

Final checklist before announcing the app:

- [ ] All features tested and working
- [ ] Performance meets requirements
- [ ] Security measures in place
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Documentation complete
- [ ] Backup procedures tested
- [ ] Team trained on maintenance
- [ ] User support process defined
- [ ] Marketing materials ready

## 📞 Support and Maintenance

### Regular Maintenance
- Monitor application performance
- Update dependencies monthly
- Review security alerts
- Monitor user feedback
- Backup data regularly

### Support Channels
- GitHub Issues for bugs
- Email for general support
- Documentation wiki for guides

---

**Deployment Complete! 🎉**

Your Speaker Persona App is now ready to help manage speakers and sessions for hackathons and conferences worldwide!