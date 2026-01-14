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

export const store = configureStore({
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
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
