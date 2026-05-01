// Chakra imports
import { Portal, Box, useDisclosure, Spinner, Center } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin';
import Navbar from 'components/navbar/NavbarAdmin';
import Sidebar from 'components/sidebar/Sidebar';
import { SidebarContext } from 'contexts/SidebarContext';
import React, { useState, Suspense, useMemo } from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import getStudentRoutes from '../../studentRoutes';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentLayout(props) {
  const { ...rest } = props;
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const sidebarWidth = toggleSidebar ? 80 : 260;

  const { campusId, user, moduleAccess } = useAuth();

  const getActiveRoute = (routes) => {
    let activeRoute = 'Student';
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].items);
        if (collapseActiveRoute !== activeRoute) return collapseActiveRoute;
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].items);
        if (categoryActiveRoute !== activeRoute) return categoryActiveRoute;
      } else if (routes[i].layout === '/student' && routes[i].path) {
        if (window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1) return routes[i].name;
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = () => false;
  const getActiveNavbarText = () => false;

  const normalizePath = (p) => (p || '').replace(/^\/+/, '');

  const ensureElement = (CompOrElement) => {
    if (React.isValidElement(CompOrElement)) return CompOrElement;
    if (typeof CompOrElement === 'function' || (typeof CompOrElement === 'object' && CompOrElement)) {
      return React.createElement(CompOrElement);
    }
    return null;
  };

  const routes = getStudentRoutes();

  const filterRoutesByAccess = (allRoutes) => {
    // For non-owner roles, when moduleAccess is missing or 'ALL', treat as allow all modules
    const allowedModules = (!moduleAccess || moduleAccess.allowModules === 'ALL')
      ? 'ALL'
      : new Set(moduleAccess.allowModules || []);
    const allowedSubroutes = new Set(
      (!moduleAccess || moduleAccess.allowSubroutes === 'ALL') ? ['ALL'] : (moduleAccess.allowSubroutes || [])
    );

    const isModuleAllowed = (name) => (allowedModules === 'ALL') || allowedModules.has(name);
    const isSubrouteAllowed = (subPath) => allowedSubroutes.has('ALL') || allowedSubroutes.has(subPath);

    const filterTree = (items) => items
      .map((r) => {
        if (r.layout !== '/student') return null;
        if (r.collapse && r.items) {
          if (!isModuleAllowed(r.name)) return null;
          const filteredItems = (r.items || []).filter((it) => isSubrouteAllowed(it.path));
          if (filteredItems.length === 0) return null;
          return { ...r, items: filteredItems };
        }
        if (!r.collapse && r.name) {
          if (!isModuleAllowed(r.name)) return null;
          return r;
        }
        return r;
      })
      .filter(Boolean);

    return filterTree(allRoutes);
  };

  const effectiveRoutes = useMemo(() => filterRoutesByAccess(routes), [routes, moduleAccess, user]);

  const getRoutes = (routes) =>
    routes
      .flatMap((route) => {
        if (route.collapse && route.items) return getRoutes(route.items);
        if (route.category && route.items) return getRoutes(route.items);
        if (route.layout === '/student' && route.path && route.component !== undefined) {
          const elementNode = ensureElement(route.component);
          if (!elementNode) return null;
          return (
            <Route
              path={`${normalizePath(route.path)}`}
              element={<ErrorBoundary>{elementNode}</ErrorBoundary>}
              key={`student-route-${route.path}`}
            />
          );
        }
        return null;
      })
      .filter(Boolean);

  document.documentElement.dir = 'ltr';
  const { onOpen } = useDisclosure();
  const location = useLocation();
  const brandText = useMemo(() => getActiveRoute(effectiveRoutes), [location.pathname, effectiveRoutes]);
  const secondary = useMemo(() => getActiveNavbar(effectiveRoutes), [location.pathname, effectiveRoutes]);
  const message = useMemo(() => getActiveNavbarText(effectiveRoutes), [location.pathname, effectiveRoutes]);

  return (
    <Box>
      <Box>
        <SidebarContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
          <Sidebar routes={effectiveRoutes} sidebarWidth={sidebarWidth} display="none" {...rest} />
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
            <Box mx="auto" p={{ base: '20px', md: '30px' }} pe="20px" minH="100vh" pt="50px">
              <Suspense
                fallback={
                  <Center minH="50vh">
                    <Spinner size="xl" thickness="4px" color="blue.500" />
                  </Center>
                }
              >
                <Routes key={campusId || 'no-campus'}>
                  {getRoutes(effectiveRoutes)}
                  <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
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
