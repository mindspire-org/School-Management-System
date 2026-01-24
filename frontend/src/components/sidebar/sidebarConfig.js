import React from 'react';
import { Icon } from '@chakra-ui/react';

// Import icons for sidebar
import {
  MdHome,
  MdPeople,
  MdSchool,
  MdCheckCircle,
  MdDirectionsBus,
  MdAttachMoney,
  MdMessage,
  MdBarChart,
  MdAssignment,
  MdSchedule,
  MdGrade,
  MdBook,
  MdPerson,
  MdCalendarToday,
  MdSettings,
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
} from 'react-icons/fa';

// Sidebar Pages Configuration
export const sidebarPages = [
  {
    name: 'Dashboard',
    layout: '/admin',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
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
        icon: <Icon as={MdPeople} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Add Student',
        layout: '/admin',
        path: '/students/add',
        icon: <Icon as={MdPerson} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Attendance',
        layout: '/admin',
        path: '/students/attendance',
        icon: <Icon as={MdCheckCircle} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Performance',
        layout: '/admin',
        path: '/students/performance',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Transport',
        layout: '/admin',
        path: '/students/transport',
        icon: <Icon as={FaBus} width="16px" height="16px" color="inherit" />,
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
        icon: <Icon as={MdPeople} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Add Teacher',
        layout: '/admin',
        path: '/teachers/add',
        icon: <Icon as={MdPerson} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Attendance',
        layout: '/admin',
        path: '/teachers/attendance',
        icon: <Icon as={MdCheckCircle} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Salary',
        layout: '/admin',
        path: '/teachers/salary',
        icon: <Icon as={FaDollarSign} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Performance',
        layout: '/admin',
        path: '/teachers/performance',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Schedule',
        layout: '/admin',
        path: '/teachers/schedule',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Subjects Assigned',
        layout: '/admin',
        path: '/teachers/subjects',
        icon: <Icon as={FaBookOpen} width="16px" height="16px" color="inherit" />,
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
        icon: <Icon as={MdSchool} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Subjects',
        layout: '/admin',
        path: '/academics/subjects',
        icon: <Icon as={MdBook} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Timetable',
        layout: '/admin',
        path: '/academics/timetable',
        icon: <Icon as={MdSchedule} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Exams',
        layout: '/admin',
        path: '/academics/exams',
        icon: <Icon as={MdAssignment} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Grades',
        layout: '/admin',
        path: '/academics/grades',
        icon: <Icon as={MdGrade} width="16px" height="16px" color="inherit" />,
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
        name: 'Mark Attendance',
        layout: '/admin',
        path: '/attendance/mark',
        icon: <Icon as={MdCheckCircle} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Attendance Reports',
        layout: '/admin',
        path: '/attendance/reports',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Calendar View',
        layout: '/admin',
        path: '/attendance/calendar',
        icon: <Icon as={MdCalendarToday} width="16px" height="16px" color="inherit" />,
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
        name: 'Routes',
        layout: '/admin',
        path: '/transport/routes',
        icon: <Icon as={MdDirectionsBus} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Vehicles',
        layout: '/admin',
        path: '/transport/vehicles',
        icon: <Icon as={FaBus} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Drivers',
        layout: '/admin',
        path: '/transport/drivers',
        icon: <Icon as={MdPerson} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Assignments',
        layout: '/admin',
        path: '/transport/assignments',
        icon: <Icon as={MdAssignment} width="16px" height="16px" color="inherit" />,
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
        name: 'Fee Collection',
        layout: '/admin',
        path: '/finance/fees',
        icon: <Icon as={MdAttachMoney} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Payroll',
        layout: '/admin',
        path: '/finance/payroll',
        icon: <Icon as={FaDollarSign} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Expenses',
        layout: '/admin',
        path: '/finance/expenses',
        icon: <Icon as={MdAttachMoney} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Reports',
        layout: '/admin',
        path: '/finance/reports',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
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
        name: 'Announcements',
        layout: '/admin',
        path: '/communication/announcements',
        icon: <Icon as={MdMessage} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Messages',
        layout: '/admin',
        path: '/communication/messages',
        icon: <Icon as={MdMessage} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Notifications',
        layout: '/admin',
        path: '/communication/notifications',
        icon: <Icon as={MdMessage} width="16px" height="16px" color="inherit" />,
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
        name: 'Academic Reports',
        layout: '/admin',
        path: '/reports/academic',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Attendance Reports',
        layout: '/admin',
        path: '/reports/attendance',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Financial Reports',
        layout: '/admin',
        path: '/reports/financial',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
      },
      {
        name: 'Custom Reports',
        layout: '/admin',
        path: '/reports/custom',
        icon: <Icon as={MdBarChart} width="16px" height="16px" color="inherit" />,
      },
    ],
  },
];

export default sidebarPages;
