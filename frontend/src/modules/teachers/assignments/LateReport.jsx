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
  Tooltip,
  Badge,
  useColorModeValue,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSearch, MdReport, MdAccessTime, MdTimer } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockAssignments } from '../../../utils/mockData';

// Derive late submissions from mock data by marking 'pending' past due
const deriveLate = () => {
  // In demo, mark every 'pending' as late
  return mockAssignments.filter(a => a.status === 'pending').map((a, i) => ({
    id: `L${i}-${a.id}`,
    title: a.title,
    subject: a.subject,
    dueDate: a.dueDate,
    student: a.teacher || 'Unknown',
    daysLate: Math.floor(Math.random() * 7) + 1,
    status: 'late',
  }));
};

export default function LateReport() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [row, setRow] = useState(null);

  const [subject, setSubject] = useState('');
  const [q, setQ] = useState('');

  const rows = useMemo(() => deriveLate(), []);
  const subjects = useMemo(() => Array.from(new Set(rows.map(r => r.subject))), [rows]);

  const filtered = useMemo(() => rows.filter(r =>
    (!subject || r.subject === subject) && (!q || r.title.toLowerCase().includes(q.toLowerCase()))
  ), [rows, subject, q]);

  const kpis = useMemo(() => ({
    totalLate: filtered.length,
    maxDaysLate: filtered.reduce((m, r) => Math.max(m, r.daysLate), 0) || 0,
    avgDaysLate: filtered.length ? Math.round(filtered.reduce((a, r) => a + r.daysLate, 0) / filtered.length) : 0,
  }), [filtered]);

  const chartData = useMemo(() => ([{ name: 'Late', data: filtered.map(r => r.daysLate) }]), [filtered]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: filtered.map(r => r.title.length > 8 ? `${r.title.slice(0,8)}…` : r.title) },
    dataLabels: { enabled: false },
    colors: ['#E53E3E'],
    grid: { borderColor: gridColor },
  }), [filtered, gridColor]);

  const subjectDistribution = useMemo(() => {
    const map = {};
    filtered.forEach(r => { map[r.subject] = (map[r.subject] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Title','Subject','Due Date','Days Late'];
    const data = filtered.map(r => [r.title, r.subject, r.dueDate, r.daysLate]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'late_report.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Late Report</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Monitor late submissions</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<MdReport color='white' />} />}
            name='Total Late'
            value={String(kpis.totalLate)}
            trendData={[1,2,2,3,3,4]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdAccessTime color='white' />} />}
            name='Max Days Late'
            value={String(kpis.maxDaysLate)}
            trendData={[1,1,2,2,3,3]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdTimer color='white' />} />}
            name='Avg Days Late'
            value={String(kpis.avgDaysLate)}
            trendData={[1,1,1,1,1,1]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Subject' value={subject} onChange={e=>setSubject(e.target.value)} size='sm' maxW='180px'>{subjects.map(s=> <option key={s}>{s}</option>)}</Select>
            <HStack>
              <Input placeholder='Search title' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='240px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setSubject('');setQ('');}}>Reset</Button>
            <Button size='sm' colorScheme='red' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0' mb='16px'>
        <Box overflowX='auto'>
          <Box minW='880px'>
            <Table size='sm' variant='striped' colorScheme='gray'>
              <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
                <Tr>
                  <Th>Title</Th>
                  <Th>Subject</Th>
                  <Th>Due Date</Th>
                  <Th isNumeric>Days Late</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(r => (
                  <Tr key={r.id} _hover={{ bg: hoverBg }}>
                    <Td><Tooltip label={r.title}><Box isTruncated maxW='280px'>{r.title}</Box></Tooltip></Td>
                    <Td>{r.subject}</Td>
                    <Td>{r.dueDate}</Td>
                    <Td isNumeric><Badge colorScheme={r.daysLate>=5?'red':'orange'}>{r.daysLate}</Badge></Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'><IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' onClick={()=>{setRow(r); onOpen();}} /></Tooltip>
                        <Tooltip label='Edit'><IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' onClick={()=>{setRow(r); onOpen();}} /></Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Days Late by Assignment</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Subjects Distribution</Text>
            <PieChart height={240} chartData={subjectDistribution.values} chartOptions={{ labels: subjectDistribution.labels, legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Late Submission</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {row && (
              <VStack align='start' spacing={2} fontSize='sm'>
                <HStack><Text fontWeight='600'>Title:</Text><Text>{row.title}</Text></HStack>
                <HStack><Text fontWeight='600'>Subject:</Text><Text>{row.subject}</Text></HStack>
                <HStack><Text fontWeight='600'>Due:</Text><Text>{row.dueDate}</Text></HStack>
                <HStack><Text fontWeight='600'>Days Late:</Text><Badge colorScheme={row.daysLate>=5?'red':'orange'}>{row.daysLate}</Badge></HStack>
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
