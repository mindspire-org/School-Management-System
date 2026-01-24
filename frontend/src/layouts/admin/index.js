// Chakra imports
import { Portal, Box, useDisclosure, Spinner, Center } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin.js';
// Layout components
import Navbar from 'components/navbar/NavbarAdmin.js';
import Sidebar from 'components/sidebar/Sidebar.js';
import { SidebarContext } from 'contexts/SidebarContext';
import React, { useState, Suspense, useMemo } from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import routes from 'routes.js';
import testRoutes from '../../testRoutes';

// Custom Chakra theme
export default function Dashboard(props) {
  const { ...rest } = props;
  // states and functions
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const sidebarWidth = toggleSidebar ? 80 : 260;
  // functions for changing the states from components
  const getRoute = () => {
    return window.location.pathname !== '/admin/full-screen-maps';
  };
  const getActiveRoute = (routes) => {
    let activeRoute = 'Default Brand Text';
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].items);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].items);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveNavbar = getActiveNavbar(routes[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].secondary;
        }
      }
    }
    return activeNavbar;
  };
  const getActiveNavbarText = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveNavbar = getActiveNavbarText(routes[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbarText(routes[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].messageNavbar;
        }
      }
    }
    return activeNavbar;
  };
  // Ensure child route paths are relative to /admin by removing any leading slash
  const normalizePath = (p) => (p || '').replace(/^\//, '');

  const getRoutes = (routes) => {
    const ensureElement = (CompOrElement) => {
      // If it's already a valid element (<Component />), return as-is
      if (React.isValidElement(CompOrElement)) return CompOrElement;
      // If it's a component type (including React.lazy), instantiate it
      if (
        typeof CompOrElement === 'function' ||
        (typeof CompOrElement === 'object' && CompOrElement)
      ) {
        return React.createElement(CompOrElement);
      }
      return null;
    };
    return routes
      .flatMap((route) => {
        // Recurse into grouped routes first
        if (route.collapse && route.items) {
          return getRoutes(route.items);
        }
        if (route.category && route.items) {
          return getRoutes(route.items);
        }

        // Create routes only for concrete entries with a path AND a component
        if (route.layout === '/admin' && route.path && route.component) {
          const elementNode = ensureElement(route.component);
          if (!elementNode) return null;
          return (
            <Route
              path={`${normalizePath(route.path)}`}
              element={<ErrorBoundary>{elementNode}</ErrorBoundary>}
              key={`route-${route.path}`}
            />
          );
        }
        return null;
      })
      .filter(Boolean);
  };
  document.documentElement.dir = 'ltr';
  const { onOpen } = useDisclosure();
  document.documentElement.dir = 'ltr';
  // React to route changes to update Navbar titles without a full reload
  const location = useLocation();
  const brandText = useMemo(() => getActiveRoute(routes), [location.pathname]);
  const secondary = useMemo(() => getActiveNavbar(routes), [location.pathname]);
  const message = useMemo(() => getActiveNavbarText(routes), [location.pathname]);
  return (
    <Box>
      <Box>
        <SidebarContext.Provider
          value={{
            toggleSidebar,
            setToggleSidebar,
          }}
        >
          <Sidebar routes={routes} sidebarWidth={sidebarWidth} display="none" {...rest} />
          <Box
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{ base: '100%', xl: `calc( 100vw - ${sidebarWidth}px )` }}
            maxWidth={{ base: '100%', xl: `calc( 100vw - ${sidebarWidth}px )` }}
            minW={0}
            overflowX="hidden"
            transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
            transitionDuration=".2s, .2s, .35s"
            transitionProperty="top, bottom, width"
            transitionTimingFunction="linear, linear, ease"
          >
            <Portal>
              <Box>
                <Navbar
                  onOpen={onOpen}
                  logoText={'MindSpire SMS'}
                  brandText={brandText}
                  secondary={secondary}
                  message={message}
                  fixed={fixed}
                  {...rest}
                />
              </Box>
            </Portal>

            {getRoute() ? (
              <Box
                mx="auto"
                p={{ base: '20px', md: '30px' }}
                pe="20px"
                minH="100vh"
                pt="50px"
              >
                <Suspense fallback={
                  <Center minH="50vh">
                    <Spinner size="xl" thickness="4px" color="blue.500" />
                  </Center>
                }>
                  <Routes>
                    {getRoutes(routes)}
                  
                  {/* Direct test routes */}
                  {testRoutes.map((route, index) => (
                    <Route 
                      key={`test-route-${index}`} 
                      path={route.path.replace('/admin/', '')} 
                      element={route.element} 
                    />
                  ))}
                  
                  <Route
                    path="/"
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                </Routes>
                </Suspense>
              </Box>
            ) : null}
            <Box>
              <Footer />
            </Box>
          </Box>
        </SidebarContext.Provider>
      </Box>
    </Box>
  );
}
