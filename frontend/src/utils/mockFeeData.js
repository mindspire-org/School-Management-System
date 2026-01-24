// Mock data for fee structure and payment history

// Student fee structure details
export const mockFeeStructure = {
  tuitionFee: {
    amount: 45000,
    status: 'paid',
    description: 'Monthly tuition fee',
    paymentHistory: [
      {
        receipt: 'RCPT-001',
        date: '2024-10-15',
        amount: 45000,
        method: 'Bank Transfer',
        transactionId: 'TXN-123456',
        receivedBy: 'Mr. Ahmed (Accountant)',
        status: 'verified',
      }
    ]
  },
  transportFee: {
    amount: 15000,
    status: 'pending',
    description: 'Monthly transport fee',
    busNumber: '#101',
    route: 'Main Route A',
    paymentHistory: []
  },
  admissionCharges: {
    amount: 10000,
    status: 'paid',
    description: 'One-time admission fee',
    paymentHistory: [
      {
        receipt: 'RCPT-002',
        date: '2024-01-15',
        amount: 10000,
        method: 'Cash',
        transactionId: '-',
        receivedBy: 'Ms. Fatima (Admin Officer)',
        status: 'verified',
      }
    ]
  },
  examinationFee: {
    amount: 5000,
    status: 'paid',
    description: 'Term examination fee',
    paymentHistory: [
      {
        receipt: 'RCPT-003',
        date: '2024-09-20',
        amount: 5000,
        method: 'Online',
        transactionId: 'ONL-789012',
        receivedBy: 'System',
        status: 'verified',
      }
    ]
  },
  libraryFee: {
    amount: 3000,
    status: 'pending',
    description: 'Annual library fee',
    paymentHistory: []
  },
  sportsFee: {
    amount: 2000,
    status: 'pending',
    description: 'Annual sports and activity fee',
    paymentHistory: []
  },
  miscCharges: {
    amount: 5000,
    status: 'paid',
    description: 'Miscellaneous charges',
    details: [
      { description: 'Uniform Fee', amount: 2000 },
      { description: 'ID Card Renewal', amount: 500 },
      { description: 'Lab Consumables', amount: 1500 },
      { description: 'Student Handbook', amount: 1000 }
    ],
    paymentHistory: [
      {
        receipt: 'RCPT-004',
        date: '2024-08-25',
        amount: 5000,
        method: 'Cheque',
        transactionId: 'CHQ-456789',
        receivedBy: 'Mr. Ahmed (Accountant)',
        status: 'verified',
      }
    ]
  }
};

// Payment installment timeline
export const mockInstallments = [
  {
    month: 'August',
    dueDate: '2024-08-01',
    amount: 10000,
    status: 'paid',
    paymentMethod: 'Bank Transfer',
    paymentDate: '2024-07-25',
  },
  {
    month: 'September',
    dueDate: '2024-09-01',
    amount: 10000,
    status: 'paid',
    paymentMethod: 'Online',
    paymentDate: '2024-09-03',
  },
  {
    month: 'October',
    dueDate: '2024-10-01',
    amount: 10000,
    status: 'paid',
    paymentMethod: 'Cash',
    paymentDate: '2024-10-01',
  },
  {
    month: 'November',
    dueDate: '2024-11-01',
    amount: 10000,
    status: 'pending',
    paymentMethod: null,
    paymentDate: null,
  },
  {
    month: 'December',
    dueDate: '2024-12-01',
    amount: 10000,
    status: 'pending',
    paymentMethod: null,
    paymentDate: null,
  },
  {
    month: 'January',
    dueDate: '2025-01-01',
    amount: 10000,
    status: 'pending',
    paymentMethod: null,
    paymentDate: null,
  }
];

// Payment history for student
export const mockPaymentHistory = [
  {
    receiptNo: 'RCPT-001',
    paymentDate: 'Oct 15, 2024',
    description: 'Monthly Fee - October 2024',
    amountPaid: 10000,
    paymentMethod: 'Cash',
    transactionNo: '-',
    receivedBy: 'Mr. Ahmed (Accountant)',
    status: 'verified',
  },
  {
    receiptNo: 'RCPT-002',
    paymentDate: 'Sep 03, 2024',
    description: 'Monthly Fee - September 2024',
    amountPaid: 10000,
    paymentMethod: 'Online',
    transactionNo: 'ONL-789012',
    receivedBy: 'System',
    status: 'verified',
  },
  {
    receiptNo: 'RCPT-003',
    paymentDate: 'Sep 20, 2024',
    description: 'Examination Fee - Term 1',
    amountPaid: 5000,
    paymentMethod: 'Online',
    transactionNo: 'ONL-789034',
    receivedBy: 'System',
    status: 'verified',
  },
  {
    receiptNo: 'RCPT-004',
    paymentDate: 'Aug 25, 2024',
    description: 'Miscellaneous Charges',
    amountPaid: 5000,
    paymentMethod: 'Cheque',
    transactionNo: 'CHQ-456789',
    receivedBy: 'Mr. Ahmed (Accountant)',
    status: 'verified',
  },
  {
    receiptNo: 'RCPT-005',
    paymentDate: 'Jul 25, 2024',
    description: 'Monthly Fee - August 2024',
    amountPaid: 10000,
    paymentMethod: 'Bank Transfer',
    transactionNo: 'TXN-123456',
    receivedBy: 'Ms. Fatima (Admin Officer)',
    status: 'verified',
  },
  {
    receiptNo: 'RCPT-006',
    paymentDate: 'Jan 15, 2024',
    description: 'Admission Fee',
    amountPaid: 10000,
    paymentMethod: 'Cash',
    transactionNo: '-',
    receivedBy: 'Ms. Fatima (Admin Officer)',
    status: 'verified',
  }
];

// Applied discounts
export const mockDiscounts = [
  {
    type: 'Sibling Discount',
    amount: 5000,
    percentage: 10,
    reason: 'Second child enrolled in school',
    approvedBy: 'Principal',
    approvalDate: '2024-01-20',
    status: 'active',
    expiryDate: '2025-01-20'
  }
];
