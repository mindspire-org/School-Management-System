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
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSearch, MdAssignment, MdCheckCircle, MdPending } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockStudents, mockAssignments } from '../../../utils/mockData';

export default function Grading() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [row, setRow] = useState(null);
  const [marks, setMarks] = useState(0);

  const [subject, setSubject] = useState('');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');

  const subjects = useMemo(() => Array.from(new Set(mockAssignments.map(a => a.subject))), []);
  const classes = useMemo(() => Array.from(new Set(mockStudents.map(s => s.class))).sort(), []);
  const sections = useMemo(() => Array.from(new Set(mockStudents.map(s => s.section))).sort(), []);

  const rows = useMemo(() => mockStudents.map(s => ({
    id: s.id,
    student: s.name,
    roll: s.rollNumber,
    cls: s.class,
    section: s.section,
    subject: subject || 'Mathematics',
    marks: Math.round((s.attendance || 80) / 100 * 100),
    status: (s.attendance || 80) >= 85 ? 'graded' : 'pending',
  })), [subject]);

  const filtered = useMemo(() => rows.filter(r =>
    (!subject || r.subject === subject) && (!cls || r.cls === cls) && (!section || r.section === section) && (!q || r.student.toLowerCase().includes(q.toLowerCase()) || r.roll.toLowerCase().includes(q.toLowerCase()))
  ), [rows, subject, cls, section, q]);

  const kpis = useMemo(() => ({
    total: filtered.length,
    graded: filtered.filter(r => r.status === 'graded').length,
    pending: filtered.filter(r => r.status === 'pending').length,
  }), [filtered]);

  const chartData = useMemo(() => ([{ name: 'Count', data: [kpis.graded, kpis.pending] }]), [kpis]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Graded','Pending'] },
    dataLabels: { enabled: false },
    colors: ['#805AD5'],
  }), []);

  const subjectDistribution = useMemo(() => {
    const map = {};
    filtered.forEach(r => { map[r.subject] = (map[r.subject] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Student','Roll','Class','Section','Subject','Marks','Status'];
    const data = filtered.map(r => [r.student, r.roll, r.cls, r.section, r.subject, r.marks, r.status]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'grading.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const openEdit = (r) => { setRow(r); setMarks(r.marks); onOpen(); };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Grading</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Review and update marks</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdAssignment color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[5,6,7,6,8,9]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdCheckCircle color='white' />} />}
            name='Graded'
            value={String(kpis.graded)}
            trendData={[2,3,4,4,5,6]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdPending color='white' />} />}
            name='Pending'
            value={String(kpis.pending)}
            trendData={[3,3,3,2,2,1]}
            trendColor='#FD7853'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Subject' value={subject} onChange={e=>setSubject(e.target.value)} size='sm' maxW='160px'>
              {subjects.map(s=> <option key={s}>{s}</option>)}
            </Select>
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='140px'>{classes.map(c=> <option key={c}>{c}</option>)}</Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='140px'>{sections.map(s=> <option key={s}>{s}</option>)}</Select>
            <HStack>
              <Input placeholder='Search student/roll' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='220px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setSubject('');setCls('');setSection('');setQ('');}}>Reset</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0' mb='16px'>
        <Box overflowX='auto'>
          <Box minW='880px'>
            <Table size='sm' variant='striped' colorScheme='gray'>
              <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
                <Tr>
                  <Th>Student</Th>
                  <Th>Roll</Th>
                  <Th>Class</Th>
                  <Th>Subject</Th>
                  <Th isNumeric>Marks</Th>
                  <Th>Status</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(r => (
                  <Tr key={r.id} _hover={{ bg: hoverBg }}>
                    <Td><Tooltip label={r.student}><Box isTruncated maxW='220px'>{r.student}</Box></Tooltip></Td>
                    <Td>{r.roll}</Td>
                    <Td>{r.cls}-{r.section}</Td>
                    <Td>{r.subject}</Td>
                    <Td isNumeric>{r.marks}</Td>
                    <Td><Badge colorScheme={r.status==='graded'?'green':'orange'}>{r.status}</Badge></Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'><IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' onClick={()=>{setRow(r); onOpen();}} /></Tooltip>
                        <Tooltip label='Edit'><IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' onClick={()=>openEdit(r)} /></Tooltip>
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
            <Text fontWeight='700' mb='8px'>Graded vs Pending</Text>
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
          <ModalHeader>Grade</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {row && (
              <VStack align='start' spacing={3}>
                <Text fontWeight='700'>{row.student}</Text>
                <HStack><Badge>{row.roll}</Badge><Badge colorScheme='purple'>Class {row.cls}-{row.section}</Badge></HStack>
                <Text>Subject: {row.subject}</Text>
                <HStack>
                  <Text>Marks:</Text>
                  <NumberInput size='sm' maxW='120px' value={marks} min={0} max={100} onChange={(v)=>setMarks(Number(v))}>
                    <NumberInputField />
                  </NumberInput>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>Close</Button>
            <Button colorScheme='purple' onClick={onClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
