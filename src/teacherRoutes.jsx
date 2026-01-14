import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdSchool,
  MdCheckCircle,
  MdAssignment,
  MdGrade,
  MdSchedule,
  MdPeople,
  MdOutlineAnalytics,
  MdBook,
  MdVideoLibrary,
  MdUploadFile,
  MdMessage,
  MdCampaign,
  MdBeachAccess,
  MdPayments,
  MdSettings,
  MdLock,
  MdNotifications,
  MdLogin,
} from 'react-icons/md';
import TeacherDashboard from './modules/teachers/TeacherDashboard';
import TeacherModulePlaceholder from './modules/teachers/TeacherModulePlaceholder';
import ClassList from './modules/teachers/classes/ClassList';
import SubjectWiseStudents from './modules/teachers/classes/SubjectWiseStudents';
import ClassTimetable from './modules/teachers/classes/ClassTimetable';
import DailyAttendance from './modules/teachers/attendance/DailyAttendance';
import AttendanceHistory from './modules/teachers/attendance/AttendanceHistory';
import MonthlyReport from './modules/teachers/attendance/MonthlyReport';
import StudentList from './modules/teachers/students/StudentList';
import StudentProfile from './modules/teachers/students/StudentProfile';
import StudentPerformance from './modules/teachers/students/StudentPerformance';
import ParentContacts from './modules/teachers/students/ParentContacts';
import CreateAssignment from './modules/teachers/assignments/CreateAssignment';
import Submissions from './modules/teachers/assignments/Submissions';
import Grading from './modules/teachers/assignments/Grading';
import LateReport from './modules/teachers/assignments/LateReport';
import ExamSchedule from './modules/teachers/exams/ExamSchedule';
import UploadMarks from './modules/teachers/exams/UploadMarks';
import ResultsAnalytics from './modules/teachers/exams/ResultsAnalytics';
import UploadNotes from './modules/teachers/materials/UploadNotes';
import Videos from './modules/teachers/materials/Videos';
import ManageMaterials from './modules/teachers/materials/ManageMaterials';
import DailyTimetable from './modules/teachers/schedule/DailyTimetable';
import WeeklyTimetable from './modules/teachers/schedule/WeeklyTimetable';
import Announcements from './modules/teachers/communication/Announcements';
import Messages from './modules/teachers/communication/Messages';
import ApplyLeave from './modules/teachers/leaves/ApplyLeave';
import LeaveStatus from './modules/teachers/leaves/LeaveStatus';
import LeaveHistory from './modules/teachers/leaves/LeaveHistory';
import MonthlyPayslip from './modules/teachers/salary/MonthlyPayslip';
import SalaryHistory from './modules/teachers/salary/History';
import Profile from './modules/teachers/settings/Profile';
import Password from './modules/teachers/settings/Password';
import Notifications from './modules/teachers/settings/Notifications';
import SMSLogin from './modules/authentication/Login';

