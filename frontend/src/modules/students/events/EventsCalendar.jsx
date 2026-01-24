import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdEvent, MdFileDownload, MdPrint, MdVisibility, MdCheckCircle, MdBookmarkAdd, MdSchedule } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }
function formatTime(d){ return d.toLocaleTimeString(undefined,{ hour:'2-digit', minute:'2-digit' }); }

export default function EventsCalendar(){
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

  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,7)); // YYYY-MM
  const [type, setType] = useState('all');
  const [query, setQuery] = useState('');

  const events = useMemo(()=>{
    const base = new Date(month+"-01");
    const y = base.getFullYear();
    const m = base.getMonth();
    const mk = (id,title,day,hour,minute,venue,type,audience,desc,reg=false)=>({ id, title, date:new Date(y,m,day,hour,minute), venue, type, audience, desc, registered:reg });
    return [
      mk('E1','Science Fair', 6,10,0,'Auditorium','School','All','School-wide exhibition of science projects. Families welcome.'),
      mk('E2','PTM', 10,9,30,'Main Hall','School',classSection,'Parent-Teacher Meeting for '+classSection+'. Slots by roll no.'),
      mk('E3','Sports Day', 18,8,0,'Sports Ground','Sports','All','Track events, football, cricket. House points.'),
      mk('E4','Coding Workshop: Web Basics', 20,14,0,'Lab 101','Workshop',classSection,'Intro to HTML/CSS/JS for your class.', true),
      mk('E5','Debate Semi-Finals', 23,11,0,'Room 204','Competition','All','Inter-class debate on climate action.'),
      mk('E6','Math Club: Problem Solving', 27,13,30,'Room 201','Club',classSection,'Weekly problem-solving session.'),
    ];
  },[month, classSection]);

  const filtered = useMemo(()=> events.filter(e => (
    (type==='all' || e.type.toLowerCase()===type) &&
    (!query || e.title.toLowerCase().includes(query.toLowerCase()) || e.venue.toLowerCase().includes(query.toLowerCase()))
  )), [events, type, query]);

  const kpis = useMemo(()=>{
    const monthEvents = events.length;
    const upcoming = events.filter(e=> e.date >= new Date()).length;
    const registered = events.filter(e=> e.registered).length;
    return { monthEvents, upcoming, registered };
  },[events]);

  const types = ['School','Workshop','Competition','Sports','Club'];
  const chartData = useMemo(()=> ([{ name:'Events', data: types.map(t => events.filter(e=>e.type.toLowerCase()===t.toLowerCase()).length) }]), [events]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: types }, colors:['#805AD5'], dataLabels:{ enabled:false } }), []);

  const exportCsv = ()=>{
    const rows = ['Title,Type,Date,Time,Venue,Audience,Registered', ...filtered.map(e=> `${e.title},${e.type},${formatDate(e.date)},${formatTime(e.date)},${e.venue},${e.audience},${e.registered?'yes':'no'}`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='events-calendar.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const toggleRegister = (id)=>{
    const idx = events.findIndex(e=>e.id===id); // events is memo; emulate UI state by cloning array via local state
  };

  const [stateEvents, setStateEvents] = useState(null);
  const effective = stateEvents || events;
  const filteredEff = useMemo(()=> effective.filter(e => (
    (type==='all' || e.type.toLowerCase()===type) &&
    (!query || e.title.toLowerCase().includes(query.toLowerCase()) || e.venue.toLowerCase().includes(query.toLowerCase()))
  )), [effective, type, query]);
  const doToggle = (id)=> setStateEvents(prev => {
    const list = (prev||events).map(e => e.id===id ? { ...e, registered: !e.registered } : e);
    return list;
  });

  const downloadICS = (e)=>{
    const dtStart = e.date;
    const dtEnd = new Date(e.date.getTime()+60*60*1000);
    const toICS = (d)=> d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const ics = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MindSpire//StudentEvents//EN','BEGIN:VEVENT',
      `UID:${e.id}@mindspire`,
      `DTSTAMP:${toICS(new Date())}`,
      `DTSTART:${toICS(dtStart)}`,
      `DTEND:${toICS(dtEnd)}`,
      `SUMMARY:${e.title}`,
      `DESCRIPTION:${e.desc}`,
      `LOCATION:${e.venue}`,
      'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type:'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${e.title.replace(/\s+/g,'_')}.ics`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Events Calendar</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdEvent} w='22px' h='22px' color='white' />} />}
            name='Events this Month'
            value={String(kpis.monthEvents)}
            trendData={[1,2,3,3,kpis.monthEvents]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdSchedule} w='22px' h='22px' color='white' />} />}
            name='Upcoming'
            value={String(kpis.upcoming)}
            trendData={[1,1,2,2,kpis.upcoming]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Registered'
            value={String(effective.filter(e=>e.registered).length)}
            trendData={[0,1,1,2,effective.filter(e=>e.registered).length]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Input type='month' size='sm' value={month} onChange={e=>setMonth(e.target.value)} maxW='180px' />
          <Select size='sm' value={type} onChange={e=>setType(e.target.value)} maxW='200px'>
            <option value='all'>All Types</option>
            <option value='school'>School</option>
            <option value='workshop'>Workshop</option>
            <option value='competition'>Competition</option>
            <option value='sports'>Sports</option>
            <option value='club'>Club</option>
          </Select>
          <Input size='sm' placeholder='Search title or venue...' value={query} onChange={e=>setQuery(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>{
              const rows = ['Title,Type,Date,Time,Venue,Audience', ...filteredEff.map(e=> `${e.title},${e.type},${formatDate(e.date)},${formatTime(e.date)},${e.venue},${e.audience}`)];
              const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='events.csv'; a.click(); URL.revokeObjectURL(url);
            }}>Export CSV</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Type</Th><Th>Date</Th><Th>Time</Th><Th>Venue</Th><Th>Audience</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filteredEff.map(e => (
              <Tr key={e.id}>
                <Td>{e.title}</Td>
                <Td><Badge colorScheme='purple'>{e.type}</Badge></Td>
                <Td>{formatDate(e.date)}</Td>
                <Td>{formatTime(e.date)}</Td>
                <Td>{e.venue}</Td>
                <Td>{e.audience}</Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(e); onOpen(); }}>View</Button>
                    <Button size='xs' variant={e.registered?'solid':'outline'} colorScheme='green' leftIcon={<Icon as={MdCheckCircle} />} onClick={()=>doToggle(e.id)}>{e.registered?'Registered':'Register'}</Button>
                    <Button size='xs' variant='outline' leftIcon={<Icon as={MdBookmarkAdd} />} onClick={()=>downloadICS(e)}>Add to Calendar</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Events by Type</Text>
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
                <Text fontWeight='600'>{selected.type} • {selected.venue}</Text>
                <Text color={textSecondary}>{formatDate(selected.date)} • {formatTime(selected.date)}</Text>
                <Text color={textSecondary}>Audience: {selected.audience}</Text>
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
