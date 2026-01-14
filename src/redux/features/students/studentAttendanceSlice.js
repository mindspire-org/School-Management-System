import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions (replace with actual API calls)
const fetchAttendanceAPI = async (studentId, filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate attendance data for the specified student
      const mockAttendance = {
        studentId,
        summary: {
          overallPercentage: 95.5,
          totalPresent: 210,
          totalAbsent: 10,
          totalLate: 5,
          totalDays: 220
        },
        records: generateAttendanceRecords(studentId, filters)
      };
      
      resolve(mockAttendance);
    }, 600);
  });
};

// Helper to generate attendance records based on filters
function generateAttendanceRecords(studentId, filters = {}) {
  const records = [];
  const today = new Date();
  
  // Default to last 30 days if no date range specified
  const endDate = filters.endDate ? new Date(filters.endDate) : today;
  const startDate = filters.startDate ? 
    new Date(filters.startDate) : 
    new Date(today.setDate(today.getDate() - 30));
    
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Skip weekends (Saturday and Sunday)
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      const isPresent = Math.random() > 0.1; // 90% chance of being present
      const isLate = isPresent && Math.random() > 0.9; // 10% chance of being late if present
      
      const record = {
        date: currentDate.toISOString().split('T')[0],
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()],
        status: isPresent ? (isLate ? 'late' : 'present') : 'absent',
        checkInTime: isPresent ? 
          (isLate ? '08:4' + Math.floor(Math.random() * 10) : '08:0' + Math.floor(Math.random() * 10)) + ' AM' : 
          null,
        checkOutTime: isPresent ? '02:3' + Math.floor(Math.random() * 10) + ' PM' : null,
        method: isPresent ? (Math.random() > 0.7 ? 'manual' : 'rfid') : null,
        location: isPresent ? 
          (Math.random() > 0.5 ? 'Main Gate' : (Math.random() > 0.5 ? 'Bus #101' : 'Classroom')) : 
          null,
        markedBy: (isPresent && Math.random() > 0.7) ? 'Mr. Ahmed (Teacher)' : 'System',
        remarks: isPresent ? 
          '' : 
          (Math.random() > 0.5 ? 'Sick leave' : (Math.random() > 0.5 ? 'Family emergency' : ''))
      };
      
      records.push(record);
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Filter by status if specified
  if (filters.status && filters.status !== 'all') {
    return records.filter(record => record.status === filters.status);
  }
  
  return records;
}

