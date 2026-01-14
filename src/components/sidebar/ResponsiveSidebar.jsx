import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Flex, Icon, Text, Button, IconButton, VStack, Link, Divider } from '@chakra-ui/react';
import TailwindAdapter from './TailwindAdapter';
import {
  MdKeyboardArrowDown as ChevronDownIcon,
  MdKeyboardArrowRight as ChevronRightIcon,
  MdHome as HomeIcon,
  MdPeople as UsersIcon,
  MdSchool as AcademicCapIcon,
  MdAttachMoney as CurrencyDollarIcon,
  MdDirectionsBus as TruckIcon,
  MdCalendarToday as CalendarIcon,
  MdBarChart as ChartBarIcon,
  MdSettings as CogIcon,
  MdNotifications as BellIcon,
  MdAccountCircle as UserCircleIcon,
  MdExitToApp as LogoutIcon,
  MdMenu as MenuIcon,
  MdMoreVert as DotsVerticalIcon,
} from 'react-icons/md';

const ResponsiveSidebar = ({ onNavigate }) => {
  // State management
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState('/dashboard');
  const [openMenus, setOpenMenus] = useState({});
  
  const location = useLocation();
  
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
      icon: <HomeIcon className="h-5 w-5" />,
      path: '/dashboard'
    },
    {
      id: 'students',
      name: 'Students',
      icon: <UsersIcon className="h-5 w-5" />,
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
      icon: <AcademicCapIcon className="h-5 w-5" />,
      hasSubmenu: true,
      submenu: [
        { id: 'teacher-list', name: 'Teacher List', path: '/teachers/list' },
        { id: 'add-teacher', name: 'Add Teacher', path: '/teachers/add' },
      ]
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
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
      icon: <TruckIcon className="h-5 w-5" />,
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
      icon: <CalendarIcon className="h-5 w-5" />,
      path: '/timetable'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: <ChartBarIcon className="h-5 w-5" />,
      path: '/reports'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <CogIcon className="h-5 w-5" />,
      path: '/settings'
    }
  ];
  
  const bottomMenuItems = [
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <BellIcon className="h-5 w-5" />,
      path: '/notifications'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: <UserCircleIcon className="h-5 w-5" />,
      path: '/profile'
    },
    {
      id: 'logout',
      name: 'Logout',
      icon: <LogoutIcon className="h-5 w-5" />,
      path: '/logout'
    }
  ];

  // Render menu item with or without submenu
  const renderMenuItem = (item) => {
    if (item.type === 'separator') {
      return (
        <div key={item.id} className="py-2 flex justify-center">
          <DotsVerticalIcon className="h-4 w-4 text-gray-400" />
        </div>
      );
    }
    
    const isActive = activeItem === item.path;
    const isSubmenuOpen = openMenus[item.id];
    
    const baseMenuClasses = `
      flex items-center w-full px-4 py-2 rounded-lg my-1
      transition-all duration-300 ease-in-out
      ${isActive && !item.hasSubmenu ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}
      cursor-pointer
    `;
    
    return (
      <div key={item.id} className="w-full">
        {item.hasSubmenu ? (
          <>
            <div 
              className={`${baseMenuClasses} ${isSubmenuOpen ? 'bg-gray-100' : ''}`}
              onClick={() => toggleSubmenu(item.id)}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              <span className={`ml-3 text-sm font-medium transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.name}
              </span>
              <div className={`ml-auto transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {isSubmenuOpen ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </div>
            </div>
            
            <div className={`
              overflow-hidden transition-all duration-300 ease-in-out
              ${isSubmenuOpen && isExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              {item.submenu.map(subItem => (
                <Link
                  key={subItem.id}
                  to={subItem.path}
                  className={`
                    flex items-center w-full px-4 py-2 pl-14 rounded-lg my-1
                    transition-all duration-300 ease-in-out text-sm
                    ${activeItem === subItem.path ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}
                    ${isExpanded ? '' : 'hidden'}
                  `}
                  onClick={() => handleMenuClick(subItem.path)}
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <Link
            to={item.path}
            className={baseMenuClasses}
            onClick={() => handleMenuClick(item.path)}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <span className={`ml-3 text-sm font-medium transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              {item.name}
            </span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`
        relative flex flex-col bg-white border-r border-gray-200 h-full
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-20'}
      `}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SMS</span>
          </div>
          <h1 className={`ml-3 font-semibold text-gray-800 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            School System
          </h1>
        </div>
      </div>
      
      {/* Toggle button */}
      <button
        className="absolute -right-3 top-20 bg-white rounded-full p-1 shadow-md border border-gray-200 cursor-pointer z-10"
        onClick={toggleSidebar}
      >
        <MenuIcon className="h-4 w-4 text-gray-600" />
      </button>
      
      {/* Main menu */}
      <div className="flex-1 px-2 py-4 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </div>
      
      {/* Bottom menu */}
      <div className="px-2 py-4 border-t border-gray-200">
        {bottomMenuItems.map(item => renderMenuItem(item))}
      </div>
    </div>
  );
};

export default ResponsiveSidebar;
