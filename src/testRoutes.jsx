import React from 'react';
import StudentListTest from './modules/students/StudentListTest';
import BasicStudentList from './modules/students/BasicStudentList';
import EnhancedStudentList from './modules/students/EnhancedStudentList';
import AddStudent from './modules/students/AddStudent';
import StudentAttendance from './modules/students/StudentAttendance';
import StudentPerformancePage from './modules/admin/pages/Students/StudentPerformancePage';
import ErrorBoundary from './components/ErrorBoundary';
import SidebarDemo from './components/sidebar/SidebarDemo';
// The sidebar demo uses ChakraSidebar instead of the Tailwind version

// Simple ComingSoon component
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

// Direct routes configuration for testing
const testRoutes = [
  {
    path: '/admin/sidebar-demo',
    element: <ErrorBoundary><SidebarDemo /></ErrorBoundary>,
  },
  {
    path: '/admin/students/list',
    element: <ErrorBoundary><EnhancedStudentList /></ErrorBoundary>,
  },
  {
    path: '/admin/students/add',
    element: <ErrorBoundary><AddStudent /></ErrorBoundary>,
  },
  {
    path: '/admin/students/attendance',
    element: <ErrorBoundary><StudentAttendance /></ErrorBoundary>,
  },
  {
    path: '/admin/students/performance',
    element: <ErrorBoundary><StudentPerformancePage /></ErrorBoundary>,
  },
  {
    path: '/admin/students/fees',
    element: <ComingSoon />,
  },
  {
    path: '/admin/students/transport',
    element: <ComingSoon />,
  }
];

export default testRoutes;
