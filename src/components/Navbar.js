import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from '../firebase/auth';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userData, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
    setShowUserMenu(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, mobile = false }) => (
    <Link
      to={to}
      className={`${
        mobile
          ? 'block px-3 py-2 rounded-md text-base font-medium'
          : 'px-3 py-2 rounded-md text-sm font-medium'
      } ${
        isActive(to)
          ? 'bg-primary-700 text-white'
          : 'text-gray-300 hover:bg-primary-700 hover:text-white'
      } transition-colors`}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-primary-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">
                {process.env.REACT_APP_APP_NAME || 'Speaker Persona'}
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {isAuthenticated ? (
                <>
                  {userData?.role === 'speaker' ? (
                    <>
                      <NavLink to="/dashboard">Dashboard</NavLink>
                      <NavLink to="/sessions">My Sessions</NavLink>
                      <NavLink to="/agenda">Agenda</NavLink>
                    </>
                  ) : userData?.role === 'event_manager' ? (
                    <>
                      <NavLink to="/dashboard">Dashboard</NavLink>
                      <NavLink to="/manage-sessions">Sessions</NavLink>
                      <NavLink to="/manage-agenda">Agenda</NavLink>
                      <NavLink to="/communications">Communications</NavLink>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <NavLink to="/login">Login</NavLink>
                  <NavLink to="/register">Register</NavLink>
                </>
              )}
            </div>
          </div>

          {/* User Menu (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="max-w-xs bg-primary-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                      {userData?.profileImage ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={userData.profileImage}
                          alt={userData.fullName}
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className="ml-2 text-white text-sm">
                      {userData?.fullName || user?.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Profile Settings
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-primary-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-800"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                {userData?.role === 'speaker' ? (
                  <>
                    <NavLink to="/dashboard" mobile>Dashboard</NavLink>
                    <NavLink to="/sessions" mobile>My Sessions</NavLink>
                    <NavLink to="/agenda" mobile>Agenda</NavLink>
                  </>
                ) : userData?.role === 'event_manager' ? (
                  <>
                    <NavLink to="/dashboard" mobile>Dashboard</NavLink>
                    <NavLink to="/manage-sessions" mobile>Sessions</NavLink>
                    <NavLink to="/manage-agenda" mobile>Agenda</NavLink>
                    <NavLink to="/communications" mobile>Communications</NavLink>
                  </>
                ) : null}
                
                {/* Mobile User Menu */}
                <div className="pt-4 pb-3 border-t border-primary-700">
                  <div className="flex items-center px-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                        {userData?.profileImage ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={userData.profileImage}
                            alt={userData.fullName}
                          />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {userData?.fullName || 'User'}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsOpen(false);
                      }}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-primary-700"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-primary-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" mobile>Login</NavLink>
                <NavLink to="/register" mobile>Register</NavLink>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;