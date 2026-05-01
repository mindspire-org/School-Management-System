import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import TeacherLayout from './layouts/teacher';
import StudentLayout from './layouts/student';
import DriverLayout from './layouts/driver';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarContext } from './contexts/SidebarContext';
import ProtectedRoute from './contexts/ProtectedRoute';
import ReduxWrapper from './components/wrappers/ReduxWrapper';
import ErrorBoundary from './components/ErrorBoundary';

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  
  return (
    <ReduxWrapper>
      <ChakraProvider theme={currentTheme}>
        <SidebarContext.Provider
          value={{
            toggleSidebar,
            setToggleSidebar,
          }}
        >
          <ErrorBoundary>
            <AuthProvider>
              <Routes>
                <Route path="auth/*" element={<AuthLayout />} />
                <Route
                  path="admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['owner', 'admin', 'parent', 'superadmin', 'branch_admin']}>
                      <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher/*"
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherLayout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student/*"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentLayout />
                    </ProtectedRoute>
                  }
                />
                <Route path="rtl/*" element={<RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />} />
                <Route
                  path="driver/*"
                  element={
                    <ProtectedRoute allowedRoles={['driver']}>
                      <DriverLayout />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
              </Routes>
            </AuthProvider>
          </ErrorBoundary>
        </SidebarContext.Provider>
      </ChakraProvider>
    </ReduxWrapper>
  );
}
