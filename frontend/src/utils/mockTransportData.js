// Mock data for student transport assignment

// Current transport assignment
export const mockTransportAssignment = {
  status: 'assigned',
  busNumber: '101',
  rfidStatus: 'active',
  cardNumber: 'RFID-001',
  monthlyFee: 3000,
  feeStatus: 'paid',
  busDetails: {
    busNumber: '101',
    busModel: 'Toyota Coaster 2022',
    registrationNumber: 'LXR-5432',
    driverName: 'Muhammad Asif',
    driverPhone: '+92 300 1234567',
    driverPhoto: 'https://bit.ly/ryan-florence',
    capacity: 35,
    currentOccupancy: 28
  },
  routeDetails: {
    name: 'Main Route A',
    totalStops: 12,
    totalDistance: '15 km',
    estimatedTime: '45 minutes'
  },
  pickupDetails: {
    stopName: 'Model Town Stop',
    stopAddress: 'Main Boulevard, Model Town',
    scheduledTime: '07:45 AM',
    distanceFromSchool: '8 km'
  },
  dropDetails: {
    stopName: 'Model Town Stop',
    stopAddress: 'Main Boulevard, Model Town',
    scheduledTime: '02:30 PM',
    distanceFromSchool: '8 km'
  }
};

// RFID card information
export const mockRfidCard = {
  cardNumber: 'RFID-001',
  issueDate: '2024-01-15',
  expiryDate: '2025-01-15',
  status: 'active',
  lastScanned: '2024-11-11T08:15:00',
  totalScans: 250,
  scanHistory: [
    {
      date: '2024-11-11',
      time: '08:15:00',
      type: 'check-in',
      location: 'Bus 101',
      status: 'success'
    },
    {
      date: '2024-11-10',
      time: '14:30:00',
      type: 'check-out',
      location: 'Bus 101',
      status: 'success'
    },
    {
      date: '2024-11-10',
      time: '08:12:00',
      type: 'check-in',
      location: 'Bus 101',
      status: 'success'
    },
    {
      date: '2024-11-09',
      time: '14:32:00',
      type: 'check-out',
      location: 'Bus 101',
      status: 'success'
    },
    {
      date: '2024-11-09',
      time: '08:18:00',
      type: 'check-in',
      location: 'Bus 101',
      status: 'success'
    }
  ]
};

// Transport attendance logs
export const mockTransportLogs = [
  {
    date: '2024-11-11',
    day: 'Monday',
    busNumber: '101',
    pickupStatus: 'on-time',
    pickupTime: '07:45 AM',
    rfidScanPickup: {
      time: '07:45 AM',
      status: 'success',
      location: 'Bus 101'
    },
    dropStatus: 'on-time',
    dropTime: '02:30 PM',
    rfidScanDrop: {
      time: '02:30 PM',
      status: 'success',
      location: 'Bus 101'
    },
    journeyDuration: '25 minutes',
    notes: ''
  },
  {
    date: '2024-11-10',
    day: 'Sunday',
    busNumber: '-',
    pickupStatus: '-',
    pickupTime: '-',
    rfidScanPickup: null,
    dropStatus: '-',
    dropTime: '-',
    rfidScanDrop: null,
    journeyDuration: '-',
    notes: 'Weekend - No School'
  },
  {
    date: '2024-11-09',
    day: 'Saturday',
    busNumber: '-',
    pickupStatus: '-',
    pickupTime: '-',
    rfidScanPickup: null,
    dropStatus: '-',
    dropTime: '-',
    rfidScanDrop: null,
    journeyDuration: '-',
    notes: 'Weekend - No School'
  },
  {
    date: '2024-11-08',
    day: 'Friday',
    busNumber: '101',
    pickupStatus: 'late',
    pickupTime: '07:55 AM',
    rfidScanPickup: {
      time: '07:55 AM',
      status: 'success',
      location: 'Bus 101'
    },
    dropStatus: 'on-time',
    dropTime: '02:30 PM',
    rfidScanDrop: {
      time: '02:30 PM',
      status: 'success',
      location: 'Bus 101'
    },
    journeyDuration: '30 minutes',
    notes: 'Bus delayed due to traffic'
  },
  {
    date: '2024-11-07',
    day: 'Thursday',
    busNumber: '101',
    pickupStatus: 'on-time',
    pickupTime: '07:45 AM',
    rfidScanPickup: {
      time: '07:45 AM',
      status: 'success',
      location: 'Bus 101'
    },
    dropStatus: 'on-time',
    dropTime: '02:30 PM',
    rfidScanDrop: {
      time: '02:30 PM',
      status: 'success',
      location: 'Bus 101'
    },
    journeyDuration: '25 minutes',
    notes: ''
  },
  {
    date: '2024-11-06',
    day: 'Wednesday',
    busNumber: '101',
    pickupStatus: 'missed',
    pickupTime: '-',
    rfidScanPickup: null,
    dropStatus: '-',
    dropTime: '-',
    rfidScanDrop: null,
    journeyDuration: '-',
    notes: 'Student absent from school'
  },
  {
    date: '2024-11-05',
    day: 'Tuesday',
    busNumber: '101',
    pickupStatus: 'on-time',
    pickupTime: '07:43 AM',
    rfidScanPickup: {
      time: '07:43 AM',
      status: 'success',
      location: 'Bus 101'
    },
    dropStatus: 'on-time',
    dropTime: '02:32 PM',
    rfidScanDrop: {
      time: '02:32 PM',
      status: 'success',
      location: 'Bus 101'
    },
    journeyDuration: '27 minutes',
    notes: ''
  }
];

