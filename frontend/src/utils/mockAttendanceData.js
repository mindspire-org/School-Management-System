// Mock attendance data for student attendance tracking
const mockAttendanceData = {
  // Student ID 1
  1: {
    '2025-11-01': { status: 'present', checkIn: '08:30:45', checkOut: '15:05:22' },
    '2025-11-02': { status: 'present', checkIn: '08:25:33', checkOut: '15:10:17' },
    '2025-11-03': { status: 'late', checkIn: '09:15:07', checkOut: '15:08:41' },
    '2025-11-04': { status: 'present', checkIn: '08:32:19', checkOut: '15:00:56' },
    '2025-11-05': { status: 'absent', checkIn: null, checkOut: null },
    '2025-11-06': { status: 'absent', checkIn: null, checkOut: null },
    '2025-11-07': { status: 'present', checkIn: '08:27:51', checkOut: '15:05:32' },
    '2025-11-08': { status: 'weekend', checkIn: null, checkOut: null },
    '2025-11-09': { status: 'weekend', checkIn: null, checkOut: null },
    '2025-11-10': { status: 'present', checkIn: '08:30:15', checkOut: '15:02:47' },
  },
  
  // Student ID 2
  2: {
    '2025-11-01': { status: 'present', checkIn: '08:22:45', checkOut: '15:08:31' },
    '2025-11-02': { status: 'present', checkIn: '08:31:12', checkOut: '15:05:44' },
    '2025-11-03': { status: 'present', checkIn: '08:29:57', checkOut: '15:07:23' },
    '2025-11-04': { status: 'leave', checkIn: null, checkOut: null },
    '2025-11-05': { status: 'leave', checkIn: null, checkOut: null },
    '2025-11-06': { status: 'leave', checkIn: null, checkOut: null },
    '2025-11-07': { status: 'present', checkIn: '08:30:09', checkOut: '15:01:19' },
    '2025-11-08': { status: 'weekend', checkIn: null, checkOut: null },
    '2025-11-09': { status: 'weekend', checkIn: null, checkOut: null },
    '2025-11-10': { status: 'present', checkIn: '08:27:33', checkOut: '15:04:51' },
  },
  
  // Student ID 3
  3: {
    '2025-11-01': { status: 'absent', checkIn: null, checkOut: null },
    '2025-11-02': { status: 'absent', checkIn: null, checkOut: null },
    '2025-11-03': { status: 'present', checkIn: '08:28:47', checkOut: '15:05:21' },
    '2025-11-04': { status: 'present', checkIn: '08:32:11', checkOut: '15:03:43' },
    '2025-11-05': { status: 'present', checkIn: '08:30:56', checkOut: '15:09:27' },
    '2025-11-06': { status: 'late', checkIn: '09:45:23', checkOut: '15:02:18' },
    '2025-11-07': { status: 'present', checkIn: '08:25:49', checkOut: '15:01:33' },
    '2025-11-08': { status: 'weekend', checkIn: null, checkOut: null },
    '2025-11-09': { status: 'weekend', checkIn: null, checkOut: null },
    '2025-11-10': { status: 'present', checkIn: '08:29:17', checkOut: '15:05:44' },
  },
  
  // Add more students as needed...
};

// Generate mock data for current month
const generateCurrentMonthData = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  
  // Number of days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Status options and their weights
  const statusOptions = [
    { status: 'present', weight: 0.75 },
    { status: 'absent', weight: 0.1 },
    { status: 'late', weight: 0.1 },
    { status: 'leave', weight: 0.05 },
  ];
  
  // Function to get random status based on weights
  const getRandomStatus = () => {
    const rand = Math.random();
    let cumulativeWeight = 0;
    
    for (const option of statusOptions) {
      cumulativeWeight += option.weight;
      if (rand <= cumulativeWeight) {
        return option.status;
      }
    }
    
    return 'present'; // Default
  };
  
  // Generate random time between 08:00 and 08:45
  const getRandomCheckInTime = () => {
    const hour = 8;
    const minute = Math.floor(Math.random() * 45);
    const second = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  };
  
  // Generate random time between 15:00 and 15:30
  const getRandomCheckOutTime = () => {
    const hour = 15;
    const minute = Math.floor(Math.random() * 30);
    const second = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  };
  
  // Generate for 10 students
  for (let studentId = 1; studentId <= 10; studentId++) {
    if (!mockAttendanceData[studentId]) {
      mockAttendanceData[studentId] = {};
    }
    
    // Generate data for each day of the month up to current day
    for (let day = 1; day <= currentDay; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        const dateStr = date.toISOString().split('T')[0];
        mockAttendanceData[studentId][dateStr] = { status: 'weekend', checkIn: null, checkOut: null };
        continue;
      }
      
      // Get random status for this day
      const status = getRandomStatus();
      const dateStr = date.toISOString().split('T')[0];
      
      // Set attendance data based on status
      if (status === 'present' || status === 'late') {
        mockAttendanceData[studentId][dateStr] = {
          status: status,
          checkIn: getRandomCheckInTime(),
          checkOut: getRandomCheckOutTime(),
        };
      } else {
        mockAttendanceData[studentId][dateStr] = {
          status: status,
          checkIn: null,
          checkOut: null,
        };
      }
    }
  }
  
  return mockAttendanceData;
};

// Generate current month data
const completeAttendanceData = generateCurrentMonthData();

export { completeAttendanceData as mockAttendanceData };
