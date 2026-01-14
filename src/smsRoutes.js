import { lazy } from 'react';

// Lazy load components for code splitting

// Admin Routes
export const adminRoutes = [
  {
    path: 'dashboard',
    component: lazy(() => import('./modules/admin/pages/Dashboard')),
  },
  {
    path: 'students',
    component: lazy(() => import('./modules/admin/pages/Students/StudentsList')),
  },
  {
    path: 'students/add',
    component: lazy(() => import('./modules/admin/pages/Students/AddStudent')),
  },
  {
    path: 'students/edit/:id',
    component: lazy(() => import('./modules/admin/pages/Students/EditStudent')),
  },
  {
    path: 'students/fees',
    component: lazy(() => import('./modules/admin/pages/Students/FeeRecordsPage')),
  },
  {
    path: 'students/fees/:id',
    component: lazy(() => import('./modules/admin/pages/Students/StudentFees')),
  },
  {
    path: 'students/transport',
    component: lazy(() => import('./modules/admin/pages/Students/TransportAssignmentPage')),
  },
  {
    path: 'students/transport/:id',
    component: lazy(() => import('./modules/admin/pages/Students/StudentTransport')),
  },
  {
    path: 'students/performance',
    component: lazy(() => import('./modules/admin/pages/Students/StudentPerformancePage')),
  },
  {
    path: 'teachers',
    component: lazy(() => import('./modules/admin/pages/Teachers/TeachersList')),
  },
  {
    path: 'teachers/add',
    component: lazy(() => import('./modules/admin/pages/Teachers/AddTeacher')),
  },
  {
    path: 'teachers/edit/:id',
    component: lazy(() => import('./modules/admin/pages/Teachers/EditTeacher')),
  },
  {
    path: 'attendance',
    component: lazy(() => import('./modules/admin/pages/Attendance/AttendanceMonitor')),
  },
  {
    path: 'attendance/reports',
    component: lazy(() => import('./modules/admin/pages/Attendance/AttendanceReports')),
  },
  {
    path: 'transport',
    component: lazy(() => import('./modules/admin/pages/Transport/BusManagement')),
  },
  {
    path: 'transport/buses',
    component: lazy(() => import('./modules/admin/pages/Transport/BusManagement')),
  },
  {
    path: 'transport/routes',
    component: lazy(() => import('./modules/admin/pages/Transport/RouteManagement')),
  },
  {
    path: 'finance',
    component: lazy(() => import('./modules/admin/pages/Finance/FeeDashboard')),
  },
  {
    path: 'finance/payments',
    component: lazy(() => import('./modules/admin/pages/Finance/Payments')),
  },
  {
    path: 'exams',
    component: lazy(() => import('./modules/admin/pages/Exams/ExamManagement')),
  },
  {
    path: 'exams/results',
    component: lazy(() => import('./modules/admin/pages/Exams/ResultEntry')),
  },
  {
    path: 'reports',
    component: lazy(() => import('./modules/admin/pages/Reports/AnalyticsDashboard')),
  },
];

// Teacher Routes
export const teacherRoutes = [
  {
    path: 'dashboard',
    component: lazy(() => import('./modules/teacher/pages/Dashboard')),
  },
  {
    path: 'classes',
    component: lazy(() => import('./modules/teacher/pages/MyClasses')),
  },
  {
    path: 'attendance',
    component: lazy(() => import('./modules/teacher/pages/Attendance/TakeAttendance')),
  },
  {
    path: 'attendance/history',
    component: lazy(() => import('./modules/teacher/pages/Attendance/AttendanceHistory')),
  },
  {
    path: 'assignments',
    component: lazy(() => import('./modules/teacher/pages/Assignments/AssignmentsList')),
  },
  {
    path: 'assignments/create',
    component: lazy(() => import('./modules/teacher/pages/Assignments/CreateAssignment')),
  },
  {
    path: 'grades',
    component: lazy(() => import('./modules/teacher/pages/Grades/GradeEntry')),
  },
  {
    path: 'schedule',
    component: lazy(() => import('./modules/teacher/pages/Schedule')),
  },
];

// Student Routes
export const studentRoutes = [
  {
    path: 'dashboard',
    component: lazy(() => import('./modules/student/pages/Dashboard')),
  },
  {
    path: 'attendance',
    component: lazy(() => import('./modules/student/pages/MyAttendance')),
  },
  {
    path: 'transport',
    component: lazy(() => import('./modules/student/pages/MyTransport')),
  },
  {
    path: 'assignments',
    component: lazy(() => import('./modules/student/pages/Assignments/AssignmentsList')),
  },
  {
    path: 'assignments/:id',
    component: lazy(() => import('./modules/student/pages/Assignments/AssignmentDetail')),
  },
  {
    path: 'results',
    component: lazy(() => import('./modules/student/pages/Results')),
  },
  {
    path: 'fees',
    component: lazy(() => import('./modules/student/pages/FeeStatus')),
  },
  {
    path: 'schedule',
    component: lazy(() => import('./modules/student/pages/Schedule')),
  },
];

// Authentication Routes
export const authRoutes = [
  {
    path: 'sign-in',
    component: lazy(() => import('./modules/authentication/Login')),
  },
  {
    path: 'sign-up',
    component: lazy(() => import('./modules/admin/pages/Auth/SignUp')),
  },
];

// Public Routes (accessible without authentication)
export const publicRoutes = [
  {
    path: '/',
    redirectTo: '/auth/sign-in',
  },
];

// Helper function to get all routes
export const getAllRoutes = () => {
  return {
    admin: adminRoutes,
    teacher: teacherRoutes,
    student: studentRoutes,
    auth: authRoutes,
    public: publicRoutes,
  };
};