// Available buses for assignment
export const mockAvailableBuses = [
  {
    busId: 'bus_001',
    busNumber: '101',
    route: 'Main Route A',
    availableSeats: 7,
    driverName: 'Muhammad Asif',
    stops: [
      { id: 1, name: 'School', time: '07:30 AM', address: 'School Campus' },
      { id: 2, name: 'Model Town Stop', time: '07:45 AM', address: 'Main Boulevard, Model Town' },
      { id: 3, name: 'Johar Town Stop', time: '08:00 AM', address: 'G Block, Johar Town' },
      { id: 4, name: 'Valencia Stop', time: '08:15 AM', address: 'Valencia Housing Society' }
    ],
    monthlyFee: 3000
  },
  {
    busId: 'bus_002',
    busNumber: '102',
    route: 'Main Route B',
    availableSeats: 12,
    driverName: 'Ahmed Khan',
    stops: [
      { id: 1, name: 'School', time: '07:30 AM', address: 'School Campus' },
      { id: 2, name: 'DHA Phase 5 Stop', time: '07:45 AM', address: 'CCA, DHA Phase 5' },
      { id: 3, name: 'Bahria Town Stop', time: '08:00 AM', address: 'Bahria Town Main Gate' },
      { id: 4, name: 'Lake City Stop', time: '08:15 AM', address: 'Lake City Housing Scheme' }
    ],
    monthlyFee: 3500
  },
  {
    busId: 'bus_003',
    busNumber: '103',
    route: 'Main Route C',
    availableSeats: 5,
    driverName: 'Arshad Ali',
    stops: [
      { id: 1, name: 'School', time: '07:30 AM', address: 'School Campus' },
      { id: 2, name: 'Gulberg Stop', time: '07:40 AM', address: 'Liberty Market, Gulberg' },
      { id: 3, name: 'Garden Town Stop', time: '07:55 AM', address: 'Garden Town Main Boulevard' },
      { id: 4, name: 'Wapda Town Stop', time: '08:10 AM', address: 'Wapda Town Main Gate' }
    ],
    monthlyFee: 2800
  }
];

// Parent notification preferences
export const mockNotificationPreferences = {
  notifyOnPickup: true,
  notifyOnDrop: true,
  notifyIfMissed: true,
  notifyOnRouteChanges: true,
  dailySummary: false,
  methods: {
    sms: true,
    email: true,
    appPush: true,
    whatsApp: false
  },
  primaryContact: {
    relation: 'father',
    name: 'Khan Sahab',
    phone: '+92 300 1234567'
  },
  secondaryContact: {
    relation: 'mother',
    name: 'Mrs. Khan',
    phone: '+92 300 7654321'
  }
};

// Emergency contacts
export const mockEmergencyContacts = {
  transportOffice: '+92 321 1234567',
  driverContact: '+92 300 1234567',
  alternativePickup: 'Grandfather may pick up in emergency (ID required)',
  specialInstructions: 'Student has mild asthma, inhaler in school bag. Do not seat near AC vent.',
  authorizedPersons: [
    { name: 'Khan Sahab', relation: 'Father', phone: '+92 300 1234567', authorized: true },
    { name: 'Mrs. Khan', relation: 'Mother', phone: '+92 300 7654321', authorized: true },
    { name: 'Ali Khan', relation: 'Elder Brother', phone: '+92 333 1234567', authorized: true }
  ]
};
