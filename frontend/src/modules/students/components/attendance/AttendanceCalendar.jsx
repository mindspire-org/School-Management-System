import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
  Center,
  HStack,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { MdCheck, MdClose, MdEventBusy } from 'react-icons/md';

const AttendanceCalendar = ({ studentId, month, attendanceData, onDateSelect }) => {
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(month || new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Colors for attendance status
  const statusColors = {
    present: { bg: 'green.50', text: 'green.600', border: 'green.200' },
    absent: { bg: 'red.50', text: 'red.600', border: 'red.200' },
    late: { bg: 'orange.50', text: 'orange.600', border: 'orange.200' },
    leave: { bg: 'yellow.50', text: 'yellow.600', border: 'yellow.200' },
    'not-marked': { bg: 'gray.50', text: 'gray.600', border: 'gray.200' },
  };

  // Generate calendar days
  useEffect(() => {
    generateCalendarDays(currentMonth);
  }, [currentMonth]);
  
  // Update month when prop changes
  useEffect(() => {
    if (month && month.getTime() !== currentMonth.getTime()) {
      setCurrentMonth(month);
    }
  }, [month]);
  
  // Generate array of days for calendar
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of the week for the first day (0-6, 0 is Sunday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total days in the month
    const daysInMonth = lastDay.getDate();
    
    // Create array for calendar grid
    const days = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, day: '', status: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const status = attendanceData[dateString] ? attendanceData[dateString].status : 'not-marked';
      
      days.push({
        date,
        day,
        status,
        checkIn: attendanceData[dateString] ? attendanceData[dateString].checkIn : null,
        checkOut: attendanceData[dateString] ? attendanceData[dateString].checkOut : null
      });
    }
    
    // Fill remaining slots in the last week
    const remainingDays = 7 - (days.length % 7 || 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        days.push({ date: null, day: '', status: null });
      }
    }
    
    setCalendarDays(days);
  };
  
  // Handle date selection
  const handleDateClick = (day) => {
    if (day.date) {
      setSelectedDate(day.date);
      if (onDateSelect) {
        onDateSelect(day.date);
      }
    }
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };
  
  // Get today's date for highlighting
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <Icon as={MdCheck} color="green.500" boxSize={4} />;
      case 'absent':
        return <Icon as={MdClose} color="red.500" boxSize={4} />;
      case 'leave':
        return <Icon as={MdEventBusy} color="yellow.500" boxSize={4} />;
      case 'late':
        return <Icon as={MdCheck} color="orange.500" boxSize={4} />;
      default:
        return null;
    }
  };
  
  // Week days header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      {/* Calendar Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label="Previous month"
          variant="ghost"
          onClick={goToPreviousMonth}
        />
        <Text fontSize="lg" fontWeight="bold">
          {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <IconButton
          icon={<ChevronRightIcon />}
          aria-label="Next month"
          variant="ghost"
          onClick={goToNextMonth}
        />
      </Flex>
      
      {/* Week Days Header */}
      <Grid templateColumns="repeat(7, 1fr)" mb={2}>
        {weekDays.map((day, index) => (
          <GridItem key={index}>
            <Center py={2} fontWeight="medium" color="gray.600">
              {day}
            </Center>
          </GridItem>
        ))}
      </Grid>
      
      {/* Calendar Grid */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {calendarDays.map((day, index) => {
          const isSelected = selectedDate && day.date && 
                           selectedDate.toDateString() === day.date.toDateString();
          const isToday = day.date && day.date.toDateString() === today.toDateString();
          const statusColor = day.status ? statusColors[day.status] : null;
          
          return (
            <GridItem key={index}>
              {day.date ? (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={2}
                  borderWidth={isSelected ? 2 : isToday ? 1 : 0}
                  borderColor={isSelected ? 'blue.500' : isToday ? 'blue.300' : 'transparent'}
                  borderRadius="md"
                  bg={statusColor ? statusColor.bg : 'transparent'}
                  cursor="pointer"
                  onClick={() => handleDateClick(day)}
                  position="relative"
                  h="80px"
                >
                  <Text fontWeight={isToday ? 'bold' : 'normal'}>
                    {day.day}
                  </Text>
                  
                  {day.status && day.status !== 'not-marked' && (
                    <Box mt={1}>
                      {getStatusIcon(day.status)}
                    </Box>
                  )}
                  
                  {day.checkIn && (
                    <Text fontSize="xs" mt={1} color={statusColor ? statusColor.text : 'gray.500'}>
                      {day.checkIn.substring(0, 5)}
                    </Text>
                  )}
                </Flex>
              ) : (
                <Box py={2} h="80px" />
              )}
            </GridItem>
          );
        })}
      </Grid>
      
      {/* Legend */}
      <HStack spacing={4} mt={4} justify="center">
        <HStack>
          <Box w={3} h={3} borderRadius="full" bg="green.500" />
          <Text fontSize="sm">Present</Text>
        </HStack>
        <HStack>
          <Box w={3} h={3} borderRadius="full" bg="red.500" />
          <Text fontSize="sm">Absent</Text>
        </HStack>
        <HStack>
          <Box w={3} h={3} borderRadius="full" bg="yellow.500" />
          <Text fontSize="sm">Leave</Text>
        </HStack>
        <HStack>
          <Box w={3} h={3} borderRadius="full" bg="orange.500" />
          <Text fontSize="sm">Late</Text>
        </HStack>
      </HStack>
    </Box>
  );
};

export default AttendanceCalendar;
