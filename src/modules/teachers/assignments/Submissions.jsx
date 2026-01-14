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
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSearch, MdAssignment, MdPending, MdCheckCircle, MdEmojiEvents } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockAssignments } from '../../../utils/mockData';

export default function Submissions() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7','#2D3748');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [row, setRow] = useState(null);

  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const subjects = useMemo(() => Array.from(new Set(mockAssignments.map(a => a.subject))), []);

  const filtered = useMemo(() => mockAssignments.filter(a =>
    (!subject || a.subject === subject) &&
    (!status || a.status === status) &&
    (!q || a.title.toLowerCase().includes(q.toLowerCase()))
  ), [subject, status, q]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const pending = filtered.filter(a => a.status === 'pending').length;
    const submitted = filtered.filter(a => a.status === 'submitted').length;
    const graded = filtered.filter(a => a.status === 'graded').length;
    return { total, pending, submitted, graded };
  }, [filtered]);

  const chartData = useMemo(() => ([{ name: 'Count', data: [kpis.pending, kpis.submitted, kpis.graded] }]), [kpis]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Pending','Submitted','Graded'] },
    dataLabels: { enabled: false },
    grid: { borderColor: gridColor },
    colors: ['#3182CE'],
  }), [gridColor]);

  const subjectDistribution = useMemo(() => {
    const map = {};
    filtered.forEach(a => { map[a.subject] = (map[a.subject] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Title','Subject','Due Date','Status','Points'];
    const rows = filtered.map(a => [a.title, a.subject, a.dueDate, a.status, a.points || '']);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'submissions.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Submissions</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Track assignment submissions</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdAssignment color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[2,3,2,4,3,4]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdPending color='white' />} />}
            name='Pending'
            value={String(kpis.pending)}
            trendData={[1,1,2,1,2,1]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdCheckCircle color='white' />} />}
            name='Submitted'
            value={String(kpis.submitted)}
            trendData={[1,2,2,3,2,3]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdEmojiEvents color='white' />} />}
            name='Graded'
            value={String(kpis.graded)}
            trendData={[0,1,1,2,2,3]}
            trendColor='#B721FF'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Subject' value={subject} onChange={e=>setSubject(e.target.value)} size='sm' maxW='180px'>{subjects.map(s=> <option key={s}>{s}</option>)}</Select>
            <Select placeholder='Status' value={status} onChange={e=>setStatus(e.target.value)} size='sm' maxW='180px'>
              <option>pending</option>
              <option>submitted</option>
              <option>graded</option>
            </Select>
            <HStack>
              <Input placeholder='Search title' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='240px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setSubject('');setStatus('');setQ('');}}>Reset</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
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
                  <Th>Status</Th>
                  <Th isNumeric>Points</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(a => (
                  <Tr key={a.id} _hover={{ bg: hoverBg }}>
                    <Td><Tooltip label={a.title}><Box isTruncated maxW='280px'>{a.title}</Box></Tooltip></Td>
                    <Td>{a.subject}</Td>
                    <Td>{a.dueDate}</Td>
                    <Td><Badge colorScheme={a.status==='graded'?'green':a.status==='submitted'?'blue':'orange'}>{a.status}</Badge></Td>
                    <Td isNumeric>{a.points || '-'}</Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'><IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' onClick={()=>{setRow(a); onOpen();}} /></Tooltip>
                        <Tooltip label='Edit'><IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' onClick={()=>{setRow(a); onOpen();}} /></Tooltip>
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
            <Text fontWeight='700' mb='8px'>Status Counts</Text>
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
          <ModalHeader>Assignment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {row && (
              <VStack align='start' spacing={2} fontSize='sm'>
                <HStack><Text fontWeight='600'>Title:</Text><Text>{row.title}</Text></HStack>
                <HStack><Text fontWeight='600'>Subject:</Text><Text>{row.subject}</Text></HStack>
                <HStack><Text fontWeight='600'>Due:</Text><Text>{row.dueDate}</Text></HStack>
                <HStack><Text fontWeight='600'>Status:</Text><Badge colorScheme={row.status==='graded'?'green':row.status==='submitted'?'blue':'orange'}>{row.status}</Badge></HStack>
                <HStack><Text fontWeight='600'>Points:</Text><Text>{row.points || '-'}</Text></HStack>
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
