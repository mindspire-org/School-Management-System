import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Button,
  SimpleGrid,
  Badge,
  Avatar,
  HStack,
  VStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Switch,
  Select,
  IconButton,
  useToast,
  Image,
} from '@chakra-ui/react';
// Icons
import {
  MdDirectionsBus,
  MdCheckCircle,
  MdCreditCard,
  MdAttachMoney,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdAccessTime,
  MdWarning,
  MdClose,
  MdBlock,
  MdReportProblem,
  MdPrint,
  MdRefresh,
  MdMap,
  MdTimeline,
} from 'react-icons/md';
// Mock data
import { mockStudents } from '../../../../utils/mockData';
import {
  mockTransportAssignment,
  mockRfidCard,
  mockTransportLogs,
  mockEmergencyContacts,
} from '../../../../utils/mockTransportData';

export default function StudentTransport() {
  const toast = useToast();
  // Get student data (would come from params in a real app)
  const student = mockStudents[0];
  
  // Handle view on map
  const handleViewMap = () => {
    toast({
      title: 'View Map',
      description: 'Map view would open here showing route and stops',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle RFID card actions
  const handleCardAction = (action) => {
    const actions = {
      block: 'Card has been blocked',
      unblock: 'Card has been unblocked',
      replace: 'Card replacement initiated',
      report: 'Card reported as lost',
      print: 'Card details sent to printer',
    };

    toast({
      title: `RFID Card Action: ${action}`,
      description: actions[action],
      status: action === 'block' || action === 'report' ? 'warning' : 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header with Student Info */}
      <Flex justify='space-between' align='center' mb='20px'>
        <HStack spacing='20px'>
          <Avatar
            size='xl'
            name={student.name}
            src={student.avatar}
          />
          <Box>
            <Text fontSize='2xl' fontWeight='bold'>{student.name}</Text>
            <Flex align='center' mt='5px'>
              <Text fontSize='md' color='gray.600' mr='10px'>
                {student.rollNumber}
              </Text>
              <Badge colorScheme='purple' mr='10px'>
                Class {student.class}-{student.section}
              </Badge>
              <Badge colorScheme='green'>Active</Badge>
            </Flex>
            <Text fontSize='sm' color='gray.500' mt='5px'>
              {student.email}
            </Text>
          </Box>
        </HStack>
        
        <HStack spacing='10px'>
          <Button leftIcon={<MdDirectionsBus />} colorScheme='blue'>
            Modify Transport
          </Button>
          <Button leftIcon={<MdMap />} variant='outline'>
            View Route Map
          </Button>
        </HStack>
      </Flex>

      {/* Transport Status Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <Card>
          <CardBody>
            <Stat>
              <Flex justify='space-between'>
                <Box>
                  <StatLabel color='gray.500'>Transport Status</StatLabel>
                  <StatNumber>{mockTransportAssignment.status}</StatNumber>
                  <Badge 
                    colorScheme={mockTransportAssignment.status === 'assigned' ? 'green' : 'gray'}
                    mt='5px'
                  >
                    {mockTransportAssignment.status === 'assigned' ? 'Active' : 'Inactive'}
                  </Badge>
                </Box>
                <Box
                  bg='blue.100'
                  h='60px'
                  w='60px'
                  borderRadius='md'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Icon as={MdDirectionsBus} w='30px' h='30px' color='blue.500' />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <Flex justify='space-between'>
                <Box>
                  <StatLabel color='gray.500'>Bus Number</StatLabel>
                  <StatNumber>{mockTransportAssignment.busNumber}</StatNumber>
                  <Text fontSize='sm' color='gray.500' mt='5px' cursor='pointer' _hover={{ textDecoration: 'underline' }}>
                    Click to view details
                  </Text>
                </Box>
                <Box
                  bg='purple.100'
                  h='60px'
                  w='60px'
                  borderRadius='md'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Icon as={MdDirectionsBus} w='30px' h='30px' color='purple.500' />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <Flex justify='space-between'>
                <Box>
                  <StatLabel color='gray.500'>RFID Status</StatLabel>
                  <StatNumber>{mockRfidCard.status}</StatNumber>
                  <Text fontSize='sm' color='gray.500' mt='5px'>
                    Card: {mockRfidCard.cardNumber}
                  </Text>
                </Box>
                <Box
                  bg='green.100'
                  h='60px'
                  w='60px'
                  borderRadius='md'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Icon as={MdCreditCard} w='30px' h='30px' color='green.500' />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <Flex justify='space-between'>
                <Box>
                  <StatLabel color='gray.500'>Monthly Fee</StatLabel>
                  <StatNumber>PKR {mockTransportAssignment.monthlyFee.toLocaleString()}</StatNumber>
                  <Badge 
                    colorScheme={mockTransportAssignment.feeStatus === 'paid' ? 'green' : 'orange'}
                    mt='5px'
                  >
                    {mockTransportAssignment.feeStatus.toUpperCase()}
                  </Badge>
                </Box>
                <Box
                  bg='teal.100'
                  h='60px'
                  w='60px'
                  borderRadius='md'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Icon as={MdAttachMoney} w='30px' h='30px' color='teal.500' />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Current Assignment Details */}
      <Card mb='20px'>
        <CardHeader>
          <Text fontSize='lg' fontWeight='bold'>Current Transport Assignment</Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            {/* Left Column (Bus Details) */}
            <Box>
              {/* Bus Information Card */}
              <Card variant='outline' mb='20px' p='15px'>
                <Flex justify='space-between'>
                  <Box>
                    <Text fontSize='2xl' fontWeight='bold'>
                      Bus {mockTransportAssignment.busDetails.busNumber}
                    </Text>
                    <Text fontSize='sm' color='gray.500'>
                      {mockTransportAssignment.busDetails.busModel}
                    </Text>
                    <Text fontSize='sm' color='gray.500' fontFamily='mono'>
                      Reg: {mockTransportAssignment.busDetails.registrationNumber}
                    </Text>
                  </Box>
                  <Box
                    bg='blue.50'
                    p='10px'
                    borderRadius='md'
                    textAlign='center'
                  >
                    <Text fontSize='sm' color='gray.500'>Capacity</Text>
                    <Text fontWeight='bold'>
                      {mockTransportAssignment.busDetails.currentOccupancy}/{mockTransportAssignment.busDetails.capacity}
                    </Text>
                    <Text fontSize='xs' color='gray.500'>students</Text>
                  </Box>
                </Flex>
                
                <Divider my='15px' />
                
                <HStack>
                  <Avatar
                    size='md'
                    name={mockTransportAssignment.busDetails.driverName}
                    src={mockTransportAssignment.busDetails.driverPhoto}
                  />
                  <Box>
                    <Text fontWeight='500'>
                      {mockTransportAssignment.busDetails.driverName}
                    </Text>
                    <Text fontSize='sm' color='gray.500'>
                      Driver
                    </Text>
                  </Box>
                  <IconButton
                    icon={<MdPhone />}
                    colorScheme='green'
                    variant='ghost'
                    ml='auto'
                    size='sm'
                    aria-label='Call driver'
                    onClick={() => {
                      toast({
                        title: 'Calling Driver',
                        description: `Calling ${mockTransportAssignment.busDetails.driverName} at ${mockTransportAssignment.busDetails.driverPhone}`,
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  />
                </HStack>
              </Card>
              
              {/* Route Information Card */}
              <Card variant='outline' mb='20px' p='15px'>
                <Flex justify='space-between' mb='10px'>
                  <Text fontWeight='bold' fontSize='md'>
                    Route Information
                  </Text>
                  <Button
                    size='xs'
                    leftIcon={<MdMap />}
                    colorScheme='blue'
                    variant='outline'
                    onClick={handleViewMap}
                  >
                    View Map
                  </Button>
                </Flex>
                
                <SimpleGrid columns={2} spacing={5}>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Route Name:</Text>
                    <Text fontWeight='500'>{mockTransportAssignment.routeDetails.name}</Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Total Stops:</Text>
                    <Text fontWeight='500'>{mockTransportAssignment.routeDetails.totalStops}</Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Total Distance:</Text>
                    <Text fontWeight='500'>{mockTransportAssignment.routeDetails.totalDistance}</Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Estimated Time:</Text>
                    <Text fontWeight='500'>{mockTransportAssignment.routeDetails.estimatedTime}</Text>
                  </Box>
                </SimpleGrid>
              </Card>
              
              {/* Pickup/Drop Details */}
              <SimpleGrid columns={2} spacing={5}>
                {/* Pickup Details */}
                <Card variant='outline' p='15px' bg='blue.50'>
                  <HStack mb='10px'>
                    <Icon as={MdAccessTime} color='blue.500' />
                    <Text fontWeight='bold' fontSize='md'>
                      Pickup Details
                    </Text>
                  </HStack>
                  
                  <Box mb='10px'>
                    <Text fontSize='sm' color='gray.500'>Stop Name:</Text>
                    <Text fontWeight='500'>{mockTransportAssignment.pickupDetails.stopName}</Text>
                  </Box>
                  
                  <Box mb='10px'>
                    <Text fontSize='sm' color='gray.500'>Address:</Text>
                    <Text fontSize='sm'>{mockTransportAssignment.pickupDetails.stopAddress}</Text>
                  </Box>
                  
                  <Box mb='10px'>
                    <Text fontSize='sm' color='gray.500'>Time:</Text>
                    <Text fontWeight='bold' color='blue.600'>
                      {mockTransportAssignment.pickupDetails.scheduledTime}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Distance from School:</Text>
                    <Text fontSize='sm'>{mockTransportAssignment.pickupDetails.distanceFromSchool}</Text>
                  </Box>
                </Card>
                
                {/* Drop Details */}
                <Card variant='outline' p='15px' bg='purple.50'>
                  <HStack mb='10px'>
                    <Icon as={MdLocationOn} color='purple.500' />
                    <Text fontWeight='bold' fontSize='md'>
                      Drop Details
                    </Text>
                  </HStack>
                  
                  <Box mb='10px'>
                    <Text fontSize='sm' color='gray.500'>Stop Name:</Text>
                    <Text fontWeight='500'>{mockTransportAssignment.dropDetails.stopName}</Text>
                  </Box>
                  
                  <Box mb='10px'>
                    <Text fontSize='sm' color='gray.500'>Address:</Text>
                    <Text fontSize='sm'>{mockTransportAssignment.dropDetails.stopAddress}</Text>
                  </Box>
                  
                  <Box mb='10px'>
                    <Text fontSize='sm' color='gray.500'>Time:</Text>
                    <Text fontWeight='bold' color='purple.600'>
                      {mockTransportAssignment.dropDetails.scheduledTime}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Distance from School:</Text>
                    <Text fontSize='sm'>{mockTransportAssignment.dropDetails.distanceFromSchool}</Text>
                  </Box>
                </Card>
              </SimpleGrid>
            </Box>
            
            {/* Right Column (RFID Details) */}
            <Box>
              {/* RFID Card Information Card */}
              <Card variant='outline' mb='20px' p='15px'>
                <Flex justify='space-between' align='flex-start'>
                  <Box>
                    <Text fontSize='xl' fontWeight='bold'>
                      RFID Card {mockRfidCard.cardNumber}
                    </Text>
                    <Text fontSize='sm' color='gray.500'>
                      Issued: {new Date(mockRfidCard.issueDate).toLocaleDateString()}
                    </Text>
                    <Text fontSize='sm' color='gray.500'>
                      Expires: {new Date(mockRfidCard.expiryDate).toLocaleDateString()}
                    </Text>
                    <Badge 
                      colorScheme={mockRfidCard.status === 'active' ? 'green' : 'red'}
                      mt='5px'
                    >
                      {mockRfidCard.status.toUpperCase()}
                    </Badge>
                  </Box>
                  
                  {/* QR Code visualization */}
                  <Box 
                    bg='gray.100' 
                    p={2} 
                    borderRadius='md' 
                    border='1px' 
                    borderColor='gray.200'
                    h='90px'
                    w='90px'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                  >
                    <Text fontSize='xs'>QR Code</Text>
                    {/* In a real app, this would be an actual QR code image */}
                  </Box>
                </Flex>
                
                <Divider my='15px' />
                
                <SimpleGrid columns={2} spacing={5} mb='15px'>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Last Scanned:</Text>
                    <Text fontWeight='500'>
                      {new Date(mockRfidCard.lastScanned).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Total Scans:</Text>
                    <Text fontWeight='500'>{mockRfidCard.totalScans}</Text>
                  </Box>
                </SimpleGrid>
                
                <Text fontWeight='bold' fontSize='md' mb='10px'>
                  Card Actions
                </Text>
                
                <SimpleGrid columns={3} spacing={2}>
                  <Button 
                    colorScheme='red' 
                    size='sm' 
                    leftIcon={<MdBlock />}
                    onClick={() => handleCardAction('block')}
                  >
                    Block Card
                  </Button>
                  <Button 
                    colorScheme='orange' 
                    size='sm' 
                    leftIcon={<MdReportProblem />}
                    onClick={() => handleCardAction('report')}
                  >
                    Report Lost
                  </Button>
                  <Button 
                    colorScheme='blue' 
                    size='sm' 
                    leftIcon={<MdRefresh />}
                    onClick={() => handleCardAction('replace')}
                  >
                    Replace Card
                  </Button>
                  <Button 
                    colorScheme='gray' 
                    size='sm' 
                    leftIcon={<MdPrint />}
                    onClick={() => handleCardAction('print')}
                    gridColumn="span 3"
                  >
                    Print Card
                  </Button>
                </SimpleGrid>
              </Card>
              
              {/* Recent Scan History */}
              <Card variant='outline' mb='20px' p='15px'>
                <Text fontWeight='bold' fontSize='md' mb='10px'>
                  Recent Scan History
                </Text>
                
                <TableContainer>
                  <Table variant='simple' size='sm'>
                    <Thead>
                      <Tr>
                        <Th>DATE & TIME</Th>
                        <Th>TYPE</Th>
                        <Th>LOCATION</Th>
                        <Th>STATUS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mockRfidCard.scanHistory.map((scan, idx) => (
                        <Tr key={idx}>
                          <Td>
                            {new Date(`${scan.date}T${scan.time}`).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Td>
                          <Td>
                            <Badge colorScheme={scan.type === 'check-in' ? 'blue' : 'purple'}>
                              {scan.type === 'check-in' ? 'Check In' : 'Check Out'}
                            </Badge>
                          </Td>
                          <Td>{scan.location}</Td>
                          <Td>
                            <Badge colorScheme={scan.status === 'success' ? 'green' : 'red'}>
                              {scan.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Transport Attendance History */}
      <Card mb='20px'>
        <CardHeader>
          <Text fontSize='lg' fontWeight='bold'>Transport Attendance Logs</Text>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant='simple'>
              <Thead>
                <Tr>
                  <Th>DATE</Th>
                  <Th>BUS NO.</Th>
                  <Th>PICKUP STATUS</Th>
                  <Th>PICKUP TIME</Th>
                  <Th>DROP STATUS</Th>
                  <Th>DROP TIME</Th>
                  <Th>JOURNEY</Th>
                  <Th>NOTES</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockTransportLogs.map((log, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Text fontWeight='500'>{log.date}</Text>
                      <Text fontSize='xs' color='gray.500'>{log.day}</Text>
                    </Td>
                    <Td>
                      {log.busNumber !== '-' ? (
                        <Badge colorScheme='blue'>{log.busNumber}</Badge>
                      ) : (
                        <Text>-</Text>
                      )}
                    </Td>
                    <Td>
                      {log.pickupStatus !== '-' ? (
                        <Badge
                          colorScheme={
                            log.pickupStatus === 'on-time'
                              ? 'green'
                              : log.pickupStatus === 'late'
                              ? 'orange'
                              : log.pickupStatus === 'missed'
                              ? 'red'
                              : 'gray'
                          }
                        >
                          {log.pickupStatus.replace('-', ' ')}
                        </Badge>
                      ) : (
                        <Text>-</Text>
                      )}
                    </Td>
                    <Td>{log.pickupTime}</Td>
                    <Td>
                      {log.dropStatus !== '-' ? (
                        <Badge
                          colorScheme={
                            log.dropStatus === 'on-time'
                              ? 'green'
                              : log.dropStatus === 'late'
                              ? 'orange'
                              : log.dropStatus === 'early'
                              ? 'yellow'
                              : 'gray'
                          }
                        >
                          {log.dropStatus.replace('-', ' ')}
                        </Badge>
                      ) : (
                        <Text>-</Text>
                      )}
                    </Td>
                    <Td>{log.dropTime}</Td>
                    <Td>{log.journeyDuration}</Td>
                    <Td>
                      <Text fontSize='sm'>{log.notes}</Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          
          <SimpleGrid columns={{ base: 1, md: 4 }} gap='20px' mt='20px'>
            <Stat>
              <StatLabel>Total Days</StatLabel>
              <StatNumber>7</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Days Traveled</StatLabel>
              <StatNumber>5</StatNumber>
              <StatHelpText>71.4% days</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Days Missed</StatLabel>
              <StatNumber>2</StatNumber>
              <StatHelpText>28.6% days</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>On-Time Rate</StatLabel>
              <StatNumber>80%</StatNumber>
              <StatHelpText>4 out of 5 days</StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Emergency Contacts & Instructions */}
      <Card mb='20px'>
        <CardHeader>
          <Text fontSize='lg' fontWeight='bold'>Emergency Information</Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px'>
            <Card variant='outline' p='15px'>
              <Text fontWeight='bold' fontSize='md' mb='10px'>
                In Case of Emergency
              </Text>
              
              <VStack align='stretch' spacing={3}>
                <Flex>
                  <Text fontSize='sm' color='gray.500' w='150px'>School Transport Office:</Text>
                  <Text fontSize='sm' fontWeight='500' color='blue.500' cursor='pointer'>
                    {mockEmergencyContacts.transportOffice}
                  </Text>
                </Flex>
                
                <Flex>
                  <Text fontSize='sm' color='gray.500' w='150px'>Driver Contact:</Text>
                  <Text fontSize='sm' fontWeight='500' color='blue.500' cursor='pointer'>
                    {mockEmergencyContacts.driverContact}
                  </Text>
                </Flex>
                
                <Flex>
                  <Text fontSize='sm' color='gray.500' w='150px'>Alternative Pickup:</Text>
                  <Text fontSize='sm'>
                    {mockEmergencyContacts.alternativePickup}
                  </Text>
                </Flex>
              </VStack>
            </Card>
            
            <Card variant='outline' p='15px'>
              <Text fontWeight='bold' fontSize='md' mb='10px'>
                Special Instructions
              </Text>
              
              <Text fontSize='sm' mb='10px'>
                {mockEmergencyContacts.specialInstructions}
              </Text>
              
              <Text fontWeight='500' fontSize='sm' mb='5px'>
                Authorized Persons for Pickup:
              </Text>
              
              <VStack align='stretch' spacing={1}>
                {mockEmergencyContacts.authorizedPersons.map((person, idx) => (
                  <HStack key={idx} spacing='3'>
                    <Icon
                      as={person.authorized ? MdCheckCircle : MdClose}
                      color={person.authorized ? 'green.500' : 'red.500'}
                    />
                    <Text fontSize='sm'>
                      {person.name} ({person.relation})
                    </Text>
                    <Text fontSize='sm' color='blue.500' cursor='pointer' ml='auto'>
                      {person.phone}
                    </Text>
                  </HStack>
                ))}
              </VStack>
              
              <Button size='sm' colorScheme='blue' variant='outline' mt='15px'>
                Update Instructions
              </Button>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Transport Issue Reporting */}
      <Card mb='20px'>
        <CardHeader>
          <Flex justify='space-between' align='center'>
            <Text fontSize='lg' fontWeight='bold'>Report Transport Issue</Text>
            <Button size='sm' colorScheme='red' leftIcon={<MdWarning />}>
              Report Issue
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap='20px'>
            <Card variant='outline' p='15px'>
              <Text fontWeight='bold' fontSize='md' mb='15px'>
                Common Issues
              </Text>
              
              <SimpleGrid columns={2} spacing={3}>
                <Button size='sm' colorScheme='gray' variant='outline'>
                  Bus Late
                </Button>
                <Button size='sm' colorScheme='gray' variant='outline'>
                  Missed Pickup
                </Button>
                <Button size='sm' colorScheme='gray' variant='outline'>
                  RFID Not Working
                </Button>
                <Button size='sm' colorScheme='gray' variant='outline'>
                  Driver Issue
                </Button>
                <Button size='sm' colorScheme='gray' variant='outline'>
                  Route Changed
                </Button>
                <Button size='sm' colorScheme='gray' variant='outline'>
                  Other Issue
                </Button>
              </SimpleGrid>
            </Card>
            
            <Card variant='outline' p='15px'>
              <Text fontWeight='bold' fontSize='md' mb='10px'>
                Recent Reported Issues
              </Text>
              
              <TableContainer>
                <Table size='sm' variant='simple'>
                  <Thead>
                    <Tr>
                      <Th>DATE</Th>
                      <Th>ISSUE</Th>
                      <Th>STATUS</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>Nov 8, 2024</Td>
                      <Td>Bus Late by 10 mins</Td>
                      <Td>
                        <Badge colorScheme='green'>Resolved</Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>Oct 25, 2024</Td>
                      <Td>RFID Not Detecting</Td>
                      <Td>
                        <Badge colorScheme='green'>Resolved</Badge>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
}
