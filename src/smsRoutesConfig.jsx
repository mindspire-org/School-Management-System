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
  MdInventory,
  MdStore,
  MdPhone,
  MdQrCodeScanner,
  MdCardMembership,
  MdWork,
  MdMonetizationOn,
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
import ParentAlerts from './modules/parent/pages/Alerts';
import StudentsList from './modules/admin/pages/Students/StudentsList';
import EditStudent from './modules/admin/pages/Students/EditStudent';
import StudentProfile from './modules/admin/pages/Students/StudentProfile';
import AttendanceMonitor from './modules/admin/pages/Attendance/AttendanceMonitor';
import AdminDailyAttendance from './modules/admin/pages/Attendance/AdminDailyAttendance';
import AdminQRAttendance from './modules/admin/pages/Attendance/QRCodeAttendance';

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
    {
      name: 'Campuses',
      layout: '/admin',
      path: '/campuses-list',
      icon: <Icon as={MdSchool} width="20px" height="20px" color="inherit" />,
      component: lazy(() => import('./modules/admin/pages/Settings/CampusesList')),
    },

    // Parents Section
    {
      name: 'Parents',
      layout: '/admin',
      icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Parent List',
          layout: '/admin',
          path: '/parents/list',
          component: lazy(() => import('./modules/admin/pages/Parents/ParentsList')),
        },
        {
          name: 'Add Parent',
          layout: '/admin',
          path: '/parents/add',
          component: lazy(() => import('./modules/admin/pages/Parents/AddParent')),
        },
        {
          name: 'Parent Inform',
          layout: '/admin',
          path: '/parents/inform',
          component: lazy(() => import('./modules/admin/pages/Parents/ParentInform')),
        },
        {
          name: 'Edit Parent',
          layout: '/admin',
          path: '/parents/edit/:id',
          component: lazy(() => import('./modules/admin/pages/Parents/EditParent')),
          hidden: true,
        },
      ],
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
        {
          name: 'QR Attendance',
          layout: '/admin',
          path: '/students/attendance/qr',
          component: <AdminQRAttendance />,
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
        {
          name: 'QR Attendance',
          layout: '/admin',
          path: '/teachers/attendance/qr',
          component: <AdminQRAttendance />,
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
          name: 'Class Results View',
          layout: '/admin',
          path: '/academics/results/class-view',
          component: lazy(() => import('./modules/admin/pages/academics/ResultsClassView')),
          hidden: true,
        },
        {
          name: 'Generate Results',
          layout: '/admin',
          path: '/academics/results/generate',
          component: lazy(() => import('./modules/admin/pages/academics/ResultsGenerate')),
          hidden: true,
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
        /* Temporarily hidden: RFID Logs
        {
          name: 'RFID Logs',
          layout: '/admin',
          path: '/attendance/rfid-logs',
          component: lazy(() => import('./modules/admin/pages/Attendance/RFIDLogs')),
        },
        */
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
        /* Temporarily hidden: Heatmaps
        {
          name: 'Heatmaps',
          layout: '/admin',
          path: '/attendance/heatmaps',
          component: lazy(() => import('./modules/admin/pages/Attendance/AttendanceHeatmaps')),
        },
        */
        {
          name: 'Alerts',
          layout: '/admin',
          path: '/attendance/alerts',
          component: lazy(() => import('./modules/admin/pages/Attendance/AttendanceAlerts')),
        },
        {
          name: 'QR Attendance',
          layout: '/admin',
          path: '/attendance/qr',
          component: <AdminQRAttendance />,
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
        // NOTE: The following Transport pages are temporarily disabled.
        // To re-enable, remove the surrounding comments for the desired block.
        /*
        {
          name: 'Live Tracking',
          layout: '/admin',
          path: '/transport/live-tracking',
          component: lazy(() => import('./modules/admin/pages/Transport/LiveTracking')),
        },
        */
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
        /*
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
        */
      ],
    },

    // Inventory Section
    {
      name: 'Inventory',
      layout: '/admin',
      icon: <Icon as={MdInventory} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Product',
          layout: '/admin',
          path: '/inventory/product',
          component: lazy(() => import('./modules/admin/pages/Inventory/Product')),
        },
        {
          name: 'Category',
          layout: '/admin',
          path: '/inventory/category',
          component: lazy(() => import('./modules/admin/pages/Inventory/Category')),
        },
        {
          name: 'Store',
          layout: '/admin',
          path: '/inventory/store',
          component: lazy(() => import('./modules/admin/pages/Inventory/Store')),
        },
        {
          name: 'Supplier',
          layout: '/admin',
          path: '/inventory/supplier',
          component: lazy(() => import('./modules/admin/pages/Inventory/Supplier')),
        },
        {
          name: 'Unit',
          layout: '/admin',
          path: '/inventory/unit',
          component: lazy(() => import('./modules/admin/pages/Inventory/Unit')),
        },
        {
          name: 'Purchase',
          layout: '/admin',
          path: '/inventory/purchase',
          component: lazy(() => import('./modules/admin/pages/Inventory/Purchase')),
        },
        {
          name: 'Sales',
          layout: '/admin',
          path: '/inventory/sales',
          component: lazy(() => import('./modules/admin/pages/Inventory/Sales')),
        },
        {
          name: 'Issue',
          layout: '/admin',
          path: '/inventory/issue',
          component: lazy(() => import('./modules/admin/pages/Inventory/Issue')),
        },
      ],
    },

    // Reception Section
    {
      name: 'Reception',
      layout: '/admin',
      icon: <Icon as={MdPhone} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Admission Enquiry',
          layout: '/admin',
          path: '/reception/admission-enquiry',
          component: lazy(() => import('./modules/admin/pages/Reception/AdmissionEnquiry')),
        },
        {
          name: 'Postal Record',
          layout: '/admin',
          path: '/reception/postal-record',
          component: lazy(() => import('./modules/admin/pages/Reception/PostalRecord')),
        },
        {
          name: 'Call Log',
          layout: '/admin',
          path: '/reception/call-log',
          component: lazy(() => import('./modules/admin/pages/Reception/CallLog')),
        },
        {
          name: 'Visitor Log',
          layout: '/admin',
          path: '/reception/visitor-log',
          component: lazy(() => import('./modules/admin/pages/Reception/VisitorLog')),
        },
        {
          name: 'Complaint',
          layout: '/admin',
          path: '/reception/complaint',
          component: lazy(() => import('./modules/admin/pages/Reception/Complaint')),
        },
        {
          name: 'Config Reception',
          layout: '/admin',
          path: '/reception/config',
          component: lazy(() => import('./modules/admin/pages/Reception/ConfigReception')),
        },
      ],
    },

    // Card Management Section
    {
      name: 'Card Management',
      layout: '/admin',
      icon: <Icon as={MdCreditCard} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Id Card Template',
          layout: '/admin',
          path: '/card-management/id-card-template',
          component: lazy(() => import('./modules/admin/pages/CardManagement/IdCardTemplate')),
        },
        {
          name: 'Student Id Card',
          layout: '/admin',
          path: '/card-management/student-id-card',
          component: lazy(() => import('./modules/admin/pages/CardManagement/StudentIdCard')),
        },
        {
          name: 'Employee Id Card',
          layout: '/admin',
          path: '/card-management/employee-id-card',
          component: lazy(() => import('./modules/admin/pages/CardManagement/EmployeeIdCard')),
        },
        {
          name: 'Admit Card Template',
          layout: '/admin',
          path: '/card-management/admit-card-template',
          component: lazy(() => import('./modules/admin/pages/CardManagement/AdmitCardTemplate')),
        },
        {
          name: 'Generate Admit Card',
          layout: '/admin',
          path: '/card-management/generate-admit-card',
          component: lazy(() => import('./modules/admin/pages/CardManagement/GenerateAdmitCard')),
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

    // Reports Section
    {
      name: 'Reports',
      layout: '/admin',
      icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Student Reports',
          collapse: true,
          items: [
            {
              name: 'Attendance Report',
              layout: '/admin',
              path: '/reports/student/attendance',
              component: lazy(() => import('./modules/admin/pages/Reports/Student/StudentAttendanceReport')),
            },
            {
              name: 'Performance Report',
              layout: '/admin',
              path: '/reports/student/performance',
              component: lazy(() => import('./modules/admin/pages/Reports/Student/StudentPerformanceReport')),
            },
          ],
        },
        {
          name: 'Fees Reports',
          collapse: true,
          items: [
            {
              name: 'Collection Report',
              layout: '/admin',
              path: '/reports/fees/collection',
              component: lazy(() => import('./modules/admin/pages/Reports/Fees/FeesCollectionReport')),
            },
            {
              name: 'Outstanding Report',
              layout: '/admin',
              path: '/reports/fees/outstanding',
              component: lazy(() => import('./modules/admin/pages/Reports/Fees/FeesOutstandingReport')),
            },
          ],
        },
        {
          name: 'Financial Reports',
          collapse: true,
          items: [
            {
              name: 'Income Statement',
              layout: '/admin',
              path: '/reports/financial/income',
              component: lazy(() => import('./modules/admin/pages/Reports/Financial/IncomeReport')),
            },
            {
              name: 'Expense Report',
              layout: '/admin',
              path: '/reports/financial/expense',
              component: lazy(() => import('./modules/admin/pages/Reports/Financial/ExpenseReport')),
            },
          ],
        },
        {
          name: 'Attendance Reports',
          collapse: true,
          items: [
            {
              name: 'Daily Report',
              layout: '/admin',
              path: '/reports/attendance/daily',
              component: lazy(() => import('./modules/admin/pages/Reports/Attendance/DailyAttendanceReport')),
            },
            {
              name: 'Monthly Report',
              layout: '/admin',
              path: '/reports/attendance/monthly',
              component: lazy(() => import('./modules/admin/pages/Reports/Attendance/MonthlyAttendanceReport')),
            },
          ],
        },
        {
          name: 'Human Resource',
          collapse: true,
          items: [
            {
              name: 'Employee Report',
              layout: '/admin',
              path: '/reports/hr/employee',
              component: lazy(() => import('./modules/admin/pages/Reports/HumanResource/EmployeeReport')),
            },
            {
              name: 'Salary Report',
              layout: '/admin',
              path: '/reports/hr/salary',
              component: lazy(() => import('./modules/admin/pages/Reports/HumanResource/SalaryReport')),
            },
          ],
        },
        {
          name: 'Examination',
          collapse: true,
          items: [
            {
              name: 'Results Report',
              layout: '/admin',
              path: '/reports/exam/results',
              component: lazy(() => import('./modules/admin/pages/Reports/Examination/ExamResultsReport')),
            },
            {
              name: 'Grade Distribution',
              layout: '/admin',
              path: '/reports/exam/grades',
              component: lazy(() => import('./modules/admin/pages/Reports/Examination/ExamGradesReport')),
            },
          ],
        },
        {
          name: 'Inventory',
          collapse: true,
          items: [
            {
              name: 'Stock Report',
              layout: '/admin',
              path: '/reports/inventory/stock',
              component: lazy(() => import('./modules/admin/pages/Reports/Inventory/StockReport')),
            },
            {
              name: 'Purchase Report',
              layout: '/admin',
              path: '/reports/inventory/purchase',
              component: lazy(() => import('./modules/admin/pages/Reports/Inventory/PurchaseReport')),
            },
          ],
        },
      ],
    },

    // Events Section
    {
      name: 'Events',
      layout: '/admin',
      path: '/events',
      icon: <Icon as={MdEvent} width="20px" height="20px" color="inherit" />,
      component: lazy(() => import('./modules/admin/pages/Events/Events')),
    },

    // Certificates Section
    {
      name: 'Certificates',
      layout: '/admin',
      icon: <Icon as={MdCardMembership} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Certificate Template',
          layout: '/admin',
          path: '/certificates/template',
          component: lazy(() => import('./modules/admin/pages/Certificates/CertificateTemplate')),
        },
        {
          name: 'Employee Certificate',
          layout: '/admin',
          path: '/certificates/employee',
          component: lazy(() => import('./modules/admin/pages/Certificates/EmployeeCertificate')),
        },
        {
          name: 'Student Certificate',
          layout: '/admin',
          path: '/certificates/student',
          component: lazy(() => import('./modules/admin/pages/Certificates/StudentCertificate')),
        },
      ],
    },

    // Human Resource Section
    {
      name: 'Human Resource',
      layout: '/admin',
      icon: <Icon as={MdWork} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'Payroll',
          collapse: true,
          items: [
            {
              name: 'Payroll Dashboard',
              layout: '/admin',
              path: '/hr/payroll/dashboard',
              component: lazy(() => import('./modules/admin/pages/HumanResource/Payroll/PayrollDashboard')),
            },
          ],
        },
        {
          name: 'Advance Salary',
          collapse: true,
          items: [
            {
              name: 'Advance Requests',
              layout: '/admin',
              path: '/hr/advance-salary/requests',
              component: lazy(() => import('./modules/admin/pages/HumanResource/AdvanceSalary/AdvanceRequests')),
            },
          ],
        },
        {
          name: 'Leave',
          collapse: true,
          items: [
            {
              name: 'Leave Requests',
              layout: '/admin',
              path: '/hr/leave/requests',
              component: lazy(() => import('./modules/admin/pages/HumanResource/Leave/LeaveRequests')),
            },
          ],
        },
        {
          name: 'Award',
          collapse: true,
          items: [
            {
              name: 'Awards List',
              layout: '/admin',
              path: '/hr/award/list',
              component: lazy(() => import('./modules/admin/pages/HumanResource/Award/AwardsList')),
            },
          ],
        },
      ],
    },

    /*
    // Communication Section (paused)
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
    */

    /*
    // Reports & Analytics Section (paused)
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
    */

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
          name: 'Licensing',
          layout: '/admin',
          path: '/settings/licensing',
          component: lazy(() => import('./modules/admin/pages/Settings/Licensing')),
        },
        {
          name: 'Master Data',
          layout: '/admin',
          path: '/settings/master-data',
          component: lazy(() => import('./modules/admin/pages/MasterDataManagement')),
        },
        {
          name: 'Campuses',
          layout: '/admin',
          path: '/settings/campuses',
          component: lazy(() => import('./modules/admin/pages/Settings/Campuses')),
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

    /* Notifications (temporarily hidden)
    {
      name: 'Notifications',
      layout: '/admin',
      path: '/notifications',
      icon: <Icon as={FaBell} width="20px" height="20px" color="inherit" />,
      component: lazy(() => import('./modules/admin/pages/Notifications/Notifications')),
    },
    */
    // Parent Portal - For logged in parents
    {
      name: 'Parent Portal',
      layout: '/admin',
      icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
      collapse: true,
      items: [
        {
          name: 'My Children',
          layout: '/admin',
          path: '/parent/students',
          component: lazy(() => import('./modules/admin/pages/Students/StudentsList')),
        },
        {
          name: 'Alerts',
          layout: '/admin',
          path: '/parent/alerts',
          component: <ParentAlerts />,
        },
        {
          name: 'Fees & Payments',
          layout: '/admin',
          path: '/parent/fees',
          component: lazy(() => import('./modules/admin/pages/Finance/OutstandingFees')),
        },
      ],
    },
  ];

  return adminMenu;
};

export default getSMSRoutes;
