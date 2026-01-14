import React, { useMemo, useState } from 'react';
import { Box, Text, Flex, HStack, SimpleGrid, Select, Input, Button, useColorModeValue, Badge, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Icon, IconButton } from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { mockExamResults, mockStudents } from '../../../utils/mockData';

export default function StudentPerformance() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');

  const classes = useMemo(() => Array.from(new Set(mockStudents.map(s => s.class))).sort(), []);
  const sections = useMemo(() => Array.from(new Set(mockStudents.map(s => s.section))).sort(), []);

  const rows = useMemo(() => mockStudents.map(s => ({
    id: s.id,
    name: s.name,
    roll: s.rollNumber,
    cls: s.class,
    section: s.section,
    percentage: s.attendance,
  })), []);

  const filtered = useMemo(() => rows.filter(r =>
    (!cls || r.cls === cls) && (!section || r.section === section) && (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.roll.toLowerCase().includes(q.toLowerCase()))
  ), [rows, cls, section, q]);

  const chartData = useMemo(() => ([
    { name: 'Avg %', data: mockExamResults[0].subjects.map(s => s.score) }
  ]), []);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: mockExamResults[0].subjects.map(s => s.name) },
    dataLabels: { enabled: false },
    colors: ['#805AD5'],
  }), []);

  const gradeBuckets = useMemo(() => {
    const buckets = { '≥90%': 0, '80-89%': 0, '<80%': 0 };
    filtered.forEach(r => {
      if (r.percentage >= 90) buckets['≥90%'] += 1;
      else if (r.percentage >= 80) buckets['80-89%'] += 1;
      else buckets['<80%'] += 1;
    });
    return {
      labels: Object.keys(buckets),
      values: Object.values(buckets),
    };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Name','Roll','Class','Section','Overall %'];
    const data = filtered.map(r => [r.name, r.roll, r.cls, r.section, r.percentage]);
    const csv = [header, ...data].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'student_performance.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Performance</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Class-wise performance overview</Text>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select placeholder='Class' value={cls} onChange={e=>setCls(e.target.value)} size='sm' maxW='160px'>{classes.map(c=> <option key={c}>{c}</option>)}</Select>
            <Select placeholder='Section' value={section} onChange={e=>setSection(e.target.value)} size='sm' maxW='160px'>{sections.map(s=> <option key={s}>{s}</option>)}</Select>
            <Input placeholder='Search name or roll' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='240px' />
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{setCls('');setSection('');setQ('');}}>Reset</Button>
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
                  <Th>Name</Th>
                  <Th>Roll</Th>
                  <Th>Class</Th>
                  <Th isNumeric>Overall %</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(r => (
                  <Tr key={r.id} _hover={{ bg: hoverBg }}>
                    <Td><Tooltip label={r.name}><Box isTruncated maxW='240px'>{r.name}</Box></Tooltip></Td>
                    <Td>{r.roll}</Td>
                    <Td>{r.cls}-{r.section}</Td>
                    <Td isNumeric><Badge colorScheme={r.percentage>=90?'green':r.percentage>=80?'yellow':'red'}>{r.percentage}%</Badge></Td>
                    <Td>
                      <HStack justify='flex-end'>
                        <Tooltip label='View'><IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' /></Tooltip>
                        <Tooltip label='Edit'><IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' /></Tooltip>
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
          <Text fontWeight='700' mb='8px'>Average Subject Scores</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Grade Distribution</Text>
          <PieChart height={240} chartData={gradeBuckets.values} chartOptions={{ labels: gradeBuckets.labels, legend: { position: 'right' } }} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
