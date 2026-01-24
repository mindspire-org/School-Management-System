import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  Spinner,
  Progress,
  HStack,
  IconButton,
  Tooltip,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Card from 'components/card/Card.js';
import {
  MdMoreVert,
  MdPerson,
  MdEdit,
  MdDelete,
  MdAccessTime,
  MdBlock,
  MdDirectionsBus,
  MdPayment,
  MdContentCopy,
  MdAssessment,
  MdCardMembership,
  MdEmail,
  MdMessage,
  MdPersonAdd,
  MdSchool,
  MdReceipt,
  MdBarChart,
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

const StudentTable = ({
  students = [],
  loading = false,
  isStudentSelected,
  handleSelectAll,
  handleSelectStudent,
  allSelected = false,
  navigateToStudentProfile,
}) => {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  
  // Mock data for features demonstration
  const mockStudents = [
    {
      id: 1,
      name: 'Ahmed Khan',
      rollNumber: 'STD001',
      class: '10',
      section: 'A',
      rfidTag: 'RFID-1234',
      attendance: 95,
      feeStatus: 'paid',
      busAssigned: true,
      busNumber: '001',
      parentName: 'Zubair Khan',
      parentPhone: '+92 300 1234567',
      email: 'ahmed@example.com',
      status: 'active',
      lastActive: '2 hours ago',
      photo: '',
    },
    {
      id: 2,
      name: 'Fatima Ali',
      rollNumber: 'STD002',
      class: '10',
      section: 'B',
      rfidTag: 'RFID-2345',
      attendance: 88,
      feeStatus: 'pending',
      busAssigned: true,
      busNumber: '002',
      parentName: 'Tariq Ali',
      parentPhone: '+92 300 9876543',
      email: 'fatima@example.com',
      status: 'active',
      lastActive: '5 hours ago',
      photo: '',
    },
    {
      id: 3,
      name: 'Zainab Hassan',
      rollNumber: 'STD003',
      class: '11',
      section: 'A',
      rfidTag: 'RFID-3456',
      attendance: 78,
      feeStatus: 'overdue',
      busAssigned: false,
      busNumber: '',
      parentName: 'Nasir Hassan',
      parentPhone: '+92 300 5555666',
      email: 'zainab@example.com',
      status: 'inactive',
      lastActive: '1 day ago',
      photo: '',
    },
    {
      id: 4,
      name: 'Mohammad Raza',
      rollNumber: 'STD004',
      class: '11',
      section: 'B',
      rfidTag: 'RFID-4567',
      attendance: 92,
      feeStatus: 'paid',
      busAssigned: true,
      busNumber: '001',
      parentName: 'Imran Raza',
      parentPhone: '+92 300 7778888',
      email: 'mohammad@example.com',
      status: 'active',
      lastActive: '3 hours ago',
      photo: '',
    },
  ];
  
  // Use provided students or mock data if empty
  const displayStudents = students.length > 0 ? students : mockStudents;
  
  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'suspended': return 'orange';
      default: return 'gray';
    }
  };
  
  // Fee status badge color mapping
  const getFeeStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      case 'partial': return 'purple';
      case 'waived': return 'blue';
      default: return 'gray';
    }
  };
  
  // Attendance color mapping
  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'teal';
    if (percentage >= 70) return 'yellow';
    if (percentage >= 60) return 'orange';
    return 'red';
  };
  
  // Format parent phone number for WhatsApp
  const getWhatsAppLink = (phone) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <Card mb="20px" overflow="hidden">
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th px="6px" width="40px">
                <Checkbox
                  isChecked={allSelected}
                  onChange={handleSelectAll}
                  isDisabled={loading}
                  colorScheme="brand"
                />
              </Th>
              <Th>Student</Th>
              <Th>Roll No.</Th>
              <Th>RFID Tag</Th>
              <Th>Class</Th>
              <Th>Parent Contact</Th>
              <Th>Attendance</Th>
              <Th>Transport</Th>
              <Th>Fee Status</Th>
              <Th>Status</Th>
              <Th>Last Active</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={12}>
                  <Flex justify="center" align="center" py={8}>
                    <Spinner size="lg" color="brand.500" mr={4} />
                    <Text>Loading students...</Text>
                  </Flex>
                </Td>
              </Tr>
            ) : displayStudents.length === 0 ? (
              <Tr>
                <Td colSpan={12}>
                  <Flex direction="column" justify="center" align="center" py={8}>
                    <Icon as={MdSchool} w={12} h={12} color="gray.400" mb={3} />
                    <Text fontSize="lg" fontWeight="medium">
                      No students found
                    </Text>
                    <Text color="gray.500">
                      Try adjusting your search or filters
                    </Text>
                  </Flex>
                </Td>
              </Tr>
            ) : (
              displayStudents.map((student) => (
                <Tr key={student.id} _hover={{ bg: hoverBg }}>
                  <Td px="6px" width="40px">
                    <Checkbox
                      isChecked={isStudentSelected ? isStudentSelected(student.id) : false}
                      onChange={() => handleSelectStudent && handleSelectStudent(student.id)}
                      colorScheme="brand"
                    />
                  </Td>
                  <Td>
                    <Flex align="center">
                      <Avatar
                        src={student.photo || ''}
                        name={student.name}
                        size="sm"
                        mr={3}
                      />
                      <Box>
                        <Text 
                          fontWeight="600" 
                          color={textColor} 
                          cursor="pointer" 
                          onClick={() => navigateToStudentProfile && navigateToStudentProfile(student.id)}
                        >
                          {student.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {student.email}
                        </Text>
                      </Box>
                    </Flex>
                  </Td>
                  <Td>{student.rollNumber}</Td>
                  <Td>
                    <HStack>
                      <Text>{student.rfidTag}</Text>
                      <IconButton
                        aria-label="Copy RFID"
                        icon={<MdContentCopy />}
                        size="xs"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(student.rfidTag)}
                      />
                    </HStack>
                  </Td>
                  <Td>{student.class}-{student.section}</Td>
                  <Td>
                    <Flex direction="column">
                      <Text fontWeight="500">{student.parentName}</Text>
                      <Flex align="center">
                        <Text fontSize="sm" color="gray.500" mr={2}>
                          {student.parentPhone}
                        </Text>
                        <Tooltip label="Message on WhatsApp">
                          <IconButton
                            as="a"
                            href={getWhatsAppLink(student.parentPhone)}
                            target="_blank"
                            aria-label="WhatsApp"
                            icon={<FaWhatsapp />}
                            size="xs"
                            colorScheme="green"
                            variant="ghost"
                          />
                        </Tooltip>
                      </Flex>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex direction="column">
                      <Text fontWeight="500" mb={1}>
                        {student.attendance}%
                      </Text>
                      <Progress 
                        value={student.attendance} 
                        size="sm" 
                        colorScheme={getAttendanceColor(student.attendance)}
                        borderRadius="full"
                      />
                    </Flex>
                  </Td>
                  <Td>
                    {student.busAssigned ? (
                      <Badge colorScheme="blue">Bus #{student.busNumber}</Badge>
                    ) : (
                      <Badge colorScheme="gray">No Bus</Badge>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={getFeeStatusColor(student.feeStatus)}>
                      {student.feeStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </Td>
                  <Td>{student.lastActive}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        size="sm"
                        rightIcon={<MdMoreVert />}
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem 
                          icon={<MdPerson />} 
                          onClick={() => navigateToStudentProfile && navigateToStudentProfile(student.id)}
                        >
                          View Profile
                        </MenuItem>
                        <MenuItem 
                          icon={<MdEdit />} 
                          as={RouterLink}
                          to={`/admin/students/edit/${student.id}`}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          icon={<MdAccessTime />}
                          as={RouterLink}
                          to={`/admin/students/attendance/${student.id}`}
                        >
                          Attendance
                        </MenuItem>
                        <MenuItem
                          icon={<MdBarChart />}
                          as={RouterLink}
                          to={`/admin/students/performance/${student.id}`}
                        >
                          Performance
                        </MenuItem>
                        <MenuItem
                          icon={<MdPayment />}
                          as={RouterLink}
                          to={`/admin/students/fees/${student.id}`}
                        >
                          Fees
                        </MenuItem>
                        <MenuItem
                          icon={<MdDirectionsBus />}
                          as={RouterLink}
                          to={`/admin/students/transport/${student.id}`}
                          isDisabled={!student.busAssigned}
                        >
                          Transport
                        </MenuItem>
                        <MenuItem 
                          icon={<MdMessage />}
                        >
                          Send SMS
                        </MenuItem>
                        <MenuItem 
                          icon={<MdEmail />}
                        >
                          Send Email
                        </MenuItem>
                        <MenuItem 
                          icon={<MdCardMembership />}
                        >
                          Print ID Card
                        </MenuItem>
                        <MenuItem 
                          icon={<MdReceipt />}
                        >
                          Print Receipt
                        </MenuItem>
                        <MenuItem 
                          icon={<MdDelete />} 
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Card>
  );
};

export default StudentTable;
