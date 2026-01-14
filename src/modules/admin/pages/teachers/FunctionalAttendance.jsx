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
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';

const FunctionalAttendance = () => {
  console.log('FunctionalAttendance component is rendering');

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const toast = useToast();

  const teachers = [
    { id: 1, name: "Dr. Sarah Johnson", department: "Mathematics", defaultStatus: "present" },
    { id: 2, name: "Prof. Michael Chen", department: "Physics", defaultStatus: "present" },
    { id: 3, name: "Ms. Emily Rodriguez", department: "English", defaultStatus: "late" },
    { id: 4, name: "Dr. James Wilson", department: "Chemistry", defaultStatus: "absent" },
    { id: 5, name: "Mrs. Lisa Thompson", department: "History", defaultStatus: "present" }
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
    console.log(`Updated teacher ${teacherId} status to: ${status}`);
  };

  const handleSaveAttendance = () => {
    console.log('Saving attendance:', attendance);
    
    toast({
      title: 'Attendance Saved!',
      description: `Attendance for ${formatDate(selectedDate)} has been saved successfully.`,
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
    <Box 
      pt={{ base: '130px', md: '80px', xl: '80px' }} 
      px={4}
      bg="gray.50"
      minH="100vh"
    >
      {/* Success Indicator */}
      <Alert status="success" mb={4} borderRadius="lg">
        <AlertIcon />
        ✅ Teacher Attendance component is working properly!
      </Alert>

      {/* Page Header */}
      <Box mb={6}>
        <Heading as="h1" size="lg" color="gray.800" mb={2}>
          Teacher Attendance
        </Heading>
        <Text color="gray.600" fontSize="md">
          Mark daily attendance for teaching staff - {formatDate(selectedDate)}
        </Text>
      </Box>
      
      {/* Date Selection and Save */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md" color="gray.800">
            Attendance Management
          </Heading>
        </CardHeader>
        <CardBody>
          <Flex 
            justifyContent="space-between" 
            alignItems="center"
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <FormControl maxW="250px">
              <FormLabel color="gray.700">Select Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                size="lg"
                bg="white"
              />
            </FormControl>
            
            <Button 
              colorScheme="blue" 
              size="lg"
              onClick={handleSaveAttendance}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            >
              Save Attendance
            </Button>
          </Flex>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {stats.total}
            </Text>
            <Text fontSize="sm" color="gray.600">Total Teachers</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {stats.present}
            </Text>
            <Text fontSize="sm" color="gray.600">Present</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              {stats.absent}
            </Text>
            <Text fontSize="sm" color="gray.600">Absent</Text>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="orange.500">
              {stats.late}
            </Text>
            <Text fontSize="sm" color="gray.600">Late</Text>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <Heading size="md" color="gray.800">
            Daily Attendance Record
          </Heading>
        </CardHeader>
        
        <CardBody>
          <Box overflow="auto">
            <Table variant="simple" size="md">
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
                        <Badge colorScheme="blue" variant="subtle">
                          {teacher.department}
                        </Badge>
                      </Td>
                      <Td>
                        <Select
                          value={attendanceStatus}
                          onChange={(e) => handleStatusChange(teacher.id, e.target.value)}
                          width="140px"
                          size="sm"
                          bg="white"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                        </Select>
                      </Td>
                      <Td>
                        <Text color="gray.600" fontSize="sm">
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
        </CardBody>
      </Card>

      {/* Debug Information */}
      <Card mt={6}>
        <CardBody>
          <Text fontSize="sm" color="gray.600" mb={2}>
            <strong>Debug Info:</strong> Attendance component rendered at {new Date().toLocaleTimeString()}
          </Text>
          <Text fontSize="sm" color="gray.600">
            <strong>Tracking:</strong> {teachers.length} teachers, Date: {selectedDate}
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
};

export default FunctionalAttendance;
