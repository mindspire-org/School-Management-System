import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions (replace with actual API calls)
const fetchStudentFeesAPI = async (studentId, filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockFees = {
        studentId,
        feePlan: {
          name: 'Standard',
          academicYear: '2024-2025',
          totalAnnualFee: 85000,
          transportFee: 15000,
          admissionFee: 5000,
          examFee: 3000,
          libraryFee: 2000,
          sportsFee: 1500,
          labFee: 3500,
          miscFees: 2000,
          monthlyInstallment: 8500,
          paymentSchedule: 'monthly', // monthly, quarterly, half-yearly, annually
          discount: {
            type: 'percentage', // percentage, fixed, scholarship
            value: 10,
            reason: 'Sibling discount',
            approvedBy: 'Principal',
            appliedTo: ['tuitionFee', 'transportFee'] // Fees to which discount applies
          },
          notes: 'Annual increase of 5% applies next year'
        },
        summary: {
          totalAnnualDue: 85000,
          totalAnnualPaid: 34000,
          totalAnnualBalance: 51000,
          currentDue: 8500,
          currentPaid: 0,
          currentBalance: 8500,
          overdueAmount: 0,
          lastPaymentAmount: 8500,
          lastPaymentDate: '2024-02-15',
          nextDueDate: '2024-03-15'
        },
        transactions: generateTransactions(studentId, filters),
        invoices: generateInvoices(studentId, filters),
        feeSchedule: generateFeeSchedule()
      };
      
      resolve(mockFees);
    }, 600);
  });
};

