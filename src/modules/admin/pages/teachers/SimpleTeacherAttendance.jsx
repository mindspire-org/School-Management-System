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
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';

const SimpleTeacherAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const teachers = [
    { id: 1, name: "Robert Smith", status: "present" },
    { id: 2, name: "Sarah Johnson", status: "present" },
    { id: 3, name: "Michael Brown", status: "absent" },
    { id: 4, name: "David Wilson", status: "present" },
    { id: 5, name: "Jennifer Lee", status: "late" }
  ];

  const [attendance, setAttendance] = useState(
    teachers.reduce((acc, teacher) => {
      acc[teacher.id] = teacher.status;
      return acc;
    }, {})
  );

  const handleStatusChange = (teacherId, status) => {
    setAttendance(prev => ({
      ...prev,
      [teacherId]: status
    }));
  };

  const handleSave = () => {
    alert('Attendance saved successfully!');
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Teacher Attendance
      </Heading>
      
      <Card mb={4}>
        <Box p={4}>
          <HStack spacing={4} mb={4}>
            <FormControl maxW="200px">
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </FormControl>
            <Button colorScheme="blue" onClick={handleSave} mt={8}>
              Save Attendance
            </Button>
          </HStack>
        </Box>
      </Card>

      <Card>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Teacher Name</Th>
              <Th>Status</Th>
              <Th>Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {teachers.map((teacher) => (
              <Tr key={teacher.id}>
                <Td>{teacher.name}</Td>
                <Td>
                  <Select
                    value={attendance[teacher.id]}
                    onChange={(e) => handleStatusChange(teacher.id, e.target.value)}
                    width="120px"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </Select>
                </Td>
                <Td>
                  {attendance[teacher.id] === 'present' ? '8:30 AM' : 
                   attendance[teacher.id] === 'late' ? '9:15 AM' : '-'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
};

export default SimpleTeacherAttendance;
