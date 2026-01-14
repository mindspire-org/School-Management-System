import React, { useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Select,
  Input,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
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
import { MdSearch, MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdTrendingUp, MdStar, MdArrowDownward } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import LineChart from '../../../components/charts/LineChart';
import PieChart from '../../../components/charts/PieChart';
import { mockAttendanceStats } from '../../../utils/mockData';

export default function AttendanceHistory() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [row, setRow] = useState(null);

  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: false },
    xaxis: { categories: mockAttendanceStats.map(x => x.day) },
    colors: ['#3182CE'],
    yaxis: { labels: { formatter: (v) => `${v}%` } },
    grid: { borderColor: gridColor },
  }), [gridColor]);

  const chartData = useMemo(() => [{ name: 'Attendance %', data: mockAttendanceStats.map(x => x.percentage) }], []);

  const totals = useMemo(() => {
    const present = mockAttendanceStats.reduce((a,b)=> a + b.present, 0);
    const absent = mockAttendanceStats.reduce((a,b)=> a + b.absent, 0);
    return { present, absent };
  }, []);

  const records = useMemo(() => mockAttendanceStats.map((x, i) => ({
    id: i+1,
    date: x.day,
    cls: '10',
    section: i % 2 === 0 ? 'A' : 'B',
    present: x.present,
    absent: x.absent,
    percentage: x.percentage,
  })), []);

  const filtered = useMemo(() => records.filter(r =>
    (!cls || r.cls === cls) && (!section || r.section === section) && (!q || r.date.toLowerCase().includes(q.toLowerCase()))
  ), [cls, section, q, records]);

  const exportCSV = () => {
    const header = ['Date','Class','Section','Present','Absent','Percentage'];
    const rows = filtered.map(r => [r.date, r.cls, r.section, r.present, r.absent, r.percentage]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Attendance History</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Review historical attendance trends and logs.</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdTrendingUp color='white' />} />}
            name='Average'
            value={`${Math.round(mockAttendanceStats.reduce((a,b)=>a+b.percentage,0)/mockAttendanceStats.length)}%`}
            trendData={[70,75,80,85,82,88]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdStar color='white' />} />}
            name='Best Day'
            value={mockAttendanceStats.reduce((p,c)=> c.percentage>p.percentage?c:p).day}
            trendData={[1,2,1,3,2,3]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FF6A88 0%,#FF99AC 100%)' icon={<MdArrowDownward color='white' />} />}
            name='Lowest'
            value={mockAttendanceStats.reduce((p,c)=> c.percentage<p.percentage?c:p).day}
            trendData={[3,2,2,1,2,1]}
            trendColor='#FF6A88'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Input type='date' value={from} onChange={e=>setFrom(e.target.value)} size='sm' maxW='180px' placeholder='From' />
            <Input type='date' value={to} onChange={e=>setTo(e.target.value)} size='sm' maxW='180px' placeholder='To' />
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='160px'>
              <option>9</option>
              <option>10</option>
              <option>11</option>
            </Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='160px'>
              <option>A</option>
              <option>B</option>
            </Select>
            <HStack>
              <Input placeholder='Search day' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='220px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button leftIcon={<MdRefresh />} size='sm' variant='outline' onClick={()=>{setCls('');setSection('');setQ('');setFrom('');setTo('');}}>Reset</Button>
            <Button leftIcon={<MdFileDownload />} size='sm' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb='16px'>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Attendance Trend</Text>
            <LineChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Present vs Absent</Text>
            <PieChart height={240} chartData={[totals.present, totals.absent]} chartOptions={{ labels: ['Present','Absent'], legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Flex justify='space-between' align='center' p='12px' borderBottom='1px solid' borderColor='gray.100'>
          <Text fontWeight='600'>Logs</Text>
        </Flex>
        <Box overflowX='auto'>
          <Box minW='800px'>
            <Table size='sm' variant='striped' colorScheme='gray'>
              <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
                <Tr>
                  <Th>Date</Th>
                  <Th>Class</Th>
                  <Th>Section</Th>
                  <Th isNumeric>Present</Th>
                  <Th isNumeric>Absent</Th>
                  <Th isNumeric>Percentage</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(r => (
                  <Tr key={r.id} _hover={{ bg: hoverBg }}>
                    <Td>{r.date}</Td>
                    <Td>{r.cls}</Td>
                    <Td>{r.section}</Td>
                    <Td isNumeric>{r.present}</Td>
                    <Td isNumeric>{r.absent}</Td>
                    <Td isNumeric>
                      <Badge colorScheme={r.percentage >= 90 ? 'green' : r.percentage >= 80 ? 'yellow' : 'red'}>{r.percentage}%</Badge>
                    </Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'>
                          <IconButton aria-label='View' icon={<MdVisibility />} size='sm' variant='ghost' onClick={()=>{setRow(r); onOpen();}} />
                        </Tooltip>
                        <Tooltip label='Edit'>
                          <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{setRow(r); onOpen();}} />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {filtered.length === 0 && (
                  <Tr>
                    <Td colSpan={7}>
                      <Box p='12px' textAlign='center' color={textSecondary}>No records.</Box>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attendance Log</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {row && (
              <VStack align='start' spacing={2} fontSize='sm'>
                <HStack><Text fontWeight='600'>Date:</Text><Text>{row.date}</Text></HStack>
                <HStack><Text fontWeight='600'>Class:</Text><Text>{row.cls}-{row.section}</Text></HStack>
                <HStack><Text fontWeight='600'>Present:</Text><Text>{row.present}</Text></HStack>
                <HStack><Text fontWeight='600'>Absent:</Text><Text>{row.absent}</Text></HStack>
                <HStack><Text fontWeight='600'>Percentage:</Text><Text>{row.percentage}%</Text></HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
