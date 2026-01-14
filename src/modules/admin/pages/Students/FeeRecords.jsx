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
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
// Custom components
import Card from '../../../../components/card/Card';
// Icons
import {
  MdSearch,
  MdFilterList,
  MdAttachMoney,
  MdRemoveRedEye,
  MdReceipt,
  MdWarning,
  MdMoreVert,
} from 'react-icons/md';
// Mock data
import { mockStudents } from '../../../../utils/mockData';
import { mockFeeStructure } from '../../../../utils/mockFeeData';

export default function FeeRecords() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const toast = useToast();

  // Calculate total fee and paid amounts for each student
  const studentsWithFeeData = mockStudents.map(student => {
    // In a real app, this would come from the backend
    // Here we're just simulating different fee statuses for the mock data
    const totalFee = 85000;
    const paidAmount = student.id % 3 === 0 ? 85000 : (student.id % 3 === 1 ? 60000 : 45000);
    const pendingAmount = totalFee - paidAmount;
    const feeStatus = pendingAmount === 0 ? 'paid' : (pendingAmount > 20000 ? 'overdue' : 'pending');
    
    return {
      ...student,
      totalFee,
      paidAmount,
      pendingAmount,
      feeStatus,
      paymentPercentage: (paidAmount / totalFee) * 100
    };
  });

  // Filter students
  const filteredStudents = studentsWithFeeData.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    const matchesStatus = filterStatus === 'all' || student.feeStatus === filterStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Handle view student fee details
  const handleViewStudentFees = (studentId) => {
    navigate(`/admin/students/fees/${studentId}`);
  };

  // Handle send fee reminder
  const handleSendReminder = (student) => {
    toast({
      title: 'Fee Reminder Sent',
      description: `Reminder sent to ${student.name}'s parents`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Fee Records
          </Text>
          <Text fontSize='md' color='gray.500'>
            Manage student fees and payments
          </Text>
        </Box>
        <HStack>
          <Button
            colorScheme='blue'
            leftIcon={<MdReceipt />}
          >
            Generate Invoices
          </Button>
          <Button
            colorScheme='green'
            leftIcon={<MdAttachMoney />}
          >
            Record Payments
          </Button>
        </HStack>
      </Flex>

      {/* Fee Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap='20px' mb='20px'>
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Total Fees (This Month)
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              PKR 4,250,000
            </Text>
            <Badge colorScheme='blue' alignSelf='flex-start' mt='5px'>
              Expected
            </Badge>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Collected Amount
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              PKR 3,825,000
            </Text>
            <Badge colorScheme='green' alignSelf='flex-start' mt='5px'>
              90% Collected
            </Badge>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Pending Amount
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              PKR 425,000
            </Text>
            <Badge colorScheme='orange' alignSelf='flex-start' mt='5px'>
              10% Pending
            </Badge>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction='column' py='15px' px='20px'>
            <Text color='gray.500' fontSize='sm' fontWeight='500'>
              Overdue Amount
            </Text>
            <Text fontSize='2xl' fontWeight='bold' mt='5px'>
              PKR 125,000
            </Text>
            <Badge colorScheme='red' alignSelf='flex-start' mt='5px'>
              3% Overdue
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
              placeholder='Search by name, ID, or email...'
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            icon={<MdFilterList />}
          >
            <option value='all'>All Status</option>
            <option value='paid'>Fee Paid</option>
            <option value='pending'>Fee Pending</option>
            <option value='overdue'>Fee Overdue</option>
          </Select>
        </Flex>
      </Card>

      {/* Students Fee Table */}
      <Card p='20px'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>STUDENT</Th>
                <Th>CLASS</Th>
                <Th>TOTAL FEE</Th>
                <Th>PAID</Th>
                <Th>PENDING</Th>
                <Th>STATUS</Th>
                <Th>PAYMENT DUE</Th>
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
                    <Text fontSize='sm' fontWeight='500'>
                      PKR {student.totalFee.toLocaleString()}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm' fontWeight='500' color='green.500'>
                      PKR {student.paidAmount.toLocaleString()}
                    </Text>
                    <Text fontSize='xs' color='gray.500'>
                      {student.paymentPercentage.toFixed(0)}% paid
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm' fontWeight='500' color={student.pendingAmount > 0 ? 'orange.500' : 'green.500'}>
                      PKR {student.pendingAmount.toLocaleString()}
                    </Text>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={
                        student.feeStatus === 'paid' 
                          ? 'green' 
                          : student.feeStatus === 'pending' 
                            ? 'orange' 
                            : 'red'
                      }
                    >
                      {student.feeStatus.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    {student.feeStatus !== 'paid' ? (
                      <Text fontSize='sm'>Nov 30, 2024</Text>
                    ) : (
                      <Text fontSize='sm'>-</Text>
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
                        <MenuItem
                          icon={<MdRemoveRedEye />}
                          onClick={() => handleViewStudentFees(student.id)}
                        >
                          View Details
                        </MenuItem>
                        <MenuItem
                          icon={<MdReceipt />}
                        >
                          Generate Invoice
                        </MenuItem>
                        {student.feeStatus !== 'paid' && (
                          <MenuItem
                            icon={<MdWarning />}
                            onClick={() => handleSendReminder(student)}
                          >
                            Send Reminder
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
