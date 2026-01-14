import React, { useEffect, useState } from 'react';
import { Box, Text, Flex, Button, SimpleGrid, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Input, InputGroup, InputLeftElement, Select, Avatar, HStack, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast } from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
// Icons
import { MdDirectionsBus, MdCreditCard, MdLocationOn, MdPerson, MdSearch, MdFilterList, MdRemoveRedEye, MdMoreVert, MdMap } from 'react-icons/md';
// API
import * as studentsApi from '../../../../services/api/students';
import * as transportApi from '../../../../services/api/transport';

export default function TransportAssignmentPage() {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [transportByStudent, setTransportByStudent] = useState({}); // { [id]: { busNumber, ... } }
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const assignDisc = useDisclosure();
  const [assignState, setAssignState] = useState({ studentId: null, busId: '', routeId: '', pickupStopId: '', dropStopId: '' });

  // Load students and buses
  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, busesRes, routesRes] = await Promise.all([
          studentsApi.list({ pageSize: 200 }),
          transportApi.listBuses(),
          transportApi.listRoutes(),
        ]);
        const rows = Array.isArray(studentsRes?.rows) ? studentsRes.rows : (Array.isArray(studentsRes) ? studentsRes : []);
        setStudents(rows || []);
        setBuses(Array.isArray(busesRes?.items) ? busesRes.items : (Array.isArray(busesRes) ? busesRes : []));
        setRoutes(Array.isArray(routesRes?.items) ? routesRes.items : (Array.isArray(routesRes) ? routesRes : []));
        // Fetch transport info per student (best-effort)
        (rows || []).slice(0, 100).forEach(async (s) => {
          try {
            const payload = await studentsApi.getTransport(s.id);
            setTransportByStudent(prev => ({ ...prev, [s.id]: payload || {} }));
          } catch { }
        });
      } catch (e) {
        toast({ title: 'Failed to load transport data', status: 'error' });
      }
    };
    load();
  }, []);

  const openAssign = (studentId) => {
    const current = transportByStudent[studentId] || {};
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
      await studentsApi.updateTransport(assignState.studentId, {
        busId: assignState.busId ? Number(assignState.busId) : null,
        routeId: assignState.routeId ? Number(assignState.routeId) : null,
        pickupStopId: assignState.pickupStopId ? Number(assignState.pickupStopId) : null,
        dropStopId: assignState.dropStopId ? Number(assignState.dropStopId) : null,
      });
      const payload = await studentsApi.getTransport(assignState.studentId);
      setTransportByStudent(prev => ({ ...prev, [assignState.studentId]: payload || {} }));
      toast({ title: 'Transport updated', status: 'success' });
      assignDisc.onClose();
    } catch (e) {
      const message = e?.response?.data?.message || 'Failed to update transport';
      toast({ title: 'Error', description: message, status: 'error' });
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
          value='12'
          icon={MdDirectionsBus}
          colorScheme='blue'
        />

        <StatCard
          title='Bus Users'
          value='845'
          subValue='67.6% Students'
          icon={MdPerson}
          colorScheme='green'
          note='Of total student body'
        />

        <StatCard
          title='Active RFID Cards'
          value='825'
          subValue='97.6% Users'
          icon={MdCreditCard}
          colorScheme='orange'
          note='Cards assigned and active'
        />

        <StatCard
          title='Routes'
          value='5'
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
          {[1, 2, 3].map((bus) => (
            <Card key={bus} variant='outline'>
              <Flex p='15px' justify='space-between' align='center'>
                <Box>
                  <Text fontWeight='bold'>Bus 10{bus}</Text>
                  <Text fontSize='sm' color='gray.500'>Main Route {String.fromCharCode(64 + bus)}</Text>
                  <HStack mt='5px' spacing='5px'>
                    <Badge colorScheme='green'>{5 + bus} seats available</Badge>
                  </HStack>
                </Box>
                <IconButton
                  icon={<MdDirectionsBus />}
                  colorScheme='blue'
                  size='sm'
                  aria-label='View bus details'
                />
              </Flex>
            </Card>
          ))}
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
              placeholder='Search by name, ID, or bus...'
            />
          </InputGroup>

          <Select
            w={{ base: '100%', md: '150px' }}
            icon={<MdFilterList />}
            defaultValue='all'
          >
            <option value='all'>All Classes</option>
            <option value='9'>Class 9</option>
            <option value='10'>Class 10</option>
            <option value='11'>Class 11</option>
            <option value='12'>Class 12</option>
          </Select>

          <Select
            w={{ base: '100%', md: '150px' }}
            icon={<MdFilterList />}
            defaultValue='all'
          >
            <option value='all'>All Buses</option>
            <option value='101'>Bus 101</option>
            <option value='102'>Bus 102</option>
            <option value='103'>Bus 103</option>
            <option value='none'>Not Assigned</option>
          </Select>
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
              {students.map((student) => {
                const t = transportByStudent[student.id] || {};
                return (
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
                        {student.class}-{student.section}
                      </Badge>
                    </Td>
                    <Td>
                      {t.busNumber ? (
                        <Badge colorScheme='blue'>{t.busNumber}</Badge>
                      ) : (
                        <Badge colorScheme='gray'>Not Assigned</Badge>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize='sm'>{t.routeName || 'N/A'}</Text>
                    </Td>
                    <Td>
                      <HStack spacing='2'>
                        <IconButton
                          aria-label='More options'
                          icon={<MdMoreVert />}
                          size='sm'
                          variant='ghost'
                          onClick={() => openAssign(student.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
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
            <Button colorScheme='blue' onClick={saveAssign} isDisabled={!assignState.studentId}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
