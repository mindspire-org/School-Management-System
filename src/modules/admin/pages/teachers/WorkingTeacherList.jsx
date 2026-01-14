import React from 'react';
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
  Badge,
  Button,
  Flex,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { MdPeople, MdSchool } from 'react-icons/md';
import Card from 'components/card/Card.js';

const WorkingTeacherList = () => {
  console.log('WorkingTeacherList component rendered successfully');

  const teachers = [
    {
      id: 1,
      name: "Robert Smith",
      email: "robert@school.edu",
      subject: "Mathematics",
      status: "Active",
      phone: "123-456-7890"
    },
    {
      id: 2,
      name: "Sarah Johnson", 
      email: "sarah@school.edu",
      subject: "Biology",
      status: "Active",
      phone: "123-456-7891"
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@school.edu", 
      subject: "English",
      status: "On Leave",
      phone: "123-456-7892"
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david@school.edu",
      subject: "Computer Science", 
      status: "Active",
      phone: "123-456-7893"
    }
  ];

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex mb={6} justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading as="h2" size="lg" mb={2} color="gray.800">
            Teachers Management
          </Heading>
          <Text color="gray.600">
            Manage and view all teaching staff information
          </Text>
        </Box>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Card>
          <Box p={5}>
            <Flex align="center" mb={3}>
              <Icon as={MdPeople} color="blue.500" boxSize={6} mr={3} />
              <Text fontSize="lg" fontWeight="medium" color="gray.700">
                Total Teachers
              </Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="blue.500">
              {teachers.length}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Registered in system
            </Text>
          </Box>
        </Card>
        
        <Card>
          <Box p={5}>
            <Flex align="center" mb={3}>
              <Icon as={MdSchool} color="green.500" boxSize={6} mr={3} />
              <Text fontSize="lg" fontWeight="medium" color="gray.700">
                Active Teachers
              </Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="green.500">
              {teachers.filter(t => t.status === "Active").length}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Currently teaching
            </Text>
          </Box>
        </Card>
        
        <Card>
          <Box p={5}>
            <Flex align="center" mb={3}>
              <Icon as={MdPeople} color="orange.500" boxSize={6} mr={3} />
              <Text fontSize="lg" fontWeight="medium" color="gray.700">
                On Leave
              </Text>
            </Flex>
            <Text fontSize="3xl" fontWeight="bold" color="orange.500">
              {teachers.filter(t => t.status === "On Leave").length}
            </Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Temporarily unavailable
            </Text>
          </Box>
        </Card>
      </SimpleGrid>

      {/* Teachers Table */}
      <Card>
        <Box p={4} borderBottomWidth={1} borderColor="gray.200">
          <Heading size="md" color="gray.800">Teachers List</Heading>
        </Box>
        
        <Box overflow="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Subject</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teachers.map((teacher) => (
                <Tr key={teacher.id} _hover={{ bg: "gray.50" }}>
                  <Td>
                    <Text fontWeight="medium" color="gray.800">
                      {teacher.name}
                    </Text>
                  </Td>
                  <Td>
                    <Text color="gray.600">
                      {teacher.email}
                    </Text>
                  </Td>
                  <Td>
                    <Text color="gray.600">
                      {teacher.phone}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                      {teacher.subject}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={teacher.status === "Active" ? "green" : "orange"}
                      variant="subtle"
                      fontSize="xs"
                    >
                      {teacher.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Button size="sm" variant="outline" colorScheme="blue">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" colorScheme="red">
                        Delete
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
};

export default WorkingTeacherList;
