import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdSchool, MdFileDownload, MdPrint, MdVisibility, MdCheckCircle, MdAccessTime } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents, mockTeachers } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }
function formatTime(d){ return d.toLocaleTimeString(undefined,{ hour:'2-digit', minute:'2-digit' }); }

export default function Workshops(){
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
  const data = useMemo(()=>{
    const mk = (id,title,subject,level,daysAhead,hours,venue,desc,reg=false)=>({ id, title, subject, level, date:new Date(today.getFullYear(), today.getMonth(), today.getDate()+daysAhead, 14,0), duration:hours, venue, desc, registered:reg, mentor: teachers.find(t=>t.subject===subject)?.name || 'Guest Mentor' });
    return [
      mk('W1','Intro to Web Dev', subjects[2]||'Computer Science','Beginner', 4, 2, 'Lab 101','HTML/CSS fundamentals and live demo'),
      mk('W2','Biology Lab Techniques', subjects[1]||'Biology','Intermediate', 7, 3, 'Bio Lab','Microscope handling and staining', true),
      mk('W3','Math Problem Solving', subjects[0]||'Mathematics','Intermediate', 9, 2, 'Room 201','Competitive problem-solving strategies'),
      mk('W4','Public Speaking Basics','English','Beginner', 13, 2, 'Room 104','Confidence and delivery practice'),
    ];
  },[subjects, teachers]);

  const [items, setItems] = useState(data);
  const [subj, setSubj] = useState('all');
  const [level, setLevel] = useState('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(()=> items.filter(w => (subj==='all'||w.subject===subj) && (level==='all'||w.level===level) && (!q || w.title.toLowerCase().includes(q.toLowerCase()))), [items, subj, level, q]);

  const kpis = useMemo(()=>({ total: items.length, registered: items.filter(i=>i.registered).length, hours: items.reduce((s,i)=>s+i.duration,0) }), [items]);

  const chartLevels = ['Beginner','Intermediate','Advanced'];
  const chartData = useMemo(()=> ([{ name:'Workshops', data: chartLevels.map(l => items.filter(i=>i.level===l).length) }]), [items]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: chartLevels }, colors:['#805AD5'], dataLabels:{ enabled:false }, tooltip:{ enabled:true } }), []);

  const toggleReg = (id)=> setItems(prev => prev.map(i => i.id===id ? { ...i, registered: !i.registered } : i));
  const exportCsv = ()=>{
    const rows = ['Title,Subject,Level,Date,Time,Venue,Duration,Registered', ...filtered.map(e=> `${e.title},${e.subject},${e.level},${formatDate(e.date)},${formatTime(e.date)},${e.venue},${e.duration}h,${e.registered?'yes':'no'}`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='workshops.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Workshops</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdSchool} w='22px' h='22px' color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[1,2,2,3,kpis.total]}
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
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />}
            name='Total Hours'
            value={`${kpis.hours}h`}
            trendData={[1,2,2,3,kpis.hours]}
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
          <Select size='sm' value={level} onChange={e=>setLevel(e.target.value)} maxW='200px'>
            <option value='all'>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </Select>
          <Input size='sm' placeholder='Search workshops...' value={q} onChange={e=>setQ(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCsv}>Export CSV</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Level</Th><Th>Date</Th><Th>Time</Th><Th>Duration</Th><Th>Venue</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(e => (
              <Tr key={e.id}>
                <Td>{e.title}</Td>
                <Td>{e.subject}</Td>
                <Td><Badge colorScheme='purple'>{e.level}</Badge></Td>
                <Td>{formatDate(e.date)}</Td>
                <Td>{formatTime(e.date)}</Td>
                <Td>{e.duration}h</Td>
                <Td>{e.venue}</Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(e); onOpen(); }}>View</Button>
                    <Button size='xs' colorScheme='green' variant={e.registered?'solid':'outline'} leftIcon={<Icon as={MdCheckCircle} />} onClick={()=>toggleReg(e.id)}>{e.registered? 'Registered':'Register'}</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px'>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Workshops by Level</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Level Trend (Line)</Text>
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
                <Text fontWeight='600'>{selected.subject} • {selected.level}</Text>
                <Text color={textSecondary}>{formatDate(selected.date)} • {formatTime(selected.date)} • {selected.venue}</Text>
                <Text color={textSecondary}>Mentor: {selected.mentor}</Text>
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
