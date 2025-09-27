import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createUser, USER_ROLES } from '../firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch 
  } = useForm();

  const password = watch('password');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await createUser(data.email, data.password, {
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
        organization: data.organization,
        bio: data.bio,
        // New required fields
        track: data.track,
        sessionCategory: data.sessionCategory,
        tshirtSize: data.tshirtSize,
        foodChoice: data.foodChoice,
        // Optional co-speaker fields
        speaker2Name: data.speaker2Name || null,
        speaker2Email: data.speaker2Email || null,
        speaker2TshirtSize: data.speaker2TshirtSize || null,
        // Emergency contact fields
        bloodGroup: data.bloodGroup || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactNumber: data.emergencyContactNumber || null,
        // Professional links
        linkedinProfile: data.linkedinProfile || null,
        sapCommunityUrl: data.sapCommunityUrl || null
      });
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email'
                    }
                  })}
                  type="email"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Account Type *
              </label>
              <select
                {...register('role', {
                  required: 'Please select an account type'
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select your role</option>
                <option value={USER_ROLES.SPEAKER}>Speaker</option>
                <option value={USER_ROLES.EVENT_MANAGER}>Event Manager</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Mobile Number *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid mobile number'
                    }
                  })}
                  type="tel"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                Organization
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('organization')}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your organization/company"
                />
              </div>
            </div>

            {/* Track */}
            <div>
              <label htmlFor="track" className="block text-sm font-medium text-gray-700">
                Track *
              </label>
              <select
                {...register('track', { required: 'Track is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select Track</option>
                <option value="technology">Technology</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="product">Product</option>
                <option value="ai-ml">AI/ML</option>
              </select>
              {errors.track && (
                <p className="mt-1 text-sm text-red-600">{errors.track.message}</p>
              )}
            </div>

            {/* Session Category */}
            <div>
              <label htmlFor="sessionCategory" className="block text-sm font-medium text-gray-700">
                Session Category *
              </label>
              <select
                {...register('sessionCategory', { required: 'Session category is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select Category</option>
                <option value="master-class">Master Class</option>
                <option value="demo-pod">Demo Pod</option>
                <option value="talk">Talk</option>
                <option value="workshop">Workshop</option>
                <option value="panel">Panel Discussion</option>
                <option value="lightning">Lightning Talk</option>
              </select>
              {errors.sessionCategory && (
                <p className="mt-1 text-sm text-red-600">{errors.sessionCategory.message}</p>
              )}
            </div>

            {/* T-shirt Size */}
            <div>
              <label htmlFor="tshirtSize" className="block text-sm font-medium text-gray-700">
                T-shirt Size *
              </label>
              <select
                {...register('tshirtSize', { required: 'T-shirt size is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select Size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
              {errors.tshirtSize && (
                <p className="mt-1 text-sm text-red-600">{errors.tshirtSize.message}</p>
              )}
            </div>

            {/* Co-Speaker Details */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Co-Speaker Details (Optional)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="speaker2Name" className="block text-sm font-medium text-gray-700">
                    Speaker 2 Name
                  </label>
                  <input
                    {...register('speaker2Name')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Co-speaker full name"
                  />
                </div>
                <div>
                  <label htmlFor="speaker2Email" className="block text-sm font-medium text-gray-700">
                    Speaker 2 Email
                  </label>
                  <input
                    {...register('speaker2Email', {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email'
                      }
                    })}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="co-speaker@example.com"
                  />
                  {errors.speaker2Email && (
                    <p className="mt-1 text-sm text-red-600">{errors.speaker2Email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="speaker2TshirtSize" className="block text-sm font-medium text-gray-700">
                  Speaker 2 T-shirt Size
                </label>
                <select
                  {...register('speaker2TshirtSize')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="XXXL">XXXL</option>
                </select>
              </div>
            </div>

            {/* Food Choice */}
            <div>
              <label htmlFor="foodChoice" className="block text-sm font-medium text-gray-700">
                Food Choice *
              </label>
              <div className="mt-2 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    {...register('foodChoice', { required: 'Food choice is required' })}
                    type="radio"
                    value="veg"
                    className="form-radio h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                </label>
                <label className="inline-flex items-center ml-6">
                  <input
                    {...register('foodChoice')}
                    type="radio"
                    value="non-veg"
                    className="form-radio h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Non-Vegetarian</span>
                </label>
              </div>
              {errors.foodChoice && (
                <p className="mt-1 text-sm text-red-600">{errors.foodChoice.message}</p>
              )}
            </div>

            {/* Emergency Contact Information */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                    Blood Group
                  </label>
                  <select
                    {...register('bloodGroup')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700">
                    Emergency Contact Name
                  </label>
                  <input
                    {...register('emergencyContactName')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Emergency contact full name"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="emergencyContactNumber" className="block text-sm font-medium text-gray-700">
                  Emergency Contact Number
                </label>
                <input
                  {...register('emergencyContactNumber', {
                    pattern: {
                      value: /^[+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Emergency contact phone number"
                />
                {errors.emergencyContactNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.emergencyContactNumber.message}</p>
                )}
              </div>
            </div>

            {/* Professional Links */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Links</h4>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="linkedinProfile" className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile URL
                  </label>
                  <input
                    {...register('linkedinProfile', {
                      pattern: {
                        value: /^https:\/\/www\.linkedin\.com\/.+/,
                        message: 'Please enter a valid LinkedIn URL'
                      }
                    })}
                    type="url"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="https://www.linkedin.com/in/yourprofile"
                  />
                  {errors.linkedinProfile && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkedinProfile.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="sapCommunityUrl" className="block text-sm font-medium text-gray-700">
                    SAP Community URL
                  </label>
                  <input
                    {...register('sapCommunityUrl')}
                    type="url"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="https://community.sap.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <div className="mt-1">
                <textarea
                  {...register('bio', {
                    maxLength: {
                      value: 500,
                      message: 'Bio must be less than 500 characters'
                    }
                  })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Tell us about yourself..."
                />
              </div>
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                This will be displayed on your speaker profile and in session descriptions.
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => 
                      value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" text="" /> : 'Create Account'}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;