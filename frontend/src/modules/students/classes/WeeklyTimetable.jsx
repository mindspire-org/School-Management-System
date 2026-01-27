import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  VStack,
  HStack,
  Select,
  Button,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdAccessTime, MdDateRange, MdClass } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { studentsApi, teachersApi } from '../../../services/api';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const dayMap = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
};

const dayOfWeekToName = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

const shortDayFromSlot = (slot) => {
  const explicit = slot?.dayName ? String(slot.dayName) : null;
  if (explicit && dayMap[explicit]) return dayMap[explicit];

  const raw = slot?.dayOfWeek;
  if (raw === undefined || raw === null) return null;

  const num = Number(raw);
  if (Number.isFinite(num) && dayOfWeekToName[num] && dayMap[dayOfWeekToName[num]]) {
    return dayMap[dayOfWeekToName[num]];
  }

  const asStr = String(raw);
  if (dayMap[asStr]) return dayMap[asStr];

  return null;
};

export default function WeeklyTimetable() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await studentsApi.list({ pageSize: 1 });
        const self = res?.rows?.[0] || null;
        if (!alive) return;
        setStudent(self);

        if (self?.class) {
          const items = await teachersApi.listSchedules({
            className: self.class,
            section: self.section || undefined,
          });
          if (!alive) return;
          setSchedule(Array.isArray(items) ? items : []);
        } else {
          setSchedule([]);
        }
      } catch (_) {
        if (!alive) return;
        setStudent(null);
        setSchedule([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, []);

  const myClass = useMemo(() => {
    if (!student) return '—';
    return `${student.class || ''}${student.section || ''}` || '—';
  }, [student]);

  const [selectedDay, setSelectedDay] = useState(days[0]);

  const periods = useMemo(() => {
    const raw = (schedule || [])
      .filter((s) => s?.dayOfWeek && s?.startTime)
      .map((s) => String(s.timeSlotLabel || s.startTime));
    const unique = Array.from(new Set(raw));
    if (unique.length) return unique;
    return ['08:00', '09:00', '10:00', '11:00', '12:00', '02:00'];
  }, [schedule]);

  const weekGrid = useMemo(() => {
    const grid = {};
    days.forEach((d) => {
      grid[d] = {};
      periods.forEach((p) => {
        grid[d][p] = { subject: '-', room: '-', className: myClass, teacher: '-' };
      });
    });

    (schedule || []).forEach((slot) => {
      const shortDay = shortDayFromSlot(slot);
      if (!shortDay || !grid[shortDay]) return;
      const key = String(slot.timeSlotLabel || slot.startTime);
      if (!key || !grid[shortDay][key]) return;
      const room = slot.room ? String(slot.room).replace('Room ', '').replace('ROOM ', '') : '-';
      grid[shortDay][key] = {
        subject: slot.subject || '-',
        room,
        className: `${slot.className || slot.class || ''}${slot.section || ''}` || myClass,
        teacher: slot.teacherName || '-',
      };
    });
    return grid;
  }, [schedule, periods, myClass]);

  const tableRows = useMemo(() => periods.map(p => ({
    time: p,
    cells: days.map(d => ({ day: d, time: p, ...(weekGrid[d]?.[p]||{ subject:'-', room:'-', className: myClass, teacher:'-' }) }))
  })), [periods, weekGrid, myClass]);

  const selectedRows = useMemo(() => periods.map(p => ({ time: p, ...(weekGrid[selectedDay]?.[p]||{ subject:'-', room:'-', className: myClass, teacher:'-' }) })), [periods, weekGrid, selectedDay, myClass]);

  const chartData = useMemo(() => ([{ name: 'Lessons', data: days.map(() => periods.length) }]), [periods]);

  const exportCSV = () => {
    const header = ['Class','Time',...days];
    const data = tableRows.map(r => [myClass, r.time, ...r.cells.map(c => `${c.subject}${c.room && c.room!=='-'?` (Rm ${c.room})`:''}`)]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'student_weekly_timetable.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Weekly Timetable</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Your schedule for class {myClass}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />}
            name='Total Periods/Day'
            value={String(periods.length)}
            trendData={[4,5,5,6,periods.length]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdDateRange} w='22px' h='22px' color='white' />} />}
            name='Days/Week'
            value={String(days.length)}
            trendData={[5,5,5,5,days.length]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
            name='Class'
            value={myClass}
            trendData={[1,1,1,1,1]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      {loading ? (
        <Card p='16px' mb='16px'>
          <Text color={textSecondary}>Loading timetable...</Text>
        </Card>
      ) : null}

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' flexWrap='wrap' rowGap={3}>
          <HStack>
            <Text fontWeight='600'>Selected day:</Text>
            <Select size='sm' value={selectedDay} onChange={e=>setSelectedDay(e.target.value)} maxW='140px'>
              {days.map(d => <option key={d}>{d}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={()=>setSelectedDay(days[0])}>Reset</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='16px' mb='16px'>
        <Text fontSize='md' fontWeight='bold' mb='10px'>Selected Day: {selectedDay}</Text>
        <Table size='sm' variant='simple'>
          <Thead>
            <Tr>
              <Th>Time</Th>
              <Th>Subject</Th>
              <Th>Room</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {selectedRows.map(r => (
              <Tr key={r.time}>
                <Td>{r.time}</Td>
                <Td>{r.subject}</Td>
                <Td>{r.room}</Td>
                <Td>
                  <Button size='xs' colorScheme='purple' onClick={() => { setSelectedDetail({ day: selectedDay, time: r.time, subject: r.subject, room: r.room, teacher: r.teacher, className: myClass }); onOpen(); }}>View</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead position='sticky' top={0} bg={useColorModeValue('white','gray.800')} zIndex={1} boxShadow='sm'>
            <Tr>
              <Th>Time</Th>
              {days.map(d => (<Th key={d}>{d}</Th>))}
            </Tr>
          </Thead>
          <Tbody>
            {tableRows.map(r => (
              <Tr key={r.time}>
                <Td fontWeight='600'>{r.time}</Td>
                {r.cells.map((c) => {
                  const cell = c || { day: '-', time: r.time, subject: '-', room: '-', teacher: '-' };
                  return (
                    <Td key={cell.day || r.time}>
                      {cell.subject || '-'} {cell.room && cell.room !== '-' ? <Badge ml={2}>Rm {cell.room}</Badge> : null}
                      <Button
                        ml={2}
                        size='xs'
                        variant='ghost'
                        colorScheme='purple'
                        onClick={() => {
                          setSelectedDetail({
                            day: cell.day,
                            time: cell.time,
                            subject: cell.subject || '-',
                            room: cell.room || '-',
                            teacher: cell.teacher || '-',
                            className: myClass,
                          });
                          onOpen();
                        }}
                      >
                        View
                      </Button>
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <BarChart chartData={chartData} chartOptions={{ xaxis: { categories: days }, colors: ['#805AD5'] }} height={220} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Period Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDetail ? (
              <VStack align='start' spacing={2}>
                <Text><b>Day:</b> {selectedDetail.day}</Text>
                <Text><b>Time:</b> {selectedDetail.time}</Text>
                <Text><b>Subject:</b> {selectedDetail.subject}</Text>
                <Text><b>Class:</b> {selectedDetail.className}</Text>
                <Text><b>Room:</b> {selectedDetail.room}</Text>
                <Text><b>Teacher:</b> {selectedDetail.teacher || '-'}</Text>
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
