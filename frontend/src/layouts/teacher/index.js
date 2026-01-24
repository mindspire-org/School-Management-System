// Chakra imports
import { Portal, Box, useDisclosure, Spinner, Center } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin.js';
import Navbar from 'components/navbar/NavbarAdmin.js';
import Sidebar from 'components/sidebar/Sidebar.js';
import { SidebarContext } from 'contexts/SidebarContext';
import React, { useState, Suspense, useMemo } from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import getTeacherRoutes from '../../teacherRoutes';

export default function TeacherLayout(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const sidebarWidth = toggleSidebar ? 80 : 260;

  const getActiveRoute = (routes) => {
    let activeRoute = 'Teacher';
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
        if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = () => false;
  const getActiveNavbarText = () => false;

  const normalizePath = (p) => (p || '').replace(/^\//, '');

  const ensureElement = (CompOrElement) => {
    if (React.isValidElement(CompOrElement)) return CompOrElement;
    if (typeof CompOrElement === 'function' || (typeof CompOrElement === 'object' && CompOrElement)) {
      return React.createElement(CompOrElement);
    }
    return null;
  };

  const routes = getTeacherRoutes();

  const getRoutes = (routes) => {
    return routes
      .flatMap((route) => {
        if (route.collapse && route.items) return getRoutes(route.items);
        if (route.category && route.items) return getRoutes(route.items);
        if (route.layout === '/teacher' && route.path && route.component !== undefined) {
          const elementNode = ensureElement(route.component);
          if (!elementNode) return null;
          return (
            <Route
              path={`${normalizePath(route.path)}`}
              element={<ErrorBoundary>{elementNode}</ErrorBoundary>}
              key={`teacher-route-${route.path}`}
            />
          );
        }
        return null;
      })
      .filter(Boolean);
  };

  document.documentElement.dir = 'ltr';
  const { onOpen } = useDisclosure();
  const location = useLocation();
  const brandText = useMemo(() => getActiveRoute(routes), [location.pathname]);
  const secondary = useMemo(() => getActiveNavbar(routes), [location.pathname]);
  const message = useMemo(() => getActiveNavbarText(routes), [location.pathname]);

  return (
    <Box>
      <Box>
        <SidebarContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
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
                  <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />
                </Routes>
              </Suspense>
            </Box>
            <Box>
              <Footer />
            </Box>
          </Box>
        </SidebarContext.Provider>
      </Box>
    </Box>
  );
}
