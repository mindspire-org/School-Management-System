import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdAltRoute,
  MdMap,
  MdGpsFixed,
  MdPeople,
  MdListAlt,
  MdReportProblem,
  MdAccessTime,
  MdMessage,
  MdDescription,
  MdPayments,
  MdSettings,
  MdLogin,
} from 'react-icons/md';

import DriverDashboard from './modules/drivers/DriverDashboard';
import DriverModulePlaceholder from './modules/drivers/DriverModulePlaceholder';
import LiveTracking from './modules/drivers/LiveTracking';
import MyRoutes from './modules/drivers/MyRoutes';
import PickupDrop from './modules/drivers/PickupDrop';
import VehicleChecklist from './modules/drivers/VehicleChecklist';
import IncidentsSafety from './modules/drivers/IncidentsSafety';
import ShiftAttendance from './modules/drivers/ShiftAttendance';
import DriverCommunications from './modules/drivers/DriverCommunications';
import DriverDocuments from './modules/drivers/DriverDocuments';
import DriverSalary from './modules/drivers/DriverSalary';
import DriverSettings from './modules/drivers/DriverSettings';
import SMSLogin from './modules/authentication/Login';

const driverRoutes = [
  {
    name: 'Dashboard',
    layout: '/driver',
    path: '/dashboard',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <DriverDashboard />,
  },
  {
    name: 'My Routes',
    layout: '/driver',
    path: '/routes',
    icon: <Icon as={MdAltRoute} width="20px" height="20px" color="inherit" />,
    component: <MyRoutes />,
  },
  {
    name: 'Live Tracking',
    layout: '/driver',
    path: '/live-tracking',
    icon: <Icon as={MdMap} width="20px" height="20px" color="inherit" />,
    component: <LiveTracking />,
  },
  {
    name: 'Student Pickup/Drop',
    layout: '/driver',
    path: '/pickup-drop',
    icon: <Icon as={MdPeople} width="20px" height="20px" color="inherit" />,
    component: <PickupDrop />,
  },
  {
    name: 'Vehicle Checklist',
    layout: '/driver',
    path: '/checklist',
    icon: <Icon as={MdListAlt} width="20px" height="20px" color="inherit" />,
    component: <VehicleChecklist />,
  },
  {
    name: 'Incidents & Safety',
    layout: '/driver',
    path: '/incidents',
    icon: <Icon as={MdReportProblem} width="20px" height="20px" color="inherit" />,
    component: <IncidentsSafety />,
  },
  {
    name: 'Shift & Attendance',
    layout: '/driver',
    path: '/shift',
    icon: <Icon as={MdAccessTime} width="20px" height="20px" color="inherit" />,
    component: <ShiftAttendance />,
  },
  {
    name: 'Communications',
    layout: '/driver',
    path: '/communications',
    icon: <Icon as={MdMessage} width="20px" height="20px" color="inherit" />,
    component: <DriverCommunications />,
  },
  {
    name: 'Documents',
    layout: '/driver',
    path: '/documents',
    icon: <Icon as={MdDescription} width="20px" height="20px" color="inherit" />,
    component: <DriverDocuments />,
  },
  {
    name: 'Salary',
    layout: '/driver',
    path: '/salary',
    icon: <Icon as={MdPayments} width="20px" height="20px" color="inherit" />,
    component: <DriverSalary />,
  },
  {
    name: 'Settings',
    layout: '/driver',
    path: '/settings',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
    component: <DriverSettings />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLogin} width="20px" height="20px" color="inherit" />,
    component: <SMSLogin />,
  },
];

export const getDriverRoutes = () => driverRoutes;
export default getDriverRoutes;
