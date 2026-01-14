# Redux Toolkit Integration Guide

This project uses Redux Toolkit for state management. This document explains how Redux is structured in the School Management System and how to use it in your components.

## 📁 Redux Structure

The Redux implementation follows a feature-based structure:

```
src/
└── redux/
    ├── store.js             # Main Redux store configuration
    ├── hooks.js             # Custom hooks for easier Redux usage
    └── features/            # Feature slices
        ├── auth/            # Authentication state management
        │   └── authSlice.js
        ├── students/        # Student management
        │   └── studentSlice.js  
        ├── teachers/        # Teacher management
        │   └── teacherSlice.js
        ├── attendance/      # Attendance tracking
        │   └── attendanceSlice.js
        ├── finance/         # Financial management
        │   └── financeSlice.js
        └── ui/              # UI state (sidebar, theme, etc.)
            └── uiSlice.js
```

## 🔄 Redux Slices

Each slice encapsulates related state and logic:

### 1. Auth Slice (`authSlice.js`)
Manages authentication state, login/logout functionality, and user information.

```javascript
// Example usage
import { login, logout } from 'redux/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from 'redux/hooks';

// In your component
const dispatch = useAppDispatch();
const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

// Login
dispatch(login({ email: 'user@example.com', password: 'password' }));

// Logout
dispatch(logout());
```

### 2. UI Slice (`uiSlice.js`)
Manages UI state like sidebar visibility, current page, theme, and notifications.

```javascript
// Example usage
import { toggleSidebar, setCurrentPage, addNotification } from 'redux/features/ui/uiSlice';

// Toggle sidebar
dispatch(toggleSidebar());

// Set current page
dispatch(setCurrentPage('dashboard'));

// Add notification
dispatch(addNotification({
  title: 'Success',
  message: 'Student added successfully',
  type: 'success',
}));
```

### 3. Student Slice (`studentSlice.js`)
Manages student data, filtering, and operations.

```javascript
// Example usage
import { 
  fetchStudents, 
  addStudent,
  selectAllStudents,
  selectFilteredStudents
} from 'redux/features/students/studentSlice';

// Fetch all students
dispatch(fetchStudents());

// Add a new student
dispatch(addStudent({
  name: 'John Doe',
  grade: '10th',
  rollNumber: 'S003',
  section: 'A',
  // other details...
}));

// Get filtered students using selector
const filteredStudents = useAppSelector(selectFilteredStudents);
```

### 4. Attendance Slice (`attendanceSlice.js`)
Manages attendance records and tracking.

```javascript
// Example usage
import { fetchAttendanceByDate, markAttendance } from 'redux/features/attendance/attendanceSlice';

// Fetch attendance for a specific date and class
dispatch(fetchAttendanceByDate({ 
  date: '2025-11-10', 
  classId: '10A' 
}));

// Mark a student's attendance
dispatch(markAttendance({
  studentId: 1,
  present: true,
  date: '2025-11-10',
  classId: '10A'
}));
```

## 🧰 Custom Hooks

For easier Redux usage, we provide two custom hooks in `hooks.js`:

```javascript
import { useAppDispatch, useAppSelector } from 'redux/hooks';

// In your component
const dispatch = useAppDispatch(); // Typed dispatch
const user = useAppSelector((state) => state.auth.user); // Typed selector
```

## 🔍 Best Practices

1. **Use Selectors**: Create and use selectors for deriving data from the Redux store.
2. **Async Logic in Thunks**: Place all async operations in thunks, not components.
3. **Immutable Updates**: Redux Toolkit's `createSlice` uses Immer, allowing you to write "mutating" logic that is actually immutable.
4. **Minimize State**: Only store data in Redux that needs to be shared across components.
5. **Use Loading States**: Each slice has loading states to handle pending operations.

## 🌐 Global State vs. Local State

Not everything needs to be in Redux. Use local component state for:

- UI states that don't affect other components
- Form inputs that are only used within a single form
- Temporary data that doesn't need to persist

Use Redux for:
- User authentication state
- Data shared across multiple components
- Data that needs to persist across page navigation
- Server-side data that needs to be cached

## 📚 Example Component

```jsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { fetchStudents } from 'redux/features/students/studentSlice';
import { toggleSidebar } from 'redux/features/ui/uiSlice';

const StudentsPage = () => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { students, loading } = useAppSelector((state) => state.students);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);
  
  return (
    <div>
      <button onClick={() => dispatch(toggleSidebar())}>
        {sidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
      
      {loading ? (
        <p>Loading students...</p>
      ) : (
        <ul>
          {students.map(student => (
            <li key={student.id}>{student.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentsPage;
```
