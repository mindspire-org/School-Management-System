import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions (replace with actual API calls)
const fetchStudentsAPI = async (filters = {}) => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockStudents = [
        {
          id: 'student_001',
          photo: 'https://bit.ly/dan-abramov',
          name: 'Ali Khan',
          rollNumber: 'STD-2024-001',
          email: 'ali.khan@student.mindspire.com',
          class: '10-A',
          section: 'A',
          rfidTag: 'RFID-001',
          rfidAssigned: true,
          attendance: 95.5, // percentage
          feeStatus: 'paid', // paid, pending, overdue
          feeAmount: 0, // amount due
          busNumber: '101',
          busAssigned: true,
          parentName: 'Khan Sahab',
          parentPhone: '+92 300 1234567',
          parentWhatsApp: '+92 300 1234567',
          status: 'active', // active, inactive
          admissionDate: '2024-01-15',
          personalInfo: {
            dateOfBirth: '2010-05-15',
            gender: 'Male',
            bloodGroup: 'O+',
            religion: 'Islam',
            nationality: 'Pakistani',
            cnic: '12345-1234567-1',
            address: '123 Main St, Karachi',
            city: 'Karachi',
            postalCode: '75300',
            phone: '+92 321 1234567'
          },
          academicInfo: {
            admissionNumber: 'ADM-2024-001',
            academicYear: '2024-2025',
            previousSchool: 'ABC School',
            previousClass: '9th',
            specialNeeds: 'None'
          },
          parentInfo: {
            father: {
              name: 'Khan Sahab',
              cnic: '12345-1234567-2',
              phone: '+92 300 1234567',
              email: 'khan@example.com',
              occupation: 'Business',
              income: 150000
            },
            mother: {
              name: 'Mrs. Khan',
              cnic: '12345-1234567-3',
              phone: '+92 301 1234567',
              email: 'mrs.khan@example.com',
              occupation: 'Teacher',
              income: 80000
            },
            guardian: {
              name: '',
              relationship: '',
              phone: '',
              cnic: ''
            },
            emergency: {
              name: 'Khan Sahab',
              phone: '+92 300 1234567',
              relationship: 'Father'
            }
          },
          transportInfo: {
            usesTransport: true,
            busNumber: '101',
            route: 'Route A - Gulshan to School',
            pickupPoint: 'Stop 3 - Main Boulevard',
            dropPoint: 'Stop 3 - Main Boulevard',
            pickupTime: '07:15 AM',
            dropTime: '02:45 PM'
          },
          rfidInfo: {
            tagNumber: 'RFID-001',
            issueDate: '2024-01-15',
            expiryDate: '2025-01-15',
            status: 'active' // active, blocked, lost
          },
          feeInfo: {
            feePlan: 'Standard',
            totalAnnualFee: 85000,
            transportFee: 15000,
            admissionFee: 5000,
            examFee: 3000,
            monthlyInstallment: 8500,
            discount: {
              type: 'percentage', // percentage, fixed, scholarship
              value: 10,
              reason: 'Sibling discount',
              approvedBy: 'Principal'
            },
            paymentSchedule: 'monthly', // monthly, quarterly, half-yearly, annually
            firstPaymentDue: '2024-02-01',
            paymentMethods: ['cash', 'bank-transfer']
          }
        },
        {
          id: 'student_002',
          photo: 'https://bit.ly/sage-adebayo',
          name: 'Ayesha Ahmed',
          rollNumber: 'STD-2024-002',
          email: 'ayesha.ahmed@student.mindspire.com',
          class: '10-A',
          section: 'A',
          rfidTag: 'RFID-002',
          rfidAssigned: true,
          attendance: 92.0,
          feeStatus: 'pending',
          feeAmount: 8500,
          busNumber: '103',
          busAssigned: true,
          parentName: 'Ahmed Sahab',
          parentPhone: '+92 300 7654321',
          parentWhatsApp: '+92 300 7654321',
          status: 'active',
          admissionDate: '2024-01-20',
          // Other detailed fields similar to above
        },
        {
          id: 'student_003',
          photo: '',
          name: 'Bilal Khan',
          rollNumber: 'STD-2024-003',
          email: 'bilal.khan@student.mindspire.com',
          class: '9-B',
          section: 'B',
          rfidTag: 'RFID-003',
          rfidAssigned: true,
          attendance: 78.5,
          feeStatus: 'overdue',
          feeAmount: 17000,
          busNumber: '',
          busAssigned: false,
          parentName: 'Khan Bilal',
          parentPhone: '+92 333 1234567',
          parentWhatsApp: '+92 333 1234567',
          status: 'active',
          admissionDate: '2024-01-25',
          // Other detailed fields similar to above
        },
        // More students can be added as needed
      ];

      // Apply filters if provided
      let filtered = [...mockStudents];
      
      if (filters.class && filters.class !== 'all') {
        filtered = filtered.filter(student => student.class.split('-')[0] === filters.class);
      }
      
      if (filters.section && filters.section !== 'all') {
        filtered = filtered.filter(student => student.section === filters.section);
      }
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(student => student.status === filters.status);
      }
      
      if (filters.transport && filters.transport !== 'all') {
        if (filters.transport === 'bus') {
          filtered = filtered.filter(student => student.busAssigned);
        } else {
          filtered = filtered.filter(student => !student.busAssigned);
        }
      }
      
      if (filters.feeStatus && filters.feeStatus !== 'all') {
        filtered = filtered.filter(student => student.feeStatus === filters.feeStatus);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(student => 
          student.name.toLowerCase().includes(term) || 
          student.rollNumber.toLowerCase().includes(term) || 
          student.rfidTag.toLowerCase().includes(term)
        );
      }
      
      resolve(filtered);
    }, 800);
  });
};

