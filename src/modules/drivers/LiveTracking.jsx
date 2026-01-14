import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Badge,
  Icon,
  HStack,
  VStack,
  Button,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  Select,
  Input,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  IconButton,
} from '@chakra-ui/react';
import {
  MdMap,
  MdGpsFixed,
  MdDirectionsBus,
  MdAccessTime,
  MdMyLocation,
  MdRefresh,
  MdLayers,
  MdPlayArrow,
  MdStop,
  MdReportProblem,
  MdCheckCircle,
  MdPeople,
} from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';
import SparklineChart from '../../components/charts/SparklineChart';

export default function LiveTracking() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const subtle = useColorModeValue('gray.50', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();
  const sosDisc = useDisclosure();
  const incidentDisc = useDisclosure();

  const data = useMemo(() => ({
    routeName: 'Route A - North Loop',
    vehicleId: 'BUS-12',
    distance: '18.6 km',
    duration: '1h 25m',
    progress: 62,
    gpsStatus: 'Connected',
    network: 'Good',
    heading: 'NE',
    speed: 36,
    speedTrend: [28, 32, 30, 35, 36, 31, 34, 38, 33, 36, 37, 35, 34, 36, 39, 37, 35, 33, 34, 36, 38, 37, 36, 35],
    lastUpdate: '1 min ago',
    nextStop: { name: 'Stop #7 - Oak Street', eta: '08:42 AM' },
    currentStop: { name: 'Poplar St - Stop 7', eta: '08:35 AM' },
    stops: [
      { id: 1, name: 'Maple Ave - Stop 1', eta: '07:05 AM', status: 'completed' },
      { id: 2, name: 'Oak Street - Stop 2', eta: '07:12 AM', status: 'completed' },
      { id: 3, name: 'Pine Crescent - Stop 3', eta: '07:19 AM', status: 'completed' },
      { id: 4, name: 'Birch Lane - Stop 4', eta: '07:25 AM', status: 'completed' },
      { id: 5, name: 'Cedar Ct - Stop 5', eta: '07:32 AM', status: 'completed' },
      { id: 6, name: 'Walnut Rd - Stop 6', eta: '07:38 AM', status: 'completed' },
      { id: 7, name: 'Poplar St - Stop 7', eta: '07:43 AM', status: 'pending' },
      { id: 8, name: 'Sycamore Ave - Stop 8', eta: '07:48 AM', status: 'pending' },
      { id: 9, name: 'Ash Grove - Stop 9', eta: '07:53 AM', status: 'pending' },
      { id: 10, name: 'Willow Park - Stop 10', eta: '07:57 AM', status: 'pending' },
      { id: 11, name: 'Elm Heights - Stop 11', eta: '08:00 AM', status: 'pending' },
      { id: 12, name: 'School Main Gate', eta: '08:06 AM', status: 'pending' },
    ],
    students: [
      { id: 'S-01', name: 'Ali Khan', stopId: 7, status: 'waiting' },
      { id: 'S-02', name: 'Sara Ahmed', stopId: 7, status: 'waiting' },
      { id: 'S-03', name: 'Usman Tariq', stopId: 8, status: 'waiting' },
      { id: 'S-04', name: 'Fatima Noor', stopId: 8, status: 'waiting' },
      { id: 'S-05', name: 'Hassan Raza', stopId: 9, status: 'waiting' },
      { id: 'S-06', name: 'Ayesha Malik', stopId: 9, status: 'waiting' },
      { id: 'S-07', name: 'Bilal Ahmad', stopId: 10, status: 'waiting' },
      { id: 'S-08', name: 'Zainab Ali', stopId: 10, status: 'waiting' },
      { id: 'S-09', name: 'Hamza Siddiqui', stopId: 11, status: 'waiting' },
      { id: 'S-10', name: 'Noor Fatima', stopId: 11, status: 'waiting' },
      { id: 'S-11', name: 'Daniyal Khan', stopId: 12, status: 'waiting' },
      { id: 'S-12', name: 'Mina Aslam', stopId: 12, status: 'waiting' },
    ],
  }), []);

  const [tracking, setTracking] = useState(true);
  const [mapStyle, setMapStyle] = useState('default');
  const [students, setStudents] = useState(data.students);

  const completedStops = data.stops.filter(s => s.status === 'completed').length;
  const remainingStops = data.stops.length - completedStops;

  const markBoarded = (sid) => {
    setStudents(prev => prev.map(s => s.id === sid ? { ...s, status: 'boarded' } : s));
    toast({ status: 'success', title: 'Student marked as boarded' });
  };

  const markAbsent = (sid) => {
    setStudents(prev => prev.map(s => s.id === sid ? { ...s, status: 'absent' } : s));
    toast({ status: 'info', title: 'Student marked as absent' });
  };

  const exportStopsCSV = () => {
    const header = ['#', 'Stop', 'ETA', 'Status'];
    const rows = data.stops.map(s => [s.id, s.name, s.eta, s.status]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `route_stops.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Live Tracking</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Real-time vehicle position with route, stops and student details</Text>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing='20px'>
        {/* Map + Controls */}
        <Card p='16px'>
          <HStack justify='space-between' align='center' mb='10px' flexWrap='wrap' rowGap={2}>
            <HStack>
              <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<Icon as={MdMap} w='22px' h='22px' color='white' />} />
              <VStack spacing={0} align='start'>
                <Text fontWeight='600'>Route Map</Text>
                <HStack spacing={2}>
                  <Badge colorScheme='blue'><Icon as={MdDirectionsBus} me='4px' />{data.vehicleId}</Badge>
                  <Badge variant='subtle'>{data.distance}</Badge>
                  <Badge variant='subtle'>{data.duration}</Badge>
                </HStack>
              </VStack>
            </HStack>
            <HStack>
              <Tooltip label='Recenter'>
                <IconButton aria-label='recenter' size='sm' icon={<MdMyLocation />} />
              </Tooltip>
              <Tooltip label={tracking ? 'Stop tracking' : 'Start tracking'}>
                <Button size='sm' leftIcon={tracking ? <MdStop /> : <MdPlayArrow />} onClick={()=>{ setTracking(!tracking); toast({ status:'success', title: tracking ? 'Tracking paused' : 'Tracking started' }); }}>{tracking ? 'Stop' : 'Start'}</Button>
              </Tooltip>
              <Tooltip label='Refresh now'>
                <IconButton aria-label='refresh' size='sm' icon={<MdRefresh />} onClick={()=>toast({ status:'success', title:'Data refreshed' })} />
              </Tooltip>
              <Tooltip label='Map style'>
                <Button size='sm' leftIcon={<MdLayers />} onClick={()=> setMapStyle(mapStyle === 'default' ? 'satellite' : 'default')}>{mapStyle === 'default' ? 'Default' : 'Satellite'}</Button>
              </Tooltip>
            </HStack>
          </HStack>
          <Box h={{ base: '260px', md: '360px' }} borderRadius='12px' bg={subtle} borderWidth='1px' borderColor={border} display='flex' alignItems='center' justifyContent='center'>
            <VStack spacing={1}>
              <Icon as={MdMap} w='36px' h='36px' color='gray.400' />
              <Text fontSize='sm' color={textSecondary}>Map placeholder — integrate map SDK here</Text>
            </VStack>
          </Box>
          <HStack mt='10px' spacing={4} flexWrap='wrap'>
            <Tag>GPS: {data.gpsStatus}</Tag>
            <Tag>Network: {data.network}</Tag>
            <Tag>Heading: {data.heading}</Tag>
            <Tag>Last update: {data.lastUpdate}</Tag>
          </HStack>
        </Card>

        {/* Details */}
        <VStack spacing='20px' align='stretch'>
          <Card p='16px'>
            <HStack justify='space-between' align='start' flexWrap='wrap' rowGap={2}>
              <VStack align='start' spacing={0}>
                <Text fontSize='lg' fontWeight='bold'>Trip Summary</Text>
                <Text fontSize='sm' color={textSecondary} noOfLines={1}>{data.routeName}</Text>
              </VStack>
              <Badge colorScheme='green'>{data.progress}%</Badge>
            </HStack>
            <Box mt='10px' h='8px' bg={useColorModeValue('gray.200','gray.600')} borderRadius='full' position='relative'>
              <Box h='100%' w={`${data.progress}%`} bg='green.400' borderRadius='full' />
            </Box>
            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing='12px' mt='12px'>
              <Card p='12px'>
                <Text fontSize='xs' color={textSecondary}>Next Stop</Text>
                <Text fontWeight='700' noOfLines={1}>{data.nextStop.name}</Text>
              </Card>
              <Card p='12px'>
                <Text fontSize='xs' color={textSecondary}>ETA</Text>
                <Text fontWeight='700'>{data.nextStop.eta}</Text>
              </Card>
              <Card p='12px'>
                <Text fontSize='xs' color={textSecondary}>Stops</Text>
                <Text fontWeight='700'>{completedStops} / {data.stops.length}</Text>
              </Card>
            </SimpleGrid>
          </Card>

          <Card p='16px'>
            <HStack justify='space-between' align='start'>
              <VStack align='start' spacing={0}>
                <Text fontSize='lg' fontWeight='bold'>Live Metrics</Text>
                <Text fontSize='sm' color={textSecondary}>Speed over last updates</Text>
              </VStack>
              <Badge>{data.speed} km/h</Badge>
            </HStack>
            <Box mt='8px'>
              <SparklineChart data={data.speedTrend} color="#3182CE" height={60} valueFormatter={(v)=>`${v} km/h`} />
            </Box>
            <HStack mt='10px' spacing={4} flexWrap='wrap'>
              <Tag><Icon as={MdGpsFixed} me='4px' />{data.gpsStatus}</Tag>
              <Tag><Icon as={MdAccessTime} me='4px' />{data.lastUpdate}</Tag>
            </HStack>
          </Card>

          <Card p='16px'>
            <HStack justify='space-between' align='center' mb='8px'>
              <HStack>
                <Icon as={MdPeople} />
                <Text fontSize='lg' fontWeight='bold'>Students</Text>
              </HStack>
              <HStack>
                <Button size='sm' colorScheme='orange' variant='outline' leftIcon={<MdReportProblem />} onClick={sosDisc.onOpen}>SOS</Button>
                <Button size='sm' variant='outline' onClick={incidentDisc.onOpen}>Report Incident</Button>
              </HStack>
            </HStack>
            <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
              <Box maxH='260px' overflowY='auto'>
                <Table size='sm' variant='simple'>
                  <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>Stop</Th>
                      <Th>Status</Th>
                      <Th textAlign='right'>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {students.map(st => {
                      const stop = data.stops.find(s => s.id === st.stopId);
                      return (
                        <Tr key={st.id}>
                          <Td>{st.id}</Td>
                          <Td maxW='220px'><Text noOfLines={1}>{st.name}</Text></Td>
                          <Td maxW='260px'><Text noOfLines={1}>{stop ? stop.name : '-'}</Text></Td>
                          <Td>
                            <Badge colorScheme={st.status === 'boarded' ? 'green' : st.status === 'absent' ? 'red' : 'gray'}>{st.status}</Badge>
                          </Td>
                          <Td isNumeric>
                            <HStack spacing={2} justify='flex-end'>
                              <Tooltip label='Mark boarded'>
                                <IconButton size='sm' aria-label='boarded' icon={<MdCheckCircle />} onClick={()=>markBoarded(st.id)} isDisabled={st.status === 'boarded'} />
                              </Tooltip>
                              <Tooltip label='Mark absent'>
                                <Button size='xs' colorScheme='red' variant='ghost' onClick={()=>markAbsent(st.id)}>Absent</Button>
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Card>
        </VStack>
      </SimpleGrid>

      {/* SOS Modal */}
      <Modal isOpen={sosDisc.isOpen} onClose={sosDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send SOS</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select defaultValue='accident'>
                <option value='accident'>Accident</option>
                <option value='medical'>Medical</option>
                <option value='security'>Security</option>
                <option value='vehicle'>Vehicle Breakdown</option>
              </Select>
              <Input placeholder='Location (optional)' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={sosDisc.onClose}>Cancel</Button>
            <Button colorScheme='orange' onClick={()=>{ sosDisc.onClose(); toast({ status:'warning', title:'SOS sent' }); }}>Send SOS</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Incident Modal */}
      <Modal isOpen={incidentDisc.isOpen} onClose={incidentDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Incident</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select defaultValue='delay'>
                <option value='delay'>Delay</option>
                <option value='behavior'>Student Behavior</option>
                <option value='traffic'>Traffic/Route</option>
                <option value='vehicle'>Vehicle Issue</option>
              </Select>
              <Input placeholder='Notes (optional)' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={incidentDisc.onClose}>Cancel</Button>
            <Button colorScheme='pink' onClick={()=>{ incidentDisc.onClose(); toast({ status:'success', title:'Incident submitted' }); }}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