const fetchRFIDLogsAPI = async (studentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const logs = [];
      const today = new Date();
      
      // Generate 10 recent RFID logs
      for (let i = 0; i < 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // Generate random time
        const hour = Math.floor(Math.random() * 10) + 7; // Between 7 and 17
        const minute = Math.floor(Math.random() * 60);
        
        logs.push({
          id: `log_${i}`,
          dateTime: `${date.toISOString().split('T')[0]} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          location: Math.random() > 0.5 ? 'Bus #101' : 'Main Gate',
          scanType: hour < 12 ? 'Check-in' : 'Check-out',
          cardNumber: `RFID-00${studentId.split('_')[1]}`,
          status: Math.random() > 0.1 ? 'Success' : 'Failed' // 90% success rate
        });
      }
      
      resolve(logs);
    }, 500);
  });
};

// Async thunks
export const fetchStudentAttendance = createAsyncThunk(
  'studentAttendance/fetchAttendance',
  async ({ studentId, filters = {} }, { rejectWithValue }) => {
    try {
      const attendance = await fetchAttendanceAPI(studentId, filters);
      return attendance;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRFIDLogs = createAsyncThunk(
  'studentAttendance/fetchRFIDLogs',
  async (studentId, { rejectWithValue }) => {
    try {
      const logs = await fetchRFIDLogsAPI(studentId);
      return logs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAttendance = createAsyncThunk(
  'studentAttendance/markAttendance',
  async ({ studentId, date, status, remarks = '' }, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        studentId,
        date,
        status,
        checkInTime: status === 'present' || status === 'late' ? 
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
          null,
        method: 'manual',
        location: 'Admin Dashboard',
        markedBy: 'Admin User',
        remarks
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const overrideAttendance = createAsyncThunk(
  'studentAttendance/overrideAttendance',
  async ({ studentId, date, status, remarks = '' }, { rejectWithValue }) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        studentId,
        date,
        status,
        checkInTime: status === 'present' || status === 'late' ? 
          '08:30 AM' : 
          null,
        method: 'manual-override',
        location: 'Admin Dashboard',
        markedBy: 'Admin User (Override)',
        remarks: remarks || 'Attendance record corrected'
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentStudent: null,
  summary: {
    overallPercentage: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalDays: 0
  },
  records: [],
  rfidLogs: [],
  filters: {
    startDate: '',
    endDate: '',
    status: 'all', // all, present, absent, late, leave
    viewType: 'calendar' // calendar or table
  },
  loading: false,
  error: null,
  rfidLogsLoading: false,
  rfidLogsError: null,
  markingAttendance: false,
  markingError: null
};

const studentAttendanceSlice = createSlice({
  name: 'studentAttendance',
  initialState,
  reducers: {
    setAttendanceFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAttendanceFilters(state) {
      state.filters = {
        startDate: '',
        endDate: '',
        status: 'all',
        viewType: 'calendar'
      };
    },
    toggleViewType(state) {
      state.filters.viewType = state.filters.viewType === 'calendar' ? 'table' : 'calendar';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch attendance
      .addCase(fetchStudentAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.currentStudent = action.payload.studentId;
        state.summary = action.payload.summary;
        state.records = action.payload.records;
        state.loading = false;
      })
      .addCase(fetchStudentAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch RFID logs
      .addCase(fetchRFIDLogs.pending, (state) => {
        state.rfidLogsLoading = true;
        state.rfidLogsError = null;
      })
      .addCase(fetchRFIDLogs.fulfilled, (state, action) => {
        state.rfidLogs = action.payload;
        state.rfidLogsLoading = false;
      })
      .addCase(fetchRFIDLogs.rejected, (state, action) => {
        state.rfidLogsLoading = false;
        state.rfidLogsError = action.payload;
      })
      
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.markingAttendance = true;
        state.markingError = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        const { date, status } = action.payload;
        
        // Find if there's an existing record for this date
        const existingIndex = state.records.findIndex(record => record.date === date);
        
        if (existingIndex !== -1) {
          // Update existing record
          state.records[existingIndex] = action.payload;
        } else {
          // Add new record
          state.records.push(action.payload);
        }
        
        // Update summary statistics
        if (status === 'present') {
          state.summary.totalPresent++;
        } else if (status === 'absent') {
          state.summary.totalAbsent++;
        } else if (status === 'late') {
          state.summary.totalLate++;
          state.summary.totalPresent++; // Late is also counted as present
        }
        
        state.summary.totalDays = state.summary.totalPresent + state.summary.totalAbsent;
        state.summary.overallPercentage = (state.summary.totalPresent / state.summary.totalDays) * 100;
        
        state.markingAttendance = false;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.markingAttendance = false;
        state.markingError = action.payload;
      })
      
      // Override attendance
      .addCase(overrideAttendance.pending, (state) => {
        state.markingAttendance = true;
        state.markingError = null;
      })
      .addCase(overrideAttendance.fulfilled, (state, action) => {
        const { date, status } = action.payload;
        
        // Find if there's an existing record for this date
        const existingIndex = state.records.findIndex(record => record.date === date);
        
        // Track old status for stats update
        const oldStatus = existingIndex !== -1 ? state.records[existingIndex].status : null;
        
        if (existingIndex !== -1) {
          // Update existing record
          state.records[existingIndex] = action.payload;
        } else {
          // Add new record
          state.records.push(action.payload);
        }
        
        // Update summary statistics
        if (oldStatus) {
          // Decrement old status counts
          if (oldStatus === 'present') {
            state.summary.totalPresent--;
          } else if (oldStatus === 'absent') {
            state.summary.totalAbsent--;
          } else if (oldStatus === 'late') {
            state.summary.totalLate--;
            state.summary.totalPresent--; // Late is also counted as present
          }
        }
        
        // Increment new status counts
        if (status === 'present') {
          state.summary.totalPresent++;
        } else if (status === 'absent') {
          state.summary.totalAbsent++;
        } else if (status === 'late') {
          state.summary.totalLate++;
          state.summary.totalPresent++; // Late is also counted as present
        }
        
        state.summary.totalDays = state.summary.totalPresent + state.summary.totalAbsent;
        state.summary.overallPercentage = (state.summary.totalPresent / state.summary.totalDays) * 100;
        
        state.markingAttendance = false;
      })
      .addCase(overrideAttendance.rejected, (state, action) => {
        state.markingAttendance = false;
        state.markingError = action.payload;
      });
  }
});

export const { 
  setAttendanceFilters,
  clearAttendanceFilters,
  toggleViewType
} = studentAttendanceSlice.actions;

export default studentAttendanceSlice.reducer;

// Selectors
export const selectAttendanceSummary = (state) => state.studentAttendance.summary;
export const selectAttendanceRecords = (state) => state.studentAttendance.records;
export const selectAttendanceFilters = (state) => state.studentAttendance.filters;
export const selectRFIDLogs = (state) => state.studentAttendance.rfidLogs;
export const selectAttendanceLoading = (state) => state.studentAttendance.loading;
export const selectRFIDLogsLoading = (state) => state.studentAttendance.rfidLogsLoading;
export const selectMarkingAttendance = (state) => state.studentAttendance.markingAttendance;

// Filter attendance records by date or status
export const selectFilteredAttendanceRecords = (state) => {
  const { records } = state.studentAttendance;
  const { startDate, endDate, status } = state.studentAttendance.filters;
  
  return records.filter(record => {
    // Filter by date range
    let matchesDateRange = true;
    if (startDate && endDate) {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDateRange = recordDate >= start && recordDate <= end;
    }
    
    // Filter by status
    const matchesStatus = status === 'all' || record.status === status;
    
    return matchesDateRange && matchesStatus;
  });
};
