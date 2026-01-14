import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions
const fetchTeachersAPI = async () => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: 'Prof. Robert Smith',
          qualification: 'PhD Mathematics',
          employeeId: 'T001',
          contactInfo: {
            email: 'robert@school.edu',
            phone: '9876543210',
          },
          subjects: ['Mathematics', 'Physics'],
          classes: ['10A', '11B', '12A'],
          joiningDate: '2019-07-15',
        },
        {
          id: 2,
          name: 'Ms. Sarah Johnson',
          qualification: 'MSc Biology',
          employeeId: 'T002',
          contactInfo: {
            email: 'sarah@school.edu',
            phone: '9876543211',
          },
          subjects: ['Biology', 'Chemistry'],
          classes: ['9A', '10B', '11A'],
          joiningDate: '2020-06-01',
        },
        // More teachers...
      ]);
    }, 1000);
  });
};

// Async thunks
export const fetchTeachers = createAsyncThunk('teachers/fetchTeachers', async (_, { rejectWithValue }) => {
  try {
    const teachers = await fetchTeachersAPI();
    return teachers;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addTeacher = createAsyncThunk('teachers/addTeacher', async (teacherData, { rejectWithValue }) => {
  try {
    // Replace with actual API call
    const newTeacher = { id: Date.now(), ...teacherData };
    return newTeacher;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  teachers: [],
  selectedTeacher: null,
  loading: false,
  error: null,
  filters: {
    subject: '',
    searchTerm: '',
  },
  teacherSchedule: {},
};

const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    selectTeacher: (state, action) => {
      state.selectedTeacher = action.payload;
    },
    clearSelectedTeacher: (state) => {
      state.selectedTeacher = null;
    },
    setTeacherFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTeacherFilters: (state) => {
      state.filters = {
        subject: '',
        searchTerm: '',
      };
    },
    setTeacherSchedule: (state, action) => {
      const { teacherId, schedule } = action.payload;
      state.teacherSchedule[teacherId] = schedule;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.teachers = action.payload;
        state.loading = false;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add teacher
      .addCase(addTeacher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeacher.fulfilled, (state, action) => {
        state.teachers.push(action.payload);
        state.loading = false;
      })
      .addCase(addTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  selectTeacher, 
  clearSelectedTeacher, 
  setTeacherFilters, 
  clearTeacherFilters,
  setTeacherSchedule 
} = teacherSlice.actions;

export default teacherSlice.reducer;

// Selectors
export const selectAllTeachers = (state) => state.teachers.teachers;
export const selectFilteredTeachers = (state) => {
  const { teachers } = state.teachers;
  const { subject, searchTerm } = state.teachers.filters;
  
  return teachers.filter(teacher => {
    const matchesSubject = !subject || teacher.subjects.includes(subject);
    const matchesSearch = !searchTerm || 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSubject && matchesSearch;
  });
};
