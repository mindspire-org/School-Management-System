import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions
const fetchFinanceAPI = async () => {
  // Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        feeCollection: {
          total: 1250000,
          collected: 950000,
          pending: 300000,
          overdue: 150000,
        },
        monthlyStats: [
          { month: 'Jan', collected: 85000, pending: 15000 },
          { month: 'Feb', collected: 90000, pending: 10000 },
          { month: 'Mar', collected: 95000, pending: 5000 },
          { month: 'Apr', collected: 80000, pending: 20000 },
          { month: 'May', collected: 82000, pending: 18000 },
          // More monthly data...
        ],
        recentPayments: [
          { 
            id: 1, 
            studentId: 1, 
            amount: 5000, 
            date: '2025-11-05', 
            method: 'Online',
            status: 'completed',
            studentName: 'John Doe',
            feeType: 'Tuition',
          },
          { 
            id: 2, 
            studentId: 2, 
            amount: 4500, 
            date: '2025-11-04', 
            method: 'Cash',
            status: 'completed',
            studentName: 'Jane Smith',
            feeType: 'Tuition',
          },
          // More payment records...
        ],
      });
    }, 1000);
  });
};

// Async thunks
export const fetchFinanceData = createAsyncThunk('finance/fetchData', async (_, { rejectWithValue }) => {
  try {
    const financeData = await fetchFinanceAPI();
    return financeData;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const addPayment = createAsyncThunk('finance/addPayment', async (paymentData, { rejectWithValue }) => {
  try {
    // Replace with actual API call
    const newPayment = { id: Date.now(), ...paymentData, status: 'completed', date: new Date().toISOString().split('T')[0] };
    return newPayment;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const initialState = {
  summary: {
    feeCollection: {
      total: 0,
      collected: 0,
      pending: 0,
      overdue: 0,
    },
    monthlyStats: [],
  },
  recentPayments: [],
  feeStructure: {},
  loading: false,
  error: null,
  selectedInvoice: null,
};

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    setSelectedInvoice: (state, action) => {
      state.selectedInvoice = action.payload;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
    },
    updateFeeStructure: (state, action) => {
      state.feeStructure = { ...state.feeStructure, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch finance data
      .addCase(fetchFinanceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinanceData.fulfilled, (state, action) => {
        const { feeCollection, monthlyStats, recentPayments } = action.payload;
        state.summary.feeCollection = feeCollection;
        state.summary.monthlyStats = monthlyStats;
        state.recentPayments = recentPayments;
        state.loading = false;
      })
      .addCase(fetchFinanceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add payment
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.recentPayments.unshift(action.payload);
        
        // Update summary
        state.summary.feeCollection.collected += action.payload.amount;
        state.summary.feeCollection.pending -= action.payload.amount;
        
        // Update monthly stats
        const month = new Date().toLocaleString('default', { month: 'short' });
        const monthIndex = state.summary.monthlyStats.findIndex(stat => stat.month === month);
        
        if (monthIndex !== -1) {
          state.summary.monthlyStats[monthIndex].collected += action.payload.amount;
          state.summary.monthlyStats[monthIndex].pending -= action.payload.amount;
        }
        
        state.loading = false;
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedInvoice, clearSelectedInvoice, updateFeeStructure } = financeSlice.actions;

export default financeSlice.reducer;
