import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdEmojiEvents, MdFileDownload, MdPrint, MdVisibility, MdCheckCircle, MdBookmarkAdd } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents, mockTeachers } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }
function formatTime(d){ return d.toLocaleTimeString(undefined,{ hour:'2-digit', minute:'2-digit' }); }

export default function Competitions(){
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

  const teachers = useMemo(()=> mockTeachers.filter(t => (t.classes||[]).includes(classSection)), [classSection]);
  const subjects = useMemo(()=> Array.from(new Set(teachers.map(t=>t.subject))), [teachers]);

  const today = new Date();
  const comps = useMemo(()=>{
    const mk = (id,title,subject,daysAhead,venue,type,desc,awards=['Gold','Silver','Bronze'],reg=false)=>({ id, title, subject, date:new Date(today.getFullYear(), today.getMonth(), today.getDate()+daysAhead, 10,0), venue, type, desc, awards, registered:reg });
    return [
      mk('C1','Math Olympiad Qualifier', subjects[0]||'Mathematics', 5, 'Room 201', 'Academic', 'Individual contest on algebra & geometry'),
      mk('C2','Science Debate', subjects[1]||'Biology', 9, 'Auditorium', 'Debate', 'Team debate on climate change policies', ['Best Speaker','Best Team'], true),
      mk('C3','Coding Sprint', subjects[2]||'Computer Science', 12, 'Lab 101', 'Programming', '2-hour coding challenge in JS'),
      mk('C4','English Spelling Bee', 'English', 15, 'Room 104', 'Language', 'Spelling and vocabulary contest'),
    ];
  },[subjects]);

  const [items, setItems] = useState(comps);
  const [subj, setSubj] = useState('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(()=> items.filter(c => (subj==='all'||c.subject===subj) && (!q || c.title.toLowerCase().includes(q.toLowerCase()))), [items, subj, q]);

  const kpis = useMemo(()=>({ upcoming: items.length, registered: items.filter(i=>i.registered).length, subjects: new Set(items.map(i=>i.subject)).size }), [items]);

  const chartData = useMemo(()=> ([{ name:'Competitions', data: subjects.map(s => items.filter(i=>i.subject===s).length) }]), [items, subjects]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: subjects }, colors:['#805AD5'], dataLabels:{ enabled:false }, tooltip:{ enabled:true } }), [subjects]);

  const toggleReg = (id)=> setItems(prev => prev.map(i => i.id===id ? { ...i, registered: !i.registered } : i));

  const exportCsv = ()=>{
    const rows = ['Title,Subject,Date,Time,Venue,Type,Registered', ...filtered.map(e=> `${e.title},${e.subject},${formatDate(e.date)},${formatTime(e.date)},${e.venue},${e.type},${e.registered?'yes':'no'}`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='competitions.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Competitions</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdEmojiEvents} w='22px' h='22px' color='white' />} />}
            name='Upcoming'
            value={String(kpis.upcoming)}
            trendData={[1,2,2,3,kpis.upcoming]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Registered'
            value={String(kpis.registered)}
            trendData={[0,1,1,2,kpis.registered]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdBookmarkAdd} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(kpis.subjects)}
            trendData={[1,1,2,2,kpis.subjects]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={subj} onChange={e=>setSubj(e.target.value)} maxW='220px'>
            <option value='all'>All Subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Input size='sm' placeholder='Search competitions...' value={q} onChange={e=>setQ(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCsv}>Export CSV</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Date</Th><Th>Time</Th><Th>Venue</Th><Th>Type</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(e => (
              <Tr key={e.id}>
                <Td>{e.title}</Td>
                <Td>{e.subject}</Td>
                <Td>{formatDate(e.date)}</Td>
                <Td>{formatTime(e.date)}</Td>
                <Td>{e.venue}</Td>
                <Td><Badge colorScheme='purple'>{e.type}</Badge></Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(e); onOpen(); }}>View</Button>
                    <Button size='xs' colorScheme='green' variant={e.registered?'solid':'outline'} leftIcon={<Icon as={MdCheckCircle} />} onClick={()=>toggleReg(e.id)}>{e.registered? 'Registered':'Register'}</Button>
                    <Button size='xs' variant='outline' leftIcon={<Icon as={MdBookmarkAdd} />} onClick={()=>{ /* ICS similar to Events calendar handled there if needed */ }}>Add</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px'>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Competitions by Subject</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Subject Trend (Line)</Text>
          <LineChart chartData={chartData} chartOptions={{ ...chartOptions, colors:['#01B574'], stroke:{ curve:'smooth', width:3 } }} height={220} />
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
                <Text fontWeight='600'>{selected.subject} • {selected.type}</Text>
                <Text color={textSecondary}>{formatDate(selected.date)} • {formatTime(selected.date)} • {selected.venue}</Text>
                <Text>Awards: {selected.awards.join(', ')}</Text>
                <Text>{selected.desc}</Text>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
