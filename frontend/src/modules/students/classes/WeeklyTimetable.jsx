import React, { useMemo, useState } from 'react';
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
import { mockTodayClasses } from '../../../utils/mockData';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';

const days = ['Mon','Tue','Wed','Thu','Fri'];
const periods = ['08:00','09:00','10:00','11:00','12:00','02:00'];

export default function WeeklyTimetable() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Derive student's primary class from mockTodayClasses
  const myClass = useMemo(() => {
    const counts = {};
    (mockTodayClasses||[]).forEach(c=>{ counts[c.className] = (counts[c.className]||0)+1; });
    const entry = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    return entry ? entry[0] : '10A';
  }, []);

  const [selectedDay, setSelectedDay] = useState(days[0]);

  // Build a simple weekly grid by rotating today's classes across the week/time slots
  const weekGrid = useMemo(() => {
    const byTime = periods.map((p, i) => ({ time: p, item: mockTodayClasses[i % mockTodayClasses.length] }));
    const grid = {};
    days.forEach((d, di) => {
      grid[d] = {};
      periods.forEach((p, pi) => {
        const src = byTime[(pi + di) % byTime.length].item;
        grid[d][p] = { subject: src.subject, room: src.room.replace('Room ','').replace('ROOM ',''), className: src.className, teacher: '—' };
      });
    });
    return grid;
  }, []);

  const tableRows = useMemo(() => periods.map(p => ({
    time: p,
    cells: days.map(d => ({ day: d, time: p, ...(weekGrid[d]?.[p]||{ subject:'-', room:'-', className: myClass, teacher:'-' }) }))
  })), [weekGrid, myClass]);

  const selectedRows = useMemo(() => periods.map(p => ({ time: p, ...(weekGrid[selectedDay]?.[p]||{ subject:'-', room:'-', className: myClass, teacher:'-' }) })), [weekGrid, selectedDay, myClass]);

  const chartData = useMemo(() => ([{ name: 'Lessons', data: days.map(d => periods.length) }]), []);

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
                  <Button size='xs' colorScheme='purple' onClick={() => { setSelectedDetail({ day: selectedDay, time: r.time, subject: r.subject, room: r.room, className: myClass }); onOpen(); }}>View</Button>
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
                {r.cells.map(c => (
                  <Td key={c.day}>
                    {c.subject} {c.room && c.room!=='-' ? <Badge ml={2}>Rm {c.room}</Badge> : null}
                    <Button ml={2} size='xs' variant='ghost' colorScheme='purple' onClick={() => { setSelectedDetail({ day: c.day, time: c.time, subject: c.subject, room: c.room, className: myClass }); onOpen(); }}>View</Button>
                  </Td>
                ))}
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
                <Text><b>Teacher:</b> Notified</Text>
                <Badge colorScheme='green'>Hardcoded Demo</Badge>
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
