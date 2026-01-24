import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  ButtonGroup,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
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
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdListAlt, MdCheckCircle, MdCancel, MdCreditCard, MdSearch, MdFilterList, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import * as rfidApi from '../../../../services/api/rfid';
import { useAuth } from '../../../../contexts/AuthContext';

// Data will be fetched from backend

export default function RFIDLogs() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [location, setLocation] = useState('all');
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ status: 'Success', location: '' });
  const [saving, setSaving] = useState(false);
  const fetchingRef = useRef(false);

  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const filtered = useMemo(() => {
    return rows.filter((l) => {
      const matchesSearch =
        !search ||
        (l.student || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.studentId || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.card || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || (l.status || '').toLowerCase() === status;
      const matchesLocation = location === 'all' || (l.location || '').toLowerCase().includes(location);
      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [rows, search, status, location]);

  const stats = useMemo(() => {
    const total = rows.length;
    const success = rows.filter((l) => (l.status || '').toLowerCase() === 'success').length;
    const failed = rows.filter((l) => (l.status || '').toLowerCase() === 'failed').length;
    const uniqueCards = new Set(rows.map((l) => l.card)).size;
    return { total, success, failed, uniqueCards };
  }, [rows]);

  const mapToUi = (r) => ({
    id: r.id,
    time: r.scanTime ? new Date(r.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
    student: r.studentName || '-',
    studentId: r.rollNumber || (r.studentId ? String(r.studentId) : '-'),
    card: r.cardNumber || '-',
    bus: r.busNumber || '-',
    status: (r.status || '').toLowerCase() === 'failed' ? 'Failed' : 'Success',
    location: r.location || '-',
  });

  const load = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const params = {
        q: search || undefined,
        status: status !== 'all' ? status : undefined,
        location: location !== 'all' ? location : undefined,
        pageSize: 200,
      };
      const data = await rfidApi.list(params);
      const list = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []));
      setRows(list.map(mapToUi));
    } catch (e) {
      const details = Array.isArray(e?.data?.errors) ? e.data.errors.map(x=>`${x.path || x.param || 'field'}: ${x.msg}`).join(', ') : '';
      const msg = (e?.data?.message || e?.message || 'Failed to load RFID logs') + (details ? ` — ${details}` : '');
      const id = 'rfid-logs-error';
      if (!toast.isActive(id)) toast({ id, title: 'Failed to load RFID logs', description: msg, status: 'error' });
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, status, location, search]);

  const exportCSV = () => {
    const header = ['Time','Student','ID','Card','Bus','Status','Location'];
    const csvRows = filtered.map(l => [l.time, l.student, l.studentId, l.card, l.bus, l.status, l.location]);
    const csv = [header, ...csvRows].map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rfid_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 16px; }
        h2 { margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f5f5f5; text-align: left; }
      </style>`;
    const rowsHtml = filtered.map(l => `
      <tr>
        <td>${l.time}</td>
        <td>${l.student}</td>
        <td>${l.studentId}</td>
        <td>${l.card}</td>
        <td>${l.bus}</td>
        <td>${l.status}</td>
        <td>${l.location}</td>
      </tr>
    `).join('');
    w.document.write(`
      <html><head><title>RFID Logs</title>${styles}</head><body>
      <h2>RFID Logs</h2>
      <table>
        <thead><tr><th>Time</th><th>Student</th><th>ID</th><th>Card</th><th>Bus</th><th>Status</th><th>Location</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 300); };</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>RFID Logs</Heading>
          <Text color={textColorSecondary}>Live and historical RFID scan records</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<Icon as={MdFileDownload} />} variant="outline" colorScheme="blue" onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<Icon as={MdPictureAsPdf} />} colorScheme="blue" onClick={exportPDF}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Total Scans"
          value={String(stats.total)}
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              icon={<Icon w='28px' h='28px' as={MdListAlt} color='white' />}
            />
          }
        />
        <MiniStatistics
          name="Success"
          value={String(stats.success)}
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #00b09b 0%, #96c93d 100%)'
              icon={<Icon w='28px' h='28px' as={MdCheckCircle} color='white' />}
            />
          }
          endContent={<Badge colorScheme='green'>{stats.total ? Math.round((stats.success / stats.total) * 100) : 0}%</Badge>}
        />
        <MiniStatistics
          name="Failed"
          value={String(stats.failed)}
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #f5576c 0%, #f093fb 100%)'
              icon={<Icon w='28px' h='28px' as={MdCancel} color='white' />}
            />
          }
        />
        <MiniStatistics
          name="Unique Cards"
          value={String(stats.uniqueCards)}
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)'
              icon={<Icon w='28px' h='28px' as={MdCreditCard} color='white' />}
            />
          }
        />
      </SimpleGrid>

      {/* Toolbar */}
      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search name, ID, or card' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW="200px" icon={<MdFilterList />} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='success'>Success</option>
            <option value='failed'>Failed</option>
          </Select>
          <Select maxW="220px" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value='all'>All Locations</option>
            <option value='main gate'>Main Gate</option>
            <option value='bus'>Bus</option>
          </Select>
        </Flex>
      </Card>

      {/* Table */}
      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Time</Th>
                <Th>Student</Th>
                <Th>ID</Th>
                <Th>Card</Th>
                <Th>Bus</Th>
                <Th>Status</Th>
                <Th>Location</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((l) => (
                <Tr key={l.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Badge>{l.time}</Badge></Td>
                  <Td><Text fontWeight='500'>{l.student}</Text></Td>
                  <Td><Text color={textColorSecondary}>{l.studentId}</Text></Td>
                  <Td><Text fontFamily='mono'>{l.card}</Text></Td>
                  <Td><Badge colorScheme='blue'>{l.bus}</Badge></Td>
                  <Td>
                    <Badge colorScheme={l.status === 'Success' ? 'green' : 'red'}>{l.status}</Badge>
                  </Td>
                  <Td><Text color={textColorSecondary}>{l.location}</Text></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(l); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(l); setForm({ status: l.status, location: l.location }); editDisc.onOpen(); }} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* View Modal */}
      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Time</Text><Text>{selected.time}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{selected.student}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>ID</Text><Text>{selected.studentId}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Card</Text><Text>{selected.card}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Bus</Text><Text>{selected.bus}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Status</Text><Badge colorScheme={selected.status==='Success'?'green':'red'}>{selected.status}</Badge></Flex>
                <Flex justify='space-between'><Text fontWeight='600'>Location</Text><Text>{selected.location}</Text></Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Log</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <FormControl mb={3}>
                  <FormLabel>Status</FormLabel>
                  <Select value={form.status} onChange={(e)=> setForm(f=>({ ...f, status: e.target.value }))}>
                    <option>Success</option>
                    <option>Failed</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input value={form.location} onChange={(e)=> setForm(f=>({ ...f, location: e.target.value }))} />
                </FormControl>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' isLoading={saving} onClick={async ()=>{
              if(!selected) return;
              try {
                setSaving(true);
                await rfidApi.update(selected.id, { status: (form.status || '').toLowerCase(), location: form.location });
                toast({ title: 'Log updated', status: 'success' });
                await load();
                editDisc.onClose();
              } catch (e) {
                toast({ title: 'Failed to update log', status: 'error' });
              } finally { setSaving(false); }
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