// Helper functions to generate mock data
function generateTransactions(studentId, filters = {}) {
  const transactions = [
    {
      id: 'txn_001',
      date: '2024-01-15',
      amount: 18500, // First month + admission fee
      method: 'Bank Transfer',
      referenceNo: 'BT20240115001',
      description: 'January 2024 fees + Admission fee',
      status: 'completed',
      receiptNo: 'REC-2024-001',
      paidBy: 'Khan Sahab (Father)',
      receivedBy: 'Finance Office',
      breakdown: [
        { type: 'Admission Fee', amount: 5000 },
        { type: 'Tuition Fee', amount: 8500 },
        { type: 'Transport Fee', amount: 5000 }
      ]
    },
    {
      id: 'txn_002',
      date: '2024-02-15',
      amount: 8500, // Monthly fee
      method: 'Cash',
      referenceNo: 'CASH20240215001',
      description: 'February 2024 fees',
      status: 'completed',
      receiptNo: 'REC-2024-122',
      paidBy: 'Khan Sahab (Father)',
      receivedBy: 'Finance Office',
      breakdown: [
        { type: 'Tuition Fee', amount: 8500 }
      ]
    },
    {
      id: 'txn_003',
      date: '2024-02-15',
      amount: 7000, // Transport fee for March-April
      method: 'Cash',
      referenceNo: 'CASH20240215002',
      description: 'Transport fee March-April 2024',
      status: 'completed',
      receiptNo: 'REC-2024-123',
      paidBy: 'Khan Sahab (Father)',
      receivedBy: 'Finance Office',
      breakdown: [
        { type: 'Transport Fee', amount: 7000 }
      ]
    }
  ];
  
  // Apply filters if provided
  let filteredTransactions = [...transactions];
  
  if (filters.startDate && filters.endDate) {
    filteredTransactions = filteredTransactions.filter(txn => {
      const txnDate = new Date(txn.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      return txnDate >= startDate && txnDate <= endDate;
    });
  }
  
  if (filters.status) {
    filteredTransactions = filteredTransactions.filter(txn => 
      txn.status === filters.status
    );
  }
  
  if (filters.paymentMethod) {
    filteredTransactions = filteredTransactions.filter(txn => 
      txn.method === filters.paymentMethod
    );
  }
  
  return filteredTransactions;
}

function generateInvoices(studentId, filters = {}) {
  const invoices = [
    {
      id: 'inv_001',
      invoiceNo: 'INV-2024-001',
      date: '2024-01-10',
      dueDate: '2024-01-15',
      totalAmount: 18500,
      paidAmount: 18500,
      balance: 0,
      status: 'paid',
      items: [
        { description: 'Admission Fee', amount: 5000 },
        { description: 'Tuition Fee - January 2024', amount: 8500 },
        { description: 'Transport Fee - January 2024', amount: 5000 }
      ],
      paymentHistory: [
        { date: '2024-01-15', amount: 18500, method: 'Bank Transfer', txnId: 'txn_001' }
      ]
    },
    {
      id: 'inv_002',
      invoiceNo: 'INV-2024-122',
      date: '2024-02-01',
      dueDate: '2024-02-15',
      totalAmount: 8500,
      paidAmount: 8500,
      balance: 0,
      status: 'paid',
      items: [
        { description: 'Tuition Fee - February 2024', amount: 8500 }
      ],
      paymentHistory: [
        { date: '2024-02-15', amount: 8500, method: 'Cash', txnId: 'txn_002' }
      ]
    },
    {
      id: 'inv_003',
      invoiceNo: 'INV-2024-123',
      date: '2024-02-01',
      dueDate: '2024-02-15',
      totalAmount: 10000,
      paidAmount: 7000,
      balance: 3000,
      status: 'partially_paid',
      items: [
        { description: 'Transport Fee - March & April 2024', amount: 10000 }
      ],
      paymentHistory: [
        { date: '2024-02-15', amount: 7000, method: 'Cash', txnId: 'txn_003' }
      ]
    },
    {
      id: 'inv_004',
      invoiceNo: 'INV-2024-245',
      date: '2024-03-01',
      dueDate: '2024-03-15',
      totalAmount: 8500,
      paidAmount: 0,
      balance: 8500,
      status: 'unpaid',
      items: [
        { description: 'Tuition Fee - March 2024', amount: 8500 }
      ],
      paymentHistory: []
    }
  ];
  
  // Apply filters if provided
  let filteredInvoices = [...invoices];
  
  if (filters.startDate && filters.endDate) {
    filteredInvoices = filteredInvoices.filter(inv => {
      const invDate = new Date(inv.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      return invDate >= startDate && invDate <= endDate;
    });
  }
  
  if (filters.status) {
    filteredInvoices = filteredInvoices.filter(inv => 
      inv.status === filters.status
    );
  }
  
  return filteredInvoices;
}

function generateFeeSchedule() {
  const schedule = [];
  const startDate = new Date('2024-01-01');
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);
    
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    
    schedule.push({
      id: `schedule_${i + 1}`,
      month,
      year,
      dueDate: `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-15`,
      amount: 8500,
      status: i < 3 ? 'paid' : (i === 3 ? 'due' : 'upcoming'),
      paidDate: i < 3 ? `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-15` : null
    });
  }
  
  return schedule;
}

