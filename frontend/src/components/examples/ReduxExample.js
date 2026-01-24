import React, { useEffect } from 'react';
import { Box, Button, Flex, SimpleGrid, Text, useColorModeValue, Spinner } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { toggleTheme } from 'redux/features/ui/uiSlice';
import { fetchStudents } from 'redux/features/students/studentSlice';
import { fetchAttendanceByDate } from 'redux/features/attendance/attendanceSlice';

const ReduxExample = () => {
  const dispatch = useAppDispatch();
  
  // Select data from Redux store
  const { theme, loading: uiLoading } = useAppSelector((state) => state.ui);
  const { students, loading: studentsLoading } = useAppSelector((state) => state.students);
  const { dailySummary, loading: attendanceLoading } = useAppSelector((state) => state.attendance);
  
  // Combined loading state
  const isLoading = uiLoading || studentsLoading || attendanceLoading;
  
  // Box colors based on theme
  const boxBg = useColorModeValue('white', 'navy.700');
  const textColor = useColorModeValue('navy.700', 'white');
  
  useEffect(() => {
    // Load data on component mount
    dispatch(fetchStudents());
    dispatch(fetchAttendanceByDate({ date: new Date().toISOString().split('T')[0], classId: 'ALL' }));
  }, [dispatch]);
  
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="20px" mb="20px">
        {/* Theme Toggle */}
        <Box
          bg={boxBg}
          borderRadius="20px"
          p="20px"
          boxShadow="0px 5px 14px rgba(0, 0, 0, 0.05)"
        >
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Current Theme
            </Text>
            <Text textTransform="capitalize">{theme}</Text>
          </Flex>
          <Button
            mt="15px"
            colorScheme="purple"
            onClick={() => dispatch(toggleTheme())}
          >
            Toggle Theme
          </Button>
        </Box>
        
        {/* Students Count */}
        <Box
          bg={boxBg}
          borderRadius="20px"
          p="20px"
          boxShadow="0px 5px 14px rgba(0, 0, 0, 0.05)"
        >
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Students
          </Text>
          {studentsLoading ? (
            <Flex justify="center" align="center" h="80px">
              <Spinner />
            </Flex>
          ) : (
            <Text fontSize="3xl" fontWeight="bold" mt="10px">
              {students.length}
            </Text>
          )}
        </Box>
        
        {/* Attendance Summary */}
        <Box
          bg={boxBg}
          borderRadius="20px"
          p="20px"
          boxShadow="0px 5px 14px rgba(0, 0, 0, 0.05)"
        >
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Today's Attendance
          </Text>
          {attendanceLoading ? (
            <Flex justify="center" align="center" h="80px">
              <Spinner />
            </Flex>
          ) : (
            <SimpleGrid columns={2} spacing={2} mt="10px">
              <Box>
                <Text color="gray.500">Present</Text>
                <Text fontSize="xl" fontWeight="bold">{dailySummary.present}</Text>
              </Box>
              <Box>
                <Text color="gray.500">Absent</Text>
                <Text fontSize="xl" fontWeight="bold">{dailySummary.absent}</Text>
              </Box>
              <Box>
                <Text color="gray.500">Late</Text>
                <Text fontSize="xl" fontWeight="bold">{dailySummary.late}</Text>
              </Box>
              <Box>
                <Text color="gray.500">Total</Text>
                <Text fontSize="xl" fontWeight="bold">{dailySummary.total}</Text>
              </Box>
            </SimpleGrid>
          )}
        </Box>
      </SimpleGrid>
      
      {isLoading && (
        <Box position="fixed" bottom="20px" right="20px" bg="blue.500" color="white" p="10px" borderRadius="md">
          <Flex align="center">
            <Spinner size="sm" mr="10px" />
            <Text>Loading data...</Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ReduxExample;
