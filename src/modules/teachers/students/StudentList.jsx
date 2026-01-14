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
  Avatar,
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
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit, MdSearch, MdPeople, MdTrendingUp } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockStudents } from '../../../utils/mockData';

export default function StudentList() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const gridColor = useColorModeValue('#EDF2F7', '#2D3748');

  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');

  const classes = useMemo(() => Array.from(new Set(mockStudents.map(s => s.class))).sort(), []);
  const sections = useMemo(() => Array.from(new Set(mockStudents.map(s => s.section))).sort(), []);

  const filtered = useMemo(() => (
    mockStudents.filter(s =>
      (!cls || s.class === cls) &&
      (!section || s.section === section) &&
      (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.rollNumber.toLowerCase().includes(q.toLowerCase()))
    )
  ), [cls, section, q]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const avgAtt = total ? Math.round(filtered.reduce((a, s) => a + (s.attendance || 0), 0) / total) : 0;
    return { total, avgAtt };
  }, [filtered]);

  const chartData = useMemo(() => ([{ name: 'Students', data: Object.values(filtered.reduce((acc, s) => {
    const key = `${s.class}-${s.section}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})) }]), [filtered]);

  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: Object.keys(filtered.reduce((acc, s) => { const key = `${s.class}-${s.section}`; acc[key] = (acc[key] || 0) + 1; return acc; }, {})) },
    dataLabels: { enabled: false },
    grid: { borderColor: gridColor },
    colors: ['#3182CE'],
  }), [filtered, gridColor]);

  const attendanceBuckets = useMemo(() => {
    const buckets = { '≥90%': 0, '80-89%': 0, '<80%': 0 };
    filtered.forEach(s => {
      const a = s.attendance || 0;
      if (a >= 90) buckets['≥90%'] += 1;
      else if (a >= 80) buckets['80-89%'] += 1;
      else buckets['<80%'] += 1;
    });
    return { labels: Object.keys(buckets), values: Object.values(buckets) };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Name','Roll','Class','Section','Attendance%','Parent','Phone','Email'];
    const rows = filtered.map(s => [s.name, s.rollNumber, s.class, s.section, s.attendance, s.parentName, s.parentPhone, s.email]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Student List</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Filter and manage students</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdPeople color='white' />} />} name='Total Students' value={String(kpis.total)} trendData={[50,60,70,80,90]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdTrendingUp color='white' />} />} name='Average Attendance' value={`${kpis.avgAtt}%`} trendData={[80,82,84,85,86]} trendColor='#01B574' />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='160px'>{classes.map(c=> <option key={c}>{c}</option>)}</Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='160px'>{sections.map(s=> <option key={s}>{s}</option>)}</Select>
            <HStack>
              <Input placeholder='Search name or roll' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='240px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setCls('');setSection('');setQ('');}}>Reset</Button>
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
                  <Th isNumeric>Attendance</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(s => (
                  <Tr key={s.id} _hover={{ bg: hoverBg }}>
                    <Td>
                      <HStack maxW='300px' spacing={3}>
                        <Avatar name={s.name} src={s.avatar} size='sm' />
                        <Box>
                          <Tooltip label={s.name}><Text fontWeight='600' isTruncated maxW='200px'>{s.name}</Text></Tooltip>
                          <Text fontSize='xs' color={textSecondary}>{s.email}</Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>{s.rollNumber}</Td>
                    <Td>{s.class}-{s.section}</Td>
                    <Td isNumeric><Badge colorScheme={s.attendance>=90?'green':s.attendance>=80?'yellow':'red'}>{s.attendance}%</Badge></Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'><IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' /></Tooltip>
                        <Tooltip label='Edit'><IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' /></Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {filtered.length===0 && (
                  <Tr><Td colSpan={5}><Box p='12px' textAlign='center' color={textSecondary}>No students found.</Box></Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Students by Class-Section</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Attendance Distribution</Text>
          <PieChart height={240} chartData={attendanceBuckets.values} chartOptions={{ labels: attendanceBuckets.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
