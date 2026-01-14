import React, { useState } from 'react';
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
  Badge,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { MdCalendarToday, MdCheckCircle, MdCancel } from 'react-icons/md';
import Card from 'components/card/Card.js';

const WorkingAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const toast = useToast();

  const teachers = [
    { id: 1, name: "Robert Smith", department: "Mathematics", defaultStatus: "present" },
    { id: 2, name: "Sarah Johnson", department: "Biology", defaultStatus: "present" },
    { id: 3, name: "Michael Brown", department: "English", defaultStatus: "absent" },
    { id: 4, name: "David Wilson", department: "Computer Science", defaultStatus: "present" },
    { id: 5, name: "Jennifer Lee", department: "Chemistry", defaultStatus: "late" }
  ];

  const [attendance, setAttendance] = useState(
    teachers.reduce((acc, teacher) => {
      acc[teacher.id] = teacher.defaultStatus;
      return acc;
    }, {})
  );

  const handleStatusChange = (teacherId, status) => {
    setAttendance(prev => ({
      ...prev,
      [teacherId]: status
    }));
  };

  const handleSaveAttendance = () => {
    toast({
      title: 'Success',
      description: `Attendance for ${formatDate(selectedDate)} has been saved successfully!`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate stats
  const stats = {
    total: teachers.length,
    present: Object.values(attendance).filter(status => status === 'present').length,
    absent: Object.values(attendance).filter(status => status === 'absent').length,
    late: Object.values(attendance).filter(status => status === 'late').length,
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={{ base: 4, md: 6 }}>
      {/* Header */}
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={2} color="gray.800">
          Teacher Attendance
        </Heading>
        <Text color="gray.600">
          Mark and manage daily teacher attendance
        </Text>
      </Box>
      
      {/* Date Selection */}
      <Card mb={6}>
        <Flex 
          p={4} 
          justifyContent="space-between" 
          alignItems="center"
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <FormControl maxW="250px">
            <FormLabel color="gray.700">Select Date</FormLabel>
            <Input
              id="attendance-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="lg"
            />
          </FormControl>
          
          <Button 
            colorScheme="blue" 
            size="lg"
            onClick={handleSaveAttendance}
            leftIcon={<Icon as={MdCheckCircle} />}
          >
            Save Attendance
          </Button>
        </Flex>
      </Card>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <Box p={4} textAlign="center">
            <Icon as={MdCalendarToday} boxSize={8} color="blue.500" mb={2} />
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {stats.total}
            </Text>
            <Text fontSize="sm" color="gray.600">Total Teachers</Text>
          </Box>
        </Card>
        
        <Card>
          <Box p={4} textAlign="center">
            <Icon as={MdCheckCircle} boxSize={8} color="green.500" mb={2} />
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {stats.present}
            </Text>
            <Text fontSize="sm" color="gray.600">Present</Text>
          </Box>
        </Card>
        
        <Card>
          <Box p={4} textAlign="center">
            <Icon as={MdCancel} boxSize={8} color="red.500" mb={2} />
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              {stats.absent}
            </Text>
            <Text fontSize="sm" color="gray.600">Absent</Text>
          </Box>
        </Card>
        
        <Card>
          <Box p={4} textAlign="center">
            <Icon as={MdCalendarToday} boxSize={8} color="orange.500" mb={2} />
            <Text fontSize="2xl" fontWeight="bold" color="orange.500">
              {stats.late}
            </Text>
            <Text fontSize="sm" color="gray.600">Late</Text>
          </Box>
        </Card>
      </SimpleGrid>
      
      {/* Attendance Table */}
      <Card>
        <Box p={4} borderBottomWidth={1} borderColor="gray.200">
          <Heading size="md" color="gray.800">
            Attendance Record - {formatDate(selectedDate)}
          </Heading>
        </Box>
        
        <Box overflow="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Teacher Name</Th>
                <Th>Department</Th>
                <Th>Status</Th>
                <Th>Time In</Th>
                <Th>Notes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teachers.map(teacher => {
                const attendanceStatus = attendance[teacher.id] || 'absent';
                
                return (
                  <Tr key={teacher.id} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <Text fontWeight="medium" color="gray.800">
                        {teacher.name}
                      </Text>
                    </Td>
                    <Td>
                      <Text color="gray.600">
                        {teacher.department}
                      </Text>
                    </Td>
                    <Td>
                      <Select
                        id={`attendance-status-${teacher.id}`}
                        value={attendanceStatus}
                        onChange={(e) => handleStatusChange(teacher.id, e.target.value)}
                        width="140px"
                        size="sm"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                      </Select>
                    </Td>
                    <Td>
                      <Text color="gray.600">
                        {attendanceStatus === 'present' ? '8:30 AM' : 
                         attendanceStatus === 'late' ? '9:15 AM' : '-'}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          attendanceStatus === 'present' ? 'green' :
                          attendanceStatus === 'late' ? 'orange' : 'red'
                        }
                        variant="subtle"
                        fontSize="xs"
                      >
                        {attendanceStatus === 'present' ? 'On Time' :
                         attendanceStatus === 'late' ? 'Arrived Late' : 'Not Present'}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default WorkingAttendance;
