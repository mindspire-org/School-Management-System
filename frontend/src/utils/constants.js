// User Role Constants
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

// Attendance Status Constants
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HOLIDAY: 'holiday',
  EXCUSED: 'excused',
};

// Bus Status Constants
export const BUS_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  EN_ROUTE: 'en_route',
  PARKED: 'parked',
  DELAYED: 'delayed',
};

// Assignment Status Constants
export const ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  OVERDUE: 'overdue',
  DRAFT: 'draft',
};

// Fee Status Constants
export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  WAIVED: 'waived',
};

// Student Status Constants
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
};

// Teacher Status Constants
export const TEACHER_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  INACTIVE: 'inactive',
  RETIRED: 'retired',
};

// Grade Constants
export const GRADES = {
  'A+': { min: 95, max: 100, points: 4.0 },
  'A': { min: 90, max: 94, points: 4.0 },
  'A-': { min: 85, max: 89, points: 3.7 },
  'B+': { min: 80, max: 84, points: 3.3 },
  'B': { min: 75, max: 79, points: 3.0 },
  'B-': { min: 70, max: 74, points: 2.7 },
  'C+': { min: 65, max: 69, points: 2.3 },
  'C': { min: 60, max: 64, points: 2.0 },
  'C-': { min: 55, max: 59, points: 1.7 },
  'D': { min: 50, max: 54, points: 1.0 },
  'F': { min: 0, max: 49, points: 0.0 },
};

// RFID Event Types
export const RFID_EVENTS = {
  BUS_BOARDING: 'bus_boarding',
  BUS_ALIGHTING: 'bus_alighting',
  SCHOOL_ENTRY: 'school_entry',
  SCHOOL_EXIT: 'school_exit',
  CLASSROOM_ENTRY: 'classroom_entry',
  LIBRARY_ENTRY: 'library_entry',
  CAFETERIA_ENTRY: 'cafeteria_entry',
};

// Alert Types
export const ALERT_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// Exam Types
export const EXAM_TYPES = {
  UNIT_TEST: 'unit_test',
  MID_TERM: 'mid_term',
  FINAL: 'final',
  QUIZ: 'quiz',
  PRACTICAL: 'practical',
  MOCK: 'mock',
};

// Class Sections
export const CLASS_SECTIONS = ['A', 'B', 'C', 'D', 'E'];

// Class Grades (Academic Levels)
export const CLASS_GRADES = [
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
];

// Subject List
export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physical Education',
  'Art',
  'Music',
  'Economics',
  'Business Studies',
  'Psychology',
  'Sociology',
];

// Time Slots for Classes
export const TIME_SLOTS = [
  '08:00 AM - 08:45 AM',
  '08:45 AM - 09:30 AM',
  '09:30 AM - 09:45 AM', // Break
  '09:45 AM - 10:30 AM',
  '10:30 AM - 11:15 AM',
  '11:15 AM - 12:00 PM',
  '12:00 PM - 01:00 PM', // Lunch
  '01:00 PM - 01:45 PM',
  '01:45 PM - 02:30 PM',
  '02:30 PM - 03:15 PM',
  '03:15 PM - 04:00 PM',
];

// Days of the Week
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  BASE_URL: import.meta.env?.VITE_API_URL || 'http://localhost:5000/api',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  STUDENTS: {
    LIST: '/students',
    CREATE: '/students',
    GET: '/students/:id',
    UPDATE: '/students/:id',
    DELETE: '/students/:id',
    ATTENDANCE: '/students/:id/attendance',
  },
  TEACHERS: {
    LIST: '/teachers',
    CREATE: '/teachers',
    GET: '/teachers/:id',
    UPDATE: '/teachers/:id',
    DELETE: '/teachers/:id',
    SCHEDULE: '/teachers/:id/schedule',
  },
  TRANSPORT: {
    BUSES: '/transport/buses',
    TRACKING: '/transport/tracking',
    ROUTES: '/transport/routes',
    TELEMATICS: '/transport/telematics/:busId',
  },
  ATTENDANCE: {
    LOG: '/attendance/log',
    REPORT: '/attendance/report',
    RFID: '/attendance/rfid',
  },
  FINANCE: {
    FEES: '/finance/fees',
    PAYMENTS: '/finance/payments',
    REPORTS: '/finance/reports',
  },
  EXAMS: {
    LIST: '/exams',
    CREATE: '/exams',
    RESULTS: '/exams/:id/results',
  },
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  INPUT: 'YYYY-MM-DD',
  TIME: 'HH:mm A',
  DATETIME: 'DD MMM YYYY HH:mm A',
  API: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sms_auth_token',
  USER_DATA: 'sms_user_data',
  THEME: 'sms_theme',
  LANGUAGE: 'sms_language',
  SIDEBAR_STATE: 'sms_sidebar_state',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
  RFID_REGEX: /^RFID-[0-9]{3,10}$/,
  STUDENT_ID_REGEX: /^STU[0-9]{3,10}$/,
  TEACHER_ID_REGEX: /^TCH[0-9]{3,10}$/,
  BUS_NUMBER_REGEX: /^BUS-[0-9]{3,5}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
};
