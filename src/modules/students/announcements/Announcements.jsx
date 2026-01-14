import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdMarkEmailRead, MdVisibility, MdFileDownload, MdPrint, MdNotificationsActive, MdDateRange } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }

export default function Announcements(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const student = useMemo(()=>{
    if (user?.role==='student'){
      const byEmail = mockStudents.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s=>s.name?.toLowerCase()===user.name?.toLowerCase());
      if (byName) return byName;
      return { id:999, name:user.name, rollNumber:'STU999', class:'10', section:'A', email:user.email };
    }
    return mockStudents[0];
  },[user]);
  const classSection = `${student.class}${student.section}`;

  // Demo announcements scoped to student
  const demo = useMemo(()=>{
    const today = new Date();
    const mk = (id,type,title,daysAgo,source,msg,read=false)=>({ id, type, title, message: msg, source, date: new Date(today.getFullYear(), today.getMonth(), today.getDate()-daysAgo), read });
    return [
      mk('A1','assignment','Math Assignment Posted',1,'Dr. Sarah Wilson',`New Algebra assignment for ${classSection}. Submit by Friday.`),
      mk('A2','grade','Chemistry Quiz Graded',3,'Mr. Michael Brown','Your Chemistry quiz has been graded. Check Results page.'),
      mk('A3','attendance','Attendance Reminder',2,'Admin','Low attendance alert: keep above 90% this month.'),
      mk('A4','fee','Fee Due in 3 Days',4,'Accounts','Please clear current month fee to avoid late charges.'),
      mk('A5','notice','PTM on Saturday',6,'School Office','Parent-Teacher Meeting scheduled this weekend.','read'),
      mk('A6','assignment','English Essay Feedback',0,'Ms. Emily Davis','Feedback posted for your essay submission.','read'),
    ];
  },[classSection]);

  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(demo);

  const filtered = useMemo(()=> items.filter(n => (
    (type==='all' || n.type===type) && (!query || n.title.toLowerCase().includes(query.toLowerCase()) || n.message.toLowerCase().includes(query.toLowerCase()))
  )),[items, type, query]);

  const kpis = useMemo(()=>{
    const total = items.length;
    const unread = items.filter(i=>!i.read).length;
    const thisWeek = items.filter(i=> (Date.now()-i.date.getTime())/(1000*60*60*24) <= 7).length;
    return { total, unread, thisWeek };
  },[items]);

  const chartTypes = ['assignment','grade','attendance','fee','notice'];
  const chartData = useMemo(()=> ([{ name:'Announcements', data: chartTypes.map(t => items.filter(i=>i.type===t).length) }]), [items]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: chartTypes.map(t=>t.toUpperCase()) }, colors:['#805AD5'], dataLabels:{ enabled:false } }), []);

  const markAllRead = ()=> setItems(prev => prev.map(i=>({ ...i, read:true })));
  const toggleRead = (id)=> setItems(prev => prev.map(i=> i.id===id? { ...i, read:!i.read } : i));

  const exportCsv = ()=>{
    const rows = ['Type,Title,Date,Status,Source,Message', ...filtered.map(r=> `${r.type},${r.title},${formatDate(r.date)},${r.read?'read':'unread'},${r.source},"${r.message.replace(/"/g,'""')}"`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='announcements.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Announcements</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

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
          <Thead><Tr><Th>Title</Th><Th>Type</Th><Th>Date</Th><Th>Source</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(n => (
              <Tr key={n.id}>
                <Td>{n.title}</Td>
                <Td><Badge colorScheme='purple'>{n.type.toUpperCase()}</Badge></Td>
                <Td>{formatDate(n.date)}</Td>
                <Td>{n.source}</Td>
                <Td>{n.read? <Badge colorScheme='green'>Read</Badge> : <Badge colorScheme='red'>Unread</Badge>}</Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(n); onOpen(); }}>View</Button>
                    <Button size='xs' variant='outline' onClick={()=>toggleRead(n.id)}>{n.read? 'Mark Unread':'Mark Read'}</Button>
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
            value={String(filtered.filter(n=>!n.read).length)}
            trendData={[0,1,1,2,filtered.filter(n=>!n.read).length]}
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
          <ModalHeader>{selected?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text fontWeight='600'>{selected.source} • {selected.type.toUpperCase()}</Text>
                <Text color={textSecondary}>{formatDate(selected.date)}</Text>
                <Text>{selected.message}</Text>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
