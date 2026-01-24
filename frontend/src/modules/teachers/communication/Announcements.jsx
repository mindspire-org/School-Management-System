import React, { useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Select,
  Input,
  Button,
  Icon,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdAdd, MdRefresh, MdFileDownload, MdPrint, MdVisibility, MdEdit, MdDelete, MdAnnouncement, MdSchedule, MdDrafts } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const initialAnnouncements = [
  { id: 1, title: 'Parent-Teacher Meeting', audience: 'All', status: 'Sent', date: '2025-11-10' },
  { id: 2, title: 'Math Quiz Reminder', audience: '9-A', status: 'Scheduled', date: '2025-11-20' },
  { id: 3, title: 'Homework Policy Update', audience: '10-A', status: 'Draft', date: '2025-11-17' },
];

export default function Announcements() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const [audience, setAudience] = useState('All');
  const [status, setStatus] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(initialAnnouncements);
  const [selected, setSelected] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const filtered = useMemo(() => rows.filter(r =>
    (audience === 'All' || r.audience === audience) &&
    (status === 'All' || r.status === status) &&
    (!from || r.date >= from) && (!to || r.date <= to) &&
    (!search || r.title.toLowerCase().includes(search.toLowerCase()))
  ), [rows, audience, status, from, to, search]);

  const kpis = useMemo(() => ({
    total: rows.length,
    scheduled: rows.filter(r => r.status === 'Scheduled').length,
    drafts: rows.filter(r => r.status === 'Draft').length,
  }), [rows]);

  const chartData = useMemo(() => ([{ name: 'Announcements', data: [kpis.total, kpis.scheduled, kpis.drafts] }]), [kpis]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: ['Total', 'Scheduled', 'Drafts'] }, colors: ['#3182CE'] }), []);

  const statusDistribution = useMemo(() => {
    const map = { Draft: 0, Scheduled: 0, Sent: 0 };
    filtered.forEach(r => { map[r.status] = (map[r.status] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Title', 'Audience', 'Status', 'Date'];
    const csv = [header, ...filtered.map(r => [r.title, r.audience, r.status, r.date])]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'announcements.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const resetFilters = () => { setAudience('All'); setStatus('All'); setFrom(''); setTo(''); setSearch(''); };

  const openCreate = () => { setSelected({ id: 0, title: '', audience: 'All', status: 'Draft', date: new Date().toISOString().slice(0,10), message: '' }); onOpen(); };
  const openEdit = (r) => { setSelected({ ...r, message: r.message || '' }); onOpen(); };
  const openView = (r) => { setSelected(r); onViewOpen(); };

  const saveAnnouncement = () => {
    if (!selected.title?.trim()) return;
    if (selected.id === 0) setRows(prev => [{ ...selected, id: Math.max(0, ...prev.map(p => p.id)) + 1 }, ...prev]);
    else setRows(prev => prev.map(p => p.id === selected.id ? selected : p));
    onClose();
  };

  const deleteRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Announcements</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Create and manage announcements</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdAnnouncement color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[2,3,3,4,3,5]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdSchedule color='white' />} />}
            name='Scheduled'
            value={String(kpis.scheduled)}
            trendData={[0,1,1,2,1,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdDrafts color='white' />} />}
            name='Drafts'
            value={String(kpis.drafts)}
            trendData={[1,1,1,1,2,2]}
            trendColor='#B721FF'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' align='center' justify='space-between'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={audience} onChange={e=>setAudience(e.target.value)} size='sm' maxW='160px'>
              <option value='All'>All</option>
              <option value='9-A'>9-A</option>
              <option value='10-A'>10-A</option>
            </Select>
            <Select value={status} onChange={e=>setStatus(e.target.value)} size='sm' maxW='160px'>
              <option>All</option>
              <option>Draft</option>
              <option>Scheduled</option>
              <option>Sent</option>
            </Select>
            <Input type='date' value={from} onChange={e=>setFrom(e.target.value)} size='sm' maxW='160px' />
            <Input type='date' value={to} onChange={e=>setTo(e.target.value)} size='sm' maxW='160px' />
            <Input placeholder='Search title…' value={search} onChange={e=>setSearch(e.target.value)} size='sm' maxW='200px' />
          </HStack>
          <HStack>
            <Button size='sm' leftIcon={<Icon as={MdAdd} />} colorScheme='blue' onClick={openCreate}>New</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={resetFilters}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
            <Tr>
              <Th>Title</Th>
              <Th>Audience</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th textAlign='right'>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(r => (
              <Tr key={r.id} _hover={{ bg: hoverBg }}>
                <Td><Box isTruncated maxW='320px'>{r.title}</Box></Td>
                <Td>{r.audience}</Td>
                <Td>
                  <Badge colorScheme={r.status==='Sent'?'green':r.status==='Scheduled'?'orange':'purple'}>{r.status}</Badge>
                </Td>
                <Td>{r.date}</Td>
                <Td>
                  <HStack justify='flex-end'>
                    <IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' onClick={()=>openView(r)} />
                    <IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' onClick={()=>openEdit(r)} />
                    <IconButton aria-label='Delete' icon={<MdDelete/>} size='sm' variant='ghost' onClick={()=>deleteRow(r.id)} />
                  </HStack>
                </Td>
              </Tr>
            ))}
            {filtered.length===0 && (
              <Tr><Td colSpan={5}><Box p='12px' textAlign='center' color={textSecondary}>No records.</Box></Td></Tr>
            )}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Totals Overview</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Status Distribution</Text>
          <PieChart height={240} chartData={statusDistribution.values} chartOptions={{ labels: statusDistribution.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selected?.id ? 'Edit Announcement' : 'Create Announcement'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} align='stretch'>
              <Input placeholder='Title' value={selected?.title || ''} onChange={e=>setSelected(s=>({...s, title: e.target.value}))} />
              <Select value={selected?.audience || 'All'} onChange={e=>setSelected(s=>({...s, audience: e.target.value}))}>
                <option>All</option><option>9-A</option><option>10-A</option>
              </Select>
              <Select value={selected?.status || 'Draft'} onChange={e=>setSelected(s=>({...s, status: e.target.value}))}>
                <option>Draft</option><option>Scheduled</option><option>Sent</option>
              </Select>
              <Input type='date' value={selected?.date || ''} onChange={e=>setSelected(s=>({...s, date: e.target.value}))} />
              <Textarea placeholder='Message...' rows={5} value={selected?.message || ''} onChange={e=>setSelected(s=>({...s, message: e.target.value}))} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button onClick={onClose} variant='ghost'>Cancel</Button>
              <Button colorScheme='blue' onClick={saveAnnouncement}>Save</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Announcement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <VStack align='start' spacing={2}>
                <Text fontWeight='600'>{selected.title}</Text>
                <HStack><Badge>{selected.audience}</Badge><Badge>{selected.status}</Badge><Badge>{selected.date}</Badge></HStack>
                <Text whiteSpace='pre-wrap' fontSize='sm' color={textSecondary}>{selected.message || 'No message'}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
