import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  SimpleGrid,
  Text,
  Badge,
  Icon,
  IconButton,
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
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
// Custom components
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
// Icons
import {
  MdCheckCircle,
  MdCancel,
  MdTimer,
  MdCircle,
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdFileDownload,
  MdPictureAsPdf,
  MdRemoveRedEye,
  MdEdit,
} from 'react-icons/md';
// Mock data
import { mockAttendanceLogs, mockStats } from '../../../../utils/mockData';
// Helpers
import { formatTime, getStatusColor } from '../../../../utils/helpers';

export default function AttendanceMonitor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLive, setIsLive] = useState(true);
  const [logs, setLogs] = useState(mockAttendanceLogs);
  const [selectedLog, setSelectedLog] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [editForm, setEditForm] = useState({ status: 'boarding', location: '' });

  // Calculate attendance stats
  const todayPresent = Math.floor(mockStats.totalStudents * (mockStats.todayAttendance / 100));
  const todayAbsent = mockStats.totalStudents - todayPresent;
  const todayLate = Math.floor(mockStats.totalStudents * 0.02); // 2% late

  // Filter attendance logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.rfidTag.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || log.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Attendance Monitor
          </Text>
          <Text fontSize='md' color='gray.500'>
            Real-time RFID attendance tracking system
          </Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} colorScheme='blue' variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap='20px' mb='20px'>
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #00F260 0%, #0575E6 100%)'
              icon={<Icon w='28px' h='28px' as={MdCheckCircle} color='white' />}
            />
          }
          name='Present Today'
          value={todayPresent.toString()}
          endContent={
            <Badge colorScheme='green' fontSize='sm'>
              {mockStats.todayAttendance}%
            </Badge>
          }
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #FC466B 0%, #3F5EFB 100%)'
              icon={<Icon w='28px' h='28px' as={MdCancel} color='white' />}
            />
          }
          name='Absent Today'
          value={todayAbsent.toString()}
          endContent={
            <Badge colorScheme='red' fontSize='sm'>
              {(100 - mockStats.todayAttendance).toFixed(1)}%
            </Badge>
          }
        />
        
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #FDBB2D 0%, #22C1C3 100%)'
              icon={<Icon w='28px' h='28px' as={MdTimer} color='white' />}
            />
          }
          name='Late Arrivals'
          value={todayLate.toString()}
          endContent={
            <Badge colorScheme='orange' fontSize='sm'>
              2%
            </Badge>
          }
        />
        
        <MiniStatistics
          name='Attendance Rate'
          value={`${mockStats.todayAttendance}%`}
          startContent={
            <Flex align='center' justify='center'>
              <Box position='relative' w='60px' h='60px'>
                <svg width='60' height='60'>
                  <circle
                    cx='30'
                    cy='30'
                    r='25'
                    stroke='#E2E8F0'
                    strokeWidth='5'
                    fill='none'
                  />
                  <circle
                    cx='30'
                    cy='30'
                    r='25'
                    stroke='#48BB78'
                    strokeWidth='5'
                    fill='none'
                    strokeDasharray={`${2 * Math.PI * 25 * mockStats.todayAttendance / 100} ${2 * Math.PI * 25}`}
                    strokeDashoffset='0'
                    transform='rotate(-90 30 30)'
                  />
                </svg>
              </Box>
            </Flex>
          }
        />
      </SimpleGrid>

      {/* Real-time RFID Logs */}
      <Card p='20px'>
        <Flex justify='space-between' align='center' mb='20px'>
          <Flex align='center' gap='10px'>
            <Text fontSize='lg' fontWeight='bold'>
              Real-Time RFID Check-Ins
            </Text>
            {isLive && (
              <Badge colorScheme='green' fontSize='sm'>
                <Icon as={MdCircle} mr='5px' color='green.500' />
                Live
              </Badge>
            )}
          </Flex>
          
          <Flex gap='10px'>
            <InputGroup w='200px'>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.300' />
              </InputLeftElement>
              <Input
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            
            <Select
              w='150px'
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              icon={<MdFilterList />}
            >
              <option value='all'>All Status</option>
              <option value='boarding'>Boarding</option>
              <option value='alighting'>Alighting</option>
            </Select>
          </Flex>
        </Flex>

        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>TIME</Th>
                <Th>STUDENT</Th>
                <Th>STUDENT ID</Th>
                <Th>RFID TAG</Th>
                <Th>BUS #</Th>
                <Th>STATUS</Th>
                <Th>LOCATION</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredLogs.map((log) => (
                <Tr key={log.id}>
                  <Td>
                    <Badge colorScheme='gray' fontSize='xs'>
                      {log.timestamp}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontWeight='500'>{log.studentName}</Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm' color='gray.600'>
                      {log.studentId}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize='sm' fontFamily='mono'>
                      {log.rfidTag}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme='blue'>{log.busNumber}</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize='sm' color='gray.600'>
                      {log.location}
                    </Text>
                  </Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelectedLog(log); viewDisc.onOpen(); }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelectedLog(log); setEditForm({ status: log.status.toLowerCase(), location: log.location }); editDisc.onOpen(); }} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {filteredLogs.length === 0 && (
          <Flex justify='center' align='center' h='100px'>
            <Text color='gray.500'>No attendance logs found</Text>
          </Flex>
        )}
      </Card>

      {/* View Modal */}
      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Check-in Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLog && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{selectedLog.studentName}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Student ID</Text><Text>{selectedLog.studentId}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>RFID</Text><Text>{selectedLog.rfidTag}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Bus</Text><Text>{selectedLog.busNumber}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Time</Text><Text>{selectedLog.timestamp}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Status</Text><Badge colorScheme={getStatusColor(selectedLog.status)}>{selectedLog.status}</Badge></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Check-in</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLog && (
              <Box>
                <FormControl mb={3}>
                  <FormLabel>Status</FormLabel>
                  <Select value={editForm.status} onChange={(e)=> setEditForm(f=>({ ...f, status: e.target.value }))}>
                    <option value='boarding'>boarding</option>
                    <option value='alighting'>alighting</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input value={editForm.location} onChange={(e)=> setEditForm(f=>({ ...f, location: e.target.value }))} />
                </FormControl>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              if(!selectedLog) return;
              setLogs(prev => prev.map(l => l.id===selectedLog.id ? { ...l, status: editForm.status, location: editForm.location } : l));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
