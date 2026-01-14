import React, { useMemo, useState } from 'react';
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

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const periods = ['08:00', '09:00', '10:00', '11:00', '12:00', '02:00'];

const sampleWeek = {
  '9-A': {
    Mon: {
      '08:00': { subject: 'Mathematics', room: '201', teacher: 'Mr. Ali' },
      '09:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
      '10:00': { subject: 'Chemistry', room: '305', teacher: 'Mr. Khan' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'Physics', room: '302', teacher: 'Mr. Aslam' },
      '02:00': { subject: 'Computer Science', room: 'Lab-1', teacher: 'Ms. Ayesha' },
    },
    Tue: {
      '08:00': { subject: 'Urdu', room: '103', teacher: 'Mr. Imran' },
      '09:00': { subject: 'Math', room: '201', teacher: 'Mr. Ali' },
      '10:00': { subject: 'Biology', room: '306', teacher: 'Ms. Hina' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
      '02:00': { subject: 'Islamiat', room: '105', teacher: 'Mr. Hassan' },
    },
    Wed: {
      '08:00': { subject: 'Mathematics', room: '201', teacher: 'Mr. Ali' },
      '09:00': { subject: 'Computer Science', room: 'Lab-1', teacher: 'Ms. Ayesha' },
      '10:00': { subject: 'Physics', room: '302', teacher: 'Mr. Aslam' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'Urdu', room: '103', teacher: 'Mr. Imran' },
      '02:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
    },
    Thu: {
      '08:00': { subject: 'Chemistry', room: '305', teacher: 'Mr. Khan' },
      '09:00': { subject: 'Biology', room: '306', teacher: 'Ms. Hina' },
      '10:00': { subject: 'Math', room: '201', teacher: 'Mr. Ali' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'Pak Studies', room: '101', teacher: 'Mr. Nadeem' },
      '02:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
    },
    Fri: {
      '08:00': { subject: 'Mathematics', room: '201', teacher: 'Mr. Ali' },
      '09:00': { subject: 'Urdu', room: '103', teacher: 'Mr. Imran' },
      '10:00': { subject: 'Physics', room: '302', teacher: 'Mr. Aslam' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'Computer Science', room: 'Lab-1', teacher: 'Ms. Ayesha' },
      '02:00': { subject: 'Islamiyat', room: '105', teacher: 'Mr. Hassan' },
    },
  },
  '10-A': {
    Mon: {
      '08:00': { subject: 'Chemistry', room: '305', teacher: 'Mr. Khan' },
      '09:00': { subject: 'Biology', room: '306', teacher: 'Ms. Hina' },
      '10:00': { subject: 'Math', room: '201', teacher: 'Mr. Ali' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
      '02:00': { subject: 'Urdu', room: '103', teacher: 'Mr. Imran' },
    },
    Tue: {
      '08:00': { subject: 'Physics', room: '302', teacher: 'Mr. Aslam' },
      '09:00': { subject: 'Pak Studies', room: '101', teacher: 'Mr. Nadeem' },
      '10:00': { subject: 'Math', room: '201', teacher: 'Mr. Ali' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'Computer Science', room: 'Lab-1', teacher: 'Ms. Ayesha' },
      '02:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
    },
    Wed: {
      '08:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
      '09:00': { subject: 'Urdu', room: '103', teacher: 'Mr. Imran' },
      '10:00': { subject: 'Physics', room: '302', teacher: 'Mr. Aslam' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'Math', room: '201', teacher: 'Mr. Ali' },
      '02:00': { subject: 'Chemistry', room: '305', teacher: 'Mr. Khan' },
    },
    Thu: {
      '08:00': { subject: 'Biology', room: '306', teacher: 'Ms. Hina' },
      '09:00': { subject: 'Pak Studies', room: '101', teacher: 'Mr. Nadeem' },
      '10:00': { subject: 'Computer Science', room: 'Lab-1', teacher: 'Ms. Ayesha' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
      '02:00': { subject: 'Urdu', room: '103', teacher: 'Mr. Imran' },
    },
    Fri: {
      '08:00': { subject: 'Math', room: '201', teacher: 'Mr. Ali' },
      '09:00': { subject: 'English', room: '104', teacher: 'Ms. Sara' },
      '10:00': { subject: 'Chemistry', room: '305', teacher: 'Mr. Khan' },
      '11:00': { subject: 'Break', room: '-', teacher: '-' },
      '12:00': { subject: 'Urdu', room: '103', teacher: 'Mr. Imran' },
      '02:00': { subject: 'Biology', room: '306', teacher: 'Ms. Hina' },
    },
  },
};

export default function WeeklyTimetable() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const { user } = useAuth();

  const [cls, setCls] = useState('9');
  const [section, setSection] = useState('A');
  function toYMD(d) { const x = new Date(d.getTime() - d.getTimezoneOffset()*60000); return x.toISOString().slice(0,10); }
  const [weekStart, setWeekStart] = useState(() => {
    const t = new Date(); const offset = (t.getDay() + 6) % 7; const m = new Date(t); m.setDate(t.getDate() - offset);
    return toYMD(m);
  });
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toYMD(new Date()));
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const key = `${cls}-${section}`;
  const weekDataRaw = useMemo(() => sampleWeek[key] || {}, [key]);
  const teacherTokens = useMemo(() => {
    const raw = (user?.name || '').toLowerCase().replace(/\b(mr\.?|ms\.?|mrs\.?|miss|dr\.?|prof\.?|teacher)\b/g, '').trim();
    const toks = raw.split(/\s+/).filter(Boolean);
    return toks.length ? toks : ['ali'];
  }, [user]);

  const isMine = (teacherStr) => {
    if (!teacherStr || teacherStr === '-') return false;
    const s = String(teacherStr).toLowerCase();
    return teacherTokens.some((t) => s.includes(t));
  };

  // Build aggregated map across ALL classes: day -> time -> [{ cs, subject, room, teacher }]
  const { weekEntries, breakTimesByDay } = useMemo(() => {
    const out = {}; const breaks = {};
    days.forEach(d => { out[d] = {}; periods.forEach(p => { out[d][p] = []; }); breaks[d] = new Set(); });
    Object.keys(sampleWeek).forEach((cs) => {
      const week = sampleWeek[cs] || {};
      days.forEach((d) => {
        const slots = week[d] || {};
        periods.forEach((t) => {
          const v = slots[t];
          if (!v) return;
          if (v.subject === 'Break') { breaks[d].add(t); return; }
          if (isMine(v.teacher)) out[d][t].push({ cs, subject: v.subject, room: v.room, teacher: v.teacher });
        });
      });
    });
    return { weekEntries: out, breakTimesByDay: breaks };
  }, [isMine]);

  const matchesClass = (cs) => {
    if (!cls && !section) return true;
    const [c, s] = cs.split('-');
    return (!cls || c === cls) && (!section || s === section);
  };

  // Filtered entries based on optional class/section selection
  const filteredWeek = useMemo(() => {
    const out = {};
    days.forEach(d => { out[d] = {}; periods.forEach(p => { out[d][p] = (weekEntries[d][p] || []).filter(e => matchesClass(e.cs)); }); });
    return out;
  }, [weekEntries, cls, section]);

  const kpis = useMemo(() => {
    let total = 0; let breaks = 0; const subjects = new Set();
    days.forEach(d => periods.forEach(p => {
      const arr = filteredWeek[d][p] || [];
      total += arr.length;
      arr.forEach(e => subjects.add(e.subject));
      if (breakTimesByDay[d].has(p)) breaks += 1;
    }));
    return { total, breaks, subjects: subjects.size };
  }, [filteredWeek, breakTimesByDay]);

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
      if (breakTimesByDay[day].has(time)) return { day, time, subject: 'Break', classes: '-', room: '-', teacher: '-' };
      return { day, time, subject: '-', classes: '-', room: '-', teacher: '-' };
    }),
  })), [filteredWeek, breakTimesByDay, user]);

  const exportCSV = () => {
    const header = ['WeekStart','Filters (Class-Section)','Time', ...days];
    const filterLabel = cls || section ? `${cls||''}-${section||''}` : 'All';
    const data = tableRows.map(r => [weekStart || 'This Week', filterLabel, r.time, ...r.cells.map(c => {
      if (c.subject === 'Break') return 'Break';
      if (c.subject === '-') return '-';
      const clsTxt = c.classes && c.classes !== '-' ? ` @ ${c.classes}` : '';
      const rmTxt = c.room && c.room !== '-' ? ` (Rm ${c.room})` : '';
      return `${c.subject}${rmTxt}${clsTxt}`;
    })]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'weekly_timetable.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const chartData = useMemo(() => ([{ name: 'Lessons', data: days.map(d => periods.reduce((s,p)=> s + (filteredWeek[d][p]?.length || 0), 0)) }]), [filteredWeek]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: days }, colors: ['#805AD5'] }), []);

  const totals = useMemo(() => {
    const lessons = days.reduce((s,d)=> s + periods.reduce((t,p)=> t + (filteredWeek[d][p]?.length || 0), 0), 0);
    const breaks = days.reduce((s,d)=> s + Array.from(breakTimesByDay[d] || []).length, 0);
    return { lessons, breaks };
  }, [filteredWeek, breakTimesByDay]);

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
    if (breakTimesByDay[selectedDayKey]?.has(time)) return { time, subject: 'Break', room: '-', teacher: '-', classes: '-' };
    return { time, subject: '-', room: '-', teacher: '-', classes: '-' };
  }), [filteredWeek, selectedDayKey, breakTimesByDay, user]);

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
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' align='center' justify='space-between'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='140px'>
              <option>9</option><option>10</option>
            </Select>
            <Select value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='120px'>
              <option>A</option><option>B</option>
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{const t=new Date(); setCls('9'); setSection('A'); setViewDate(t); setWeekStart(toMondayStr(t)); setSelectedDate(t.toISOString().slice(0,10));}}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint}/>} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
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
          <HStack spacing={6}>
            <Text fontSize='sm' color={textSecondary}>Week starting: {weekStart}</Text>
            <Text fontSize='sm' color={textSecondary}>Selected: {selectedDate}</Text>
          </HStack>
        </Flex>
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
