// Format date utilities
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(
    date.toDate ? date.toDate() : new Date(date)
  );
};

export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Session status utilities
export const SESSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  HOLD: 'hold'
};

export const SESSION_TYPES = {
  KEYNOTE: 'keynote',
  TALK: 'talk',
  WORKSHOP: 'workshop',
  PANEL: 'panel',
  LIGHTNING: 'lightning_talk'
};

export const TRACKS = {
  TECH: 'technology',
  DESIGN: 'design',
  BUSINESS: 'business',
  MARKETING: 'marketing',
  PRODUCT: 'product'
};

export const getStatusColor = (status) => {
  const colors = {
    [SESSION_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
    [SESSION_STATUS.SUBMITTED]: 'bg-blue-100 text-blue-800',
    [SESSION_STATUS.UNDER_REVIEW]: 'bg-yellow-100 text-yellow-800',
    [SESSION_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [SESSION_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [SESSION_STATUS.HOLD]: 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status) => {
  const texts = {
    [SESSION_STATUS.DRAFT]: 'Draft',
    [SESSION_STATUS.SUBMITTED]: 'Submitted',
    [SESSION_STATUS.UNDER_REVIEW]: 'Under Review',
    [SESSION_STATUS.APPROVED]: 'Approved',
    [SESSION_STATUS.REJECTED]: 'Rejected',
    [SESSION_STATUS.HOLD]: 'On Hold'
  };
  return texts[status] || status;
};

// File utilities
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

export const isValidImageFile = (file) => {
  const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = getFileExtension(file.name);
  return validTypes.includes(extension);
};

export const isValidDocumentFile = (file) => {
  const validTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
  const extension = getFileExtension(file.name);
  return validTypes.includes(extension);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  const re = /^[+]?[1-9][\d]{0,15}$/;
  return re.test(phone.replace(/[\s\-()]/g, ''));
};

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }
};

// Generate QR code data
export const generateQRData = (type, data) => {
  const baseUrl = window.location.origin;
  
  switch (type) {
    case 'checkin':
      return JSON.stringify({
        type: 'event_checkin',
        eventId: data.eventId,
        speakerId: data.speakerId,
        sessionId: data.sessionId,
        timestamp: Date.now()
      });
    case 'tshirt':
      return JSON.stringify({
        type: 'tshirt_collection',
        speakerId: data.speakerId,
        size: data.size,
        timestamp: Date.now()
      });
    case 'session':
      return `${baseUrl}/session/${data.sessionId}`;
    default:
      return JSON.stringify(data);
  }
};