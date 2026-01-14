import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Badge,
  Avatar,
  Card,
  CardHeader,
  CardBody,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { MdPerson } from 'react-icons/md';
import { Link } from 'react-router-dom';

// This is a simplified version of StudentList that doesn't rely on Redux
function BasicStudentList() {
  const students = [
    {
      id: 1,
      name: 'John Doe',
      rollNumber: 'STD001',
      class: '10',
      section: 'A',
      parentName: 'Robert Doe',
      parentPhone: '+92 300 1234567',
      status: 'active',
      photo: ''
    },
    {
      id: 2,
      name: 'Jane Smith',
      rollNumber: 'STD002',
      class: '10',
      section: 'B',
      parentName: 'Mary Smith',
      parentPhone: '+92 300 7654321',
      status: 'inactive',
      photo: ''
    }
  ];

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Alert status="success" mb={5}>
        <AlertIcon />
        This is a simplified student list page that doesn't use Redux. If you can see this, the routing is working correctly.
      </Alert>
      
      {/* Page Header */}
      <Flex
        mb="20px"
        justifyContent="space-between"
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'start', md: 'center' }}
      >
        <Box>
          <Heading as="h3" size="lg" mb="4">
            Students (Basic List)
          </Heading>
          <Text color="gray.500">Sample student data (non-Redux)</Text>
        </Box>
        
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px" mb="20px">
        <Card>
          <CardBody>
            <Flex direction="column">
              <Flex align="center" mb="20px">
                <Icon as={MdPerson} h="24px" w="24px" color={brandColor} me="12px" />
                <Text fontSize="lg" fontWeight="700" color={textColor}>
                  Total Students
                </Text>
              </Flex>
              <Text fontSize="34px" fontWeight="700" color={textColor}>
                2
              </Text>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Search */}
      <Card mb="20px">
        <CardBody>
          <InputGroup width={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search (non-functional)"
            />
          </InputGroup>
        </CardBody>
      </Card>

      {/* Students Table */}
      <Card mb="20px" overflow="hidden">
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Roll Number</Th>
                  <Th>Class</Th>
                  <Th>Parent</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {students.map((student) => (
                  <Tr key={student.id}>
                    <Td>
                      <Flex align="center">
                        <Avatar
                          src={student.photo || ''}
                          name={student.name}
                          size="sm"
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="600" color={textColor}>
                            {student.name}
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>{student.rollNumber}</Td>
                    <Td>{student.class}-{student.section}</Td>
                    <Td>
                      <Text fontWeight="500">{student.parentName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {student.parentPhone}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={student.status === 'active' ? 'green' : 'red'}>
                        {student.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
      
      <HStack spacing={4} mb={8}>
        <Button as={Link} to="/admin" colorScheme="blue">
          Go to Dashboard
        </Button>
      </HStack>
    </Box>
  );
}

export default BasicStudentList;
