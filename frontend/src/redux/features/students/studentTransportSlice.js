import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions (replace with actual API calls)
const fetchStudentTransportAPI = async (studentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockTransportData = {
        studentId,
        transportInfo: {
          usesTransport: true,
          busNumber: '101',
          route: {
            id: 'route_1',
            name: 'Route A - Gulshan to School',
            description: 'Covers Gulshan-e-Iqbal, Gulistan-e-Johar, and surrounding areas',
            distance: '12.5 km',
            estimatedTime: '35 min'
          },
          pickupPoint: {
            id: 'stop_3',
            name: 'Stop 3 - Main Boulevard',
            location: 'Main Boulevard, Block 13-D, Gulshan-e-Iqbal',
            coordinates: '24.9204, 67.0971',
            landmark: 'Opposite to Imtiaz Super Market'
          },
          dropPoint: {
            id: 'stop_3',
            name: 'Stop 3 - Main Boulevard',
            location: 'Main Boulevard, Block 13-D, Gulshan-e-Iqbal',
            coordinates: '24.9204, 67.0971',
            landmark: 'Opposite to Imtiaz Super Market'
          },
          pickupTime: '07:15 AM',
          dropTime: '02:45 PM',
          driverInfo: {
            name: 'Ahmed Khan',
            phone: '+92 333 1234567',
            license: 'DL-2020-12345',
            experience: '8 years'
          },
          conductorInfo: {
            name: 'Ali Hassan',
            phone: '+92 333 7654321'
          },
          vehicleInfo: {
            busNumber: '101',
            model: 'Toyota Coaster 2019',
            capacity: 30,
            registrationNumber: 'BKA-456',
            lastMaintenance: '2024-01-15',
            features: ['AC', 'CCTV', 'GPS Tracking', 'First Aid Kit']
          }
        },
        tripHistory: generateTripHistory(studentId),
        feeHistory: generateFeeHistory(studentId),
        busTracking: generateBusTracking()
      };
      
      resolve(mockTransportData);
    }, 700);
  });
};

