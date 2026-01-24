import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  HStack,
  Flex,
  Icon,
  SimpleGrid,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Avatar,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { MdCalendarToday, MdCheckCircle, MdCancel, MdAccessTime } from 'react-icons/md';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import * as teacherApi from '../../../../services/api/teachers';

const TeacherAttendance = () => {
  // Date state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split('T')[0]
  );

  const [teacherRows, setTeacherRows] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  
  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  
  const normalizeTime = (value) => {
    if (!value) return '';
    return String(value).slice(0, 5);
  };

  const defaultEntry = useMemo(() => ({ status: 'absent', checkInTime: '', checkOutTime: '' }), []);

  const fetchAttendance = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const response = await teacherApi.getAttendance({ date: selectedDate });
      const records = Array.isArray(response?.records) ? response.records : [];
      const normalized = records
        .filter((record) => record?.teacherId)
        .map((record) => ({
          teacherId: record.teacherId,
          name: record.teacherName || 'Unknown',
          photo: record.avatar || '',
          employeeId: record.employeeId || '—',
          department: record.department || '—',
          status: record.status || 'absent',
          checkInTime: normalizeTime(record.checkInTime),
          checkOutTime: normalizeTime(record.checkOutTime),
        }));
      setTeacherRows(normalized);
      setAttendanceMap(() => {
        const next = {};
        normalized.forEach((record) => {
          next[record.teacherId] = {
            status: record.status || 'absent',
            checkInTime: record.checkInTime || '',
            checkOutTime: record.checkOutTime || '',
          };
        });
        return next;
      });
    } catch (error) {
      console.error(error);
      setTeacherRows([]);
      setAttendanceMap({});
      toast({
        title: 'Failed to load attendance',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);
  
  // Handle attendance status change
  const updateAttendanceEntry = (teacherId, changes) => {
    setAttendanceMap((prev) => {
      const existing = prev[teacherId] || defaultEntry;
      return {
        ...prev,
        [teacherId]: {
          ...existing,
          ...changes,
        },
      };
    });
  };

  const handleStatusChange = (teacherId, status) => {
    updateAttendanceEntry(teacherId, { status });
  };

  const handleTimeChange = (teacherId, field, value) => {
    updateAttendanceEntry(teacherId, { [field]: value });
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  // Change date by one day
  const changeDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };
  
  // Handle save attendance
  const handleSaveAttendance = async () => {
    if (!selectedDate || !teacherRows.length) return;
    setSaving(true);
    try {
      const entries = teacherRows.map((row) => {
        const entry = attendanceMap[row.teacherId] || defaultEntry;
        return {
          teacherId: row.teacherId,
          status: entry.status || 'absent',
          checkInTime: entry.checkInTime || null,
          checkOutTime: entry.checkOutTime || null,
        };
      });
      await teacherApi.saveAttendance({ date: selectedDate, entries });
      toast({
        title: 'Attendance saved',
        description: formatDate(selectedDate),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchAttendance();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to save attendance',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Calculate attendance stats
  const stats = useMemo(() => {
    const total = teacherRows.length;
    const statuses = teacherRows.map((row) => (attendanceMap[row.teacherId]?.status) || 'absent');
    const present = statuses.filter((status) => status === 'present').length;
    const absent = statuses.filter((status) => status === 'absent').length;
    const late = statuses.filter((status) => status === 'late').length;
    return { total, present, absent, late };
  }, [attendanceMap, teacherRows]);
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Attendance</Heading>
          <Text color={textColorSecondary}>Manage and track teacher attendance</Text>
        </Box>
      </Flex>
      
      {/* Date Selector */}
      <Card mb={5}>
        <Flex 
          p={4} 
          justifyContent="space-between" 
          alignItems="center"
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <FormControl maxW="300px">
            <FormLabel>Select Date</FormLabel>
            <HStack>
              <IconButton
                icon={<ChevronLeftIcon />}
                onClick={() => changeDate(-1)}
                aria-label="Previous day"
              />
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={today.toISOString().split('T')[0]}
              />
              <IconButton
                icon={<ChevronRightIcon />}
                onClick={() => changeDate(1)}
                isDisabled={selectedDate === today.toISOString().split('T')[0]}
                aria-label="Next day"
              />
            </HStack>
          </FormControl>
          
          <Button 
            colorScheme="blue" 
            size="md"
            onClick={handleSaveAttendance}
            isLoading={saving}
            isDisabled={!teacherRows.length || saving}
            leftIcon={<Icon as={MdCheckCircle} />}
          >
            Save Attendance
          </Button>
        </Flex>
      </Card>
      
      {/* Stats Cards - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdCalendarToday} w='24px' h='24px' color='white' />} />}
          name='Total'
          value={String(stats.total)}
          growth={formatDate(selectedDate)}
          trendData={[stats.total-2, stats.total-1, stats.total]}
          trendColor='#4481EB'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='24px' h='24px' color='white' />} />}
          name='Present'
          value={String(stats.present)}
          growth={`${stats.total>0 ? Math.round((stats.present/stats.total)*100) : 0}% of total`}
          trendData={[1,2,2,3,stats.present]}
          trendColor='#01B574'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdCancel} w='24px' h='24px' color='white' />} />}
          name='Absent'
          value={String(stats.absent)}
          growth={`${stats.total>0 ? Math.round((stats.absent/stats.total)*100) : 0}% of total`}
          trendData={[0,1,1,1,stats.absent]}
          trendColor='#f5576c'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdAccessTime} w='24px' h='24px' color='white' />} />}
          name='Late'
          value={String(stats.late)}
          growth={`${stats.total>0 ? Math.round((stats.late/stats.total)*100) : 0}% of total`}
          trendData={[0,1,1,2,stats.late]}
          trendColor='#FD7853'
        />
      </SimpleGrid>
      
      {/* Attendance Table */}
      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue("gray.200", "gray.700")}>
          Attendance Record - {formatDate(selectedDate)}
        </Heading>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Teacher</Th>
                <Th>ID</Th>
                <Th>Department</Th>
                <Th width="200px">Status</Th>
                <Th>Time In</Th>
                <Th>Time Out</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={6}>
                    <Flex align="center" justify="center" py={10}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading attendance...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : teacherRows.length === 0 ? (
                <Tr>
                  <Td colSpan={6}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>
                      No teachers found for the selected date.
                    </Text>
                  </Td>
                </Tr>
              ) : (
                teacherRows.map((teacher) => {
                  const attendanceEntry = attendanceMap[teacher.teacherId] || defaultEntry;
                  const attendanceStatus = attendanceEntry.status || 'absent';
                  return (
                    <Tr key={teacher.teacherId}>
                      <Td>
                        <Flex align="center">
                          <Avatar src={teacher.photo} name={teacher.name} size="sm" mr={3} />
                          <Text fontWeight="medium">{teacher.name}</Text>
                        </Flex>
                      </Td>
                      <Td>{teacher.employeeId}</Td>
                      <Td>{teacher.department}</Td>
                      <Td>
                        <Select
                          value={attendanceStatus}
                          onChange={(e) => handleStatusChange(teacher.teacherId, e.target.value)}
                          width="full"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          type="time"
                          value={attendanceEntry.checkInTime || ''}
                          onChange={(e) => handleTimeChange(teacher.teacherId, 'checkInTime', e.target.value)}
                          isDisabled={attendanceStatus === 'absent'}
                        />
                      </Td>
                      <Td>
                        <Input
                          type="time"
                          value={attendanceEntry.checkOutTime || ''}
                          onChange={(e) => handleTimeChange(teacher.teacherId, 'checkOutTime', e.target.value)}
                          isDisabled={attendanceStatus === 'absent'}
                        />
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default TeacherAttendance;
