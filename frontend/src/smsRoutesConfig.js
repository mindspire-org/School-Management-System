import React, { lazy } from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdPerson,
  MdPeople,
  MdSchool,
  MdCheckCircle,
  MdDirectionsBus,
  MdAttachMoney,
  MdMessage,
  MdBarChart,
  MdSettings,
  MdNotifications,
  MdBook,
  MdAssignment,
  MdSchedule,
  MdGrade,
  MdAssessment,
  MdList,
  MdAdd,
  MdCreditCard,
  MdMap,
  MdSpeed,
  MdWarning,
  MdEmail,
  MdEvent,
  MdAlarm,
  MdSecurity,
  MdHistory,
} from 'react-icons/md';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBookOpen,
  FaClipboardCheck,
  FaBus,
  FaDollarSign,
  FaBullhorn,
  FaChartLine,
  FaCog,
  FaBell,
} from 'react-icons/fa';

// SMS Component Imports
import AdminDashboard from './modules/admin/pages/Dashboard';
import StudentsList from './modules/admin/pages/Students/StudentsList';
import EditStudent from './modules/admin/pages/Students/EditStudent';
import StudentProfile from './modules/admin/pages/Students/StudentProfile';
import AttendanceMonitor from './modules/admin/pages/Attendance/AttendanceMonitor';
import AdminDailyAttendance from './modules/admin/pages/Attendance/AdminDailyAttendance';

// Student Module Components
import StudentListTest from './modules/students/StudentListTest';
import StudentList from './modules/students/StudentList';
import AddStudent from './modules/students/AddStudent';
import StudentAttendance from './modules/students/StudentAttendance';
// Other student components will be imported as they are developed

// Placeholder component for pages under development
const ComingSoon = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '24px',
    color: '#666'
  }}>
    Page Under Development
  </div>
);

