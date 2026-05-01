import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, Flex, HStack, SimpleGrid, Select, Input, Button, useColorModeValue, Badge, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Icon, IconButton } from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdVisibility, MdEdit } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import * as studentsApi from '../../../services/api/students';
import * as resultsApi from '../../../services/api/results';

export default function StudentPerformance() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');

  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentsApi.list({ page: 1, pageSize: 200 });
        setStudents(Array.isArray(data?.rows) ? data.rows : []);
      } catch (e) {
        setStudents([]);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await resultsApi.list({ page: 1, pageSize: 200, className: cls || undefined, section: section || undefined });
        setResults(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
        setResults([]);
      }
    };
    fetchResults();
  }, [cls, section]);

  const classes = useMemo(() => Array.from(new Set(students.map(s => s.class))).filter(Boolean).sort(), [students]);
  const sections = useMemo(() => Array.from(new Set(students.map(s => s.section))).filter(Boolean).sort(), [students]);

  const rows = useMemo(() => {
    const agg = new Map();
    results.forEach((r) => {
      const sid = r.studentId;
      if (!sid) return;
      const marks = Number(r.marks);
      if (!Number.isFinite(marks)) return;
      const cur = agg.get(sid) || { total: 0, count: 0 };
      cur.total += marks;
      cur.count += 1;
      agg.set(sid, cur);
    });

    return students.map(s => {
      const a = agg.get(s.id);
      const avg = a && a.count ? Math.round(a.total / a.count) : 0;
      return {
        id: s.id,
        name: s.name,
        roll: s.rollNumber,
        cls: s.class,
        section: s.section,
        percentage: avg,
      };
    });
  }, [students, results]);

  const filtered = useMemo(() => rows.filter(r =>
    (!cls || r.cls === cls) && (!section || r.section === section) && (!q || r.name.toLowerCase().includes(q.toLowerCase()) || r.roll.toLowerCase().includes(q.toLowerCase()))
  ), [rows, cls, section, q]);

  const subjectAverages = useMemo(() => {
    const bySubj = new Map();
    results.forEach((r) => {
      const subj = r.subject;
      const marks = Number(r.marks);
      if (!subj || !Number.isFinite(marks)) return;
      const cur = bySubj.get(subj) || { total: 0, count: 0 };
      cur.total += marks;
      cur.count += 1;
      bySubj.set(subj, cur);
    });
    const subjects = Array.from(bySubj.keys()).sort();
    return {
      subjects,
      values: subjects.map((s) => {
        const v = bySubj.get(s);
        return v && v.count ? Math.round(v.total / v.count) : 0;
      }),
    };
  }, [results]);

  const chartData = useMemo(() => ([
    { name: 'Avg %', data: subjectAverages.values }
  ]), [subjectAverages]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: subjectAverages.subjects },
    dataLabels: { enabled: false },
    colors: ['#805AD5'],
  }), [subjectAverages]);

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
