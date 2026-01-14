import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import uiReducer from './features/ui/uiSlice';
import studentReducer from './features/students/studentSlice';
import studentAttendanceReducer from './features/students/studentAttendanceSlice';
import studentPerformanceReducer from './features/students/studentPerformanceSlice';
import studentFeesReducer from './features/students/studentFeesSlice';
import studentTransportReducer from './features/students/studentTransportSlice';
import attendanceReducer from './features/attendance/attendanceSlice';
import teacherReducer from './features/teachers/teacherSlice';
import financeReducer from './features/finance/financeSlice';

// Debug middleware to log actions
const loggerMiddleware = store => next => action => {
  console.group(`%c Action: ${action.type}`, 'color: #00C49F; font-weight: bold');
  console.info('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

// Export simplified debug store with minimum reducers
export const debugStore = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    students: studentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(loggerMiddleware),
  devTools: true,
});

// Export full store as well
export const fullDebugStore = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    students: studentReducer,
    studentAttendance: studentAttendanceReducer,
    studentPerformance: studentPerformanceReducer,
    studentFees: studentFeesReducer,
    studentTransport: studentTransportReducer,
    attendance: attendanceReducer,
    teachers: teacherReducer,
    finance: financeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(loggerMiddleware),
  devTools: true,
});

export default debugStore;
