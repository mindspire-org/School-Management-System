import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdPerson,
  MdPeople,
  MdCheckCircle,
  MdDirectionsBus,
  MdAttachMoney,
  MdBarChart,
  MdSchool,
  MdAssignment,
  MdGrade,
  MdSchedule,
  MdLibraryBooks,
  MdAssessment,
  MdPayment,
} from 'react-icons/md';

// Function to get sidebar routes based on user role
export const getSidebarRoutes = (role) => {
  switch (role) {
    case 'admin':
      return getAdminRoutes();
    case 'teacher':
      return getTeacherRoutes();
    case 'student':
      return getStudentRoutes();
    default:
      return [];
  }
};

// Admin Portal Routes
const getAdminRoutes = () => [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Students',
    layout: '/admin',
    path: '/students',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Teachers',
    layout: '/admin',
    path: '/teachers',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Attendance',
    layout: '/admin',
    path: '/attendance',
    icon: <Icon as={MdCheckCircle} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Transport',
    layout: '/admin',
    path: '/transport',
    icon: <Icon as={MdDirectionsBus} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Finance',
    layout: '/admin',
    path: '/finance',
    icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Exams',
    layout: '/admin',
    path: '/exams',
    icon: <Icon as={MdAssessment} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Reports',
    layout: '/admin',
    path: '/reports',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
  },
];

// Teacher Portal Routes
const getTeacherRoutes = () => [
  {
    name: 'Dashboard',
    layout: '/teacher',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'My Classes',
    layout: '/teacher',
    path: '/classes',
    icon: <Icon as={MdSchool} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Attendance',
    layout: '/teacher',
    path: '/attendance',
    icon: <Icon as={MdCheckCircle} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Assignments',
    layout: '/teacher',
    path: '/assignments',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Grades',
    layout: '/teacher',
    path: '/grades',
    icon: <Icon as={MdGrade} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Schedule',
    layout: '/teacher',
    path: '/schedule',
    icon: <Icon as={MdSchedule} width="20px" height="20px" color="inherit" />,
  },
];

// Student Portal Routes
const getStudentRoutes = () => [
  {
    name: 'Dashboard',
    layout: '/student',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'My Attendance',
    layout: '/student',
    path: '/attendance',
    icon: <Icon as={MdCheckCircle} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'My Transport',
    layout: '/student',
    path: '/transport',
    icon: <Icon as={MdDirectionsBus} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Assignments',
    layout: '/student',
    path: '/assignments',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Results',
    layout: '/student',
    path: '/results',
    icon: <Icon as={MdLibraryBooks} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Fee Status',
    layout: '/student',
    path: '/fees',
    icon: <Icon as={MdPayment} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Schedule',
    layout: '/student',
    path: '/schedule',
    icon: <Icon as={MdSchedule} width="20px" height="20px" color="inherit" />,
  },
];

// Function to merge existing routes with SMS routes (for gradual transition)
export const mergeRoutes = (existingRoutes, userRole) => {
  const smsRoutes = getSidebarRoutes(userRole);
  
  // Filter out existing Horizon routes that conflict with SMS routes
  const filteredExisting = existingRoutes.filter(route => {
    // Keep auth routes
    if (route.layout === '/auth') return true;
    // Remove default admin routes to avoid confusion
    if (route.layout === '/admin' && userRole === 'admin') return false;
    return true;
  });
  
  // Return SMS routes for the current role
  return smsRoutes;
};

// Helper function to get dashboard path for each role
export const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'student':
      return '/student/dashboard';
    case 'driver':
      return '/driver/dashboard';
    default:
      return '/auth/sign-in';
  }
};

// Helper function to check if a path requires authentication
export const requiresAuth = (path) => {
  const publicPaths = ['/auth/sign-in', '/auth/sign-up', '/auth/forgot-password'];
  return !publicPaths.includes(path);
};

// Helper function to get allowed roles for a path
export const getAllowedRoles = (path) => {
  if (path.startsWith('/admin/')) return ['admin'];
  if (path.startsWith('/teacher/')) return ['teacher'];
  if (path.startsWith('/student/')) return ['student'];
  if (path.startsWith('/driver/')) return ['driver'];
  return ['admin', 'teacher', 'student']; // Allow all roles for other paths
};
