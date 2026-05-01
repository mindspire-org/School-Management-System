import React from 'react';
import { Icon } from '@chakra-ui/react';
import { MdLock } from 'react-icons/md';

// SMS Routes Configuration
import { getSMSRoutes } from './smsRoutesConfig';

// Auth Imports
import SMSLogin from './modules/authentication/Login';
import SMSSignUp from './modules/authentication/SignUp';

// Get SMS routes from configuration
const smsRoutes = getSMSRoutes();

const routes = [
  ...smsRoutes, // Use for sidebar display
  
  // Auth Routes
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SMSLogin />,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SMSSignUp />,
  },
];

export default routes;
