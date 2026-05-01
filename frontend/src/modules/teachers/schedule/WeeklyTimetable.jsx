import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  SimpleGrid,
  Select,
  Button,
  Icon,
  Tooltip,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
import { MdRefresh, MdFileDownload, MdPrint, MdClass, MdAlarm, MdBook } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { useAuth } from '../../../contexts/AuthContext';

import * as teachersApi from '../../../services/api/teachers';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function WeeklyTimetable() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const { user } = useAuth();

  const [scheduleSlots, setScheduleSlots] = useState([]);

  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  function toYMD(d) { const x = new Date(d.getTime() - d.getTimezoneOffset()*60000); return x.toISOString().slice(0,10); }
  const [weekStart, setWeekStart] = useState(() => {
    const t = new Date(); const offset = (t.getDay() + 6) % 7; const m = new Date(t); m.setDate(t.getDate() - offset);
    return toYMD(m);
  });
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toYMD(new Date()));
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const res = await teachersApi.listSchedules({});
        const data = Array.isArray(res) ? res : [];
        if (mounted) setScheduleSlots(data);
      } catch (e) {
        console.error('Failed to load weekly schedules', e);
        if (mounted) setScheduleSlots([]);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const periods = useMemo(() => {
    const set = new Set(scheduleSlots.map(s => String(s.startTime || '').slice(0,5)).filter(Boolean));
    const list = Array.from(set);
    list.sort();
    return list.length ? list : ['08:00','09:00','10:00','11:00','12:00','14:00'];
  }, [scheduleSlots]);

  const availableClasses = useMemo(() => {
    const set = new Set(scheduleSlots.map(s => String(s.class)).filter(Boolean));
    const list = Array.from(set);
    list.sort((a,b)=>Number(a)-Number(b));
    return list;
  }, [scheduleSlots]);

  const availableSections = useMemo(() => {
    const set = new Set(scheduleSlots
      .filter(s => !cls || String(s.class) === String(cls))
      .map(s => String(s.section))
      .filter(Boolean)
    );
    const list = Array.from(set);
    list.sort();
    return list;
  }, [scheduleSlots, cls]);

  // Build filtered weekly map: day -> time -> [{ cs, subject, room, teacher }]
  const filteredWeek = useMemo(() => {
    const out = {};
    days.forEach(d => { out[d] = {}; periods.forEach(p => { out[d][p] = []; }); });

    scheduleSlots
      .filter(s => (!cls || String(s.class) === String(cls)) && (!section || String(s.section) === String(section)))
      .forEach(s => {
        const dayIndex = Number(s.dayOfWeek);
        const dayName = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][dayIndex - 1];
        if (!days.includes(dayName)) return;
        const t = String(s.startTime || '').slice(0,5);
        if (!t) return;
        if (!out[dayName][t]) out[dayName][t] = [];
        out[dayName][t].push({
          cs: `${s.class || ''}-${s.section || ''}`.replace(/^-|-$/g, ''),
          subject: s.subject || '-',
          room: s.room || '-',
          teacher: s.teacherName || user?.name || '-',
        });
      });
    return out;
  }, [scheduleSlots, cls, section, periods, user]);

  const kpis = useMemo(() => {
    let total = 0; let breaks = 0; const subjects = new Set();
    days.forEach(d => periods.forEach(p => {
      const arr = filteredWeek[d][p] || [];
      total += arr.length;
      arr.forEach(e => subjects.add(e.subject));
    }));
    return { total, breaks, subjects: subjects.size };
  }, [filteredWeek, periods]);

  const tableRows = useMemo(() => periods.map(time => ({
    time,
    cells: days.map(day => {
      const arr = filteredWeek[day][time] || [];
      if (arr.length > 0) {
        const subject = arr.length === 1 ? arr[0].subject : 'Multiple';
        const classes = arr.map(e => e.cs).join(', ');
        const room = arr.length === 1 ? arr[0].room : '-';
        const teacher = arr.length === 1 ? arr[0].teacher : (subject==='Multiple' ? (user?.name || '-') : arr[0].teacher);
        return { day, time, subject, classes, room, teacher };
      }
      return { day, time, subject: '-', classes: '-', room: '-', teacher: '-' };
    }),
  })), [filteredWeek, periods, user]);

  const exportCSV = () => {
    const header = ['WeekStart','Filters (Class-Section)','Time', ...days];
    const filterLabel = cls || section ? `${cls||''}-${section||''}` : 'All';
    const data = tableRows.map(r => [weekStart || 'This Week', filterLabel, r.time, ...r.cells.map(c => {
      if (c.subject === '-') return '-';
      const clsTxt = c.classes && c.classes !== '-' ? ` @ ${c.classes}` : '';
      const rmTxt = c.room && c.room !== '-' ? ` (Rm ${c.room})` : '';
      return `${c.subject}${rmTxt}${clsTxt}`;
    })]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'weekly_timetable.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => ([{ name: 'Lessons', data: days.map(d => periods.reduce((s,p)=> s + (filteredWeek[d][p]?.length || 0), 0)) }]), [filteredWeek, periods]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: days }, colors: ['#805AD5'] }), []);

  const totals = useMemo(() => {
    const lessons = days.reduce((s,d)=> s + periods.reduce((t,p)=> t + (filteredWeek[d][p]?.length || 0), 0), 0);
    return { lessons, breaks: 0 };
  }, [filteredWeek, periods]);

  const onCellClick = (cell) => {
    // Also set selectedDate based on weekStart + day index so the mini table reflects that day
    const start = new Date(weekStart);
    const dayIndexMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4 };
    const idx = dayIndexMap[cell.day] ?? 0;
    const d = new Date(start); d.setDate(start.getDate() + idx);
    setSelectedDate(toYMD(d));
    setSelected(cell);
    onOpen();
  };

  const monthYearLabel = useMemo(() => {
    const d = viewDate; const m = d.toLocaleString(undefined, { month: 'long' });
    return `${m} ${d.getFullYear()}`;
  }, [viewDate]);

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const calendarDays = useMemo(() => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = (d.getDay() + 6) % 7; // Monday-first
    const first = new Date(d); first.setDate(1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => { const x = new Date(first); x.setDate(first.getDate() + i); return x; });
  }, [viewDate]);

  const isSameDay = (a, bStr) => { const [yy,mm,dd] = bStr.split('-').map(Number); return a.getFullYear()===yy && (a.getMonth()+1)===mm && a.getDate()===dd; };

  const toMondayStr = (d) => { const off = (d.getDay()+6)%7; const m = new Date(d); m.setDate(d.getDate()-off); return toYMD(m); };

  const selectedDayKey = useMemo(() => {
    const [yy,mm,dd] = selectedDate.split('-').map(Number);
    const d = new Date(yy, mm-1, dd);
    const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return names[d.getDay()] || 'Mon';
  }, [selectedDate]);

  const selectedDayRows = useMemo(() => periods.map(time => {
    const arr = (filteredWeek[selectedDayKey] && filteredWeek[selectedDayKey][time]) || [];
    if (arr.length > 0) {
      const subject = arr.length === 1 ? arr[0].subject : 'Multiple';
      const classes = arr.map(e => e.cs).join(', ');
      const room = arr.length === 1 ? arr[0].room : '-';
      const teacher = arr.length === 1 ? arr[0].teacher : (subject==='Multiple' ? (user?.name || '-') : arr[0].teacher);
      return { time, subject, room, teacher, classes };
    }
    return { time, subject: '-', room: '-', teacher: '-', classes: '-' };
  }), [filteredWeek, selectedDayKey, user, periods]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Weekly Timetable</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Overview of periods across the week</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdClass color='white' />} />}
            name='Total Periods'
            value={String(kpis.total)}
            trendData={[3,4,4,5,4,6]}
            trendColor='#B721FF'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdAlarm color='white' />} />}
            name='Breaks'
            value={String(kpis.breaks)}
            trendData={[1,1,1,2,1,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdBook color='white' />} />}
            name='Unique Subjects'
            value={String(kpis.subjects)}
            trendData={[2,2,3,3,4,4]}
            trendColor='#01B574'
          />
          <HStack>
            <Button size='sm' onClick={()=>setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1))}>{'<'}</Button>
            <Text fontWeight='600'>{monthYearLabel}</Text>
            <Button size='sm' onClick={()=>setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1))}>{'>'}</Button>
          </HStack>
          <HStack spacing={6}>
            <Text fontSize='sm' color={textSecondary}>Week starting: {weekStart}</Text>
            <Text fontSize='sm' color={textSecondary}>Selected: {selectedDate}</Text>
          </HStack>
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='140px'>
              <option value=''>All</option>
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='120px'>
              <option value=''>All</option>
              {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{const t=new Date();setCls('');setSection('');setWeekStart(toYMD(t));setSelectedDate(toYMD(t));}}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint}/>} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='16px' mb='16px'>
        <SimpleGrid columns={7} spacing='6px'>
          {weekDays.map(d => (<Box key={d} textAlign='center' fontSize='xs' color={textSecondary}>{d}</Box>))}
          {calendarDays.map((d, idx) => {
            const inMonth = d.getMonth() === viewDate.getMonth();
            const isToday = isSameDay(d, toYMD(new Date()));
            const isSelected = isSameDay(d, selectedDate);
            return (
              <Box
                key={idx}
                onClick={()=>{ setWeekStart(toMondayStr(d)); setSelectedDate(toYMD(d)); }}
                cursor='pointer'
                p='8px'
                textAlign='center'
                borderRadius='8px'
                bg={isSelected ? 'purple.500' : isToday ? 'purple.50' : 'transparent'}
                color={isSelected ? 'white' : inMonth ? undefined : textSecondary}
                borderWidth={isToday && !isSelected ? '1px' : '0px'}
                borderColor={isToday && !isSelected ? 'purple.200' : 'transparent'}
              >
                <Text fontSize='sm'>{d.getDate()}</Text>
              </Box>
            );
          })}
        </SimpleGrid>
      </Card>

      <Card p='16px' mb='16px'>
        <Text fontSize='md' fontWeight='bold' mb='10px'>Selected Day: {selectedDate}</Text>
        <Table size='sm' variant='simple'>
          <Thead>
            <Tr>
              <Th>Time</Th>
              <Th>Subject</Th>
              <Th>Room</Th>
              <Th>Class</Th>
              <Th>Teacher</Th>
            </Tr>
          </Thead>
          <Tbody>
            {selectedDayRows.map(r => (
              <Tr key={r.time} _hover={{ bg: hoverBg }}>
                <Td>{r.time}</Td>
                <Td>{r.subject}</Td>
                <Td>{r.room}</Td>
                <Td>{r.classes}</Td>
                <Td>{r.teacher}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
            <Tr>
              <Th>Time</Th>
              {days.map(d => (<Th key={d}>{d}</Th>))}
            </Tr>
          </Thead>
          <Tbody>
            {tableRows.map(r => (
              <Tr key={r.time} _hover={{ bg: hoverBg }}>
                <Td fontWeight='600'>{r.time}</Td>
                {r.cells.map(c => (
                  <Td key={c.day} onClick={() => onCellClick(c)} cursor='pointer'>
                    <Tooltip label={`${c.subject}${c.classes && c.classes!=='-'?` · ${c.classes}`:''} · ${c.teacher} · ${c.room}`}>
                      <Box isTruncated maxW='220px'>
                        {c.subject}{c.classes && c.classes!=='-' ? ` · ${c.classes}` : ''}
                      </Box>
                    </Tooltip>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Lessons per Day</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Lessons vs Breaks (Week)</Text>
            <PieChart height={240} chartData={[totals.lessons, totals.breaks]} chartOptions={{ labels:['Lessons','Breaks'], legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Slot Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2} fontSize='sm'>
                <HStack><Text fontWeight='600'>Day:</Text><Text>{selected.day}</Text></HStack>
                <HStack><Text fontWeight='600'>Time:</Text><Text>{selected.time}</Text></HStack>
                <HStack><Text fontWeight='600'>Subject:</Text><Text>{selected.subject}</Text></HStack>
                <HStack><Text fontWeight='600'>Room:</Text><Text>{selected.room}</Text></HStack>
                <HStack><Text fontWeight='600'>Teacher:</Text><Text>{selected.teacher}</Text></HStack>
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
