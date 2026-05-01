import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex, useToast } from '@chakra-ui/react';
import { MdMarkEmailRead, MdVisibility, MdFileDownload, MdPrint, MdNotificationsActive, MdDateRange } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import { useAuth } from '../../../contexts/AuthContext';
import * as studentsApi from '../../../services/api/students';
import * as notificationsApi from '../../../services/api/notifications';

function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }

export default function Announcements(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const rowBg = useColorModeValue('gray.50','whiteAlpha.100');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selected, setSelected] = useState(null);

  const [student, setStudent] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role !== 'student') return;
        const payload = await studentsApi.list({ pageSize: 1 });
        const me = Array.isArray(payload?.rows) && payload.rows.length ? payload.rows[0] : null;
        setStudent(me);
      } catch {
        setStudent(null);
      }

      try {
        const payload = await notificationsApi.list({ page: 1, pageSize: 200 });
        setItems(Array.isArray(payload?.items) ? payload.items : []);
      } catch {
        setItems([]);
      }
    };
    load();
  }, [user?.role]);

  const classSection = `${student?.class || ''}${student?.section || ''}`;

  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(()=> items.filter(n => (
    (type==='all' || String(n?.type || '').toLowerCase()===String(type).toLowerCase()) &&
    (!query || String(n?.message || '').toLowerCase().includes(query.toLowerCase()))
  )),[items, type, query]);

  const kpis = useMemo(()=>{
    const total = items.length;
    const unread = items.filter(i=>!i?.isRead).length;
    const thisWeek = items.filter(i=> i?.createdAt && (Date.now()-new Date(i.createdAt).getTime())/(1000*60*60*24) <= 7).length;
    return { total, unread, thisWeek };
  },[items]);

  const chartTypes = ['assignment','grade','attendance','fee','notice'];
  const chartData = useMemo(()=> ([{ name:'Announcements', data: chartTypes.map(t => items.filter(i=>i.type===t).length) }]), [items]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: chartTypes.map(t=>t.toUpperCase()) }, colors:['#805AD5'], dataLabels:{ enabled:false } }), []);

  const markAllRead = async ()=>{
    const unreadIds = (items || []).filter(i => i?.id && !i?.isRead).map(i => i.id);
    if (!unreadIds.length) return;
    try {
      await Promise.all(unreadIds.map((id) => notificationsApi.markRead(id)));
      setItems(prev => (prev || []).map(i => ({ ...i, isRead: true })));
    } catch (e) {
      toast({ status: 'error', title: 'Failed to mark all read' });
    }
  };
  const toggleRead = async (id)=>{
    try {
      if (!id) return;
      await notificationsApi.markRead(id);
      setItems(prev => (prev || []).map(i=> i.id===id? { ...i, isRead:true } : i));
    } catch (e) {
      toast({ status: 'error', title: 'Failed to mark as read' });
    }
  };

  const exportCsv = ()=>{
    const rows = ['Type,Date,Status,Message', ...filtered.map(r=> `${r.type || ''},${r.createdAt ? String(r.createdAt).slice(0,10) : ''},${r.isRead?'read':'unread'},"${String(r.message || '').replace(/"/g,'""')}"`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='announcements.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Announcements</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {(student?.name || user?.name || '')}
        {student?.rollNumber ? ` • Roll ${student.rollNumber}` : ''}
        {classSection ? ` • Class ${classSection}` : ''}
      </Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<Icon as={MdNotificationsActive} w='22px' h='22px' color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[1,2,2,3,3]}
            trendColor='#B721FF'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdMarkEmailRead} w='22px' h='22px' color='white' />} />}
            name='Unread'
            value={String(kpis.unread)}
            trendData={[1,1,1,2,2]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdDateRange} w='22px' h='22px' color='white' />} />}
            name='This Week'
            value={String(kpis.thisWeek)}
            trendData={[0,1,1,2,2]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={type} onChange={e=>setType(e.target.value)} maxW='220px'>
            <option value='all'>All Types</option>
            <option value='assignment'>Assignment</option>
            <option value='grade'>Grade</option>
            <option value='attendance'>Attendance</option>
            <option value='fee'>Fee</option>
            <option value='notice'>Notice</option>
          </Select>
          <Input size='sm' placeholder='Search title or message...' value={query} onChange={e=>setQuery(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' leftIcon={<Icon as={MdMarkEmailRead} />} onClick={markAllRead}>Mark all read</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCsv}>Export CSV</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Message</Th><Th>Type</Th><Th>Date</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(n => (
              <Tr key={n.id}>
                <Td>{n.message}</Td>
                <Td><Badge colorScheme='purple'>{String(n.type || 'notice').toUpperCase()}</Badge></Td>
                <Td>{n.createdAt ? formatDate(new Date(n.createdAt)) : '-'}</Td>
                <Td>{n.isRead? <Badge colorScheme='green'>Read</Badge> : <Badge colorScheme='red'>Unread</Badge>}</Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(n); onOpen(); }}>View</Button>
                    {!n.isRead && <Button size='xs' variant='outline' onClick={()=>toggleRead(n.id)}>Mark Read</Button>}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdNotificationsActive} w='22px' h='22px' color='white' />} />}
            name='Total'
            value={String(filtered.length)}
            trendData={[1,2,3,3,filtered.length]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdMarkEmailRead} w='22px' h='22px' color='white' />} />}
            name='Unread'
            value={String(filtered.filter(n=>!n.isRead).length)}
            trendData={[0,1,1,2,filtered.filter(n=>!n.isRead).length]}
            trendColor='#f5576c'
          />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px'>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Announcements by Type</Text>
          <BarChart chartData={chartData} chartOptions={{ ...chartOptions, tooltip:{ enabled:true } }} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Type Trend (Line)</Text>
          <LineChart chartData={chartData} chartOptions={{ ...chartOptions, colors:['#01B574'], dataLabels:{ enabled:false }, stroke:{ curve:'smooth', width:3 }, tooltip:{ enabled:true } }} height={220} />
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Announcement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text fontWeight='600'>{String(selected.type || 'notice').toUpperCase()}</Text>
                <Text color={textSecondary}>{selected.createdAt ? formatDate(new Date(selected.createdAt)) : '-'}</Text>
                <Text>{selected.message || ''}</Text>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