export const getSMSRoutes = () => {
  const adminMenu = [
    // Dashboard
    {
      name: 'Dashboard',
      layout: '/admin',
      path: '/dashboard',
      icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
      component: <AdminDashboard />,
    },
    
    // Students Section
    {
      name: 'Students',
      layout: '/admin',
      icon: <Icon as={FaUserGraduate} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Student List',
          layout: '/admin',
          path: '/students/list',
          component: <StudentsList />,
        },
        {
          name: 'Add Student',
          layout: '/admin',
          path: '/students/add',
          component: <AddStudent />,
        },
        {
          name: 'Edit Student',
          layout: '/admin',
          path: '/students/edit/:id',
          component: <EditStudent />,
          hidden: true,
        },
        {
          name: 'Student Profile',
          layout: '/admin',
          path: '/students/profile/:id',
          component: <StudentProfile />,
          hidden: true,
        },
        {
          name: 'Attendance',
          layout: '/admin',
          path: '/students/attendance',
          component: <StudentAttendance />,
        },
        {
          name: 'Student Attendance',
          layout: '/admin',
          path: '/students/attendance/:id',
          component: <ComingSoon />,
          hidden: true,
        },
        {
          name: 'Performance',
          layout: '/admin',
          path: '/students/performance',
          component: lazy(() => import('./modules/admin/pages/Students/StudentPerformancePage')),
        },
        {
          name: 'Student Performance',
          layout: '/admin',
          path: '/students/performance/:id',
          component: <ComingSoon />,
          hidden: true,
        },
        {
          name: 'Fee Records',
          layout: '/admin',
          path: '/students/fees',
          component: lazy(() => import('./modules/admin/pages/Students/FeeRecordsPage')),
        },
        {
          name: 'Student Fees',
          layout: '/admin',
          path: '/students/fees/:id',
          component: lazy(() => import('./modules/admin/pages/Students/StudentFees')),
          hidden: true,
        },
        {
          name: 'Transport Assignment',
          layout: '/admin',
          path: '/students/transport',
          component: lazy(() => import('./modules/admin/pages/Students/TransportAssignmentPage')),
        },
        {
          name: 'Student Transport',
          layout: '/admin',
          path: '/students/transport/:id',
          component: lazy(() => import('./modules/admin/pages/Students/StudentTransport')),
          hidden: true,
        },
      ],
    },
    
    // Teachers Section
    {
      name: 'Teachers',
      layout: '/admin',
      icon: <Icon as={FaChalkboardTeacher} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Teacher List',
          layout: '/admin',
          path: '/teachers/list',
          component: lazy(() => import('./modules/admin/pages/teachers/TeacherList')),
        },
        {
          name: 'Add Teacher',
          layout: '/admin',
          path: '/teachers/add',
          component: lazy(() => import('./modules/admin/pages/teachers/AddTeacher')),
        },
        {
          name: 'Attendance',
          layout: '/admin',
          path: '/teachers/attendance',
          component: lazy(() => import('./modules/admin/pages/teachers/TeacherAttendance')),
        },
        {
          name: 'Salary',
          layout: '/admin',
          path: '/teachers/salary',
          component: lazy(() => import('./modules/admin/pages/teachers/TeacherSalary')),
        },
        {
          name: 'Performance',
          layout: '/admin',
          path: '/teachers/performance',
          component: lazy(() => import('./modules/admin/pages/teachers/TeacherPerformance')),
        },
        {
          name: 'Schedule',
          layout: '/admin',
          path: '/teachers/schedule',
          component: lazy(() => import('./modules/admin/pages/teachers/TeacherSchedule')),
        },
        {
          name: 'Subjects Assigned',
          layout: '/admin',
          path: '/teachers/subjects',
          component: lazy(() => import('./modules/admin/pages/teachers/TeacherSubjects')),
        },
      ],
    },
    
    // Academics Section
    {
      name: 'Academics',
      layout: '/admin',
      icon: <Icon as={FaBookOpen} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Classes',
          layout: '/admin',          
          path: '/academics/classes',
          component: lazy(() => import('./modules/admin/pages/academics/Classes')),
        },
        {
          name: 'Subjects',
          layout: '/admin',
          path: '/academics/subjects',
          component: lazy(() => import('./modules/admin/pages/academics/Subjects')),
        },
        {
          name: 'Timetable',
          layout: '/admin',
          path: '/academics/timetable',
          component: lazy(() => import('./modules/admin/pages/academics/Timetable')),
        },
        {
          name: 'Syllabus',
          layout: '/admin',
          path: '/academics/syllabus',
          component: lazy(() => import('./modules/admin/pages/academics/Syllabus')),
        },
        {
          name: 'Exams',
          layout: '/admin',
          path: '/academics/exams',
          component: lazy(() => import('./modules/admin/pages/academics/Exams')),
        },
        {
          name: 'Results',
          layout: '/admin',
          path: '/academics/results',
          component: lazy(() => import('./modules/admin/pages/academics/Results')),
        },
        {
          name: 'Grade Calculation',
          layout: '/admin',
          path: '/academics/grading',
          component: lazy(() => import('./modules/admin/pages/academics/GradeCalculation')),
        },
      ],
    },
    
    // Attendance Section
    {
      name: 'Attendance',
      layout: '/admin',
      icon: <Icon as={FaClipboardCheck} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Daily Attendance',
          layout: '/admin',
          path: '/attendance/daily',
          component: <AdminDailyAttendance />,
        },
        {
          name: 'RFID Logs',
          layout: '/admin',
          path: '/attendance/rfid-logs',
          component: lazy(() => import('./modules/admin/pages/Attendance/RFIDLogs')),
        },
        {
          name: 'Manual Override',
          layout: '/admin',
          path: '/attendance/manual',
          component: lazy(() => import('./modules/admin/pages/Attendance/ManualOverride')),
        },
        {
          name: 'Reports',
          layout: '/admin',
          path: '/attendance/reports',
          component: lazy(() => import('./modules/admin/pages/Attendance/AttendanceReports')),
        },
        {
          name: 'Heatmaps',
          layout: '/admin',
          path: '/attendance/heatmaps',
          component: lazy(() => import('./modules/admin/pages/Attendance/AttendanceHeatmaps')),
        },
        {
          name: 'Alerts',
          layout: '/admin',
          path: '/attendance/alerts',
          component: lazy(() => import('./modules/admin/pages/Attendance/AttendanceAlerts')),
        },
      ],
    },
    
    // Transport Section
    {
      name: 'Transport',
      layout: '/admin',
      icon: <Icon as={FaBus} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Live Tracking',
          layout: '/admin',
          path: '/transport/live-tracking',
          component: lazy(() => import('./modules/admin/pages/Transport/LiveTracking')),
        },
        {
          name: 'Bus Management',
          layout: '/admin',
          path: '/transport/buses',
          component: lazy(() => import('./modules/admin/pages/Transport/BusManagement')),
        },
        {
          name: 'Driver Management',
          layout: '/admin',
          path: '/transport/drivers',
          component: lazy(() => import('./modules/admin/pages/Transport/DriverManagement')),
        },
        {
          name: 'Routes & Stops',
          layout: '/admin',
          path: '/transport/routes',
          component: lazy(() => import('./modules/admin/pages/Transport/RoutesStops')),
        },
        {
          name: 'RFID Attendance',
          layout: '/admin',
          path: '/transport/rfid',
          component: lazy(() => import('./modules/admin/pages/Transport/RFIDAttendance')),
        },
        {
          name: 'Telematics',
          layout: '/admin',
          path: '/transport/telematics',
          component: lazy(() => import('./modules/admin/pages/Transport/Telematics')),
        },
        {
          name: 'Alerts',
          layout: '/admin',
          path: '/transport/alerts',
          component: lazy(() => import('./modules/admin/pages/Transport/TransportAlerts')),
        },
      ],
    },
    
    // Finance Section
    {
      name: 'Finance',
      layout: '/admin',
      icon: <Icon as={FaDollarSign} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Fee Dashboard',
          layout: '/admin',
          path: '/finance/dashboard',
          component: lazy(() => import('./modules/admin/pages/Finance/FeeDashboard')),
        },
        {
          name: 'Invoices',
          layout: '/admin',
          path: '/finance/invoices',
          component: lazy(() => import('./modules/admin/pages/Finance/Invoices')),
        },
        {
          name: 'Payments',
          layout: '/admin',
          path: '/finance/payments',
          component: lazy(() => import('./modules/admin/pages/Finance/Payments')),
        },
        {
          name: 'Receipts',
          layout: '/admin',
          path: '/finance/receipts',
          component: lazy(() => import('./modules/admin/pages/Finance/Receipts')),
        },
        {
          name: 'Reports',
          layout: '/admin',
          path: '/finance/reports',
          component: lazy(() => import('./modules/admin/pages/Finance/Reports')),
        },
        {
          name: 'Outstanding Fees',
          layout: '/admin',
          path: '/finance/outstanding',
          component: lazy(() => import('./modules/admin/pages/Finance/OutstandingFees')),
        },
        {
          name: 'Expenses',
          layout: '/admin',
          path: '/finance/expenses',
          component: lazy(() => import('./modules/admin/pages/Finance/Expenses')),
        },
        {
          name: 'Payroll',
          layout: '/admin',
          path: '/finance/payroll',
          component: lazy(() => import('./modules/admin/pages/Finance/Payroll')),
        },
      ],
    },
    
    // Communication Section
    {
      name: 'Communication',
      layout: '/admin',
      icon: <Icon as={FaBullhorn} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Send SMS',
          layout: '/admin',
          path: '/communication/sms',
          component: lazy(() => import('./modules/admin/pages/Communication/SendSMS')),
        },
        {
          name: 'Send Email',
          layout: '/admin',
          path: '/communication/email',
          component: lazy(() => import('./modules/admin/pages/Communication/SendEmail')),
        },
        {
          name: 'Announcements',
          layout: '/admin',
          path: '/communication/announcements',
          component: lazy(() => import('./modules/admin/pages/Communication/Announcements')),
        },
        {
          name: 'Event Calendar',
          layout: '/admin',
          path: '/communication/calendar',
          component: lazy(() => import('./modules/admin/pages/Communication/EventCalendar')),
        },
        {
          name: 'Reminders',
          layout: '/admin',
          path: '/communication/reminders',
          component: lazy(() => import('./modules/admin/pages/Communication/Reminders')),
        },
      ],
    },
    
    // Reports & Analytics Section
    {
      name: 'Reports & Analytics',
      layout: '/admin',
      icon: <Icon as={FaChartLine} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Student Performance',
          layout: '/admin',
          path: '/reports/student-performance',
          component: lazy(() => import('./modules/admin/pages/Reports/StudentPerformanceReport')),
        },
        {
          name: 'Attendance Reports',
          layout: '/admin',
          path: '/reports/attendance',
          component: lazy(() => import('./modules/admin/pages/Reports/AttendanceAnalytics')),
        },
        {
          name: 'Bus Usage',
          layout: '/admin',
          path: '/reports/bus-usage',
          component: lazy(() => import('./modules/admin/pages/Reports/BusUsage')),
        },
        {
          name: 'Fee Collection',
          layout: '/admin',
          path: '/reports/fee-collection',
          component: lazy(() => import('./modules/admin/pages/Reports/FeeCollection')),
        },
        {
          name: 'Teacher Performance',
          layout: '/admin',
          path: '/reports/teacher-performance',
          component: lazy(() => import('./modules/admin/pages/Reports/TeacherPerformanceReport')),
        },
        {
          name: 'Custom Reports',
          layout: '/admin',
          path: '/reports/custom',
          component: lazy(() => import('./modules/admin/pages/Reports/CustomReports')),
        },
      ],
    },
    
    // Settings Section
    {
      name: 'Settings',
      layout: '/admin',
      icon: <Icon as={FaCog} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'System Settings',
          layout: '/admin',
          path: '/settings/system',
          component: lazy(() => import('./modules/admin/pages/Settings/SystemSettings')),
        },
        {
          name: 'Role Management',
          layout: '/admin',
          path: '/settings/roles',
          component: lazy(() => import('./modules/admin/pages/Settings/RoleManagement')),
        },
        {
          name: 'Permissions',
          layout: '/admin',
          path: '/settings/permissions',
          component: lazy(() => import('./modules/admin/pages/Settings/Permissions')),
        },
        {
          name: 'User Management',
          layout: '/admin',
          path: '/settings/users',
          component: lazy(() => import('./modules/admin/pages/Settings/UserManagement')),
        },
        {
          name: 'School Profile',
          layout: '/admin',
          path: '/settings/school-profile',
          component: lazy(() => import('./modules/admin/pages/Settings/SchoolProfile')),
        },
        {
          name: 'Activity Logs',
          layout: '/admin',
          path: '/settings/activity-logs',
          component: lazy(() => import('./modules/admin/pages/Settings/ActivityLogs')),
        },
      ],
    },
    
    // Notifications
    {
      name: 'Notifications',
      layout: '/admin',
      path: '/notifications',
      icon: <Icon as={FaBell} width="20px" height="20px" color="inherit" />,
      component: lazy(() => import('./modules/admin/pages/Notifications/Notifications')),
    },
  ];

  return adminMenu;
};

export default getSMSRoutes;
