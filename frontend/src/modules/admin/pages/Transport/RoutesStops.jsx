import React, { useEffect, useMemo, useState } from 'react';
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
  Portal,
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
  useToast,
} from '@chakra-ui/react';
import { MdRoute, MdPlace, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdMoreVert, MdEdit, MdAdd } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import * as transportApi from '../../../../services/api/transport';

export default function RoutesStops() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('');
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const stopDisc = useDisclosure();
  const [activeRoute, setActiveRoute] = useState(null);
  const [routeForm, setRouteForm] = useState({ id: '', name: '', start: '', end: '' });
  const [stopForm, setStopForm] = useState({ routeId: '', stopId: '', name: '' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await transportApi.listRoutes();
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        setRoutes(items.map(r => ({ id: r.id, name: r.name, buses: Number(r.busesCount || 0), stops: Number(r.stopsCount || 0), start: r.start || '', end: r.end || '' })));
        if (items[0]) setSelected(String(items[0].id));
      } catch (e) {
        toast({ title: 'Failed to load routes', status: 'error' });
      }
    };
    loadRoutes();
  }, []);

  useEffect(() => {
    const loadStops = async () => {
      if (!selected) { setStops([]); return; }
      try {
        const res = await transportApi.listRouteStops(selected);
        const list = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        setStops(list);
        setRoutes(prev => prev.map(r => r.id === Number(selected) || r.id === selected ? { ...r, stops: list.length } : r));
      } catch (e) { setStops([]); }
    };
    loadStops();
  }, [selected]);

  const filtered = useMemo(() => {
    return routes.filter((r) => !search || String(r.name).toLowerCase().includes(search.toLowerCase()) || String(r.id).toLowerCase().includes(search.toLowerCase()));
  }, [routes, search]);

  const stats = useMemo(() => {
    const rcount = routes.length;
    const totalStops = routes.reduce((s, r) => s + (r.stops || 0), 0);
    const active = routes.length;
    return { routes: rcount, stops: totalStops, active };
  }, [routes]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Routes & Stops</Heading>
          <Text color={textColorSecondary}>Configure routes and their designated stops</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAdd />} colorScheme='blue' onClick={() => { setRouteForm({ id: '', name: '', start: '', end: '' }); editDisc.onOpen(); }}>Add Route</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard title="Routes" value={String(stats.routes)} icon={MdRoute} colorScheme="blue" />
        <StatCard title="Total Stops" value={String(stats.stops)} icon={MdPlace} colorScheme="green" />
        <StatCard title="Active Routes" value={String(stats.active)} icon={MdRoute} colorScheme="orange" />
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
                    <Td isNumeric>{r.buses || 0}</Td>
                    <Td isNumeric>{r.stops || 0}</Td>
                    <Td>{r.start || '-'}</Td>
                    <Td>{r.end || '-'}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setActiveRoute(r); viewDisc.onOpen(); }} />
                        <Menu isLazy placement='bottom-end'>
                          <MenuButton as={IconButton} aria-label='More' icon={<MdMoreVert />} size='sm' variant='ghost' />
                          <Portal>
                            <MenuList zIndex={1500}>
                              <MenuItem onClick={() => { setActiveRoute(r); viewDisc.onOpen(); }}>View Details</MenuItem>
                              <MenuItem onClick={() => { setRouteForm({ id: r.id, name: r.name, start: r.start || '', end: r.end || '' }); editDisc.onOpen(); }}>Edit</MenuItem>
                              <MenuItem color='red.500' onClick={async () => {
                                if (!window.confirm('Delete this route?')) return;
                                try {
                                  await transportApi.deleteRoute(r.id);
                                  setRoutes(prev => {
                                    const next = prev.filter(x => x.id !== r.id);
                                    if (String(selected) === String(r.id)) {
                                      setSelected(next[0] ? String(next[0].id) : '');
                                      setStops([]);
                                    }
                                    return next;
                                  });
                                  toast({ title: 'Route deleted', status: 'success' });
                                } catch (e) { toast({ title: 'Failed to delete route', status: 'error' }); }
                              }}>Delete</MenuItem>
                            </MenuList>
                          </Portal>
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
          <Heading size='md' p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>Stops - {selected || 'N/A'}</Heading>
          <VStack align='stretch' spacing={2} p={4}>
            <HStack justify='space-between' mb={2}>
              <Button leftIcon={<MdAdd />} size='sm' onClick={() => { setStopForm({ routeId: selected, stopId: '', name: '' }); stopDisc.onOpen(); }} isDisabled={!selected}>Add Stop</Button>
            </HStack>
            {stops.map((s) => (
              <HStack key={s.id} justify='space-between'>
                <Text>{s.name}</Text>
                <HStack>
                  <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setActiveRoute({ id: selected, name: routes.find(r => String(r.id) === String(selected))?.name, stop: s.name }); viewDisc.onOpen(); }} />
                  <Menu isLazy placement='bottom-end'>
                    <MenuButton as={IconButton} aria-label='More' icon={<MdMoreVert />} size='sm' variant='ghost' />
                    <Portal>
                      <MenuList zIndex={1500}>
                        <MenuItem onClick={() => { setStopForm({ routeId: selected, stopId: s.id, name: s.name }); stopDisc.onOpen(); }}>Edit</MenuItem>
                        <MenuItem color='red.500' onClick={async () => {
                          if (!window.confirm('Delete this stop?')) return;
                          try { await transportApi.removeStop(selected, s.id); setStops(prev => prev.filter(x => x.id !== s.id)); setRoutes(prev => prev.map(r => String(r.id) === String(selected) ? { ...r, stops: Math.max(0, (r.stops || 1) - 1) } : r)); toast({ title: 'Stop deleted', status: 'success' }); } catch (e) { toast({ title: 'Failed to delete stop', status: 'error' }); }
                        }}>Delete</MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
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
          <ModalHeader>{routeForm && routes.find(r => String(r.id) === String(routeForm.id)) ? 'Edit Route' : 'Add Route'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={routeForm.name} onChange={(e) => setRouteForm(f => ({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Start</FormLabel>
              <Input value={routeForm.start} onChange={(e) => setRouteForm(f => ({ ...f, start: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>End</FormLabel>
              <Input value={routeForm.end} onChange={(e) => setRouteForm(f => ({ ...f, end: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async () => {
              try {
                const exists = routes.find(r => String(r.id) === String(routeForm.id));
                if (exists) {
                  await transportApi.updateRoute(routeForm.id, { name: routeForm.name, start: routeForm.start, end: routeForm.end });
                  setRoutes(prev => prev.map(r => String(r.id) === String(routeForm.id) ? { ...r, name: routeForm.name, start: routeForm.start, end: routeForm.end } : r));
                } else {
                  const created = await transportApi.createRoute({ name: routeForm.name, start: routeForm.start, end: routeForm.end });
                  setRoutes(prev => [...prev, { id: created.id, name: created.name, buses: 0, stops: 0, start: created.start || '', end: created.end || '' }]);
                  setSelected(String(created.id));
                  setStops([]);
                }
                editDisc.onClose();
              } catch (e) { toast({ title: 'Failed to save route', status: 'error' }); }
            }}>{routes.find(r => String(r.id) === String(routeForm.id)) ? 'Save' : 'Create'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={stopDisc.isOpen} onClose={stopDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{stopForm.stopId ? 'Edit Stop' : 'Add Stop'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Stop Name</FormLabel>
              <Input value={stopForm.name} onChange={(e) => setStopForm(f => ({ ...f, name: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={stopDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async () => {
              if (!stopForm.routeId) { toast({ title: 'Select a route first', status: 'warning' }); return; }
              try {
                if (stopForm.stopId) {
                  await transportApi.updateStop(stopForm.routeId, stopForm.stopId, { name: stopForm.name });
                  setStops(prev => prev.map(s => s.id === stopForm.stopId ? { ...s, name: stopForm.name } : s));
                } else {
                  const created = await transportApi.addStop(stopForm.routeId, { name: stopForm.name });
                  setStops(prev => [...prev, created]);
                  setRoutes(prev => prev.map(r => String(r.id) === String(stopForm.routeId) ? { ...r, stops: (r.stops || 0) + 1 } : r));
                }
                stopDisc.onClose();
              } catch (e) { toast({ title: 'Failed to save stop', status: 'error' }); }
            }}>{stopForm.stopId ? 'Save' : 'Add'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
