import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdVisibility, MdFileDownload, MdPrint, MdLibraryBooks, MdError, MdDateRange, MdTimelapse } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockTeachers, mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function fmtDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }

export default function DueDates(){
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
  const subjects = useMemo(() => Array.from(new Set(mockTeachers.filter(t => t.classes?.includes(classSection)).map(t => t.subject))), [classSection]);

  const today = new Date();
  const dataset = useMemo(()=>{
    const mk = (id, title, subject, dueIn, pages) => {
      const dueOn = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dueIn);
      const issuedOn = new Date(dueOn.getFullYear(), dueOn.getMonth(), dueOn.getDate() - 14);
      const daysLeft = Math.ceil((dueOn - new Date())/(1000*60*60*24));
      const overdue = daysLeft < 0;
      return { id, title, subject, issuedOn, dueOn, pages, daysLeft, overdue };
    };
    return [
      mk('D1','Algebra Essentials', subjects[0]||'Mathematics', 3, 420),
      mk('D2','Biology: Cell Structure', subjects[1]||'Biology', -1, 260),
      mk('D3','Urdu Grammar Guide', subjects[2]||'Urdu', 7, 180),
      mk('D4','Computer Science Basics', subjects[3]||'Computer Science', 10, 350),
      mk('D5','English Essays', 'English', -3, 210),
    ];
  },[subjects]);

  const [subj, setSubj] = useState('all');
  const [q, setQ] = useState('');
  const [onlyOverdue, setOnlyOverdue] = useState('all');

  const filtered = useMemo(()=> dataset.filter(b => (
    (subj==='all' || b.subject===subj) &&
    (onlyOverdue==='all' || (onlyOverdue==='overdue'? b.overdue : !b.overdue)) &&
    (!q || b.title.toLowerCase().includes(q.toLowerCase()))
  )), [dataset, subj, onlyOverdue, q]);

  const kpis = useMemo(()=>({
    total: filtered.length,
    overdue: filtered.filter(b=>b.overdue).length,
    dueThisWeek: filtered.filter(b=> b.daysLeft>=0 && b.daysLeft<=7).length,
    avgDaysLeft: filtered.length? Math.round(filtered.reduce((s,b)=>s+b.daysLeft,0)/filtered.length):0,
  }), [filtered]);

  const buckets = ['Overdue','0-3d','4-7d','8-14d','15d+'];
  const chartData = useMemo(()=>{
    const counts = [0,0,0,0,0];
    filtered.forEach(b=>{
      if (b.daysLeft < 0) counts[0]++; else if (b.daysLeft<=3) counts[1]++; else if (b.daysLeft<=7) counts[2]++; else if (b.daysLeft<=14) counts[3]++; else counts[4]++;
    });
    return [{ name:'Books', data: counts }];
  },[filtered]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: buckets }, colors:['#805AD5'], dataLabels:{ enabled:false } }), []);

  const exportCsv = ()=>{
    const rows = ['Title,Subject,Issued On,Due On,Days Left,Overdue', ...filtered.map(b=> `${b.title},${b.subject},${fmtDate(b.issuedOn)},${fmtDate(b.dueOn)},${b.daysLeft},${b.overdue?'yes':'no'}`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='library-due-dates.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Library Due Dates</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdLibraryBooks} w='22px' h='22px' color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[1,2,2,3,kpis.total]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdError} w='22px' h='22px' color='white' />} />}
            name='Overdue'
            value={String(kpis.overdue)}
            trendData={[0,1,1,2,kpis.overdue]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdDateRange} w='22px' h='22px' color='white' />} />}
            name='Due in 7d'
            value={String(kpis.dueThisWeek)}
            trendData={[1,1,2,2,kpis.dueThisWeek]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdTimelapse} w='22px' h='22px' color='white' />} />}
            name='Avg Days Left'
            value={String(kpis.avgDaysLeft)}
            trendData={[1,1,1,1,kpis.avgDaysLeft]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={subj} onChange={e=>setSubj(e.target.value)} maxW='220px'>
            <option value='all'>All Subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select size='sm' value={onlyOverdue} onChange={e=>setOnlyOverdue(e.target.value)} maxW='200px'>
            <option value='all'>All</option>
            <option value='overdue'>Overdue Only</option>
            <option value='not'>Not Overdue</option>
          </Select>
          <Input size='sm' placeholder='Search by title...' value={q} onChange={e=>setQ(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCsv}>Export CSV</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Issued On</Th><Th>Due On</Th><Th>Days Left</Th><Th>Status</Th><Th>Action</Th></Tr></Thead>
          <Tbody>
            {filtered.map(b => (
              <Tr key={b.id}>
                <Td>{b.title}</Td>
                <Td>{b.subject}</Td>
                <Td>{fmtDate(b.issuedOn)}</Td>
                <Td>{fmtDate(b.dueOn)}</Td>
                <Td color={b.overdue? 'red.500': undefined}>{b.daysLeft}</Td>
                <Td>{b.overdue? <Badge colorScheme='red'>Overdue</Badge> : b.daysLeft<=3? <Badge colorScheme='yellow'>Due Soon</Badge> : <Badge colorScheme='green'>On Time</Badge>}</Td>
                <Td><Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(b); onOpen(); }}>View</Button></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Due Buckets</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selected?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text fontWeight='600'>{selected.subject}</Text>
                <Text color={textSecondary}>Issued: {fmtDate(selected.issuedOn)} • Due: {fmtDate(selected.dueOn)}</Text>
                <Text color={textSecondary}>Days Left: {selected.daysLeft} {selected.overdue? '(Overdue)':''}</Text>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
