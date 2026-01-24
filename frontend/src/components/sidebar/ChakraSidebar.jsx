import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Icon,
  Button,
  IconButton,
  VStack,
  HStack,
  Link,
  Collapse,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdHome,
  MdPeople,
  MdSchool,
  MdAttachMoney,
  MdDirectionsBus,
  MdCalendarToday,
  MdBarChart,
  MdSettings,
  MdNotifications,
  MdAccountCircle,
  MdExitToApp,
  MdMenu,
  MdMoreVert,
} from 'react-icons/md';

const ChakraSidebar = ({ onNavigate }) => {
  // State management
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('/dashboard');
  const [openMenus, setOpenMenus] = useState({});
  
  const location = useLocation();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeTextColor = useColorModeValue('blue.600', 'blue.200');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  
  // Update active item based on route
  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);
  
  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Toggle submenu expansion
  const toggleSubmenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };
  
  // Handle menu item click
  const handleMenuClick = (path) => {
    setActiveItem(path);
    if (onNavigate) onNavigate(path);
  };
  
  // Menu data structure
  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: MdHome,
      path: '/dashboard'
    },
    {
      id: 'students',
      name: 'Students',
      icon: MdPeople,
      hasSubmenu: true,
      submenu: [
        { id: 'student-list', name: 'Student List', path: '/students/list' },
        { id: 'add-student', name: 'Add Student', path: '/students/add' },
        { id: 'attendance', name: 'Attendance', path: '/students/attendance' },
        { id: 'performance', name: 'Performance', path: '/students/performance' },
        { id: 'fees', name: 'Fee Records', path: '/students/fees' },
        { id: 'transport', name: 'Transport', path: '/students/transport' },
      ]
    },
    {
      id: 'teachers',
      name: 'Teachers',
      icon: MdSchool,
      hasSubmenu: true,
      submenu: [
        { id: 'teacher-list', name: 'Teacher List', path: '/teachers/list' },
        { id: 'add-teacher', name: 'Add Teacher', path: '/teachers/add' },
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: MdAttachMoney,
      hasSubmenu: true,
      submenu: [
        { id: 'fee-collection', name: 'Fee Collection', path: '/finance/fees' },
        { id: 'expenses', name: 'Expenses', path: '/finance/expenses' },
        { id: 'reports', name: 'Financial Reports', path: '/finance/reports' },
      ]
    },
    {
      id: 'transport',
      name: 'Transport',
      icon: MdDirectionsBus,
      hasSubmenu: true,
      submenu: [
        { id: 'buses', name: 'Buses', path: '/transport/buses' },
        { id: 'routes', name: 'Routes', path: '/transport/routes' },
        { id: 'drivers', name: 'Drivers', path: '/transport/drivers' },
      ]
    },
    {
      id: 'separator1',
      type: 'separator'
    },
    {
      id: 'timetable',
      name: 'Timetable',
      icon: MdCalendarToday,
      path: '/timetable'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: MdBarChart,
      path: '/reports'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: MdSettings,
      path: '/settings'
    }
  ];
  
  const bottomMenuItems = [
    {
      id: 'notifications',
      name: 'Notifications',
      icon: MdNotifications,
      path: '/notifications'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: MdAccountCircle,
      path: '/profile'
    },
    {
      id: 'logout',
      name: 'Logout',
      icon: MdExitToApp,
      path: '/logout'
    }
  ];

  // Render menu item with or without submenu
  const renderMenuItem = (item) => {
    if (item.type === 'separator') {
      return (
        <Flex key={item.id} py={2} justify="center">
          <Icon as={MdMoreVert} h={4} w={4} color="gray.400" />
        </Flex>
      );
    }
    
    const isActive = activeItem === item.path;
    const isSubmenuOpen = openMenus[item.id];
    
    return (
      <Box key={item.id} w="full">
        {item.hasSubmenu ? (
          <>
            <Button
              variant="ghost"
              justifyContent="flex-start"
              alignItems="center"
              w="full"
              px={4}
              py={2}
              my={1}
              borderRadius="lg"
              transition="all 0.3s ease"
              bg={isSubmenuOpen ? hoverBgColor : 'transparent'}
              color={textColor}
              _hover={{ bg: hoverBgColor }}
              cursor="pointer"
              onClick={() => toggleSubmenu(item.id)}
            >
              <Icon as={item.icon} h={5} w={5} flexShrink={0} />
              <Text
                ml={3}
                fontSize="sm"
                fontWeight="medium"
                transition="opacity 0.3s ease"
                opacity={isExpanded ? 1 : 0}
                display={isExpanded ? 'block' : 'none'}
              >
                {item.name}
              </Text>
              <Box
                ml="auto"
                transition="opacity 0.3s ease"
                opacity={isExpanded ? 1 : 0}
                display={isExpanded ? 'block' : 'none'}
              >
                <Icon
                  as={isSubmenuOpen ? MdKeyboardArrowDown : MdKeyboardArrowRight}
                  h={4}
                  w={4}
                />
              </Box>
            </Button>
            
            <Collapse in={isSubmenuOpen && isExpanded} animateOpacity>
              <VStack align="stretch" spacing={1} mb={2}>
                {item.submenu.map(subItem => (
                  <Link
                    key={subItem.id}
                    as={RouterLink}
                    to={subItem.path}
                    display="flex"
                    alignItems="center"
                    w="full"
                    px={4}
                    py={2}
                    pl={14}
                    borderRadius="lg"
                    fontSize="sm"
                    transition="all 0.3s ease"
                    bg={activeItem === subItem.path ? activeBgColor : 'transparent'}
                    color={activeItem === subItem.path ? activeTextColor : 'gray.600'}
                    borderRightWidth={activeItem === subItem.path ? '4px' : '0'}
                    borderRightColor={activeItem === subItem.path ? 'blue.600' : 'transparent'}
                    _hover={{ bg: hoverBgColor }}
                    onClick={() => handleMenuClick(subItem.path)}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </VStack>
            </Collapse>
          </>
        ) : (
          <Link
            as={RouterLink}
            to={item.path}
            display="flex"
            alignItems="center"
            w="full"
            px={4}
            py={2}
            my={1}
            borderRadius="lg"
            transition="all 0.3s ease"
            bg={isActive ? activeBgColor : 'transparent'}
            color={isActive ? activeTextColor : textColor}
            borderRightWidth={isActive ? '4px' : '0'}
            borderRightColor={isActive ? 'blue.600' : 'transparent'}
            _hover={{ bg: hoverBgColor }}
            onClick={() => handleMenuClick(item.path)}
          >
            <Icon as={item.icon} h={5} w={5} flexShrink={0} />
            <Text
              ml={3}
              fontSize="sm"
              fontWeight="medium"
              transition="opacity 0.3s ease"
              opacity={isExpanded ? 1 : 0}
              display={isExpanded ? 'block' : 'none'}
            >
              {item.name}
            </Text>
          </Link>
        )}
      </Box>
    );
  };

  return (
    <Box
      position="relative"
      h="full"
      display="flex"
      flexDir="column"
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      transition="width 0.3s ease"
      width={isExpanded ? "256px" : "80px"}
      overflow="hidden"
    >
      {/* Sidebar header */}
      <Flex h="16" alignItems="center" justifyContent="space-between" px={4} borderBottomWidth="1px" borderColor={borderColor}>
        <Flex alignItems="center">
          <Flex
            h="8"
            w="8"
            flexShrink={0}
            borderRadius="full"
            bg="blue.600"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontWeight="bold" fontSize="sm">SMS</Text>
          </Flex>
          <Text
            ml={3}
            fontWeight="semibold"
            color="gray.800"
            transition="opacity 0.3s ease"
            opacity={isExpanded ? 1 : 0}
            display={isExpanded ? 'block' : 'none'}
          >
            School System
          </Text>
        </Flex>
      </Flex>
      
      {/* Toggle button */}
      <IconButton
        icon={<Icon as={MdMenu} h={4} w={4} color="gray.600" />}
        position="absolute"
        top="20"
        right="-3"
        size="sm"
        isRound
        bg={bgColor}
        shadow="md"
        borderWidth="1px"
        borderColor={borderColor}
        zIndex={10}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      />
      
      {/* Main menu */}
      <Box flex="1" px={2} py={4} overflowY="auto">
        <VStack spacing={0} align="stretch">
          {menuItems.map(item => renderMenuItem(item))}
        </VStack>
      </Box>
      
      {/* Bottom menu */}
      <Box px={2} py={4} borderTopWidth="1px" borderColor={borderColor}>
        <VStack spacing={0} align="stretch">
          {bottomMenuItems.map(item => renderMenuItem(item))}
        </VStack>
      </Box>
    </Box>
  );
};

export default ChakraSidebar;
