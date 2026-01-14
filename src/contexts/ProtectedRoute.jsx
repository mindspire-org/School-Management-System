import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Spinner, Flex, Text } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import { getDashboardPath } from '../utils/sidebarConfig';

/**
 * Protected Route Component
 * Wraps components that require authentication and specific roles
 * @param {Array} allowedRoles - Array of roles that can access this route
 * @param {ReactNode} children - Child components to render if authorized
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="gray.50"
        flexDirection="column"
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
          mb={4}
        />
        <Text color="gray.600">Loading...</Text>
      </Flex>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
