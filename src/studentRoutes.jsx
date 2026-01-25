import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdSchool,
  MdCheckCircle,
  MdAssignment,
  MdOutlineAnalytics,
  MdSchedule,
  MdBook,
  MdPictureAsPdf,
  MdVideoLibrary,
  MdPayments,
  MdCampaign,
  MdMessage,
  MdEvent,
  MdEmojiEvents,
  MdLibraryBooks,
  MdPerson,
  MdSettings,
  MdLock,
  MdNotifications,
  MdLogin,
  MdQrCodeScanner,
} from 'react-icons/md';

import StudentDashboard from './modules/students/StudentDashboard';
import StudentModulePlaceholder from './modules/students/StudentModulePlaceholder';
import QRCodeAttendance from './modules/students/QRCodeAttendance';
import DailyRecord from './modules/students/attendance/DailyRecord';
import MonthlyReport from './modules/students/attendance/MonthlyReport';
import AttendanceChart from './modules/students/attendance/AttendanceChart';
import Results from './modules/students/exams/Results';
import SMSLogin from './modules/authentication/Login';

const studentRoutes = [
  {
    name: 'Dashboard',
    layout: '/student',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <StudentDashboard />,
  },

  // 1) My Classes
  {
    name: 'My Classes',
    layout: '/student',
    icon: <Icon as={MdSchool} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Class List',
        layout: '/student',
        path: '/classes/list',
        icon: <Icon as={MdSchool} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Class List' subtitle='Coming soon' />,
      },
      {
        name: 'Subject Teachers',
        layout: '/student',
        path: '/classes/teachers',
        icon: <Icon as={MdPerson} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Subject Teachers' subtitle='Coming soon' />,
      },
      {
        name: 'Weekly Timetable',
        layout: '/student',
        path: '/classes/timetable',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Weekly Timetable' subtitle='Coming soon' />,
      },
    ],
  },

  // 2) Attendance
  {
    name: 'Attendance',
    layout: '/student',
    icon: <Icon as={MdCheckCircle} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Daily Record',
        layout: '/student',
        path: '/attendance/daily',
        icon: <Icon as={MdCheckCircle} width="16px" height="16px" color="inherit" />,
        component: <DailyRecord />,
      },
      {
        name: 'Monthly Report',
        layout: '/student',
        path: '/attendance/monthly',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <MonthlyReport />,
      },
      {
        name: 'Attendance Chart',
        layout: '/student',
        path: '/attendance/chart',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <AttendanceChart />,
      },
      {
        name: 'QR Attendance',
        layout: '/student',
        path: '/attendance/qr',
        icon: <Icon as={MdQrCodeScanner} width="16px" height="16px" color="inherit" />,
        component: <QRCodeAttendance />,
      },
    ],
  },

  // 3) Assignments & Homework
  {
    name: 'Assignments & Homework',
    layout: '/student',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'View Assignments',
        layout: '/student',
        path: '/assignments/list',
        icon: <Icon as={MdAssignment} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='View Assignments' subtitle='Coming soon' />,
      },
      {
        name: 'Submit Work',
        layout: '/student',
        path: '/assignments/submit',
        icon: <Icon as={MdAssignment} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Submit Work' subtitle='Coming soon' />,
      },
      {
        name: 'Teacher Feedback',
        layout: '/student',
        path: '/assignments/feedback',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Teacher Feedback' subtitle='Coming soon' />,
      },
      {
        name: 'Due Dates',
        layout: '/student',
        path: '/assignments/due-dates',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Due Dates' subtitle='Coming soon' />,
      },
    ],
  },

  // 4) Exams & Results
  {
    name: 'Exams & Results',
    layout: '/student',
    icon: <Icon as={MdOutlineAnalytics} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Exam Timetable',
        layout: '/student',
        path: '/exams/timetable',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Exam Timetable' subtitle='Coming soon' />,
      },
      {
        name: 'Results',
        layout: '/student',
        path: '/exams/results',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <Results />,
      },
      {
        name: 'Grade Card',
        layout: '/student',
        path: '/exams/grade-card',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Grade Card' subtitle='Coming soon' />,
      },
      {
        name: 'Performance Analytics',
        layout: '/student',
        path: '/exams/analytics',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Performance Analytics' subtitle='Coming soon' />,
      },
    ],
  },

  // 5) Study Material
  {
    name: 'Study Material',
    layout: '/student',
    icon: <Icon as={MdBook} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Notes',
        layout: '/student',
        path: '/materials/notes',
        icon: <Icon as={MdBook} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Notes' subtitle='Coming soon' />,
      },
      {
        name: 'PDFs',
        layout: '/student',
        path: '/materials/pdfs',
        icon: <Icon as={MdPictureAsPdf} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='PDFs' subtitle='Coming soon' />,
      },
      {
        name: 'Videos',
        layout: '/student',
        path: '/materials/videos',
        icon: <Icon as={MdVideoLibrary} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Videos' subtitle='Coming soon' />,
      },
      {
        name: 'Resources',
        layout: '/student',
        path: '/materials/resources',
        icon: <Icon as={MdBook} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Resources' subtitle='Coming soon' />,
      },
    ],
  },

  // 6) Fee Management
  {
    name: 'Fee Management',
    layout: '/student',
    icon: <Icon as={MdPayments} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Fee Status',
        layout: '/student',
        path: '/fees/status',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Fee Status' subtitle='Coming soon' />,
      },
      {
        name: 'Due Fee',
        layout: '/student',
        path: '/fees/due',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Due Fee' subtitle='Coming soon' />,
      },
      {
        name: 'Online Payment',
        layout: '/student',
        path: '/fees/pay',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Online Payment' subtitle='Coming soon' />,
      },
      {
        name: 'Fee Receipts',
        layout: '/student',
        path: '/fees/receipts',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Fee Receipts' subtitle='Coming soon' />,
      },
    ],
  },

  // 7) Announcements
  {
    name: 'Announcements',
    layout: '/student',
    icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
    path: '/announcements',
    component: <StudentModulePlaceholder title='Announcements' subtitle='Coming soon' />,
  },

  // 8) Communication (temporarily hidden)
  /*
  {
    name: 'Communication',
    layout: '/student',
    icon: <Icon as={MdMessage} width="20px" height="20px" color="inherit" />,
    path: '/communication',
    component: <Communication />,
  },
  */

  // 9) Events & Activities
  {
    name: 'Events & Activities',
    layout: '/student',
    icon: <Icon as={MdEvent} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Events Calendar',
        layout: '/student',
        path: '/events/calendar',
        icon: <Icon as={MdEvent} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Events Calendar' subtitle='Coming soon' />,
      },
      {
        name: 'Competitions',
        layout: '/student',
        path: '/events/competitions',
        icon: <Icon as={MdEmojiEvents} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Competitions' subtitle='Coming soon' />,
      },
      {
        name: 'Workshops',
        layout: '/student',
        path: '/events/workshops',
        icon: <Icon as={MdEvent} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Workshops' subtitle='Coming soon' />,
      },
    ],
  },

  // 10) Library
  {
    name: 'Library',
    layout: '/student',
    icon: <Icon as={MdLibraryBooks} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Issued Books',
        layout: '/student',
        path: '/library/issued',
        icon: <Icon as={MdLibraryBooks} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Issued Books' subtitle='Coming soon' />,
      },
      {
        name: 'Due Dates',
        layout: '/student',
        path: '/library/due-dates',
        icon: <Icon as={MdLibraryBooks} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Due Dates' subtitle='Coming soon' />,
      },
      {
        name: 'Fines',
        layout: '/student',
        path: '/library/fines',
        icon: <Icon as={MdLibraryBooks} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Fines' subtitle='Coming soon' />,
      },
    ],
  },

  // 11) Profile & Settings
  {
    name: 'Profile & Settings',
    layout: '/student',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Profile Info',
        layout: '/student',
        path: '/settings/profile',
        icon: <Icon as={MdPerson} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Profile Info' subtitle='Coming soon' />,
      },
      {
        name: 'Password',
        layout: '/student',
        path: '/settings/password',
        icon: <Icon as={MdLock} width="16px" height="16px" color="inherit" />,
        component: <StudentModulePlaceholder title='Password' subtitle='Coming soon' />,
      },
      /* Notifications (temporarily hidden)
      {
        name: 'Notifications',
        layout: '/student',
        path: '/settings/notifications',
        icon: <Icon as={MdNotifications} width="16px" height="16px" color="inherit" />,
        component: <NotificationsPage />,
      },
      */
    ],
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLogin} width="20px" height="20px" color="inherit" />,
    component: <SMSLogin />,
  },
];

export const getStudentRoutes = () => studentRoutes;
export default getStudentRoutes;
