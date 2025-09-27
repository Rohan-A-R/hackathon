import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Zap, 
  CheckCircle,
  Sparkles,
  QrCode,
  Mail
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, userData } = useAuth();

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Session Management',
      description: 'Submit, track, and manage your conference sessions with ease.'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Speaker Tools',
      description: 'Everything speakers need from submission to presentation day.'
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: 'QR Code Generation',
      description: 'Generate QR codes for check-in, t-shirt collection, and more.'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'AI Enhancement',
      description: 'Improve your session titles and abstracts with AI assistance.'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Smart Notifications',
      description: 'Automated email notifications for all stakeholders.'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Real-time Updates',
      description: 'Stay updated with real-time session status changes.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Sessions Managed' },
    { number: '1000+', label: 'Speakers Connected' },
    { number: '50+', label: 'Events Powered' },
    { number: '99.9%', label: 'Uptime Guaranteed' }
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back, {userData?.fullName}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Ready to manage your sessions for {process.env.REACT_APP_EVENT_NAME || 'the event'}?
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Speaker Persona App
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The complete platform for managing speakers and sessions at 
              {process.env.REACT_APP_EVENT_NAME ? ` ${process.env.REACT_APP_EVENT_NAME}` : ' hackathons and conferences'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for event success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for hackathons and conferences, with features that scale from small meetups to large events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by event organizers worldwide
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Simple workflow for speakers and event managers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* For Speakers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                For Speakers
              </h3>
              <div className="space-y-6">
                {[
                  'Register and create your speaker profile',
                  'Submit session proposals with AI assistance',
                  'Track review status in real-time',
                  'Confirm availability and upload materials',
                  'Download QR codes and certificates'
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 mr-4">
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Event Managers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                For Event Managers
              </h3>
              <div className="space-y-6">
                {[
                  'Review and approve session submissions',
                  'Build and publish event agendas',
                  'Send automated notifications to speakers',
                  'Track speaker availability and confirmations',
                  'Generate reports and analytics'
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 bg-primary-100 rounded-full p-2 mr-4">
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of speakers and event organizers who trust our platform for their events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;