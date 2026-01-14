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
} from 'react-icons/md';

import StudentDashboard from './modules/students/StudentDashboard';
import StudentModulePlaceholder from './modules/students/StudentModulePlaceholder';
import ClassList from './modules/students/classes/ClassList';
import SubjectTeachers from './modules/students/classes/SubjectTeachers';
import WeeklyTimetable from './modules/students/classes/WeeklyTimetable';
import DailyRecord from './modules/students/attendance/DailyRecord';
import MonthlyReport from './modules/students/attendance/MonthlyReport';
import AttendanceChart from './modules/students/attendance/AttendanceChart';
import ViewAssignments from './modules/students/assignments/ViewAssignments';
import SubmitWork from './modules/students/assignments/SubmitWork';
import TeacherFeedback from './modules/students/assignments/TeacherFeedback';
import DueDates from './modules/students/assignments/DueDates';
import ExamTimetable from './modules/students/exams/ExamTimetable';
import Results from './modules/students/exams/Results';
import GradeCard from './modules/students/exams/GradeCard';
import PerformanceAnalytics from './modules/students/exams/PerformanceAnalytics';
import Notes from './modules/students/materials/Notes';
import PDFs from './modules/students/materials/PDFs';
import Videos from './modules/students/materials/Videos';
import Resources from './modules/students/materials/Resources';
import FeeStatus from './modules/students/fees/FeeStatus';
import DueFee from './modules/students/fees/DueFee';
import OnlinePayment from './modules/students/fees/OnlinePayment';
import FeeReceipts from './modules/students/fees/FeeReceipts';
import Announcements from './modules/students/announcements/Announcements';
import Communication from './modules/students/communication/Communication';
import EventsCalendar from './modules/students/events/EventsCalendar';
import Competitions from './modules/students/events/Competitions';
import Workshops from './modules/students/events/Workshops';
import IssuedBooks from './modules/students/library/IssuedBooks';
import LibraryDueDates from './modules/students/library/DueDates';
import LibraryFines from './modules/students/library/Fines';
import ProfileInfo from './modules/students/settings/ProfileInfo';
import PasswordPage from './modules/students/settings/Password';
import NotificationsPage from './modules/students/settings/Notifications';
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
        component: <ClassList />,
      },
      {
        name: 'Subject Teachers',
        layout: '/student',
        path: '/classes/teachers',
        icon: <Icon as={MdPerson} width="16px" height="16px" color="inherit" />,
        component: <SubjectTeachers />,
      },
      {
        name: 'Weekly Timetable',
        layout: '/student',
        path: '/classes/timetable',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <WeeklyTimetable />,
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
        component: <ViewAssignments />,
      },
      {
        name: 'Submit Work',
        layout: '/student',
        path: '/assignments/submit',
        icon: <Icon as={MdAssignment} width="16px" height="16px" color="inherit" />,
        component: <SubmitWork />,
      },
      {
        name: 'Teacher Feedback',
        layout: '/student',
        path: '/assignments/feedback',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <TeacherFeedback />,
      },
      {
        name: 'Due Dates',
        layout: '/student',
        path: '/assignments/due-dates',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <DueDates />,
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
        component: <ExamTimetable />,
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
        component: <GradeCard />,
      },
      {
        name: 'Performance Analytics',
        layout: '/student',
        path: '/exams/analytics',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <PerformanceAnalytics />,
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
        component: <Notes />,
      },
      {
        name: 'PDFs',
        layout: '/student',
        path: '/materials/pdfs',
        icon: <Icon as={MdPictureAsPdf} width="16px" height="16px" color="inherit" />,
        component: <PDFs />,
      },
      {
        name: 'Videos',
        layout: '/student',
        path: '/materials/videos',
        icon: <Icon as={MdVideoLibrary} width="16px" height="16px" color="inherit" />,
        component: <Videos />,
      },
      {
        name: 'Resources',
        layout: '/student',
        path: '/materials/resources',
        icon: <Icon as={MdBook} width="16px" height="16px" color="inherit" />,
        component: <Resources />,
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
        component: <FeeStatus />,
      },
      {
        name: 'Due Fee',
        layout: '/student',
        path: '/fees/due',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <DueFee />,
      },
      {
        name: 'Online Payment',
        layout: '/student',
        path: '/fees/pay',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <OnlinePayment />,
      },
      {
        name: 'Fee Receipts',
        layout: '/student',
        path: '/fees/receipts',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <FeeReceipts />,
      },
    ],
  },

  // 7) Announcements
  {
    name: 'Announcements',
    layout: '/student',
    icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
    path: '/announcements',
    component: <Announcements />,
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
        component: <EventsCalendar />,
      },
      {
        name: 'Competitions',
        layout: '/student',
        path: '/events/competitions',
        icon: <Icon as={MdEmojiEvents} width="16px" height="16px" color="inherit" />,
        component: <Competitions />,
      },
      {
        name: 'Workshops',
        layout: '/student',
        path: '/events/workshops',
        icon: <Icon as={MdEvent} width="16px" height="16px" color="inherit" />,
        component: <Workshops />,
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
        component: <IssuedBooks />,
      },
      {
        name: 'Due Dates',
        layout: '/student',
        path: '/library/due-dates',
        icon: <Icon as={MdLibraryBooks} width="16px" height="16px" color="inherit" />,
        component: <LibraryDueDates />,
      },
      {
        name: 'Fines',
        layout: '/student',
        path: '/library/fines',
        icon: <Icon as={MdLibraryBooks} width="16px" height="16px" color="inherit" />,
        component: <LibraryFines />,
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
        component: <ProfileInfo />,
      },
      {
        name: 'Password',
        layout: '/student',
        path: '/settings/password',
        icon: <Icon as={MdLock} width="16px" height="16px" color="inherit" />,
        component: <PasswordPage />,
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