// Async thunks
export const fetchStudentFees = createAsyncThunk(
  'studentFees/fetchFees',
  async ({ studentId, filters = {} }, { rejectWithValue }) => {
    try {
      const fees = await fetchStudentFeesAPI(studentId, filters);
      return fees;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordPayment = createAsyncThunk(
  'studentFees/recordPayment',
  async ({ studentId, paymentData }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate transaction and receipt numbers
      const txnId = `txn_${Date.now()}`;
      const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newTransaction = {
        id: txnId,
        date: new Date().toISOString().split('T')[0],
        ...paymentData,
        receiptNo,
        status: 'completed'
      };
      
      return { studentId, transaction: newTransaction };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateInvoice = createAsyncThunk(
  'studentFees/generateInvoice',
  async ({ studentId, invoiceData }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate invoice number
      const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newInvoice = {
        id: `inv_${Date.now()}`,
        invoiceNo,
        date: new Date().toISOString().split('T')[0],
        ...invoiceData,
        paidAmount: 0,
        balance: invoiceData.totalAmount,
        status: 'unpaid',
        paymentHistory: []
      };
      
      return { studentId, invoice: newInvoice };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentStudentId: null,
  feePlan: {
    name: '',
    academicYear: '',
    totalAnnualFee: 0,
    transportFee: 0,
    admissionFee: 0,
    examFee: 0,
    libraryFee: 0,
    sportsFee: 0,
    labFee: 0,
    miscFees: 0,
    monthlyInstallment: 0,
    paymentSchedule: 'monthly',
    discount: {
      type: '',
      value: 0,
      reason: '',
      approvedBy: '',
      appliedTo: []
    },
    notes: ''
  },
  summary: {
    totalAnnualDue: 0,
    totalAnnualPaid: 0,
    totalAnnualBalance: 0,
    currentDue: 0,
    currentPaid: 0,
    currentBalance: 0,
    overdueAmount: 0,
    lastPaymentAmount: 0,
    lastPaymentDate: '',
    nextDueDate: ''
  },
  transactions: [],
  invoices: [],
  feeSchedule: [],
  filters: {
    startDate: '',
    endDate: '',
    status: '',
    paymentMethod: ''
  },
  loading: false,
  error: null,
  processingPayment: false,
  processingPaymentError: null,
  generatingInvoice: false,
  generatingInvoiceError: null
};

const studentFeesSlice = createSlice({
  name: 'studentFees',
  initialState,
  reducers: {
    setFeesFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFeesFilters(state) {
      state.filters = {
        startDate: '',
        endDate: '',
        status: '',
        paymentMethod: ''
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch student fees
      .addCase(fetchStudentFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentFees.fulfilled, (state, action) => {
        const { 
          studentId, 
          feePlan, 
          summary, 
          transactions, 
          invoices, 
          feeSchedule 
        } = action.payload;
        
        state.currentStudentId = studentId;
        state.feePlan = feePlan;
        state.summary = summary;
        state.transactions = transactions;
        state.invoices = invoices;
        state.feeSchedule = feeSchedule;
        state.loading = false;
      })
      .addCase(fetchStudentFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Record payment
      .addCase(recordPayment.pending, (state) => {
        state.processingPayment = true;
        state.processingPaymentError = null;
      })
      .addCase(recordPayment.fulfilled, (state, action) => {
        const { transaction } = action.payload;
        
        // Add new transaction
        state.transactions.unshift(transaction);
        
        // Update invoice if payment is linked to an invoice
        if (transaction.invoiceId) {
          const invoiceIndex = state.invoices.findIndex(inv => inv.id === transaction.invoiceId);
          
          if (invoiceIndex !== -1) {
            // Add to payment history
            if (!state.invoices[invoiceIndex].paymentHistory) {
              state.invoices[invoiceIndex].paymentHistory = [];
            }
            
            state.invoices[invoiceIndex].paymentHistory.push({
              date: transaction.date,
              amount: transaction.amount,
              method: transaction.method,
              txnId: transaction.id
            });
            
            // Update paid amount and balance
            state.invoices[invoiceIndex].paidAmount += transaction.amount;
            state.invoices[invoiceIndex].balance = 
              state.invoices[invoiceIndex].totalAmount - state.invoices[invoiceIndex].paidAmount;
            
            // Update status
            if (state.invoices[invoiceIndex].balance <= 0) {
              state.invoices[invoiceIndex].status = 'paid';
            } else {
              state.invoices[invoiceIndex].status = 'partially_paid';
            }
          }
        }
        
        // Update summary information
        state.summary.totalAnnualPaid += transaction.amount;
        state.summary.totalAnnualBalance -= transaction.amount;
        state.summary.lastPaymentAmount = transaction.amount;
        state.summary.lastPaymentDate = transaction.date;
        
        // If this payment covers current due
        if (state.summary.currentDue > 0) {
          const amountToReduceCurrent = Math.min(transaction.amount, state.summary.currentDue);
          state.summary.currentPaid += amountToReduceCurrent;
          state.summary.currentBalance -= amountToReduceCurrent;
        }
        
        // Reduce any overdue amount if applicable
        if (state.summary.overdueAmount > 0) {
          const amountLeftAfterCurrent = transaction.amount - (state.summary.currentDue - state.summary.currentPaid);
          if (amountLeftAfterCurrent > 0) {
            state.summary.overdueAmount -= Math.min(amountLeftAfterCurrent, state.summary.overdueAmount);
          }
        }
        
        state.processingPayment = false;
      })
      .addCase(recordPayment.rejected, (state, action) => {
        state.processingPayment = false;
        state.processingPaymentError = action.payload;
      })
      
      // Generate invoice
      .addCase(generateInvoice.pending, (state) => {
        state.generatingInvoice = true;
        state.generatingInvoiceError = null;
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        const { invoice } = action.payload;
        
        // Add new invoice
        state.invoices.unshift(invoice);
        
        // Update summary information
        state.summary.totalAnnualDue += invoice.totalAmount;
        state.summary.totalAnnualBalance += invoice.totalAmount;
        
        // If due date is current month, update current due
        const currentMonth = new Date().getMonth();
        const invoiceMonth = new Date(invoice.dueDate).getMonth();
        
        if (currentMonth === invoiceMonth) {
          state.summary.currentDue += invoice.totalAmount;
          state.summary.currentBalance += invoice.totalAmount;
        }
        
        state.generatingInvoice = false;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.generatingInvoice = false;
        state.generatingInvoiceError = action.payload;
      });
  }
});

export const { 
  setFeesFilters,
  clearFeesFilters
} = studentFeesSlice.actions;

export default studentFeesSlice.reducer;

// Selectors
export const selectFeesSummary = (state) => state.studentFees.summary;
export const selectFeePlan = (state) => state.studentFees.feePlan;
export const selectTransactions = (state) => state.studentFees.transactions;
export const selectInvoices = (state) => state.studentFees.invoices;
export const selectFeeSchedule = (state) => state.studentFees.feeSchedule;
export const selectFeesLoading = (state) => state.studentFees.loading;
export const selectProcessingPayment = (state) => state.studentFees.processingPayment;
export const selectFeesFilters = (state) => state.studentFees.filters;

// Filter transactions based on current filters
export const selectFilteredTransactions = (state) => {
  const { transactions } = state.studentFees;
  const { startDate, endDate, status, paymentMethod } = state.studentFees.filters;
  
  return transactions.filter(transaction => {
    // Filter by date range
    let matchesDateRange = true;
    if (startDate && endDate) {
      const txnDate = new Date(transaction.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDateRange = txnDate >= start && txnDate <= end;
    }
    
    // Filter by status
    const matchesStatus = !status || transaction.status === status;
    
    // Filter by payment method
    const matchesMethod = !paymentMethod || transaction.method === paymentMethod;
    
    return matchesDateRange && matchesStatus && matchesMethod;
  });
};

// Filter invoices based on current filters
export const selectFilteredInvoices = (state) => {
  const { invoices } = state.studentFees;
  const { startDate, endDate, status } = state.studentFees.filters;
  
  return invoices.filter(invoice => {
    // Filter by date range
    let matchesDateRange = true;
    if (startDate && endDate) {
      const invDate = new Date(invoice.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matchesDateRange = invDate >= start && invDate <= end;
    }
    
    // Filter by status
    const matchesStatus = !status || invoice.status === status;
    
    return matchesDateRange && matchesStatus;
  });
};

// Get upcoming fees from the fee schedule
export const selectUpcomingFees = (state) => {
  return state.studentFees.feeSchedule.filter(item => 
    item.status === 'upcoming' || item.status === 'due'
  ).slice(0, 3); // Get next 3 upcoming fees
};
