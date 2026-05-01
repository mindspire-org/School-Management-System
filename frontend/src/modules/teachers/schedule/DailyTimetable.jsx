import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Select,
  Button,
  Icon,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdPrint, MdVisibility, MdEdit, MdClass, MdAlarm, MdBook } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { useAuth } from '../../../contexts/AuthContext';

import * as teachersApi from '../../../services/api/teachers';

export default function DailyTimetable() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const { user } = useAuth();

  const [scheduleSlots, setScheduleSlots] = useState([]);

  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  function toYMD(d) { const x = new Date(d.getTime() - d.getTimezoneOffset()*60000); return x.toISOString().slice(0,10); }
  const [date, setDate] = useState(() => toYMD(new Date()));
  const [viewDate, setViewDate] = useState(() => new Date());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const dayKey = useMemo(() => {
    const d = new Date(date);
    const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const n = names[d.getDay()] || 'Mon';
    return n;
  }, [date]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const res = await teachersApi.listSchedules({ day: dayKey });
        const data = Array.isArray(res) ? res : [];
        if (mounted) setScheduleSlots(data);
      } catch (e) {
        console.error('Failed to load schedule', e);
        if (mounted) setScheduleSlots([]);
      }
    })();
    return () => { mounted = false; };
  }, [user, dayKey]);

  const allTimes = useMemo(() => {
    const set = new Set(scheduleSlots.map(s => String(s.startTime || '').slice(0,5)).filter(Boolean));
    const list = Array.from(set);
    list.sort();
    return list.length ? list : ['08:00','09:00','10:00','11:00','12:00','14:00'];
  }, [scheduleSlots]);

  const filteredSlots = useMemo(() => {
    return scheduleSlots.filter(s =>
      (!cls || String(s.class) === String(cls)) &&
      (!section || String(s.section) === String(section))
    );
  }, [scheduleSlots, cls, section]);

  const dayEntriesByTime = useMemo(() => {
    const map = {};
    allTimes.forEach(t => { map[t] = []; });
    filteredSlots.forEach(s => {
      const t = String(s.startTime || '').slice(0,5);
      if (!t) return;
      if (!map[t]) map[t] = [];
      map[t].push({
        cs: `${s.class || ''}-${s.section || ''}`.replace(/^-|-$/g, ''),
        subject: s.subject || '-',
        room: s.room || '-',
        teacher: s.teacherName || user?.name || '-',
      });
    });
    return map;
  }, [allTimes, filteredSlots, user]);

  const kpis = useMemo(() => {
    let total = 0; const subj = new Set(); let breaks = 0;
    allTimes.forEach((t) => {
      const arr = dayEntriesByTime[t] || [];
      total += arr.length;
      arr.forEach(e => subj.add(e.subject));
    });
    return { total, breaks, subjects: subj.size };
  }, [dayEntriesByTime, allTimes]);

  const chartData = useMemo(() => ([{ name: 'Lectures', data: allTimes.map(p => (dayEntriesByTime[p]?.length || 0)) }]), [dayEntriesByTime, allTimes]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: allTimes }, dataLabels: { enabled: false }, colors: ['#3182CE'] }), [allTimes]);

  const totals = useMemo(() => {
    const lectures = allTimes.reduce((s,p)=> s + (dayEntriesByTime[p]?.length || 0), 0);
    return { lectures, breaks: 0 };
  }, [dayEntriesByTime, allTimes]);

  const rows = useMemo(() => allTimes.map(p => {
    const arr = dayEntriesByTime[p] || [];
    if (arr.length > 0) {
      const classes = arr.map(e => e.cs).join(', ');
      const subject = arr.length === 1 ? arr[0].subject : 'Multiple';
      const room = arr.length === 1 ? arr[0].room : '-';
      const teacher = arr.length === 1 ? arr[0].teacher : (subject==='Multiple' ? (user?.name || '-') : arr[0].teacher);
      return { time: p, classes, subject, room, teacher };
    }
    return { time: p, classes: '-', subject: '-', room: '-', teacher: '-' };
  }), [dayEntriesByTime, allTimes, user]);

  const exportCSV = () => {
    const header = ['Date','Time','Class','Subject','Room','Teacher'];
    const data = allTimes.flatMap(p => {
      const arr = dayEntriesByTime[p] || [];
      if (arr.length > 0) return arr.map(e => [date || 'Today', p, e.cs, e.subject, e.room, e.teacher]);
      return [[date || 'Today', p, '-', '-', '-', '-']];
    });
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'daily_timetable.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const openView = (r) => { setSelectedPeriod(r); onOpen(); };

  const monthYearLabel = useMemo(() => {
    const d = viewDate; const m = d.toLocaleString(undefined, { month: 'long' });
    return `${m} ${d.getFullYear()}`;
  }, [viewDate]);

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const calendarDays = useMemo(() => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = (d.getDay() + 6) % 7; // Monday-first
    const first = new Date(d); first.setDate(1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const x = new Date(first); x.setDate(first.getDate() + i); return x;
    });
  }, [viewDate]);

  const isSameDay = (a, bStr) => {
    const [yy,mm,dd] = bStr.split('-').map(Number);
    return a.getFullYear()===yy && (a.getMonth()+1)===mm && a.getDate()===dd;
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Daily Timetable</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>View and manage today's schedule</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdClass color='white' />} />}
            name='Periods Today'
            value={String(kpis.total)}
            trendData={[1,2,1,3,2,3]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdAlarm color='white' />} />}
            name='Breaks'
            value={String(kpis.breaks)}
            trendData={[0,1,1,1,0,1]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdBook color='white' />} />}
            name='Unique Subjects'
            value={String(kpis.subjects)}
            trendData={[1,1,2,2,3,3]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='140px'>
              <option value=''>All</option>
              {Array.from(new Set(scheduleSlots.map(s => String(s.class)).filter(Boolean))).sort((a,b)=>Number(a)-Number(b)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='120px'>
              <option value=''>All</option>
              {Array.from(new Set(scheduleSlots
                .filter(s => !cls || String(s.class) === String(cls))
                .map(s => String(s.section))
                .filter(Boolean)
              )).sort().map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{const t=new Date();setCls('');setSection('');setDate(toYMD(t));setViewDate(t);}}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint}/>} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='16px' mb='16px'>
        <Flex align='center' justify='space-between' mb='10px'>
          <HStack>
            <Button size='sm' onClick={()=>setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1))}>{'<'}</Button>
            <Text fontWeight='600'>{monthYearLabel}</Text>
            <Button size='sm' onClick={()=>setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1))}>{'>'}</Button>
          </HStack>
          <Text fontSize='sm' color={textSecondary}>Selected: {date}</Text>
        </Flex>
        <SimpleGrid columns={7} spacing='6px'>
          {weekDays.map(d => (<Box key={d} textAlign='center' fontSize='xs' color={textSecondary}>{d}</Box>))}
          {calendarDays.map((d, idx) => {
            const inMonth = d.getMonth() === viewDate.getMonth();
            const isToday = isSameDay(d, toYMD(new Date()));
            const isSelected = isSameDay(d, date);
            return (
              <Box
                key={idx}
                onClick={()=>{setDate(toYMD(d));}}
                cursor='pointer'
                p='8px'
                textAlign='center'
                borderRadius='8px'
                bg={isSelected ? 'blue.500' : isToday ? 'blue.50' : 'transparent'}
                color={isSelected ? 'white' : inMonth ? undefined : textSecondary}
                borderWidth={isToday && !isSelected ? '1px' : '0px'}
                borderColor={isToday && !isSelected ? 'blue.200' : 'transparent'}
              >
                <Text fontSize='sm'>{d.getDate()}</Text>
              </Box>
            );
          })}
        </SimpleGrid>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
            <Tr>
              <Th>Time</Th>
              <Th>Class</Th>
              <Th>Subject</Th>
              <Th>Room</Th>
              <Th>Teacher</Th>
              <Th textAlign='right'>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map(r => (
              <Tr key={r.time} _hover={{ bg: hoverBg }}>
                <Td>{r.time}</Td>
                <Td>{r.classes || '-'}</Td>
                <Td><Tooltip label={r.subject}><Box isTruncated maxW='260px'>{r.subject}</Box></Tooltip></Td>
                <Td>{r.room}</Td>
                <Td>{r.teacher}</Td>
                <Td>
                  <HStack justify='flex-end'>
                    <Tooltip label='View'><IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' onClick={()=>openView(r)} /></Tooltip>
                    <Tooltip label='Edit'><IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' /></Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
            {rows.length===0 && (
              <Tr><Td colSpan={5}><Box p='12px' textAlign='center' color={textSecondary}>No entries.</Box></Td></Tr>
            )}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Lectures by Time</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Lectures vs Breaks</Text>
            <PieChart height={240} chartData={[totals.lectures, totals.breaks]} chartOptions={{ labels:['Lectures','Breaks'], legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Period Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPeriod ? (
              <VStack align='start' spacing={2} fontSize='sm'>
                <HStack><Text fontWeight='600'>Time:</Text><Text>{selectedPeriod.time}</Text></HStack>
                <HStack><Text fontWeight='600'>Subject:</Text><Text>{selectedPeriod.subject}</Text></HStack>
                <HStack><Text fontWeight='600'>Room:</Text><Text>{selectedPeriod.room}</Text></HStack>
                <HStack><Text fontWeight='600'>Teacher:</Text><Text>{selectedPeriod.teacher}</Text></HStack>
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
