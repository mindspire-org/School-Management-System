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
  Avatar,
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
  NumberInput,
  NumberInputField,
  useToast,
} from '@chakra-ui/react';
import { MdPerson, MdSearch, MdAdd, MdThumbUp, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdMoreVert, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import * as driversApi from '../../../../services/api/drivers';
import * as transportApi from '../../../../services/api/transport';
import { campusesApi } from '../../../../services/api';

const normalize = (d) => ({
  id: d.id,
  name: d.name,
  phone: d.phone || '-',
  license: d.licenseNumber || '-',
  status: String(d.status || 'active').toLowerCase() === 'active' ? 'On Duty' : 'Off Duty',
  bus: d.busNumber || '-',
  busId: d.busId || '',
  busNumber: d.busNumber || null,
  rating: 0,
});

export default function DriverManagement() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', name: '', phone: '', license: '', status: 'On Duty', bus: '', busId: '', rating: 0, campusId: '' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [buses, setBuses] = useState([]);
  const [campuses, setCampuses] = useState([]);

  const loadDrivers = async () => {
    try {
      const res = await driversApi.list({ pageSize: 100 });
      const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
      setRows(items.map(normalize));
    } catch (e) {
      toast({ title: 'Failed to load drivers', status: 'error' });
    }
  };

  const loadBuses = async () => {
    try {
      const res = await transportApi.listBuses();
      const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
      setBuses(items);
    } catch (e) {
      toast({ title: 'Failed to load buses', status: 'error' });
    }
  };

  const loadCampuses = async () => {
    try {
      const res = await campusesApi.list({ pageSize: 100 });
      setCampuses(res?.rows || []);
    } catch (e) {
      console.error('Failed to load campuses', e);
    }
  };

  useEffect(() => {
    loadDrivers();
    loadBuses();
    loadCampuses();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((d) => {
      const term = (search || '').toLowerCase();
      const matchesSearch = !term || d.name.toLowerCase().includes(term) || String(d.id).toLowerCase().includes(term);
      const matchesStatus = status === 'all' || d.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const stats = useMemo(() => {
    const total = rows.length;
    const onDuty = rows.filter((d) => d.status === 'On Duty').length;
    const offDuty = rows.filter((d) => d.status === 'Off Duty').length;
    const avgRating = (rows.reduce((s, d) => s + d.rating, 0) / (total || 1)).toFixed(1);
    return { total, onDuty, offDuty, avgRating };
  }, [rows]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Driver Management</Heading>
          <Text color={textColorSecondary}>Manage drivers, duty status, and licenses</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', name: '', phone: '', license: '', status: 'On Duty', bus: '', busId: '', rating: 0, campusId: '' }); editDisc.onOpen(); }}>Add Driver</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard title="Total Drivers" value={String(stats.total)} icon={MdPerson} colorScheme="blue" />
        <StatCard title="On Duty" value={String(stats.onDuty)} icon={MdThumbUp} colorScheme="green" />
        <StatCard title="Off Duty" value={String(stats.offDuty)} icon={MdPerson} colorScheme="red" />
        <StatCard title="Avg Rating" value={`${stats.avgRating}/5`} icon={MdThumbUp} colorScheme="orange" />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search driver name or ID' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW="200px" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='on duty'>On Duty</option>
            <option value='off duty'>Off Duty</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Driver</Th>
                <Th>ID</Th>
                <Th>Phone</Th>
                <Th>License</Th>
                <Th>Status</Th>
                <Th>Assigned Bus</Th>
                <Th isNumeric>Rating</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((d) => (
                <Tr key={d.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{d.name}</Text></Td>
                  <Td>{d.id}</Td>
                  <Td>{d.phone}</Td>
                  <Td>{d.license}</Td>
                  <Td><Badge colorScheme={d.status === 'On Duty' ? 'green' : 'gray'}>{d.status}</Badge></Td>
                  <Td>{d.bus}</Td>
                  <Td isNumeric>{d.rating.toFixed(1)}</Td>
                  <Td>
                    <Flex align='center' gap={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(d); viewDisc.onOpen(); }} />
                      <Menu isLazy placement='bottom-end'>
                        <MenuButton as={IconButton} aria-label='More' icon={<MdMoreVert />} size='sm' variant='ghost' />
                        <Portal>
                          <MenuList zIndex={1500}>
                            <MenuItem onClick={() => { setSelected(d); viewDisc.onOpen(); }}>View Details</MenuItem>
                            <MenuItem onClick={() => { setSelected(d); setForm({ ...d, busId: d.busId || '', campusId: d.campusId || '' }); editDisc.onOpen(); }}>Edit</MenuItem>
                            <MenuItem color='red.500' onClick={async () => {
                              if (!window.confirm('Delete this driver?')) return;
                              try {
                                await driversApi.remove(d.id);
                                await loadDrivers();
                                toast({ title: 'Driver deleted', status: 'success' });
                              } catch (e) {
                                if (e?.status === 409 && e?.data?.hasFinancialRecords) {
                                  if (window.confirm('This driver has financial records. Delete anyway?')) {
                                    try { await driversApi.remove(d.id, { force: 'true' }); await loadDrivers(); toast({ title: 'Driver deleted', status: 'success' }); } catch (err) { toast({ title: 'Failed', status: 'error' }); }
                                  }
                                } else {
                                  toast({ title: 'Failed to delete driver', status: 'error' });
                                }
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
          <ModalHeader>Driver Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Name</Text><Text>{selected.name}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>ID</Text><Text>{selected.id}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Phone</Text><Text>{selected.phone}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>License</Text><Text>{selected.license}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Status</Text><Badge colorScheme={selected.status === 'On Duty' ? 'green' : 'gray'}>{selected.status}</Badge></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Assigned Bus</Text><Text>{selected.bus}</Text></Flex>
                <Flex justify='space-between'><Text fontWeight='600'>Rating</Text><Text>{selected.rating.toFixed(1)}</Text></Flex>
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
          <ModalHeader>Edit Driver</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Phone</FormLabel>
              <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>License</FormLabel>
              <Input value={form.license} onChange={(e) => setForm(f => ({ ...f, license: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Status</FormLabel>
              <Select value={form.status.toLowerCase()} onChange={(e) => setForm(f => ({ ...f, status: e.target.value === 'on duty' ? 'On Duty' : 'Off Duty' }))}>
                <option value='on duty'>On Duty</option>
                <option value='off duty'>Off Duty</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Assigned Bus</FormLabel>
              <Select value={String(form.busId || '')} onChange={(e) => setForm(f => ({ ...f, busId: e.target.value ? Number(e.target.value) : '' }))}>
                <option value=''>Unassigned</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>{b.number}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb={3} isRequired>
              <FormLabel>Campus</FormLabel>
              <Select placeholder='Select campus' value={form.campusId} onChange={(e) => setForm(f => ({ ...f, campusId: e.target.value }))}>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Rating</FormLabel>
              <NumberInput min={0} max={5} step={0.1} value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: Number(v) || 0 }))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async () => {
              try {
                if (form.id) {
                  await driversApi.update(form.id, {
                    name: form.name,
                    phone: form.phone,
                    licenseNumber: form.license,
                    status: form.status === 'On Duty' ? 'active' : 'inactive',
                    busId: form.busId || null,
                    campusId: form.campusId || undefined,
                  });
                } else {
                  await driversApi.create({
                    name: form.name,
                    phone: form.phone,
                    licenseNumber: form.license,
                    status: form.status === 'On Duty' ? 'active' : 'inactive',
                    busId: form.busId || null,
                    campusId: form.campusId,
                  });
                }
                await loadDrivers();
                editDisc.onClose();
                toast({ title: 'Driver saved', status: 'success' });
              } catch (e) { toast({ title: 'Failed to save driver', status: 'error' }); }
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