const teacherRoutes = [
  {
    name: 'Dashboard',
    layout: '/teacher',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <TeacherDashboard />,
  },

  // 1) My Classes
  {
    name: 'My Classes',
    layout: '/teacher',
    icon: <Icon as={MdSchool} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Class List',
        layout: '/teacher',
        path: '/classes/list',
        icon: <Icon as={MdSchool} width="16px" height="16px" color="inherit" />,
        component: <ClassList />,
      },
      {
        name: 'Subject-wise Students',
        layout: '/teacher',
        path: '/classes/students',
        icon: <Icon as={MdPeople} width="16px" height="16px" color="inherit" />,
        component: <SubjectWiseStudents />,
      },
      {
        name: 'Class Timetable',
        layout: '/teacher',
        path: '/classes/timetable',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <ClassTimetable />,
      },
    ],
  },

  // 2) Attendance
  {
    name: 'Attendance',
    layout: '/teacher',
    icon: <Icon as={MdCheckCircle} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Daily Attendance',
        layout: '/teacher',
        path: '/attendance/daily',
        icon: <Icon as={MdCheckCircle} width="16px" height="16px" color="inherit" />,
        component: <DailyAttendance />,
      },
      {
        name: 'Attendance History',
        layout: '/teacher',
        path: '/attendance/history',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <AttendanceHistory />,
      },
      {
        name: 'Monthly Report',
        layout: '/teacher',
        path: '/attendance/monthly',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <MonthlyReport />,
      },
    ],
  },

  // 3) Students
  {
    name: 'Students',
    layout: '/teacher',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Student List',
        layout: '/teacher',
        path: '/students/list',
        icon: <Icon as={MdPeople} width="16px" height="16px" color="inherit" />,
        component: <StudentList />,
      },
      {
        name: 'Profile',
        layout: '/teacher',
        path: '/students/profile',
        icon: <Icon as={MdPeople} width="16px" height="16px" color="inherit" />,
        component: <StudentProfile />,
      },
      {
        name: 'Performance',
        layout: '/teacher',
        path: '/students/performance',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <StudentPerformance />,
      },
      {
        name: 'Parent Contacts',
        layout: '/teacher',
        path: '/students/parents',
        icon: <Icon as={MdMessage} width="16px" height="16px" color="inherit" />,
        component: <ParentContacts />,
      },
    ],
  },

  // 4) Assignments & Homework
  {
    name: 'Assignments & Homework',
    layout: '/teacher',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Create Assignment',
        layout: '/teacher',
        path: '/assignments/create',
        icon: <Icon as={MdAssignment} width="16px" height="16px" color="inherit" />,
        component: <CreateAssignment />,
      },
      {
        name: 'Submissions',
        layout: '/teacher',
        path: '/assignments/submissions',
        icon: <Icon as={MdAssignment} width="16px" height="16px" color="inherit" />,
        component: <Submissions />,
      },
      {
        name: 'Grading',
        layout: '/teacher',
        path: '/assignments/grading',
        icon: <Icon as={MdGrade} width="16px" height="16px" color="inherit" />,
        component: <Grading />,
      },
      {
        name: 'Late Report',
        layout: '/teacher',
        path: '/assignments/late-report',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <LateReport />,
      },
    ],
  },

  // 5) Exams & Results
  {
    name: 'Exams & Results',
    layout: '/teacher',
    icon: <Icon as={MdOutlineAnalytics} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Exam Schedule',
        layout: '/teacher',
        path: '/exams/schedule',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <ExamSchedule />,
      },
      {
        name: 'Upload Marks',
        layout: '/teacher',
        path: '/exams/upload-marks',
        icon: <Icon as={MdGrade} width="16px" height="16px" color="inherit" />,
        component: <UploadMarks />,
      },
      {
        name: 'Results Analytics',
        layout: '/teacher',
        path: '/exams/analytics',
        icon: <Icon as={MdOutlineAnalytics} width="16px" height="16px" color="inherit" />,
        component: <ResultsAnalytics />,
      },
    ],
  },

  // 6) Study Material
  {
    name: 'Study Material',
    layout: '/teacher',
    icon: <Icon as={MdBook} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Upload Notes',
        layout: '/teacher',
        path: '/materials/upload',
        icon: <Icon as={MdUploadFile} width="16px" height="16px" color="inherit" />,
        component: <UploadNotes />,
      },
      {
        name: 'Videos',
        layout: '/teacher',
        path: '/materials/videos',
        icon: <Icon as={MdVideoLibrary} width="16px" height="16px" color="inherit" />,
        component: <Videos />,
      },
      {
        name: 'Manage Materials',
        layout: '/teacher',
        path: '/materials/manage',
        icon: <Icon as={MdBook} width="16px" height="16px" color="inherit" />,
        component: <ManageMaterials />,
      },
    ],
  },

  // 7) Class Schedule
  {
    name: 'Class Schedule',
    layout: '/teacher',
    icon: <Icon as={MdSchedule} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Daily Timetable',
        layout: '/teacher',
        path: '/schedule/daily',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <DailyTimetable />,
      },
      {
        name: 'Weekly Timetable',
        layout: '/teacher',
        path: '/schedule/weekly',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
        component: <WeeklyTimetable />,
      },
    ],
  },

  // 8) Communication (temporarily hidden)
  /*
  {
    name: 'Communication',
    layout: '/teacher',
    icon: <Icon as={MdCampaign} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Announcements',
        layout: '/teacher',
        path: '/communication/announcements',
        icon: <Icon as={MdCampaign} width="16px" height="16px" color="inherit" />,
        component: <Announcements />,
      },
      {
        name: 'Messages',
        layout: '/teacher',
        path: '/communication/messages',
        icon: <Icon as={MdMessage} width="16px" height="16px" color="inherit" />,
        component: <Messages />,
      },
    ],
  },
  */

  // 9) Leaves
  {
    name: 'Leaves',
    layout: '/teacher',
    icon: <Icon as={MdBeachAccess} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Apply Leave',
        layout: '/teacher',
        path: '/leaves/apply',
        icon: <Icon as={MdBeachAccess} width="16px" height="16px" color="inherit" />,
        component: <ApplyLeave />,
      },
      {
        name: 'Leave Status',
        layout: '/teacher',
        path: '/leaves/status',
        icon: <Icon as={MdBeachAccess} width="16px" height="16px" color="inherit" />,
        component: <LeaveStatus />,
      },
      {
        name: 'Leave History',
        layout: '/teacher',
        path: '/leaves/history',
        icon: <Icon as={MdBeachAccess} width="16px" height="16px" color="inherit" />,
        component: <LeaveHistory />,
      },
    ],
  },

  // 10) Salary
  {
    name: 'Salary',
    layout: '/teacher',
    icon: <Icon as={MdPayments} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Monthly Payslip',
        layout: '/teacher',
        path: '/salary/payslip',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <MonthlyPayslip />,
      },
      {
        name: 'History',
        layout: '/teacher',
        path: '/salary/history',
        icon: <Icon as={MdPayments} width="16px" height="16px" color="inherit" />,
        component: <SalaryHistory />,
      },
    ],
  },

  // 11) Settings
  {
    name: 'Settings',
    layout: '/teacher',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
    collapse: true,
    items: [
      {
        name: 'Profile',
        layout: '/teacher',
        path: '/settings/profile',
        icon: <Icon as={MdSettings} width="16px" height="16px" color="inherit" />,
        component: <Profile />,
      },
      {
        name: 'Password',
        layout: '/teacher',
        path: '/settings/password',
        icon: <Icon as={MdLock} width="16px" height="16px" color="inherit" />,
        component: <Password />,
      },
      /* Notifications (temporarily hidden)
      {
        name: 'Notifications',
        layout: '/teacher',
        path: '/settings/notifications',
        icon: <Icon as={MdNotifications} width="16px" height="16px" color="inherit" />,
        component: <Notifications />,
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

export const getTeacherRoutes = () => teacherRoutes;
export default getTeacherRoutes;
