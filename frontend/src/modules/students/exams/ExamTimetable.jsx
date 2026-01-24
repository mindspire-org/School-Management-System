import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdSchedule, MdVisibility, MdDateRange, MdListAlt } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import { mockTeachers, mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';

function addDays(base, n){ const d = new Date(base); d.setDate(d.getDate()+n); d.setHours(0,0,0,0); return d; }
function fmt(d){ return d.toLocaleDateString(undefined, { weekday:'short', day:'2-digit', month:'short' }); }

export default function ExamTimetable(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);
  const base = useMemo(()=>{ const t=new Date(); t.setHours(0,0,0,0); return t; },[]);

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
  const subjects = useMemo(()=> Array.from(new Set(mockTeachers.filter(t=>t.classes?.includes(classSection)).map(t=>t.subject))), [classSection]);

  const items = useMemo(()=>{
    const types = ['Theory','Practical','Oral'];
    const rooms = ['Hall A','Hall B','Lab 1','Lab 2','Room 201'];
    return subjects.map((s, i)=>({
      id: `EX-${i+1}`,
      subject: s,
      date: addDays(base, 2 + i*2),
      time: i%2===0 ? '09:00 AM' : '11:30 AM',
      duration: i%2===0 ? '2h' : '1.5h',
      room: rooms[i % rooms.length],
      type: types[i % types.length],
      instructions: 'Bring ID card and required stationery. No mobiles allowed.',
    }));
  },[subjects, base]);

  const [subject, setSubject] = useState('all');
  const filtered = useMemo(()=> items.filter(x => subject==='all' || x.subject===subject), [items, subject]);

  const kpis = useMemo(()=>({
    total: items.length,
    thisWeek: items.filter(x => (x.date.getTime()-base.getTime())/(1000*60*60*24) <= 7).length,
    nextExam: items.length ? items[0].date : null,
  }),[items, base]);

  const chartData = useMemo(()=> ([{ name:'Exams', data: items.map(()=>1) }]), [items]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: items.map(x=>x.subject) }, colors:['#667eea'], dataLabels:{ enabled:false } }), [items]);

  const exportCSV = () => {
    const header = ['Subject','Date','Time','Duration','Room','Type'];
    const rows = filtered.map(x => [x.subject, fmt(x.date), x.time, x.duration, x.room, x.type]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='student_exam_timetable.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Exam Timetable</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdListAlt} w='22px' h='22px' color='white' />} />}
            name='Total Exams'
            value={String(kpis.total)}
            trendData={[1,2,2,3,kpis.total]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdDateRange} w='22px' h='22px' color='white' />} />}
            name='This Week'
            value={String(kpis.thisWeek)}
            trendData={[0,1,1,2,kpis.thisWeek]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdSchedule} w='22px' h='22px' color='white' />} />}
            name='Next Exam'
            value={kpis.nextExam ? fmt(kpis.nextExam) : '-'}
            trendData={[0,1,1,1,1]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' flexWrap='wrap' rowGap={3}>
          <HStack>
            <Icon as={MdSchedule} />
            <Select size='sm' value={subject} onChange={e=>setSubject(e.target.value)} maxW='220px'>
              <option value='all'>All Subjects</option>
              {subjects.map(s => <option key={s}>{s}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />}>Print</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Subject</Th><Th>Date</Th><Th>Time</Th><Th>Duration</Th><Th>Room</Th><Th>Type</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(x => (
              <Tr key={x.id}>
                <Td>{x.subject}</Td>
                <Td>{fmt(x.date)}</Td>
                <Td>{x.time}</Td>
                <Td>{x.duration}</Td>
                <Td>{x.room}</Td>
                <Td><Badge>{x.type}</Badge></Td>
                <Td><Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(x); onOpen(); }}>View</Button></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Exam Count by Subject</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exam Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text><b>Subject:</b> {selected.subject}</Text>
                <Text><b>Date:</b> {fmt(selected.date)}</Text>
                <Text><b>Time:</b> {selected.time}</Text>
                <Text><b>Duration:</b> {selected.duration}</Text>
                <Text><b>Room:</b> {selected.room}</Text>
                <Text><b>Type:</b> {selected.type}</Text>
                <Text><b>Instructions:</b> {selected.instructions}</Text>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
