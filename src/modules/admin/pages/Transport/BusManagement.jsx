import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  Button,
  ButtonGroup,
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
import { MdDirectionsBus, MdBuild, MdCheckCircle, MdPlaylistAdd, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdMoreVert, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import * as transportApi from '../../../../services/api/transport';
import * as driversApi from '../../../../services/api/drivers';


export default function BusManagement() {
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [routeFilter, setRouteFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [routesOptions, setRoutesOptions] = useState([]);
  const [driversOptions, setDriversOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ backendId: null, id: '', plate: '', capacity: 0, driver: '', driverId: '', routeId: '', status: 'Active', lastService: '' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const normalizeBus = (bus) => {
    if (!bus) return null;
    const statusRaw = String(bus.status || 'active').toLowerCase();
    const statusLabel = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);

    return {
      backendId: bus.id,
      id: bus.number || bus.id || '',
      plate: bus.plate || bus.plateNumber || bus.registrationNumber || '-',
      capacity: typeof bus.capacity === 'number' ? bus.capacity : 0,
      driver: bus.driverName || bus.driver || '-',
      routeId: bus.routeId || '',
      route: bus.routeName || bus.route || 'Unassigned',
      status: statusLabel,
      lastService: bus.lastService || bus.lastServiceDate || '',
      maintDue: statusRaw === 'maintenance' || bus.maintDue === true,
    };
  };

  const loadBuses = async () => {
    try {
      const data = await transportApi.listBuses();
      const source = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      const list = source.map(normalizeBus).filter(Boolean);
      setRows(list);
    } catch (e) {
      console.error('Failed to load buses', e);
      toast({
        title: 'Failed to load buses',
        description: e.message || 'Unable to load bus list from server.',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      setRows([]);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  // When editing, try to pre-select the driver option based on name or current bus assignment
  useEffect(() => {
    if (!editDisc.isOpen) return;
    if (form.driverId) return;
    if (!driversOptions.length) return;
    const byBus = driversOptions.find(d => String(d.busId || '') === String(form.backendId || ''));
    const byName = driversOptions.find(d => d.name === form.driver);
    const found = byBus || byName;
    if (found) setForm(f => ({ ...f, driverId: String(found.id) }));
  }, [editDisc.isOpen, driversOptions, form.backendId, form.driver, form.driverId]);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const data = await transportApi.listRoutes();
        const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        setRoutesOptions(items);
      } catch (e) { }
    };
    loadRoutes();
  }, []);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const data = await driversApi.list({ status: 'active', pageSize: 200 });
        const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        setDriversOptions(items.map(d => ({ id: d.id, name: d.name, busId: d.busId || null })));
      } catch (e) {
        setDriversOptions([]);
      }
    };
    loadDrivers();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((b) => {
      const matchesSearch = !search || b.id.toLowerCase().includes(search.toLowerCase()) || b.driver.toLowerCase().includes(search.toLowerCase()) || b.plate.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || b.status.toLowerCase() === status;
      const matchesRoute = routeFilter === 'all' || String(b.routeId || '') === String(routeFilter);
      return matchesSearch && matchesStatus && matchesRoute;
    });
  }, [rows, search, status, routeFilter]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((b) => b.status.toLowerCase() === 'active').length;
    const maint = rows.filter((b) => b.maintDue).length;
    const capacity = rows.reduce((s, b) => s + (b.capacity || 0), 0);
    return { total, active, maint, capacity };
  }, [rows]);

  const exportCsv = () => {
    if (!rows.length) return;
    const header = ['Bus ID', 'Plate', 'Capacity', 'Driver', 'Route', 'Status', 'Last Service'];
    const data = rows.map((b) => [
      b.id,
      b.plate,
      b.capacity,
      b.driver,
      b.route,
      b.status,
      b.lastService || '',
    ]);
    const csv = [header, ...data].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bus-management.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    if (!rows.length) return;
    const header = ['Bus ID', 'Plate', 'Capacity', 'Driver', 'Route', 'Status', 'Last Service'];
    const bodyRows = rows
      .map(
        (b) =>
          `<tr>${[
            b.id,
            b.plate,
            b.capacity,
            b.driver,
            b.route,
            b.status,
            b.lastService || '',
          ]
            .map((c) => `<td>${c ?? ''}</td>`)
            .join('')}</tr>`
      )
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Bus Management</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}
        h1{margin:0 0 12px;font-size:20px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}
        th{background:#f5f5f5}
      </style>
      </head><body><h1>Bus Management</h1>
      <table><thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${bodyRows}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Bus Management</Heading>
          <Text color={textColorSecondary}>Manage fleet, capacity, and maintenance schedules</Text>
        </Box>
        <ButtonGroup>
          <Button
            leftIcon={<MdPlaylistAdd />}
            colorScheme="blue"
            onClick={() => {
              setForm({ backendId: null, id: '', plate: '', capacity: 0, driver: '', driverId: '', routeId: '', status: 'Active', lastService: '' });
              editDisc.onOpen();
            }}
          >
            Add Bus
          </Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue" onClick={exportCsv}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue" onClick={exportPdf}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard title="Total Buses" value={String(stats.total)} icon={MdDirectionsBus} colorScheme="blue" />
        <StatCard title="Active" value={String(stats.active)} icon={MdCheckCircle} colorScheme="green" />
        <StatCard title="Maintenance Due" value={String(stats.maint)} icon={MdBuild} colorScheme="red" />
        <StatCard title="Total Capacity" value={`${stats.capacity}`} icon={MdDirectionsBus} colorScheme="orange" />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search bus, plate, or driver' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW="200px" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='maintenance'>Maintenance</option>
          </Select>
          <Select maxW="200px" value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
            <option value='all'>All Routes</option>
            {routesOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Bus ID</Th>
                <Th>Plate</Th>
                <Th isNumeric>Capacity</Th>
                <Th>Driver</Th>
                <Th>Route</Th>
                <Th>Status</Th>
                <Th>Last Service</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((b) => (
                <Tr key={b.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{b.id}</Text></Td>
                  <Td>{b.plate}</Td>
                  <Td isNumeric>{b.capacity}</Td>
                  <Td>{b.driver}</Td>
                  <Td><Badge colorScheme='blue'>{b.route}</Badge></Td>
                  <Td><Badge colorScheme={b.status === 'Active' ? 'green' : 'yellow'}>{b.status}</Badge></Td>
                  <Td><Text color={textColorSecondary}>{b.lastService}</Text></Td>
                  <Td>
                    <Flex align='center' gap={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(b); viewDisc.onOpen(); }} />
                      <Menu isLazy placement='bottom-end'>
                        <MenuButton as={IconButton} aria-label='More' icon={<MdMoreVert />} size='sm' variant='ghost' />
                        <Portal>
                          <MenuList zIndex={1500}>
                            <MenuItem onClick={() => { setSelected(b); viewDisc.onOpen(); }}>View Details</MenuItem>
                            <MenuItem onClick={() => { setSelected(b); setForm({ ...b }); editDisc.onOpen(); }}>Edit</MenuItem>
                            <MenuItem color='red.500' onClick={async () => {
                              if (!b.backendId) { toast({ title: 'Cannot delete demo bus', status: 'warning' }); return; }
                              if (!window.confirm('Delete this bus?')) return;
                              try {
                                await transportApi.deleteBus(b.backendId);
                                await loadBuses();
                                toast({ title: 'Bus deleted', status: 'success' });
                              } catch (e) {
                                toast({ title: 'Failed to delete bus', description: e.message || 'Error', status: 'error' });
                              }
                            }}>Delete</MenuItem>
                          </MenuList>
                        </Portal>
                      </Menu>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bus Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Bus ID</Text><Text>{selected.id}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Plate</Text><Text>{selected.plate}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Capacity</Text><Text>{selected.capacity}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Driver</Text><Text>{selected.driver}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Route</Text><Text>{selected.route}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Status</Text><Badge colorScheme={selected.status === 'Active' ? 'green' : 'yellow'}>{selected.status}</Badge></Flex>
                <Flex justify='space-between'><Text fontWeight='600'>Last Service</Text><Text>{selected.lastService || '-'}</Text></Flex>
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
          <ModalHeader>Edit Bus</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Bus ID</FormLabel>
              <Input value={form.id} onChange={(e) => setForm(f => ({ ...f, id: e.target.value }))} placeholder='e.g. BUS-200' />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Plate</FormLabel>
              <Input value={form.plate} onChange={(e) => setForm(f => ({ ...f, plate: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Capacity</FormLabel>
              <Input type='number' value={form.capacity} onChange={(e) => setForm(f => ({ ...f, capacity: Number(e.target.value) || 0 }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Driver</FormLabel>
              <Select
                placeholder='Select driver'
                value={form.driverId || ''}
                onChange={(e) => {
                  const id = e.target.value;
                  const found = driversOptions.find(d => String(d.id) === String(id));
                  setForm(f => ({ ...f, driverId: id, driver: found ? found.name : '' }));
                }}
              >
                {driversOptions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Route</FormLabel>
              <Select placeholder='Unassigned' value={form.routeId} onChange={(e) => setForm(f => ({ ...f, routeId: e.target.value }))}>
                {routesOptions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Status</FormLabel>
              <Select value={form.status.toLowerCase()} onChange={(e) => setForm(f => ({ ...f, status: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) }))}>
                <option value='active'>Active</option>
                <option value='maintenance'>Maintenance</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Last Service</FormLabel>
              <Input type='date' value={form.lastService} onChange={(e) => setForm(f => ({ ...f, lastService: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button
              colorScheme='blue'
              onClick={async () => {
                try {
                  if (!form.backendId && (!form.id || !String(form.id).trim())) {
                    toast({ title: 'Bus ID is required', status: 'error', duration: 4000, isClosable: true });
                    return;
                  }
                  if (!form.backendId) {
                    const exists = rows.some(b => String(b.id).toLowerCase() === String(form.id).trim().toLowerCase());
                    if (exists) {
                      toast({ title: 'Duplicate Bus ID', description: 'A bus with this ID already exists. Please choose another.', status: 'warning', duration: 5000, isClosable: true });
                      return;
                    }
                  }
                  const payload = {
                    number: form.id,
                    driverName: form.driver,
                    status: (form.status || 'Active').toLowerCase(),
                    plate: form.plate || null,
                    capacity: typeof form.capacity === 'number' ? form.capacity : null,
                    lastService: form.lastService || null,
                    routeId: form.routeId || undefined,
                  };

                  let busIdForDriver = null;
                  if (form.backendId) {
                    const updated = await transportApi.updateBus(form.backendId, payload);
                    busIdForDriver = updated?.id || form.backendId;
                  } else {
                    const created = await transportApi.createBus(payload);
                    busIdForDriver = created?.id || null;
                    const normalized = normalizeBus(created);
                    setRows(prev => normalized ? [...prev, normalized] : prev);
                  }

                  // Optionally assign selected driver to this bus (drivers table relation)
                  if (form.driverId && busIdForDriver) {
                    try { await driversApi.update(form.driverId, { busId: busIdForDriver }); } catch (_) { /* ignore */ }
                  }

                  await loadBuses();
                  toast({ title: 'Bus saved', status: 'success', duration: 3000, isClosable: true });
                  editDisc.onClose();
                } catch (e) {
                  console.error('Failed to save bus', e);
                  const msg = e?.response?.data?.message || e?.data?.message || e?.message || 'Unable to save bus details.';
                  toast({ title: 'Failed to save bus', description: msg, status: 'error', duration: 6000, isClosable: true });
                }
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
