import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Avatar,
  Badge,
  Divider,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdEmail, MdPhone, MdCalendarToday, MdAccessTime, MdPerson } from 'react-icons/md';

import AttendanceCalendar from './AttendanceCalendar';

const AttendanceDetailModal = ({ isOpen, onClose, student, attendanceData, selectedDate, onDateChange }) => {
  // State for tracking attendance stats
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    total: 0,
    percentage: 0,
  });
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Calculate attendance stats when student or data changes
  useEffect(() => {
    if (student && attendanceData) {
      calculateStats();
    }
  }, [student, attendanceData]);
  
  // Calculate attendance statistics
  const calculateStats = () => {
    // In a real app, this would use actual data
    // For demo, we'll set some example values
    setStats({
      present: 22,
      absent: 5,
      leave: 3,
      total: 30,
      percentage: 73.3,
    });
  };
  
  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display="flex" alignItems="center">
          <Icon as={MdPerson} mr={2} />
          Student Profile
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0}>
          {/* Student Info Section */}
          <Grid templateColumns={{ base: '1fr', md: '320px 1fr' }} borderBottomWidth="1px" borderColor={borderColor}>
            <GridItem borderRightWidth={{ base: 0, md: '1px' }} borderColor={borderColor} p={6}>
              <Flex direction="column" align="center" mb={6}>
                <Avatar 
                  size="xl" 
                  name={student.name} 
                  src={student.photo}
                  mb={4}
                />
                <Text fontWeight="bold" fontSize="xl">{student.name}</Text>
                <Text color="gray.500">Student</Text>
              </Flex>
              
              <VStack align="start" spacing={4} w="full">
                <HStack>
                  <Text fontWeight="medium" width="100px">Roll No:</Text>
                  <Text>{student.rollNumber}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="medium" width="100px">Email:</Text>
                  <Text color="blue.500">{student.email || 'student@school.com'}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="medium" width="100px">Phone:</Text>
                  <Text>{student.phone || 'Not provided'}</Text>
                </HStack>
                
                <Box w="full">
                  <Text fontWeight="medium" mb={2}>Category:</Text>
                  <Text>General</Text>
                </Box>
                
                <Box w="full">
                  <Text fontWeight="medium" mb={2}>Joined Date:</Text>
                  <Text>05/11/2025</Text>
                </Box>
              </VStack>
              
              <Divider my={6} />
              
              {/* Attendance Summary */}
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <Box bg="green.50" p={3} borderRadius="md" textAlign="center">
                  <Text fontWeight="bold" color="green.500">Present</Text>
                  <Text fontSize="xl" fontWeight="bold">{stats.present}</Text>
                </Box>
                <Box bg="red.50" p={3} borderRadius="md" textAlign="center">
                  <Text fontWeight="bold" color="red.500">Absent</Text>
                  <Text fontSize="xl" fontWeight="bold">{stats.absent}</Text>
                </Box>
                <Box bg="yellow.50" p={3} borderRadius="md" textAlign="center">
                  <Text fontWeight="bold" color="yellow.500">Leave</Text>
                  <Text fontSize="xl" fontWeight="bold">{stats.leave}</Text>
                </Box>
              </Grid>
            </GridItem>
            
            <GridItem p={6}>
              {/* Calendar View */}
              <AttendanceCalendar 
                studentId={student.id}
                month={selectedDate || new Date()}
                attendanceData={attendanceData}
                onDateSelect={onDateChange}
              />
            </GridItem>
          </Grid>
          
          {/* Recent Activity Section */}
          <Box p={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4}>Recent Biometric Activity</Text>
            
            {attendanceData && Object.keys(attendanceData).length > 0 ? (
              <Box>
                {Object.entries(attendanceData)
                  .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                  .slice(0, 5)
                  .map(([date, data]) => (
                    <Flex 
                      key={date} 
                      mb={3} 
                      p={3} 
                      borderWidth="1px" 
                      borderColor={borderColor} 
                      borderRadius="md"
                      justify="space-between"
                      align="center"
                    >
                      <HStack>
                        <Icon as={MdCalendarToday} color="blue.500" />
                        <Text>{new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</Text>
                      </HStack>
                      
                      <HStack spacing={4}>
                        {data.checkIn && (
                          <Flex align="center">
                            <Icon as={MdAccessTime} color="green.500" mr={1} />
                            <Text>In: {data.checkIn}</Text>
                          </Flex>
                        )}
                        
                        {data.checkOut && (
                          <Flex align="center">
                            <Icon as={MdAccessTime} color="red.500" mr={1} />
                            <Text>Out: {data.checkOut}</Text>
                          </Flex>
                        )}
                        
                        <Badge colorScheme={
                          data.status === 'present' ? 'green' : 
                          data.status === 'absent' ? 'red' : 
                          data.status === 'late' ? 'orange' : 
                          data.status === 'leave' ? 'yellow' : 'gray'
                        }>
                          {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                        </Badge>
                      </HStack>
                    </Flex>
                  ))
                }
              </Box>
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                p={6} 
                bg="gray.50" 
                borderRadius="md"
              >
                <Text color="gray.500">No recent logs</Text>
                <Button size="sm" colorScheme="blue" mt={4} leftIcon={<Icon as={MdAccessTime} />}>
                  Sync now
                </Button>
              </Flex>
            )}
          </Box>
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AttendanceDetailModal;
