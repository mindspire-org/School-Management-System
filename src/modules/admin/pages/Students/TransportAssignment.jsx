import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Button,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Avatar,
  HStack,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
// Custom components
import Card from '../../../../components/card/Card';
// Icons
import {
  MdSearch,
  MdFilterList,
  MdDirectionsBus,
  MdRemoveRedEye,
  MdEdit,
  MdCreditCard,
  MdLocationOn,
  MdPerson,
  MdMoreVert,
  MdRefresh,
  MdMap,
} from 'react-icons/md';
// Mock data
import { mockStudents } from '../../../../utils/mockData';
import { mockTransportAssignment, mockAvailableBuses } from '../../../../utils/mockTransportData';

export default function TransportAssignment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterBus, setFilterBus] = useState('all');
  const navigate = useNavigate();
  const toast = useToast();

  // Add transport data to students
  const studentsWithTransport = mockStudents.map(student => {
    // In a real app, this would come from the backend
    // Here we're just simulating different transport assignments for the mock data
    const isAssigned = student.id % 4 !== 0;
    const busNumber = isAssigned ? `10${student.id % 3 + 1}` : null;
    const rfidStatus = isAssigned ? (student.id % 5 === 0 ? 'inactive' : 'active') : null;
    
    return {
      ...student,
      transportAssigned: isAssigned,
      busNumber,
      rfidStatus,
      pickupStop: isAssigned ? 'Model Town Stop' : null,
      pickupTime: isAssigned ? '07:45 AM' : null,
    };
  });

  // Filter students
  const filteredStudents = studentsWithTransport.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.busNumber && student.busNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    const matchesBus = filterBus === 'all' || student.busNumber === filterBus;
    
    return matchesSearch && matchesClass && (filterBus === 'all' || (filterBus === 'none' ? !student.busNumber : matchesBus));
  });

  // Handle view student transport details
  const handleViewTransport = (studentId) => {
    navigate(`/admin/students/transport/${studentId}`);
  };

  // Handle assign bus
  const handleAssignBus = (student) => {
    toast({
      title: 'Assign Bus',
      description: `Redirecting to assign bus for ${student.name}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    navigate(`/admin/students/transport/${student.id}`);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Transport Assignment
          </Text>
          <Text fontSize='md' color='gray.500'>
            Manage student transport and bus assignments
          </Text>
        </Box>
        <HStack>
          <Button
            colorScheme='blue'
            leftIcon={<MdDirectionsBus />}
          >
            Manage Buses
          </Button>
          <Button
            colorScheme='green'
            leftIcon={<MdMap />}
          >
            View Routes
          </Button>
        </HStack>
      </Flex>

      {/* Transport Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap='20px' mb='20px'>
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Total Buses
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              12
            </Text>
            <Badge colorScheme='blue' alignSelf='flex-start' mt='5px'>
              All Operational
            </Badge>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Bus Users
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              845
            </Text>
            <Badge colorScheme='green' alignSelf='flex-start' mt='5px'>
              67.6% of students
            </Badge>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Active RFID Cards
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              825
            </Text>
            <Badge colorScheme='purple' alignSelf='flex-start' mt='5px'>
              97.6% of bus users
            </Badge>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Issues Reported
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              2
            </Text>
            <Badge colorScheme='red' alignSelf='flex-start' mt='5px'>
              Active Issues
            </Badge>
          </Flex>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card p='20px' mb='20px'>
        <Flex gap='10px' flexWrap='wrap'>
          <InputGroup w={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.300' />
            </InputLeftElement>
            <Input
              placeholder='Search by name, ID, or bus...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select
            w={{ base: '100%', md: '150px' }}
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            icon={<MdFilterList />}
          >
            <option value='all'>All Classes</option>
            <option value='9'>Class 9</option>
            <option value='10'>Class 10</option>
            <option value='11'>Class 11</option>
            <option value='12'>Class 12</option>
          </Select>
          
          <Select
            w={{ base: '100%', md: '150px' }}
            value={filterBus}
            onChange={(e) => setFilterBus(e.target.value)}
            icon={<MdFilterList />}
          >
            <option value='all'>All Buses</option>
            <option value='101'>Bus 101</option>
            <option value='102'>Bus 102</option>
            <option value='103'>Bus 103</option>
            <option value='none'>No Bus Assigned</option>
          </Select>
        </Flex>
      </Card>

      {/* Available Buses Card */}
      <Card p='20px' mb='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='15px'>
          Available Buses
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px'>
          {mockAvailableBuses.map((bus) => (
            <Card key={bus.busId} variant='outline'>
              <Flex p='15px' justify='space-between' align='center'>
                <Box>
                  <Text fontWeight='bold'>Bus {bus.busNumber}</Text>
                  <Text fontSize='sm' color='gray.500'>{bus.route}</Text>
                  <HStack mt='5px' spacing='5px'>
                    <Badge colorScheme='green'>{bus.availableSeats} seats available</Badge>
                    <Badge colorScheme='blue'>{bus.driverName}</Badge>
                  </HStack>
                </Box>
                <IconButton 
                  icon={<MdDirectionsBus />} 
                  colorScheme='blue' 
                  size='sm' 
                  aria-label='View bus details'
                />
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
      </Card>

      {/* Students Transport Table */}
      <Card p='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='15px'>
          Student Transport Assignments
        </Text>
        
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>STUDENT</Th>
                <Th>CLASS</Th>
                <Th>BUS NUMBER</Th>
                <Th>PICKUP POINT</Th>
                <Th>PICKUP TIME</Th>
                <Th>RFID STATUS</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredStudents.map((student) => (
                <Tr key={student.id}>
                  <Td>
                    <HStack spacing='12px'>
                      <Avatar
                        size='sm'
                        name={student.name}
                        src={student.avatar}
                      />
                      <Box>
                        <Text fontWeight='500'>{student.name}</Text>
                        <Text fontSize='xs' color='gray.500'>
                          {student.rollNumber}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme='purple'>
                      {student.class}-{student.section}
                    </Badge>
                  </Td>
                  <Td>
                    {student.busNumber ? (
                      <Badge colorScheme='blue'>{student.busNumber}</Badge>
                    ) : (
                      <Badge colorScheme='gray'>Not Assigned</Badge>
                    )}
                  </Td>
                  <Td>
                    <Text fontSize='sm'>
                      {student.pickupStop || 'N/A'}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm'>
                      {student.pickupTime || 'N/A'}
                    </Text>
                  </Td>
                  <Td>
                    {student.rfidStatus ? (
                      <Badge 
                        colorScheme={student.rfidStatus === 'active' ? 'green' : 'orange'}
                      >
                        {student.rfidStatus.toUpperCase()}
                      </Badge>
                    ) : (
                      <Badge colorScheme='gray'>N/A</Badge>
                    )}
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<MdMoreVert />}
                        variant='ghost'
                        size='sm'
                      />
                      <MenuList>
                        {student.transportAssigned ? (
                          <>
                            <MenuItem
                              icon={<MdRemoveRedEye />}
                              onClick={() => handleViewTransport(student.id)}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem
                              icon={<MdEdit />}
                              onClick={() => handleAssignBus(student)}
                            >
                              Modify Assignment
                            </MenuItem>
                            <MenuItem
                              icon={<MdRefresh />}
                            >
                              Reassign Bus
                            </MenuItem>
                          </>
                        ) : (
                          <MenuItem
                            icon={<MdDirectionsBus />}
                            onClick={() => handleAssignBus(student)}
                          >
                            Assign Bus
                          </MenuItem>
                        )}
                        {student.rfidStatus && (
                          <MenuItem
                            icon={<MdCreditCard />}
                          >
                            Manage RFID Card
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {filteredStudents.length === 0 && (
          <Flex justify='center' align='center' h='100px'>
            <Text color='gray.500'>No students found</Text>
          </Flex>
        )}
      </Card>
    </Box>
  );
}