const fetchStudentByIdAPI = async (studentId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate fetching a student from server
      const mockStudent = {
        id: studentId,
        photo: 'https://bit.ly/dan-abramov',
        name: 'Ali Khan',
        rollNumber: 'STD-2024-001',
        email: 'ali.khan@student.mindspire.com',
        class: '10-A',
        section: 'A',
        rfidTag: 'RFID-001',
        rfidAssigned: true,
        attendance: 95.5,
        feeStatus: 'paid',
        feeAmount: 0,
        busNumber: '101',
        busAssigned: true,
        parentName: 'Khan Sahab',
        parentPhone: '+92 300 1234567',
        parentWhatsApp: '+92 300 1234567',
        status: 'active',
        admissionDate: '2024-01-15',
        // Additional detailed information would be included
      };
      
      if (studentId === 'student_001') {
        resolve(mockStudent);
      } else {
        // Simulate error for non-existent student
        reject(new Error('Student not found'));
      }
    }, 500);
  });
};

// Async thunks
export const fetchStudents = createAsyncThunk('students/fetchStudents', async (filters = {}, { rejectWithValue }) => {
  try {
    const students = await fetchStudentsAPI(filters);
    return students;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchStudentById = createAsyncThunk('students/fetchStudentById', async (studentId, { rejectWithValue }) => {
  try {
    const student = await fetchStudentByIdAPI(studentId);
    return student;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addStudent = createAsyncThunk('students/addStudent', async (studentData, { rejectWithValue }) => {
  try {
    // In a real app, this would be an API call
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newStudent = { 
      id: `student_${Date.now()}`,
      photo: '', // No photo by default
      status: 'active',
      admissionDate: new Date().toISOString().split('T')[0],
      ...studentData 
    };
    return newStudent;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateStudent = createAsyncThunk('students/updateStudent', async ({ studentId, data }, { rejectWithValue }) => {
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { id: studentId, ...data };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteStudent = createAsyncThunk('students/deleteStudent', async (studentId, { rejectWithValue }) => {
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return studentId;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const bulkDeleteStudents = createAsyncThunk('students/bulkDeleteStudents', async (studentIds, { rejectWithValue }) => {
  try {
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return studentIds;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const bulkUpdateStudents = createAsyncThunk('students/bulkUpdateStudents', 
  async ({ studentIds, data }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return { studentIds, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
  formStep: 1, // Current step in multi-step form
  formData: {
    personal: {},
    academic: {},
    parent: {},
    transport: {},
    fee: {}
  },
  formErrors: {},
  uploadedFiles: [],
  stats: {
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    newThisMonth: 0
  },
  filters: {
    class: 'all',
    section: 'all',
    status: 'all',
    transport: 'all',
    feeStatus: 'all',
    searchTerm: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  },
  pagination: {
    currentPage: 1,
    rowsPerPage: 25,
    totalPages: 0,
    totalItems: 0
  },
  selectedStudents: [], // For bulk operations
  bulkActionLoading: false,
  bulkActionError: null
};

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    selectStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        class: 'all',
        section: 'all',
        status: 'all',
        transport: 'all',
        feeStatus: 'all',
        searchTerm: '',
        dateRange: {
          startDate: '',
          endDate: ''
        }
      };
    },
    setFormStep: (state, action) => {
      state.formStep = action.payload;
    },
    setAllFormData: (state, action) => {
      const next = action.payload || {};
      state.formData = {
        personal: next.personal || {},
        academic: next.academic || {},
        parent: next.parent || {},
        transport: next.transport || {},
        fee: next.fee || {},
      };
    },
    updateFormData: (state, action) => {
      const { step, data } = action.payload;
      switch(step) {
        case 'personal':
          state.formData.personal = { ...state.formData.personal, ...data };
          break;
        case 'academic':
          state.formData.academic = { ...state.formData.academic, ...data };
          break;
        case 'parent':
          state.formData.parent = { ...state.formData.parent, ...data };
          break;
        case 'transport':
          state.formData.transport = { ...state.formData.transport, ...data };
          break;
        case 'fee':
          state.formData.fee = { ...state.formData.fee, ...data };
          break;
        default:
          break;
      }
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    clearFormData: (state) => {
      state.formData = {
        personal: {},
        academic: {},
        parent: {},
        transport: {},
        fee: {}
      };
      state.formErrors = {};
      state.formStep = 1;
    },
    addUploadedFile: (state, action) => {
      state.uploadedFiles.push(action.payload);
    },
    removeUploadedFile: (state, action) => {
      state.uploadedFiles = state.uploadedFiles.filter(
        file => file.name !== action.payload
      );
    },
    clearUploadedFiles: (state) => {
      state.uploadedFiles = [];
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    toggleStudentSelection: (state, action) => {
      const studentId = action.payload;
      const index = state.selectedStudents.indexOf(studentId);
      
      if (index === -1) {
        state.selectedStudents.push(studentId);
      } else {
        state.selectedStudents.splice(index, 1);
      }
    },
    selectAllStudents: (state, action) => {
      // If passing true, select all IDs from current students
      if (action.payload) {
        state.selectedStudents = state.students.map(student => student.id);
      } else {
        state.selectedStudents = [];
      }
    },
    clearSelectedStudents: (state) => {
      state.selectedStudents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students = action.payload;
        state.loading = false;
        
        // Update stats based on fetched students
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        state.stats = {
          totalStudents: action.payload.length,
          activeStudents: action.payload.filter(s => s.status === 'active').length,
          inactiveStudents: action.payload.filter(s => s.status === 'inactive').length,
          newThisMonth: action.payload.filter(s => {
            const admissionDate = new Date(s.admissionDate);
            return admissionDate >= firstDayOfMonth;
          }).length
        };
        
        // Update pagination info
        state.pagination.totalItems = action.payload.length;
        state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.rowsPerPage);
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch student by ID
      .addCase(fetchStudentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.selectedStudent = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add student
      .addCase(addStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.students.push(action.payload);
        state.loading = false;
        state.stats.totalStudents++;
        state.stats.activeStudents++;
        state.stats.newThisMonth++;
        state.formData = {
          personal: {},
          academic: {},
          parent: {},
          transport: {},
          fee: {}
        };
        state.formErrors = {};
      })
      .addCase(addStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update student
      .addCase(updateStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const { id, ...updatedData } = action.payload;
        const index = state.students.findIndex(student => student.id === id);
        
        if (index !== -1) {
          state.students[index] = { ...state.students[index], ...updatedData };
          
          // If this is the currently selected student, update that too
          if (state.selectedStudent?.id === id) {
            state.selectedStudent = { ...state.selectedStudent, ...updatedData };
          }
          
          // Update stats if status changed
          if (updatedData.status) {
            if (updatedData.status === 'active') {
              state.stats.activeStudents++;
              state.stats.inactiveStudents--;
            } else if (updatedData.status === 'inactive') {
              state.stats.activeStudents--;
              state.stats.inactiveStudents++;
            }
          }
        }
        
        state.loading = false;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete student
      .addCase(deleteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        const studentId = action.payload;
        const deletedStudent = state.students.find(s => s.id === studentId);
        
        state.students = state.students.filter(student => student.id !== studentId);
        state.stats.totalStudents--;
        
        if (deletedStudent?.status === 'active') {
          state.stats.activeStudents--;
        } else {
          state.stats.inactiveStudents--;
        }
        
        // If the deleted student was in the selected students array, remove it
        const selectedIndex = state.selectedStudents.indexOf(studentId);
        if (selectedIndex !== -1) {
          state.selectedStudents.splice(selectedIndex, 1);
        }
        
        // If the deleted student was the currently selected student, clear it
        if (state.selectedStudent?.id === studentId) {
          state.selectedStudent = null;
        }
        
        state.loading = false;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bulk operations
      .addCase(bulkDeleteStudents.pending, (state) => {
        state.bulkActionLoading = true;
        state.bulkActionError = null;
      })
      .addCase(bulkDeleteStudents.fulfilled, (state, action) => {
        const studentIds = action.payload;
        const deletedStudents = state.students.filter(s => studentIds.includes(s.id));
        
        state.students = state.students.filter(student => !studentIds.includes(student.id));
        state.stats.totalStudents -= studentIds.length;
        state.stats.activeStudents -= deletedStudents.filter(s => s.status === 'active').length;
        state.stats.inactiveStudents -= deletedStudents.filter(s => s.status === 'inactive').length;
        
        // Clear selected students
        state.selectedStudents = state.selectedStudents.filter(
          id => !studentIds.includes(id)
        );
        
        state.bulkActionLoading = false;
      })
      .addCase(bulkDeleteStudents.rejected, (state, action) => {
        state.bulkActionLoading = false;
        state.bulkActionError = action.payload;
      })
      
      .addCase(bulkUpdateStudents.pending, (state) => {
        state.bulkActionLoading = true;
        state.bulkActionError = null;
      })
      .addCase(bulkUpdateStudents.fulfilled, (state, action) => {
        const { studentIds, data } = action.payload;
        
        // Update each student in the list
        state.students = state.students.map(student => {
          if (studentIds.includes(student.id)) {
            return { ...student, ...data };
          }
          return student;
        });
        
        // Update stats if status is being changed
        if (data.status) {
          // Count students whose status is changing
          let activeToInactive = 0;
          let inactiveToActive = 0;
          
          state.students
            .filter(s => studentIds.includes(s.id))
            .forEach(s => {
              if (s.status === 'active' && data.status === 'inactive') activeToInactive++;
              if (s.status === 'inactive' && data.status === 'active') inactiveToActive++;
            });
          
          state.stats.activeStudents += inactiveToActive - activeToInactive;
          state.stats.inactiveStudents += activeToInactive - inactiveToActive;
        }
        
        state.bulkActionLoading = false;
      })
      .addCase(bulkUpdateStudents.rejected, (state, action) => {
        state.bulkActionLoading = false;
        state.bulkActionError = action.payload;
      });
  },
});

export const {
  selectStudent,
  clearSelectedStudent,
  setFilters,
  clearFilters,
  setFormStep,
  setAllFormData,
  updateFormData,
  setFormErrors,
  clearFormData,
  addUploadedFile,
  removeUploadedFile,
  clearUploadedFiles,
  setPagination,
  toggleStudentSelection,
  selectAllStudents: selectAllStudentsAction,
  clearSelectedStudents
} = studentSlice.actions;

export default studentSlice.reducer;

// Selectors
// Main selectors
export const selectStudentsState = (state) => state.students;
export const selectAllStudents = (state) => state.students.students;
export const selectFilteredStudents = (state) => {
  const { students } = state.students;
  const { class: classFilter, section, status, transport, feeStatus, searchTerm, dateRange } = state.students.filters;
  
  return students.filter(student => {
    // Filter by class
    const matchesClass = classFilter === 'all' || student.class.split('-')[0] === classFilter;
    
    // Filter by section
    const matchesSection = section === 'all' || student.section === section;
    
    // Filter by status
    const matchesStatus = status === 'all' || student.status === status;
    
    // Filter by transport
    const matchesTransport = transport === 'all' ||
      (transport === 'bus' && student.busAssigned) ||
      (transport === 'non-bus' && !student.busAssigned);
    
    // Filter by fee status
    const matchesFeeStatus = feeStatus === 'all' || student.feeStatus === feeStatus;
    
    // Filter by search term
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.rfidTag && student.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by admission date range
    let matchesDateRange = true;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      const admissionDate = new Date(student.admissionDate);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      matchesDateRange = admissionDate >= startDate && admissionDate <= endDate;
    }
    
    return matchesClass && matchesSection && matchesStatus && matchesTransport && 
      matchesFeeStatus && matchesSearch && matchesDateRange;
  });
};

// Additional selectors
export const selectStudentStats = (state) => state.students.stats;
export const selectPagination = (state) => state.students.pagination;
export const selectSelectedStudents = (state) => state.students.selectedStudents;
export const selectStudentFormData = (state) => state.students.formData;
export const selectFormErrors = (state) => state.students.formErrors;
export const selectCurrentFormStep = (state) => state.students.formStep;
export const selectUploadedFiles = (state) => state.students.uploadedFiles;
export const selectStudentById = (state, studentId) => 
  state.students.students.find(student => student.id === studentId);

// Select only students for current page based on pagination
export const selectPaginatedStudents = (state) => {
  const { students } = state.students;
  const { currentPage, rowsPerPage } = state.students.pagination;
  
  const filteredStudents = selectFilteredStudents(state);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  
  return filteredStudents.slice(startIndex, endIndex);
};

// Is a specific student selected (for bulk operations)
export const isStudentSelected = (state, studentId) => 
  state.students.selectedStudents.includes(studentId);

// Are all current students selected
export const areAllStudentsSelected = (state) => {
  const filtered = selectFilteredStudents(state);
  const selected = state.students.selectedStudents;
  
  // All are selected if every filtered student's ID is in the selected array
  return filtered.length > 0 && filtered.every(student => selected.includes(student.id));
};
