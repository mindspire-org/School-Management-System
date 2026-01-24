import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  useColorModeValue,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
import { MdRoute, MdPlace, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdMoreVert, MdEdit, MdAdd } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRoutes = [
  { id: 'R1', name: 'North Loop', buses: 4, stops: 12, start: 'Main Gate', end: 'Civil Lines' },
  { id: 'R2', name: 'East Link', buses: 3, stops: 10, start: 'Main Gate', end: 'Askari 10' },
  { id: 'R3', name: 'West Express', buses: 2, stops: 9, start: 'Main Gate', end: 'Township' },
];

const mockStopsByRoute = {
  R1: ['Main Gate', 'Canal View', 'Shadman', 'Jail Rd', 'Civil Lines'],
  R2: ['Main Gate', 'Walton', 'Cantt', 'DHA', 'Askari 10'],
  R3: ['Main Gate', 'Faisal Town', 'Johar Town', 'Township'],
};

export default function RoutesStops() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('R1');
  const [routes, setRoutes] = useState(mockRoutes);
  const [stopsByRoute, setStopsByRoute] = useState(mockStopsByRoute);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const stopDisc = useDisclosure();
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({ id: '', name: '', start: '', end: '' });
  const [stopForm, setStopForm] = useState({ routeId: '', name: '' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const filtered = useMemo(() => {
    return routes.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));
  }, [routes, search]);

  const stats = useMemo(() => {
    const rcount = routes.length;
    const stops = routes.reduce((s, r) => s + r.stops, 0);
    const active = routes.length; // demo
    return { routes: rcount, stops, active };
  }, [routes]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Routes & Stops</Heading>
          <Text color={textColorSecondary}>Configure routes and their designated stops</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAdd />} colorScheme='blue' onClick={()=>{ setRouteForm({ id: `R${routes.length+1}`, name: '', start: '', end: '' }); editDisc.onOpen(); }}>Add Route</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Routes" value={String(stats.routes)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdRoute} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Total Stops" value={String(stats.stops)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdPlace} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Active Routes" value={String(stats.active)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdRoute} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search route' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={selected} onChange={(e) => setSelected(e.target.value)}>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.id} - {r.name}</option>
            ))}
          </Select>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
        <Card>
          <Box overflowX='auto'>
            <Table variant='simple'>
              <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th>Route</Th>
                  <Th>Name</Th>
                  <Th isNumeric>Buses</Th>
                  <Th isNumeric>Stops</Th>
                  <Th>Start</Th>
                  <Th>End</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((r) => (
                  <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Badge colorScheme='blue'>{r.id}</Badge></Td>
                    <Td><Text fontWeight='600'>{r.name}</Text></Td>
                    <Td isNumeric>{r.buses}</Td>
                    <Td isNumeric>{r.stops}</Td>
                    <Td>{r.start}</Td>
                    <Td>{r.end}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setActiveRoute(r); viewDisc.onOpen(); }} />
                        <Menu>
                          <MenuButton as={IconButton} aria-label='More' icon={<MdMoreVert />} size='sm' variant='ghost' />
                          <MenuList>
                            <MenuItem onClick={()=>{ setActiveRoute(r); viewDisc.onOpen(); }}>View Details</MenuItem>
                            <MenuItem onClick={()=>{ setRouteForm({ id: r.id, name: r.name, start: r.start, end: r.end }); editDisc.onOpen(); }}>Edit</MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Card>

        <Card>
          <Heading size='md' p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>Stops - {selected}</Heading>
          <VStack align='stretch' spacing={2} p={4}>
            <HStack justify='space-between' mb={2}>
              <Button leftIcon={<MdAdd />} size='sm' onClick={()=>{ setStopForm({ routeId: selected, name: '' }); stopDisc.onOpen(); }}>Add Stop</Button>
            </HStack>
            {stopsByRoute[selected].map((s, idx) => (
              <HStack key={`${s}-${idx}`} justify='space-between'>
                <Text>{s}</Text>
                <HStack>
                  <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setActiveRoute({ id: selected, name: routes.find(r=>r.id===selected)?.name, stop: s }); viewDisc.onOpen(); }} />
                  <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setStopForm({ routeId: selected, name: s }); stopDisc.onOpen(); }} />
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Card>
      </SimpleGrid>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeRoute && !activeRoute.stop && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>ID</Text><Text>{activeRoute.id}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Name</Text><Text>{activeRoute.name}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Buses</Text><Text>{activeRoute.buses}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Stops</Text><Text>{activeRoute.stops}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Start</Text><Text>{activeRoute.start}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>End</Text><Text>{activeRoute.end}</Text></HStack>
              </Box>
            )}
            {activeRoute && activeRoute.stop && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Route</Text><Text>{activeRoute.id} - {activeRoute.name}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Stop</Text><Text>{activeRoute.stop}</Text></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{routeForm && routes.find(r=>r.id===routeForm.id) ? 'Edit Route' : 'Add Route'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Route ID</FormLabel>
              <Input value={routeForm.id} onChange={(e)=> setRouteForm(f=>({ ...f, id: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={routeForm.name} onChange={(e)=> setRouteForm(f=>({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Start</FormLabel>
              <Input value={routeForm.start} onChange={(e)=> setRouteForm(f=>({ ...f, start: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>End</FormLabel>
              <Input value={routeForm.end} onChange={(e)=> setRouteForm(f=>({ ...f, end: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRoutes(prev => {
                const exists = prev.some(r => r.id===routeForm.id);
                if (exists) {
                  return prev.map(r => r.id===routeForm.id ? { ...r, name: routeForm.name, start: routeForm.start, end: routeForm.end } : r);
                }
                return [...prev, { id: routeForm.id, name: routeForm.name||routeForm.id, buses: 0, stops: 0, start: routeForm.start, end: routeForm.end }];
              });
              editDisc.onClose();
            }}>{routes.find(r=>r.id===routeForm.id) ? 'Save' : 'Create'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={stopDisc.isOpen} onClose={stopDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{stopsByRoute[stopForm.routeId]?.includes(stopForm.name) ? 'Edit Stop' : 'Add Stop'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Stop Name</FormLabel>
              <Input value={stopForm.name} onChange={(e)=> setStopForm(f=>({ ...f, name: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={stopDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setStopsByRoute(prev => {
                const cur = prev[stopForm.routeId] || [];
                const existsIdx = cur.findIndex(s => s===stopForm.name);
                const next = { ...prev };
                if (existsIdx>=0) {
                  // name may be unchanged; nothing else to do
                  next[stopForm.routeId] = cur;
                } else {
                  next[stopForm.routeId] = [...cur, stopForm.name];
                }
                return next;
              });
              setRoutes(prev => prev.map(r => r.id===stopForm.routeId ? { ...r, stops: (stopsByRoute[stopForm.routeId]?.length||0) + (stopsByRoute[stopForm.routeId]?.includes(stopForm.name)?0:1) } : r));
              stopDisc.onClose();
            }}>{stopsByRoute[stopForm.routeId]?.includes(stopForm.name) ? 'Save' : 'Add'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
