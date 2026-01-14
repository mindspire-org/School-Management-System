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
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSearch, MdSave, MdPeople, MdTrendingUp, MdBook } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockStudents, mockExamResults } from '../../../utils/mockData';

export default function UploadMarks() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [row, setRow] = useState(null);

  const [subject, setSubject] = useState('Mathematics');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');

  const classes = useMemo(() => Array.from(new Set(mockStudents.map(s => s.class))).sort(), []);
  const sections = useMemo(() => Array.from(new Set(mockStudents.map(s => s.section))).sort(), []);
  const subjects = useMemo(() => Array.from(new Set(mockExamResults[0].subjects.map(s => s.name))), []);

  const rows = useMemo(() => mockStudents.map(s => ({
    id: s.id,
    name: s.name,
    roll: s.rollNumber,
    cls: s.class,
    section: s.section,
    marks: Math.round((s.attendance || 80) / 100 * 100),
  })), []);

  const filtered = useMemo(() => rows.filter(r =>
    (!cls || r.cls === cls) && (!section || r.section === section) && (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.roll.toLowerCase().includes(q.toLowerCase()))
  ), [rows, cls, section, q]);

  const totals = useMemo(() => ({
    count: filtered.length,
    avg: filtered.length ? Math.round(filtered.reduce((a,r)=>a+r.marks,0)/filtered.length) : 0,
  }), [filtered]);

  const chartData = useMemo(() => ([{ name: 'Marks', data: filtered.slice(0,8).map(r=>r.marks) }]), [filtered]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: filtered.slice(0,8).map(r=> r.name.split(' ')[0]) },
    dataLabels: { enabled: false },
    colors: ['#3182CE'],
  }), [filtered]);

  const gradeBuckets = useMemo(() => {
    const buckets = { '≥85': 0, '70-84': 0, '<70': 0 };
    filtered.forEach(r => {
      if (r.marks >= 85) buckets['≥85'] += 1;
      else if (r.marks >= 70) buckets['70-84'] += 1;
      else buckets['<70'] += 1;
    });
    return { labels: Object.keys(buckets), values: Object.values(buckets) };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Student','Roll','Class','Section','Subject','Marks'];
    const data = filtered.map(r => [r.name, r.roll, r.cls, r.section, subject, r.marks]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'upload_marks.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Upload Marks</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Enter and update marks</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdPeople color='white' />} />} name='Students' value={String(totals.count)} trendData={[10,12,14,13,15,16]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdTrendingUp color='white' />} />} name='Average' value={String(totals.avg)} trendData={[70,72,74,76,78,80]} trendColor='#01B574' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdBook color='white' />} />} name='Subject' value={String(subject)} trendData={[1,1,1,1,1,1]} trendColor='#B721FF' />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={subject} onChange={e=>setSubject(e.target.value)} size='sm' maxW='160px'>{subjects.map(s=> <option key={s}>{s}</option>)}</Select>
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='140px'>{classes.map(c=> <option key={c}>{c}</option>)}</Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='140px'>{sections.map(s=> <option key={s}>{s}</option>)}</Select>
            <HStack>
              <Input placeholder='Search student/roll' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='220px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setSubject('Mathematics');setCls('');setSection('');setQ('');}}>Reset</Button>
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
                  <Th>Student</Th>
                  <Th>Roll</Th>
                  <Th>Class</Th>
                  <Th isNumeric>Marks</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(r => (
                  <Tr key={r.id} _hover={{ bg: hoverBg }}>
                    <Td><Tooltip label={r.name}><Box isTruncated maxW='220px'>{r.name}</Box></Tooltip></Td>
                    <Td>{r.roll}</Td>
                    <Td>{r.cls}-{r.section}</Td>
                    <Td isNumeric>
                      <NumberInput size='sm' maxW='100px' value={r.marks} min={0} max={100}>
                        <NumberInputField readOnly />
                      </NumberInput>
                    </Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'>
                          <IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' onClick={()=>{setRow(r); onOpen();}} />
                        </Tooltip>
                        <Tooltip label='Edit'>
                          <IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' onClick={()=>{setRow(r); onOpen();}} />
                        </Tooltip>
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
          <Text fontWeight='700' mb='8px'>Marks (Top 8)</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Grade Distribution</Text>
          <PieChart height={240} chartData={gradeBuckets.values} chartOptions={{ labels: gradeBuckets.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Marks</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {row && (
              <VStack align='start' spacing={3} fontSize='sm'>
                <HStack><Text fontWeight='600'>Student:</Text><Text>{row.name} ({row.roll})</Text></HStack>
                <HStack><Text fontWeight='600'>Class:</Text><Text>{row.cls}-{row.section}</Text></HStack>
                <HStack>
                  <Text fontWeight='600'>Marks:</Text>
                  <NumberInput size='sm' maxW='120px' defaultValue={row.marks} min={0} max={100}>
                    <NumberInputField />
                  </NumberInput>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Close</Button>
            <Button colorScheme='blue' leftIcon={<MdSave/>} onClick={onClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
