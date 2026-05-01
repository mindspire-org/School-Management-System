import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner, Flex, Text, Button } from '@chakra-ui/react';
import { useAuth } from './AuthContext';
import { getDashboardPath } from '../utils/sidebarConfig';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Protected Route Component
 * Wraps components that require authentication and specific roles
 * @param {Array} allowedRoles - Array of roles that can access this route
 * @param {ReactNode} children - Child components to render if authorized
 */
export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  let hasStoredToken = false;
  try {
    hasStoredToken = Boolean(
      sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    );
  } catch (_) {
    hasStoredToken = false;
  }

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
    if (hasStoredToken) {
      return (
        <Flex
          minH="100vh"
          align="center"
          justify="center"
          bg="gray.50"
          flexDirection="column"
          px={6}
          textAlign="center"
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
            mb={4}
          />
          <Text color="gray.700" fontWeight="700" mb={2}>Restoring session...</Text>
          <Text color="gray.600" maxW="520px" mb={5}>
            If your internet/server is slow, this can take a few seconds.
          </Text>
          <Button as="a" href="/auth/sign-in" variant="outline">Go to Sign In</Button>
        </Flex>
      );
    }
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