// Helper functions to generate mock data
function generateTripHistory(studentId) {
  const trips = [];
  const startDate = new Date('2024-01-15');
  const today = new Date();
  
  // Generate trips for each day (excluding weekends) from startDate to today
  let currentDate = new Date(startDate);
  
  while (currentDate <= today) {
    // Skip weekends (Saturday and Sunday)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const boardingStatus = Math.random() > 0.1; // 90% chance of boarding
      const isLate = boardingStatus && Math.random() > 0.9; // 10% chance of being late if boarded
      
      trips.push({
        date: currentDate.toISOString().split('T')[0],
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        boardingTime: boardingStatus ? 
          (isLate ? `07:${20 + Math.floor(Math.random() * 10)} AM` : `07:${10 + Math.floor(Math.random() * 10)} AM`) : 
          null,
        dropTime: boardingStatus ? `02:${40 + Math.floor(Math.random() * 10)} PM` : null,
        status: boardingStatus ? 
          (isLate ? 'late_boarding' : 'on_time') : 
          (Math.random() > 0.5 ? 'absent' : 'pickup_missed'),
        pickedFrom: boardingStatus ? 'Stop 3 - Main Boulevard' : null,
        droppedAt: boardingStatus ? 'Stop 3 - Main Boulevard' : null,
        notes: !boardingStatus ? 
          (Math.random() > 0.5 ? 'Parent picked up from school' : 'Absent from school') : 
          ''
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return trips.reverse(); // Most recent first
}

function generateFeeHistory(studentId) {
  return [
    {
      id: 'trans_fee_1',
      period: 'January 2024',
      amount: 5000,
      dueDate: '2024-01-15',
      paidDate: '2024-01-15',
      status: 'paid',
      receipt: 'REC-2024-001',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'trans_fee_2',
      period: 'February 2024',
      amount: 5000,
      dueDate: '2024-02-15',
      paidDate: null,
      status: 'waived',
      receipt: null,
      paymentMethod: null,
      notes: 'Waived due to bus maintenance issues for 7 days'
    },
    {
      id: 'trans_fee_3',
      period: 'March-April 2024',
      amount: 10000,
      dueDate: '2024-03-15',
      paidDate: '2024-02-15',
      status: 'paid',
      receipt: 'REC-2024-123',
      paymentMethod: 'Cash'
    },
    {
      id: 'trans_fee_4',
      period: 'May 2024',
      amount: 5000,
      dueDate: '2024-05-15',
      paidDate: null,
      status: 'unpaid',
      receipt: null,
      paymentMethod: null
    }
  ];
}

function generateBusTracking() {
  // Generate random coordinates near a school location
  const schoolCoordinates = { lat: 24.9204, lng: 67.0971 };
  
  // Random position within 1km radius
  const randomRadius = Math.random() * 0.01; // ~1km
  const randomAngle = Math.random() * Math.PI * 2;
  
  const currentLocation = {
    lat: schoolCoordinates.lat + randomRadius * Math.cos(randomAngle),
    lng: schoolCoordinates.lng + randomRadius * Math.sin(randomAngle)
  };
  
  return {
    busNumber: '101',
    routeName: 'Route A - Gulshan to School',
    currentLocation: {
      coordinates: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
      address: 'Main Boulevard, Block 13-D, Gulshan-e-Iqbal',
      lastUpdated: new Date().toISOString()
    },
    status: Math.random() > 0.8 ? 'stopped' : 'in_transit',
    estimatedArrival: '07:45 AM',
    speed: Math.floor(Math.random() * 40) + 10, // 10-50 km/h
    occupancy: 22,
    totalCapacity: 30,
    nextStop: 'School Main Gate',
    previousStop: 'Stop 4 - Johar Chowrangi'
  };
}

// Async thunks
export const fetchStudentTransport = createAsyncThunk(
  'studentTransport/fetchTransport',
  async (studentId, { rejectWithValue }) => {
    try {
      const transportData = await fetchStudentTransportAPI(studentId);
      return transportData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTransportInfo = createAsyncThunk(
  'studentTransport/updateTransportInfo',
  async ({ studentId, transportInfo }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { studentId, transportInfo };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordTransportFee = createAsyncThunk(
  'studentTransport/recordTransportFee',
  async ({ studentId, feeData }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { 
        studentId, 
        feeRecord: {
          id: `trans_fee_${Date.now()}`,
          ...feeData
        }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentStudentId: null,
  transportInfo: {
    usesTransport: false,
    busNumber: '',
    route: {
      id: '',
      name: '',
      description: '',
      distance: '',
      estimatedTime: ''
    },
    pickupPoint: {
      id: '',
      name: '',
      location: '',
      coordinates: '',
      landmark: ''
    },
    dropPoint: {
      id: '',
      name: '',
      location: '',
      coordinates: '',
      landmark: ''
    },
    pickupTime: '',
    dropTime: '',
    driverInfo: {
      name: '',
      phone: '',
      license: '',
      experience: ''
    },
    conductorInfo: {
      name: '',
      phone: ''
    },
    vehicleInfo: {
      busNumber: '',
      model: '',
      capacity: 0,
      registrationNumber: '',
      lastMaintenance: '',
      features: []
    }
  },
  tripHistory: [],
  feeHistory: [],
  busTracking: null,
  filters: {
    startDate: '',
    endDate: '',
    status: '' // on_time, late_boarding, absent, pickup_missed
  },
  loading: false,
  error: null,
  updatingTransport: false,
  updatingTransportError: null,
  recordingFee: false,
  recordingFeeError: null
};

const studentTransportSlice = createSlice({
  name: 'studentTransport',
  initialState,
  reducers: {
    setTransportFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTransportFilters(state) {
      state.filters = {
        startDate: '',
        endDate: '',
        status: ''
      };
    },
    updateBusTracking(state, action) {
      // This would be called by a real-time update
      state.busTracking = { ...state.busTracking, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch student transport data
      .addCase(fetchStudentTransport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentTransport.fulfilled, (state, action) => {
        const { 
          studentId, 
          transportInfo, 
          tripHistory, 
          feeHistory, 
          busTracking 
        } = action.payload;
        
        state.currentStudentId = studentId;
        state.transportInfo = transportInfo;
        state.tripHistory = tripHistory;
        state.feeHistory = feeHistory;
        state.busTracking = busTracking;
        state.loading = false;
      })
      .addCase(fetchStudentTransport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transport info
      .addCase(updateTransportInfo.pending, (state) => {
        state.updatingTransport = true;
        state.updatingTransportError = null;
      })
      .addCase(updateTransportInfo.fulfilled, (state, action) => {
        state.transportInfo = { 
          ...state.transportInfo, 
          ...action.payload.transportInfo 
        };
        state.updatingTransport = false;
      })
      .addCase(updateTransportInfo.rejected, (state, action) => {
        state.updatingTransport = false;
        state.updatingTransportError = action.payload;
      })
      
      // Record transport fee
      .addCase(recordTransportFee.pending, (state) => {
        state.recordingFee = true;
        state.recordingFeeError = null;
      })
      .addCase(recordTransportFee.fulfilled, (state, action) => {
        state.feeHistory.unshift(action.payload.feeRecord);
        state.recordingFee = false;
      })
      .addCase(recordTransportFee.rejected, (state, action) => {
        state.recordingFee = false;
        state.recordingFeeError = action.payload;
      });
  }
});

export const { 
  setTransportFilters,
  clearTransportFilters,
  updateBusTracking
} = studentTransportSlice.actions;

export default studentTransportSlice.reducer;

// Selectors
export const selectTransportInfo = (state) => state.studentTransport.transportInfo;
export const selectTripHistory = (state) => state.studentTransport.tripHistory;
export const selectFeeHistory = (state) => state.studentTransport.feeHistory;
export const selectBusTracking = (state) => state.studentTransport.busTracking;
export const selectTransportLoading = (state) => state.studentTransport.loading;
export const selectTransportFilters = (state) => state.studentTransport.filters;

// Filtered trip history based on current filters
export const selectFilteredTripHistory = (state) => {
  const { tripHistory } = state.studentTransport;
  const { startDate, endDate, status } = state.studentTransport.filters;
  
  return tripHistory.filter(trip => {
    // Filter by date range
    let matchesDateRange = true;
    if (startDate && endDate) {
      const tripDate = new Date(trip.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDateRange = tripDate >= start && tripDate <= end;
    }
    
    // Filter by status
    const matchesStatus = !status || trip.status === status;
    
    return matchesDateRange && matchesStatus;
  });
};

// Trip statistics
export const selectTripStatistics = (state) => {
  const trips = state.studentTransport.tripHistory;
  
  const total = trips.length;
  const onTime = trips.filter(trip => trip.status === 'on_time').length;
  const late = trips.filter(trip => trip.status === 'late_boarding').length;
  const missed = trips.filter(trip => 
    trip.status === 'absent' || trip.status === 'pickup_missed'
  ).length;
  
  return {
    total,
    onTime,
    late,
    missed,
    attendanceRate: total > 0 ? (((onTime + late) / total) * 100).toFixed(1) : '0.0',
    onTimeRate: total > 0 ? ((onTime / total) * 100).toFixed(1) : '0.0',
    lateRate: total > 0 ? ((late / total) * 100).toFixed(1) : '0.0',
    missedRate: total > 0 ? ((missed / total) * 100).toFixed(1) : '0.0'
  };
};
