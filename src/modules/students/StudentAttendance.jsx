import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  ButtonGroup,
  Input,
  Select,
  Grid,
  GridItem,
  SimpleGrid,
  HStack,
  VStack,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  useColorModeValue,
  IconButton,
  Icon,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Divider,
} from '@chakra-ui/react';

import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { 
  MdCalendarToday, MdAccessTime, MdPersonAdd, MdPerson, 
  MdCheck, MdClose, MdOutlineWatchLater, MdDateRange,
  MdFilterList, MdRefresh, MdDownload, MdPrint
} from 'react-icons/md';

// Import custom components
import AttendanceCalendar from './components/attendance/AttendanceCalendar';
import AttendanceDetailModal from './components/attendance/AttendanceDetailModal';
import * as studentsApi from '../../services/api/students';
import * as attendanceApi from '../../services/api/attendance';
import Card from '../../components/card/Card';
import StatCard from '../../components/card/StatCard';
import BarChart from '../../components/charts/BarChart.tsx';
import PieChart from '../../components/charts/PieChart';
import useClassOptions from '../../hooks/useClassOptions';

const StudentAttendance = () => {
  // States
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterValues, setFilterValues] = useState({
    class: 'all',
    section: 'all',
    attendanceStatus: 'all',
    searchTerm: '',
  });

  // Get today's attendance status for a student
  function getTodayAttendance(studentId) {
    const today = new Date().toISOString().split('T')[0];

    if (attendanceData[studentId] && attendanceData[studentId][today]) {
      return attendanceData[studentId][today];
    }

    return { status: 'not-marked', checkIn: null, checkOut: null };
  }
  
  // Modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const toast = useToast();

  // Dynamic class/section options from backend
  const { classOptions, sectionOptions } = useClassOptions({
    selectedClass: filterValues.class !== 'all' ? filterValues.class : null,
  });
  
  // Load students and today's attendance
  useEffect(() => {
    const load = async () => {
      try {
        const payload = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        setStudents((rows || []).slice(0, 100));
      } catch {}

      // Load last 7 days attendance for all students (drives charts)
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        const payload = await attendanceApi.list({ startDate, endDate });
        const rows = payload?.items || payload?.rows || (Array.isArray(payload) ? payload : []);
        const map = {};
        rows.forEach(r => {
          if (!map[r.studentId]) map[r.studentId] = {};
          const d = new Date(r.date || r.day || r.created_at || r.updated_at || Date.now()).toISOString().split('T')[0];
          map[r.studentId][d] = {
            status: r.status,
            checkIn: r.checkInTime || null,
            checkOut: r.checkOutTime || null
          };
        });
        setAttendanceData(map);
      } catch {}
    };
    load();
  }, []);
  
  // Handle student selection for detail view
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    onOpen();
  };
  
  // Calculate attendance statistics
  const calculateStats = (studentId) => {
    // This would normally come from your backend
    // For mock purposes, we'll generate random stats
    const total = 30;
    const present = Math.floor(Math.random() * 25) + 5;
    const absent = Math.floor(Math.random() * (30 - present));
    const leave = total - present - absent;
    
    return {
      total,
      present,
      absent,
      leave,
      percentage: Math.round((present / total) * 100)
    };
  };
  
  // Generate status badge based on attendance status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge colorScheme="green">Present</Badge>;
      case 'absent':
        return <Badge colorScheme="red">Absent</Badge>;
      case 'late':
        return <Badge colorScheme="orange">Late</Badge>;
      case 'leave':
        return <Badge colorScheme="yellow">Leave</Badge>;
      default:
        return <Badge colorScheme="gray">Not Marked</Badge>;
    }
  };
  
  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  // Handle month change in calendar
  const handleMonthChange = (month) => {
    setCurrentMonth(month);
  };

  // Load monthly attendance for selected student when month or selection changes
  useEffect(() => {
    const loadMonthly = async () => {
      if (!selectedStudent) return;
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0];
      try {
        const payload = await attendanceApi.list({ studentId: selectedStudent.id, startDate: start, endDate: end, pageSize: 500 });
        const rows = payload?.items || payload?.rows || (Array.isArray(payload) ? payload : []);
        const map = { ...(attendanceData[selectedStudent.id] || {}) };
        rows.forEach(r => {
          const d = new Date(r.date).toISOString().split('T')[0];
          map[d] = { status: r.status, checkIn: null, checkOut: null };
        });
        setAttendanceData(prev => ({ ...prev, [selectedStudent.id]: map }));
      } catch {}
    };
    loadMonthly();
  }, [selectedStudent, currentMonth]);
  
  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters to student list
  const filteredStudents = students.filter(student => {
    let matchesClass = filterValues.class === 'all' || student.class === filterValues.class;
    let matchesSection = filterValues.section === 'all' || student.section === filterValues.section;
    let matchesSearch = !filterValues.searchTerm || 
                        student.name.toLowerCase().includes(filterValues.searchTerm.toLowerCase()) ||
                        student.rollNumber.toLowerCase().includes(filterValues.searchTerm.toLowerCase());
    
    return matchesClass && matchesSection && matchesSearch;
  });

  const displayedStudents = filteredStudents.filter((student) => {
    if (filterValues.attendanceStatus === 'all') return true;
    const a = getTodayAttendance(student.id);
    if (filterValues.attendanceStatus === 'present') {
      return a.status === 'present' || a.status === 'late';
    }
    return a.status === filterValues.attendanceStatus;
  });

  const trend = React.useMemo(() => {
    const end = new Date();
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(end);
      d.setDate(end.getDate() - (6 - idx));
      return d;
    });
    const keys = days.map((d) => d.toISOString().split('T')[0]);
    const labels = days.map((d) => d.toLocaleDateString(undefined, { weekday: 'short' }));

    const present = [];
    const absent = [];
    const leave = [];
    const notMarked = [];

    keys.forEach((key) => {
      let p = 0;
      let a = 0;
      let l = 0;
      let n = 0;
      displayedStudents.forEach((s) => {
        const status = attendanceData?.[s.id]?.[key]?.status || 'not-marked';
        if (status === 'present' || status === 'late') p += 1;
        else if (status === 'absent') a += 1;
        else if (status === 'leave') l += 1;
        else n += 1;
      });
      present.push(p);
      absent.push(a);
      leave.push(l);
      notMarked.push(n);
    });

    return {
      labels,
      keys,
      present,
      absent,
      leave,
      notMarked,
    };
  }, [attendanceData, displayedStudents]);

  const todayCounts = React.useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let notMarked = 0;

    displayedStudents.forEach((s) => {
      const status = getTodayAttendance(s.id).status;
      if (status === 'present' || status === 'late') present += 1;
      else if (status === 'absent') absent += 1;
      else if (status === 'leave') leave += 1;
      else notMarked += 1;
    });

    return { present, absent, leave, notMarked };
  }, [displayedStudents]);
  
  // Export CSV of today's filtered attendance
  const exportCSV = () => {
    const today = new Date().toISOString().split('T')[0];
    const headers = ['Student','Roll No.','Class','Status','Check-In','Check-Out'];
    const rows = displayedStudents.map((s) => {
      const a = attendanceData[s.id]?.[today] || { status: 'not-marked', checkIn: '', checkOut: '' };
      return [
        '"' + (s.name || '') + '"',
        s.rollNumber || '',
        `${s.class || ''}-${s.section || ''}`,
        a.status || '',
        a.checkIn || '',
        a.checkOut || ''
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print (browser print dialog)
  const handlePrint = () => window.print();

  // Refresh students and today's attendance
  const refreshAll = async () => {
    try {
      const payload = await studentsApi.list({ pageSize: 200 });
      const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
      setStudents((rows || []).slice(0, 100));
    } catch {}
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const payload = await attendanceApi.list({ startDate, endDate });
      const rows = payload?.items || payload?.rows || (Array.isArray(payload) ? payload : []);
      const map = {};
      rows.forEach(r => {
        if (!map[r.studentId]) map[r.studentId] = {};
        const d = new Date(r.date || r.day || r.created_at || r.updated_at || Date.now()).toISOString().split('T')[0];
        map[r.studentId][d] = {
          status: r.status,
          checkIn: r.checkInTime || null,
          checkOut: r.checkOutTime || null
        };
      });
      setAttendanceData(map);
    } catch {}
  };
  
  // Mark attendance for today
  const markAttendance = async (studentId, status, time) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const row = await attendanceApi.create({ studentId, date: today, status, remarks: null });
      const updated = { ...attendanceData };
      if (!updated[studentId]) updated[studentId] = {};
      if (!updated[studentId][today]) updated[studentId][today] = { status, checkIn: null, checkOut: null };
      // Prefer server-returned times
      updated[studentId][today].status = row?.status || status;
      if (time === 'checkIn') {
        updated[studentId][today].checkIn = row?.checkInTime || updated[studentId][today].checkIn || new Date().toLocaleTimeString();
      } else if (time === 'checkOut') {
        updated[studentId][today].checkOut = row?.checkOutTime || updated[studentId][today].checkOut || new Date().toLocaleTimeString();
      }
      setAttendanceData(updated);
      toast({ title: time === 'checkIn' ? 'Checked in' : 'Checked out', status: 'success', duration: 2000 });
    } catch (e) {
      const details = Array.isArray(e?.data?.errors) ? e.data.errors.map(x=>`${x.param}: ${x.msg}`).join(', ') : '';
      toast({
        title: 'Failed to mark attendance',
        description: (e?.data?.message || e?.message || 'Request failed') + (details ? ` — ${details}` : ''),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Grid
        templateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gap="20px"
        mb="20px"
        alignItems="center"
      >
        <GridItem>
          <Heading as="h3" size="lg" mb="2">
            Student Attendance
          </Heading>
          <Text color="gray.500">Track and manage student attendance records</Text>
        </GridItem>
        <GridItem display="flex" justifyContent={{ base: 'flex-start', md: 'flex-end' }}>
          <ButtonGroup spacing={2}>
            <Button leftIcon={<MdDateRange />} colorScheme="blue" variant="outline">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </Button>
            <Button leftIcon={<MdDownload />} colorScheme="teal" variant="outline" onClick={exportCSV}>
              Export
            </Button>
            <Button leftIcon={<MdPrint />} colorScheme="purple" variant="outline" onClick={handlePrint}>
              Print
            </Button>
          </ButtonGroup>
        </GridItem>
      </Grid>
      
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing='20px' mb='20px'>
        <StatCard
          title="Total Students"
          value={displayedStudents.length}
          note="Students in current filters"
          icon={MdPerson}
          colorScheme="blue"
        />
        <StatCard
          title="Present Today"
          value={todayCounts.present}
          note={displayedStudents.length ? `${Math.round((todayCounts.present / displayedStudents.length) * 100)}%` : '0%'}
          icon={MdCheck}
          colorScheme="green"
        />
        <StatCard
          title="Absent Today"
          value={todayCounts.absent}
          note={displayedStudents.length ? `${Math.round((todayCounts.absent / displayedStudents.length) * 100)}%` : '0%'}
          icon={MdClose}
          colorScheme="red"
        />
        <StatCard
          title="On Leave Today"
          value={todayCounts.leave}
          note={displayedStudents.length ? `${Math.round((todayCounts.leave / displayedStudents.length) * 100)}%` : '0%'}
          icon={MdCalendarToday}
          colorScheme="orange"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='20px' mb='20px'>
        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Weekly Attendance Trend</Text>
              <Text fontSize='sm' color='gray.500'>Present/Absent/Leave (last 7 days)</Text>
            </Box>
            <Button size='sm' variant='outline' leftIcon={<MdRefresh />} onClick={refreshAll}>Refresh</Button>
          </Flex>
          <BarChart
            ariaLabel="Weekly attendance trend"
            height={300}
            stacked
            categories={trend.labels}
            series={[
              { name: 'Present', data: trend.present },
              { name: 'Absent', data: trend.absent },
              { name: 'Leave', data: trend.leave },
              { name: 'Not Marked', data: trend.notMarked },
            ]}
            options={{
              plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
              legend: { position: 'top' },
              tooltip: { shared: true, intersect: false },
            }}
          />
        </Card>

        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Today's Status Split</Text>
              <Text fontSize='sm' color='gray.500'>Present vs Absent vs Leave</Text>
            </Box>
            <Badge colorScheme='blue'>{new Date().toLocaleDateString()}</Badge>
          </Flex>
          <PieChart
            type="donut"
            height={300}
            chartData={[todayCounts.present, todayCounts.absent, todayCounts.leave, todayCounts.notMarked]}
            chartOptions={{
              labels: ['Present', 'Absent', 'Leave', 'Not Marked'],
              colors: ['#22c55e', '#ef4444', '#f59e0b', '#94a3b8'],
              legend: { position: 'bottom' },
            }}
          />
        </Card>
      </SimpleGrid>
      
      {/* Filter Panel */}
      <Card mb="20px" p="20px">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          alignItems={{ base: 'stretch', md: 'flex-end' }}
        >
          <Box flex="1">
            <Text mb={1} fontSize="sm">Search</Text>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by name or roll no..."
                value={filterValues.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box width={{ base: '100%', md: '200px' }}>
            <Text mb={1} fontSize="sm">Class</Text>
            <Select
              value={filterValues.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
            >
              <option value="all">All Classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Box>
          <Box width={{ base: '100%', md: '200px' }}>
            <Text mb={1} fontSize="sm">Section</Text>
            <Select
              value={filterValues.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
            >
              <option value="all">All Sections</option>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Box>
          <Box width={{ base: '100%', md: '200px' }}>
            <Text mb={1} fontSize="sm">Status</Text>
            <Select
              value={filterValues.attendanceStatus}
              onChange={(e) => handleFilterChange('attendanceStatus', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="leave">Leave</option>
              <option value="not-marked">Not Marked</option>
            </Select>
          </Box>
          <ButtonGroup>
            <Button leftIcon={<MdFilterList />} colorScheme="blue">
              Apply
            </Button>
            <Button leftIcon={<MdRefresh />} variant="ghost" onClick={() => { setFilterValues({ class: 'all', section: 'all', attendanceStatus: 'all', searchTerm: '' }); refreshAll(); }}>
              Reset
            </Button>
          </ButtonGroup>
        </Flex>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Daily Attendance</Tab>
          <Tab>Monthly View</Tab>
          <Tab>Reports</Tab>
        </TabList>
        
        <TabPanels>
          {/* Daily Attendance Tab */}
          <TabPanel p={0} pt={5}>
            <Card p="12px">
              <Table variant="simple" size="sm" sx={{ 'th, td': { whiteSpace: 'nowrap' } }}>
                  <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                    <Tr>
                      <Th>Student</Th>
                      <Th>Roll No.</Th>
                      <Th>Class</Th>
                      <Th>Today's Status</Th>
                      <Th>Check-In</Th>
                      <Th>Check-Out</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {displayedStudents.map(student => {
                      const todayAttendance = getTodayAttendance(student.id);
                      
                      return (
                        <Tr key={student.id} 
                          _hover={{ bg: 'gray.50' }} 
                          cursor="pointer" 
                          onClick={() => handleStudentSelect(student)}
                        >
                          <Td>
                            <Flex align="center">
                              <Avatar size="sm" name={student.name} src={student.photo} mr={3} />
                              <Box>
                                <Text fontWeight="medium">{student.name}</Text>
                              </Box>
                            </Flex>
                          </Td>
                          <Td>{student.rollNumber}</Td>
                          <Td>{student.class}-{student.section}</Td>
                          <Td>{getStatusBadge(todayAttendance.status)}</Td>
                          <Td>
                            {todayAttendance.checkIn ? (
                              <Text>{todayAttendance.checkIn}</Text>
                            ) : (
                              <Button 
                                size="sm" 
                                colorScheme="green" 
                                leftIcon={<MdOutlineWatchLater />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAttendance(student.id, 'present', 'checkIn');
                                }}
                              >
                                Check In
                              </Button>
                            )}
                          </Td>
                          <Td>
                            {todayAttendance.checkOut ? (
                              <Text>{todayAttendance.checkOut}</Text>
                            ) : todayAttendance.checkIn ? (
                              <Button 
                                size="sm" 
                                colorScheme="blue" 
                                leftIcon={<MdOutlineWatchLater />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAttendance(student.id, todayAttendance.status, 'checkOut');
                                }}
                              >
                                Check Out
                              </Button>
                            ) : (
                              <Text color="gray.400">-</Text>
                            )}
                          </Td>
                          <Td>
                            <ButtonGroup size="sm" isAttached>
                              <IconButton 
                                aria-label="Mark present" 
                                icon={<MdCheck />} 
                                colorScheme="green"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAttendance(student.id, 'present', 'checkIn');
                                }}
                              />
                              <IconButton 
                                aria-label="Mark absent" 
                                icon={<MdClose />} 
                                colorScheme="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAttendance(student.id, 'absent', 'checkIn');
                                }}
                              />
                              <IconButton 
                                aria-label="View details" 
                                icon={<MdPerson />} 
                                colorScheme="blue"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStudentSelect(student);
                                }}
                              />
                            </ButtonGroup>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
            </Card>
          </TabPanel>
          
          {/* Monthly View Tab */}
          <TabPanel p={0} pt={5}>
            <Card p={4}>
                <Heading size="md" mb={4}>Monthly Attendance Overview</Heading>
                <Text color="gray.600" mb={4}>
                  Select a student from the list below to view their detailed attendance for the month.
                </Text>
                
                <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={6}>
                  <GridItem>
                    <Card p={0} maxH="500px" overflow="auto">
                      <Box bg="gray.50" p={3} borderBottomWidth="1px">
                        <Text fontWeight="bold">Students</Text>
                      </Box>
                      <Box>
                        <VStack align="stretch" spacing={0} divider={<Divider />}>
                          {filteredStudents.map(student => (
                            <Flex
                              key={student.id}
                              p={3}
                              align="center"
                              cursor="pointer"
                              _hover={{ bg: 'gray.50' }}
                              bg={selectedStudent?.id === student.id ? 'blue.50' : 'transparent'}
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Avatar size="sm" name={student.name} src={student.photo} mr={3} />
                              <Box>
                                <Text fontWeight="medium">{student.name}</Text>
                                <Text fontSize="xs" color="gray.500">{student.rollNumber} | {student.class}-{student.section}</Text>
                              </Box>
                            </Flex>
                          ))}
                        </VStack>
                      </Box>
                    </Card>
                  </GridItem>
                  
                  <GridItem>
                    {selectedStudent ? (
                      <Card p={0}>
                        <Box bg="gray.50" p={4} borderBottomWidth="1px">
                          <Flex justify="space-between" align="center">
                            <Flex align="center">
                              <Avatar size="sm" name={selectedStudent.name} src={selectedStudent.photo} mr={3} />
                              <Box>
                                <Text fontWeight="bold">{selectedStudent.name}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  {selectedStudent.rollNumber} | Class {selectedStudent.class}-{selectedStudent.section}
                                </Text>
                              </Box>
                            </Flex>
                            <HStack>
                              <IconButton 
                                aria-label="Previous month" 
                                icon={<ChevronLeftIcon />} 
                                variant="ghost"
                                onClick={() => {
                                  const newMonth = new Date(currentMonth);
                                  newMonth.setMonth(newMonth.getMonth() - 1);
                                  handleMonthChange(newMonth);
                                }}
                              />
                              <Text fontWeight="medium">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                              </Text>
                              <IconButton 
                                aria-label="Next month" 
                                icon={<ChevronRightIcon />} 
                                variant="ghost"
                                onClick={() => {
                                  const newMonth = new Date(currentMonth);
                                  newMonth.setMonth(newMonth.getMonth() + 1);
                                  handleMonthChange(newMonth);
                                }}
                              />
                            </HStack>
                          </Flex>
                        </Box>
                        <Box p={4}>
                          {/* Monthly Calendar View */}
                          <AttendanceCalendar 
                            studentId={selectedStudent.id} 
                            month={currentMonth} 
                            attendanceData={attendanceData[selectedStudent.id] || {}} 
                            onDateSelect={handleDateChange}
                          />
                          
                          {/* Summary Stats */}
                          <Grid templateColumns="repeat(4, 1fr)" gap={4} mt={4}>
                            <Card bg="green.50" p={3} borderRadius="md">
                              <Text fontWeight="bold" color="green.500">Present</Text>
                              <Heading size="md">22</Heading>
                              <Text fontSize="sm">73.3%</Text>
                            </Card>
                            <Card bg="red.50" p={3} borderRadius="md">
                              <Text fontWeight="bold" color="red.500">Absent</Text>
                              <Heading size="md">5</Heading>
                              <Text fontSize="sm">16.7%</Text>
                            </Card>
                            <Card bg="yellow.50" p={3} borderRadius="md">
                              <Text fontWeight="bold" color="yellow.500">Leave</Text>
                              <Heading size="md">3</Heading>
                              <Text fontSize="sm">10.0%</Text>
                            </Card>
                            <Card bg="blue.50" p={3} borderRadius="md">
                              <Text fontWeight="bold" color="blue.500">Total</Text>
                              <Heading size="md">30</Heading>
                              <Text fontSize="sm">Days</Text>
                            </Card>
                          </Grid>
                        </Box>
                      </Card>
                    ) : (
                      <Flex 
                        justify="center" 
                        align="center" 
                        direction="column" 
                        h="100%" 
                        bg="gray.50" 
                        borderRadius="md" 
                        p={10}
                      >
                        <Icon as={MdPerson} boxSize={12} color="gray.300" />
                        <Text mt={4} fontWeight="medium">Select a student to view attendance details</Text>
                      </Flex>
                    )}
                  </GridItem>
                </Grid>
            </Card>
          </TabPanel>
          
          {/* Reports Tab */}
          <TabPanel p={0} pt={5}>
            <Card p={4}>
                <Heading size="md" mb={4}>Attendance Reports</Heading>
                <Text color="gray.600" mb={6}>
                  Generate and view attendance reports for different time periods.
                </Text>
                
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <Card p={4}>
                    <Heading size="sm" mb={4}>Class-wise Attendance</Heading>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Text>Class 10-A</Text>
                        <Text fontWeight="bold">92%</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Class 10-B</Text>
                        <Text fontWeight="bold">87%</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Class 11-A</Text>
                        <Text fontWeight="bold">95%</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Class 11-B</Text>
                        <Text fontWeight="bold">89%</Text>
                      </HStack>
                    </VStack>
                    <Button colorScheme="blue" mt={4} width="full">View Full Report</Button>
                  </Card>
                  
                  <Card p={4}>
                    <Heading size="sm" mb={4}>Monthly Comparison</Heading>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Text>September 2025</Text>
                        <Text fontWeight="bold">88%</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>October 2025</Text>
                        <Text fontWeight="bold">91%</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>November 2025</Text>
                        <Text fontWeight="bold">89%</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Current Month</Text>
                        <Text fontWeight="bold">92%</Text>
                      </HStack>
                    </VStack>
                    <Button colorScheme="blue" mt={4} width="full">Generate Report</Button>
                  </Card>
                </Grid>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Student Attendance Detail Modal */}
      <AttendanceDetailModal 
        isOpen={isOpen}
        onClose={onClose}
        student={selectedStudent}
        attendanceData={selectedStudent ? (attendanceData[selectedStudent.id] || {}) : {}}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
    </Box>
  );
};

export default StudentAttendance;
