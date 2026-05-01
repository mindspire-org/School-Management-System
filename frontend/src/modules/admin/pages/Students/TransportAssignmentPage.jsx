import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Button, SimpleGrid, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Input, InputGroup, InputLeftElement, Select, Avatar, HStack, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast } from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
// Icons
import { MdDirectionsBus, MdCreditCard, MdLocationOn, MdPerson, MdSearch, MdFilterList, MdRemoveRedEye, MdMoreVert, MdMap } from 'react-icons/md';
// API
import * as transportApi from '../../../../services/api/transport';
import useClassOptions from '../../../../hooks/useClassOptions';

export default function TransportAssignmentPage() {
  const toast = useToast();
  const [entries, setEntries] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [stats, setStats] = useState({ totalBuses: 0, busUsers: 0, activeRfid: 0, totalRoutes: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterBus, setFilterBus] = useState('all');

  const { classOptions } = useClassOptions();
  const assignDisc = useDisclosure();
  const [assignState, setAssignState] = useState({ studentId: null, busId: '', routeId: '', pickupStopId: '', dropStopId: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, busesRes, routesRes, entriesRes] = await Promise.all([
        transportApi.getStats(),
        transportApi.listBuses(),
        transportApi.listRoutes(),
        transportApi.listStudentEntries({
          q: search || undefined,
          className: filterClass !== 'all' ? filterClass : undefined,
          busId: filterBus !== 'all' && filterBus !== 'none' ? Number(filterBus) : undefined
        })
      ]);

      setStats(statsRes);
      setBuses(Array.isArray(busesRes?.items) ? busesRes.items : (Array.isArray(busesRes) ? busesRes : []));
      setRoutes(Array.isArray(routesRes?.items) ? routesRes.items : (Array.isArray(routesRes) ? routesRes : []));

      let rows = Array.isArray(entriesRes?.items) ? entriesRes.items : (Array.isArray(entriesRes) ? entriesRes : []);
      if (filterBus === 'none') {
        rows = rows.filter(r => !r.busId);
      }
      setEntries(rows);
    } catch (e) {
      toast({ title: 'Failed to load transport data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, filterClass, filterBus]);

  const openAssign = (studentId) => {
    const current = entries.find(e => e.id === studentId) || {};
    setAssignState({
      studentId,
      busId: current.busId ? String(current.busId) : '',
      routeId: current.routeId ? String(current.routeId) : '',
      pickupStopId: current.pickupStopId ? String(current.pickupStopId) : '',
      dropStopId: current.dropStopId ? String(current.dropStopId) : '',
    });
    assignDisc.onOpen();
  };

  const saveAssign = async () => {
    try {
      setSaving(true);
      await transportApi.setStudentTransport(assignState.studentId, {
        busId: assignState.busId ? Number(assignState.busId) : null,
        routeId: assignState.routeId ? Number(assignState.routeId) : null,
        pickupStopId: assignState.pickupStopId ? Number(assignState.pickupStopId) : null,
        dropStopId: assignState.dropStopId ? Number(assignState.dropStopId) : null,
      });
      loadData();
      toast({ title: 'Transport updated', status: 'success' });
      assignDisc.onClose();
    } catch (e) {
      const message = e?.response?.data?.message || 'Failed to update transport';
      toast({ title: 'Error', description: message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadStops = async () => {
      if (!assignState.routeId) { setStops([]); return; }
      try {
        const payload = await transportApi.listRouteStops(assignState.routeId);
        setStops(Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []));
      } catch (_) { setStops([]); }
    };
    loadStops();
  }, [assignState.routeId]);

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
        <Button colorScheme='blue' leftIcon={<MdMap />} onClick={() => window.open('#', '_self')}>
          View Route Map
        </Button>
      </Flex>

      {/* Transport Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <StatCard
          title='Total Buses'
          value={String(stats.totalBuses)}
          icon={MdDirectionsBus}
          colorScheme='blue'
        />

        <StatCard
          title='Bus Users'
          value={String(stats.busUsers)}
          subValue='Estimated count'
          icon={MdPerson}
          colorScheme='green'
          note='Of total student body'
        />

        <StatCard
          title='Active RFID Cards'
          value={String(stats.activeRfid)}
          subValue='Assigned tags'
          icon={MdCreditCard}
          colorScheme='orange'
          note='Cards assigned and active'
        />

        <StatCard
          title='Routes'
          value={String(stats.totalRoutes)}
          icon={MdLocationOn}
          colorScheme='red'
          note='Active transport routes'
        />
      </SimpleGrid>

      {/* Available Buses */}
      <Card p='20px' mb='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='15px'>
          Available Buses
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px'>
          {buses.slice(0, 6).map((bus) => {
            const capacity = bus.capacity || 0;
            const occupancy = bus.occupancy || 0;
            const available = Math.max(0, capacity - occupancy);
            return (
              <Card key={bus.id} variant='outline'>
                <Flex p='15px' justify='space-between' align='center'>
                  <Box>
                    <Text fontWeight='bold'>Bus {bus.number}</Text>
                    <Text fontSize='sm' color='gray.500'>{bus.routeName || 'No Route Assigned'}</Text>
                    <HStack mt='5px' spacing='5px'>
                      <Badge colorScheme={available > 5 ? 'green' : (available > 0 ? 'orange' : 'red')}>
                        {available} seats available
                      </Badge>
                    </HStack>
                  </Box>
                  <IconButton
                    icon={<MdDirectionsBus />}
                    colorScheme='blue'
                    size='sm'
                    aria-label='View bus details'
                    onClick={() => setFilterBus(String(bus.id))}
                  />
                </Flex>
              </Card>
            );
          })}
          {!buses.length && (
            <Text color='gray.500'>No buses registered in this campus.</Text>
          )}
        </SimpleGrid>
      </Card>

      {/* Search and Filter Section */}
      <Card p='20px' mb='20px'>
        <Flex gap='10px' flexWrap='wrap'>
          <InputGroup w={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.300' />
            </InputLeftElement>
            <Input
              placeholder='Search by name or roll number...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Select
            w={{ base: '100%', md: '150px' }}
            icon={<MdFilterList />}
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
          >
            <option value='all'>All Classes</option>
            {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>

          <Select
            w={{ base: '100%', md: '150px' }}
            icon={<MdFilterList />}
            value={filterBus}
            onChange={(e) => setFilterBus(e.target.value)}
          >
            <option value='all'>All Buses</option>
            {buses.map(b => (
              <option key={b.id} value={b.id}>Bus {b.number}</option>
            ))}
            <option value='none'>Not Assigned</option>
          </Select>
          <Button variant='ghost' size='sm' onClick={() => { setSearch(''); setFilterClass('all'); setFilterBus('all'); }}>Reset</Button>
        </Flex>
      </Card>

      {/* Students Transport Table */}
      <Card p='20px'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>STUDENT</Th>
                <Th>ROLL NO.</Th>
                <Th>CLASS</Th>
                <Th>BUS NUMBER</Th>
                <Th>ROUTE</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={6} textAlign='center' py={4}>Loading entries...</Td></Tr>
              ) : entries.map((student) => (
                <Tr key={student.id}>
                  <Td>
                    <HStack spacing='12px'>
                      <Avatar
                        size='sm'
                        name={student.name}
                        src={student.avatar}
                      />
                      <Text fontWeight='500'>{student.name}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize='sm'>{student.rollNumber}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme='purple'>
                      {student.class}{student.section ? `-${student.section}` : ''}
                    </Badge>
                  </Td>
                  <Td>
                    {student.busNumber ? (
                      <Badge colorScheme='blue'>Bus {student.busNumber}</Badge>
                    ) : (
                      <Badge colorScheme='gray'>Not Assigned</Badge>
                    )}
                  </Td>
                  <Td>
                    <Text fontSize='sm'>{student.routeName || 'N/A'}</Text>
                  </Td>
                  <Td>
                    <HStack spacing='2'>
                      <IconButton
                        aria-label='Assign Info'
                        icon={<MdMoreVert />}
                        size='sm'
                        variant='ghost'
                        onClick={() => openAssign(student.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
              {!loading && !entries.length && (
                <Tr><Td colSpan={6} textAlign='center' py={4}>No students found matching filters.</Td></Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>

      {/* Assign Modal */}
      <Modal isOpen={assignDisc.isOpen} onClose={assignDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Transport</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select placeholder='Select bus' value={assignState.busId} onChange={(e) => setAssignState(s => ({ ...s, busId: e.target.value }))} mb={3}>
              {buses.map(b => (
                <option key={b.id} value={b.id}>{b.number}</option>
              ))}
            </Select>
            <Select placeholder='Select route' value={assignState.routeId} onChange={(e) => setAssignState(s => ({ ...s, routeId: e.target.value, pickupStopId: '', dropStopId: '' }))} mb={3}>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
            <Select placeholder='Pickup stop' value={assignState.pickupStopId} onChange={(e) => setAssignState(s => ({ ...s, pickupStopId: e.target.value }))} mb={3}>
              {stops.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </Select>
            <Select placeholder='Drop stop' value={assignState.dropStopId} onChange={(e) => setAssignState(s => ({ ...s, dropStopId: e.target.value }))}>
              {stops.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={assignDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={saveAssign} isLoading={saving} isDisabled={!assignState.studentId}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
