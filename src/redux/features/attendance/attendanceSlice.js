import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API function (replace with actual API call)
const fetchAttendanceAPI = async (date, classId) => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        date,
        classId,
        records: [
          { studentId: 1, present: true, timeIn: '08:15 AM', rfidLog: true },
          { studentId: 2, present: false, timeIn: null, rfidLog: false },
          { studentId: 3, present: true, timeIn: '08:05 AM', rfidLog: true },
          // More attendance records...
        ],
      });
    }, 800);
  });
};

// Async thunks
export const fetchAttendanceByDate = createAsyncThunk(
  'attendance/fetchByDate',
  async ({ date, classId }, { rejectWithValue }) => {
    try {
      const attendance = await fetchAttendanceAPI(date, classId);
      return attendance;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async ({ studentId, present, date, classId }, { rejectWithValue }) => {
    try {
      // Replace with actual API call
      return { studentId, present, date, classId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentDate: new Date().toISOString().split('T')[0],
  selectedClass: null,
  records: {},
  dailySummary: {
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
  },
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setCurrentDate: (state, action) => {
      state.currentDate = action.payload;
    },
    setSelectedClass: (state, action) => {
      state.selectedClass = action.payload;
    },
    clearAttendanceRecords: (state) => {
      state.records = {};
      state.dailySummary = {
        present: 0,
        absent: 0,
        late: 0,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch attendance
      .addCase(fetchAttendanceByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
        const { date, classId, records } = action.payload;
        const key = `${date}-${classId}`;
        
        state.records[key] = records;
        
        // Calculate daily summary
        const present = records.filter(r => r.present).length;
        const late = records.filter(r => r.present && new Date(`2000-01-01T${r.timeIn}`).getHours() >= 8).length;
        const total = records.length;
        
        state.dailySummary = {
          present,
          absent: total - present,
          late,
          total,
        };
        
        state.loading = false;
      })
      .addCase(fetchAttendanceByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        const { studentId, present, date, classId } = action.payload;
        const key = `${date}-${classId}`;
        
        if (state.records[key]) {
          const index = state.records[key].findIndex(
            (record) => record.studentId === studentId
          );
          
          if (index !== -1) {
            state.records[key][index].present = present;
            
            // Update daily summary
            const presentCount = state.records[key].filter(r => r.present).length;
            const total = state.records[key].length;
            
            state.dailySummary = {
              ...state.dailySummary,
              present: presentCount,
              absent: total - presentCount,
            };
          }
        }
        
        state.loading = false;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentDate, setSelectedClass, clearAttendanceRecords } = attendanceSlice.actions;

export default attendanceSlice.reducer;
