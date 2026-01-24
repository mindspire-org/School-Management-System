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
  Textarea,
} from '@chakra-ui/react';
import {
  MdPeople,
  MdDirectionsBus,
  MdAltRoute,
  MdAccessTime,
  MdMap,
  MdCheckCircle,
  MdClose,
  MdPhotoCamera,
  MdNorthEast,
  MdSouthWest,
} from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';

export default function PickupDrop() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const subtle = useColorModeValue('gray.50', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const demoRoutes = useMemo(() => ([
    {
      id: 'R-A',
      name: 'Route A - North Loop',
      direction: 'Morning',
      vehicleId: 'BUS-12',
      stops: [
        { id: 1, name: 'Maple Ave - Stop 1', time: '07:05 AM', eta: '07:05 AM' },
        { id: 2, name: 'Oak Street - Stop 2', time: '07:12 AM', eta: '07:12 AM' },
        { id: 3, name: 'Pine Crescent - Stop 3', time: '07:19 AM', eta: '07:19 AM' },
        { id: 4, name: 'Birch Lane - Stop 4', time: '07:25 AM', eta: '07:25 AM' },
        { id: 5, name: 'Cedar Ct - Stop 5', time: '07:32 AM', eta: '07:32 AM' },
        { id: 6, name: 'Walnut Rd - Stop 6', time: '07:38 AM', eta: '07:38 AM' },
        { id: 7, name: 'Poplar St - Stop 7', time: '07:43 AM', eta: '07:43 AM' },
        { id: 8, name: 'Sycamore Ave - Stop 8', time: '07:48 AM', eta: '07:48 AM' },
        { id: 9, name: 'Ash Grove - Stop 9', time: '07:53 AM', eta: '07:53 AM' },
        { id: 10, name: 'Willow Park - Stop 10', time: '07:57 AM', eta: '07:57 AM' },
        { id: 11, name: 'Elm Heights - Stop 11', time: '08:00 AM', eta: '08:00 AM' },
        { id: 12, name: 'School Main Gate', time: '08:06 AM', eta: '08:06 AM' },
      ],
      students: [
        { id: 'S-01', name: 'Ali Khan', stopId: 2, status: 'pending', otp: '2041' },
        { id: 'S-02', name: 'Sara Ahmed', stopId: 2, status: 'pending', otp: '5312' },
        { id: 'S-03', name: 'Usman Tariq', stopId: 3, status: 'pending', otp: '9173' },
        { id: 'S-04', name: 'Fatima Noor', stopId: 5, status: 'pending', otp: '6635' },
        { id: 'S-07', name: 'Bilal Ahmad', stopId: 7, status: 'pending', otp: '3402' },
        { id: 'S-08', name: 'Zainab Ali', stopId: 7, status: 'pending', otp: '2874' },
        { id: 'S-09', name: 'Hamza Siddiqui', stopId: 8, status: 'pending', otp: '7741' },
        { id: 'S-10', name: 'Noor Fatima', stopId: 8, status: 'pending', otp: '4480' },
        { id: 'S-11', name: 'Daniyal Khan', stopId: 9, status: 'pending', otp: '1559' },
        { id: 'S-12', name: 'Mina Aslam', stopId: 9, status: 'pending', otp: '9863' },
        { id: 'S-13', name: 'Hassan Raza', stopId: 10, status: 'pending', otp: '4217' },
        { id: 'S-14', name: 'Ayesha Malik', stopId: 10, status: 'pending', otp: '7335' },
        { id: 'S-15', name: 'Mahnoor Fazal', stopId: 11, status: 'pending', otp: '6604' },
        { id: 'S-16', name: 'Umer Farooq', stopId: 11, status: 'pending', otp: '2098' },
      ],
    },
    {
      id: 'R-B',
      name: 'Route B - South Loop',
      direction: 'Afternoon',
      vehicleId: 'BUS-08',
      stops: [
        { id: 1, name: 'School Main Gate', time: '02:35 PM', eta: '02:35 PM' },
        { id: 2, name: 'Lakeview Rd - Stop 1', time: '02:48 PM', eta: '02:48 PM' },
        { id: 3, name: 'Elm Street - Stop 2', time: '03:01 PM', eta: '03:01 PM' },
        { id: 4, name: 'Hilltop Ave - Stop 3', time: '03:16 PM', eta: '03:17 PM' },
        { id: 5, name: 'Ridge Blvd - Stop 4', time: '03:28 PM', eta: '03:28 PM' },
        { id: 6, name: 'Valley View - Stop 5', time: '03:36 PM', eta: '03:37 PM' },
        { id: 7, name: 'Canyon Dr - Stop 6', time: '03:45 PM', eta: '03:46 PM' },
        { id: 8, name: 'Riverbank - Stop 7', time: '03:55 PM', eta: '03:55 PM' },
      ],
      students: [
        { id: 'S-21', name: 'Ahmad Raza', stopId: 2, status: 'pending', otp: '4321' },
        { id: 'S-22', name: 'Mehak Iqbal', stopId: 3, status: 'pending', otp: '8423' },
        { id: 'S-23', name: 'Zoya Khan', stopId: 3, status: 'pending', otp: '1177' },
        { id: 'S-24', name: 'Laiba Arif', stopId: 4, status: 'pending', otp: '9054' },
        { id: 'S-25', name: 'Rehan Ali', stopId: 4, status: 'pending', otp: '1190' },
        { id: 'S-26', name: 'Saad Munir', stopId: 5, status: 'pending', otp: '3388' },
        { id: 'S-27', name: 'Hira Shah', stopId: 5, status: 'pending', otp: '6642' },
        { id: 'S-28', name: 'Ibrahim Saleem', stopId: 6, status: 'pending', otp: '7740' },
        { id: 'S-29', name: 'Anaya Javed', stopId: 6, status: 'pending', otp: '5022' },
        { id: 'S-30', name: 'Ammar Nadeem', stopId: 7, status: 'pending', otp: '2903' },
        { id: 'S-31', name: 'Rumaisa Tariq', stopId: 7, status: 'pending', otp: '6614' },
        { id: 'S-32', name: 'Shayan Ali', stopId: 8, status: 'pending', otp: '8812' },
        { id: 'S-33', name: 'Huda Asghar', stopId: 8, status: 'pending', otp: '1168' },
      ],
    },
  ]), []);

  const [routes, setRoutes] = useState(demoRoutes);
  const [routeId, setRouteId] = useState(demoRoutes[0].id);
  const [mode, setMode] = useState('pickup'); // pickup | drop
  const [query, setQuery] = useState('');
  const [stopId, setStopId] = useState(demoRoutes[0].stops[0].id);
  const [otpStudent, setOtpStudent] = useState(null);
  const [proofStudent, setProofStudent] = useState(null);
  const otpDisc = useDisclosure();
  const proofDisc = useDisclosure();
  const [otpValue, setOtpValue] = useState('');
  const [noteValue, setNoteValue] = useState('');

  const selectedRoute = useMemo(() => routes.find(r => r.id === routeId), [routes, routeId]);
  const stopOptions = selectedRoute?.stops || [];
  const currentStop = stopOptions.find(s => s.id === stopId) || stopOptions[0];

  const students = selectedRoute?.students || [];
  const visibleStudents = useMemo(() => {
    let list = students.filter(s => s.stopId === currentStop?.id);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [students, currentStop, query]);

  const total = visibleStudents.length;
  const completedCount = visibleStudents.filter(s => s.status === (mode === 'pickup' ? 'boarded' : 'dropped')).length;
  const remaining = Math.max(0, total - completedCount);

  const updateStudent = (sid, patch) => {
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      return { ...r, students: r.students.map(s => s.id === sid ? { ...s, ...patch } : s) };
    }));
  };

  const verifyOtp = () => {
    if (!otpStudent) return;
    const correct = otpStudent.otp;
    if (otpValue.trim() === correct) {
      toast({ status: 'success', title: 'OTP verified' });
      otpDisc.onClose();
      setOtpValue('');
    } else {
      toast({ status: 'error', title: 'Incorrect OTP' });
    }
  };

  const boardOrDrop = (st) => {
    const newStatus = mode === 'pickup' ? 'boarded' : 'dropped';
    updateStudent(st.id, { status: newStatus, lastActionAt: new Date().toLocaleTimeString() });
    toast({ status: 'success', title: mode === 'pickup' ? 'Marked as boarded' : 'Marked as dropped' });
  };

  const markAbsent = (st) => {
    updateStudent(st.id, { status: 'absent', lastActionAt: new Date().toLocaleTimeString() });
    toast({ status: 'info', title: 'Marked as absent' });
  };

  const boardAllAtStop = () => {
    const newStatus = mode === 'pickup' ? 'boarded' : 'dropped';
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      return { ...r, students: r.students.map(s => s.stopId === currentStop.id ? { ...s, status: newStatus } : s) };
    }));
    toast({ status: 'success', title: mode === 'pickup' ? 'All boarded at stop' : 'All dropped at stop' });
  };

  const exportCSV = () => {
    const header = ['ID', 'Name', 'Stop', 'Mode', 'Status'];
    const rows = visibleStudents.map(s => [s.id, s.name, currentStop?.name || '-', mode, s.status]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pickup_drop_${selectedRoute?.id}_${currentStop?.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Student Pickup & Drop</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Stop-wise student management with OTP and proof</Text>

      <Card p='16px' mb='16px'>
        <SimpleGrid columns={{ base: 1, lg: 5 }} spacing='12px' alignItems='center'>
          <HStack>
            <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#00b09b 0%,#96c93d 100%)' icon={<Icon as={MdAltRoute} w='22px' h='22px' color='white' />} />
            <VStack align='start' spacing={0} minW='0'>
              <Text fontWeight='600'>Route</Text>
              <Select size='sm' value={routeId} onChange={e=>{ const id=e.target.value; setRouteId(id); const rt=routes.find(r=>r.id===id); setStopId(rt?.stops[0]?.id||''); }}>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </VStack>
          </HStack>
          <VStack align='start' spacing={0}>
            <Text fontWeight='600'>Mode</Text>
            <Select size='sm' value={mode} onChange={e=>{ setMode(e.target.value); }}>
              <option value='pickup'>Pickup</option>
              <option value='drop'>Drop</option>
            </Select>
          </VStack>
          <VStack align='start' spacing={0}>
            <Text fontWeight='600'>Stop</Text>
            <Select size='sm' value={stopId} onChange={e=>setStopId(Number(e.target.value))}>
              {stopOptions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </VStack>
          <VStack align='start' spacing={0}>
            <Text fontWeight='600'>Search</Text>
            <Input size='sm' placeholder='Type student name...' value={query} onChange={e=>setQuery(e.target.value)} />
          </VStack>
          <HStack justify='flex-end'>
            <Button size='sm' onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </SimpleGrid>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing='20px'>
        <Card p='16px'>
          <HStack justify='space-between' align='start' flexWrap='wrap' rowGap={2}>
            <VStack align='start' spacing={0}>
              <Text fontSize='lg' fontWeight='bold'>{selectedRoute?.name}</Text>
              <HStack spacing={2}>
                <Badge>{selectedRoute?.direction === 'Morning' ? <MdNorthEast /> : <MdSouthWest />}</Badge>
                <Badge colorScheme='blue'><Icon as={MdDirectionsBus} me='4px' />{selectedRoute?.vehicleId}</Badge>
                <Badge variant='subtle'><Icon as={MdAccessTime} me='4px' />ETA {currentStop?.eta}</Badge>
              </HStack>
            </VStack>
            <HStack>
              <Button size='sm' colorScheme='green' variant='solid' onClick={boardAllAtStop}>{mode === 'pickup' ? 'Board All at Stop' : 'Drop All at Stop'}</Button>
            </HStack>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing='12px' mt='12px'>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Total Students</Text>
              <Text fontWeight='700'>{total}</Text>
            </Card>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>{mode === 'pickup' ? 'Boarded' : 'Dropped'}</Text>
              <Text fontWeight='700'>{completedCount}</Text>
            </Card>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Remaining</Text>
              <Text fontWeight='700'>{remaining}</Text>
            </Card>
          </SimpleGrid>
          <Box mt='12px' h='8px' bg={useColorModeValue('gray.200','gray.600')} borderRadius='full' position='relative'>
            <Box h='100%' w={`${total ? Math.round((completedCount/total)*100) : 0}%`} bg='green.400' borderRadius='full' />
          </Box>
        </Card>

        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Stop Map</Text>
          <Box h={{ base: '260px', md: '320px' }} borderRadius='12px' bg={subtle} borderWidth='1px' borderColor={border} display='flex' alignItems='center' justifyContent='center'>
            <VStack spacing={1}>
              <Icon as={MdMap} w='32px' h='32px' color='gray.400' />
              <Text fontSize='sm' color={textSecondary}>Map placeholder — integrate map SDK here</Text>
            </VStack>
          </Box>
        </Card>
      </SimpleGrid>

      <Card p='16px' mt='20px'>
        <HStack justify='space-between' align='center' mb='8px'>
          <HStack>
            <Icon as={MdPeople} />
            <Text fontSize='lg' fontWeight='bold'>Students at this Stop</Text>
          </HStack>
          <HStack>
            <Tag colorScheme='blue'>{mode === 'pickup' ? 'Pickup' : 'Drop'}</Tag>
          </HStack>
        </HStack>
        <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
          <Box maxH='380px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                <Tr>
                  <Th>ID</Th>
                  <Th>Student</Th>
                  <Th>OTP</Th>
                  <Th>Status</Th>
                  <Th>Last Action</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {visibleStudents.map(st => (
                  <Tr key={st.id}>
                    <Td>{st.id}</Td>
                    <Td maxW='260px'><Text noOfLines={1}>{st.name}</Text></Td>
                    <Td>
                      <Tag>{st.otp}</Tag>
                    </Td>
                    <Td>
                      <Badge colorScheme={st.status === 'boarded' || st.status === 'dropped' ? 'green' : st.status === 'absent' ? 'red' : 'gray'}>
                        {st.status}
                      </Badge>
                    </Td>
                    <Td>{st.lastActionAt || '-'}</Td>
                    <Td isNumeric>
                      <HStack spacing={2} justify='flex-end'>
                        <Tooltip label='Verify OTP'>
                          <Button size='xs' variant='outline' onClick={()=>{ setOtpStudent(st); setOtpValue(''); otpDisc.onOpen(); }}>Verify</Button>
                        </Tooltip>
                        <Tooltip label={mode === 'pickup' ? 'Mark Boarded' : 'Mark Dropped'}>
                          <IconButton size='sm' aria-label='board/drop' icon={<MdCheckCircle />} onClick={()=>boardOrDrop(st)} isDisabled={st.status === 'boarded' || st.status === 'dropped'} />
                        </Tooltip>
                        <Tooltip label='Mark Absent'>
                          <IconButton size='sm' aria-label='absent' icon={<MdClose />} onClick={()=>markAbsent(st)} colorScheme='red' variant='outline' />
                        </Tooltip>
                        <Tooltip label='Upload Proof'>
                          <IconButton size='sm' aria-label='proof' icon={<MdPhotoCamera />} onClick={()=>{ setProofStudent(st); proofDisc.onOpen(); }} />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={otpDisc.isOpen} onClose={otpDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Verify OTP</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Text>Enter OTP for {otpStudent?.name}</Text>
              <Input value={otpValue} onChange={e=>setOtpValue(e.target.value)} placeholder='Enter OTP' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={otpDisc.onClose}>Cancel</Button>
            <Button colorScheme='green' onClick={verifyOtp}>Verify</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={proofDisc.isOpen} onClose={proofDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Proof</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Text>Attach optional photo or note for {proofStudent?.name}</Text>
              <Input type='file' accept='image/*' />
              <Textarea placeholder='Note (optional)' value={noteValue} onChange={e=>setNoteValue(e.target.value)} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={()=>{ setNoteValue(''); proofDisc.onClose(); }}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ proofDisc.onClose(); toast({ status:'success', title:'Proof saved' }); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
