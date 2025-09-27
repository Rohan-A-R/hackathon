import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Description */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {process.env.REACT_APP_APP_NAME || 'Speaker Persona App'}
            </h3>
            <p className="text-gray-300 mb-4">
              Managing speakers and sessions for {process.env.REACT_APP_EVENT_NAME || 'events'} 
              with ease. Built for hackathons and conferences.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/yourusername" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com/company/yourusername" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/yourusername/speaker-persona-app" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              <a 
                href="mailto:support@example.com" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  About the Event
                </a>
              </li>
              <li>
                <a href="/speakers" className="hover:text-white transition-colors">
                  Speakers
                </a>
              </li>
              <li>
                <a href="/agenda" className="hover:text-white transition-colors">
                  Event Agenda
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/help" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Speaker Persona App. Built for hackathons with ❤️
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Powered by React, Firebase & Netlify
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;