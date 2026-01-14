import React, { useEffect, useMemo, useState } from 'react';
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
import * as transportApi from '../../services/api/transport';

export default function PickupDrop() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const subtle = useColorModeValue('gray.50', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const [routes, setRoutes] = useState([]);
  const [routeId, setRouteId] = useState('');
  const [mode, setMode] = useState('pickup'); // pickup | drop
  const [query, setQuery] = useState('');
  const [stopId, setStopId] = useState('');
  const [otpStudent, setOtpStudent] = useState(null);
  const [proofStudent, setProofStudent] = useState(null);
  const otpDisc = useDisclosure();
  const proofDisc = useDisclosure();
  const [otpValue, setOtpValue] = useState('');
  const [noteValue, setNoteValue] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await transportApi.listRoutes();
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped = items.map((r) => ({
          id: String(r.id),
          name: r.name,
          direction: '',
          vehicleId: r.busesCount ? `Buses: ${r.busesCount}` : '',
          stops: [],
          students: [],
        }));
        setRoutes(mapped);
        if (mapped.length) setRouteId(mapped[0].id);
      } catch (e) {
        setRoutes([]);
        setRouteId('');
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        if (!routeId) return;
        const data = await transportApi.listRouteStops(routeId);
        const stops = Array.isArray(data?.items) ? data.items : [];
        setRoutes((prev) => prev.map((r) => {
          if (String(r.id) !== String(routeId)) return r;
          return {
            ...r,
            stops: stops.map((s) => ({
              id: String(s.id),
              name: s.name,
              time: '',
              eta: '',
            })),
          };
        }));
        if (stops.length) setStopId(String(stops[0].id));
        else setStopId('');
      } catch (e) {
        setStopId('');
      }
    };
    fetchStops();
  }, [routeId]);

  const selectedRoute = useMemo(() => routes.find(r => String(r.id) === String(routeId)), [routes, routeId]);
  const stopOptions = selectedRoute?.stops || [];
  const currentStop = stopOptions.find(s => String(s.id) === String(stopId)) || stopOptions[0];

  const students = selectedRoute?.students || [];
  const visibleStudents = useMemo(() => {
    let list = students;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s => String(s.name || '').toLowerCase().includes(q));
    }
    return list;
  }, [students, query]);

  const total = visibleStudents.length;
  const completedCount = visibleStudents.filter(s => s.status === (mode === 'pickup' ? 'boarded' : 'dropped')).length;
  const remaining = Math.max(0, total - completedCount);

  const updateStudent = () => {};

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
    toast({ status: 'info', title: 'Pickup/Drop actions will be available once student-stop assignments are integrated.' });
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
            <Select size='sm' value={stopId} onChange={e=>setStopId(e.target.value)}>
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
