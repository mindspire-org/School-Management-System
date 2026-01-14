import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  IconButton,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  useColorModeValue,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import LineChart from 'components/charts/LineChart';
import BarChart from 'components/charts/BarChart.tsx';
import DonutChart from 'components/charts/v2/DonutChart.tsx';
import { MdTrendingUp, MdDoneAll, MdBook, MdAssignment, MdFileDownload, MdPictureAsPdf, MdRefresh, MdSearch, MdRemoveRedEye, MdEdit, MdDelete } from 'react-icons/md';
import * as resultsApi from '../../../../services/api/results';
import useClassOptions from '../../../../hooks/useClassOptions';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? '' : String(n));

const DEMO_RESULTS = [
  {
    id: 'demo-1',
    studentName: 'Subhan',
    studentId: 2,
    class: '9A',
    section: 'A',
    examTitle: 'Mid Term',
    examId: 1,
    subject: 'English',
    marks: 50,
    grade: 'C',
  },
  {
    id: 'demo-2',
    studentName: 'Ayesha',
    studentId: 3,
    class: '9A',
    section: 'A',
    examTitle: 'Mid Term',
    examId: 1,
    subject: 'Mathematics',
    marks: 78,
    grade: 'B',
  },
  {
    id: 'demo-3',
    studentName: 'Bilal',
    studentId: 5,
    class: '9A',
    section: 'A',
    examTitle: 'Final',
    examId: 2,
    subject: 'Mathematics',
    marks: 91,
    grade: 'A',
  },
  {
    id: 'demo-4',
    studentName: 'Sana',
    studentId: 7,
    class: '9A',
    section: 'A',
    examTitle: 'Final',
    examId: 2,
    subject: 'English',
    marks: 34,
    grade: 'D',
  },
  {
    id: 'demo-5',
    studentName: 'Hassan',
    studentId: 9,
    class: '9A',
    section: 'A',
    examTitle: 'Final',
    examId: 2,
    subject: 'Physics',
    marks: 22,
    grade: 'F',
  },
];

const gradeFromMarks = (marks) => {
  const m = Number(marks || 0);
  if (m >= 85) return 'A';
  if (m >= 70) return 'B';
  if (m >= 55) return 'C';
  if (m >= 33) return 'D';
  return 'F';
};

export default function Results() {
  const [cls, setCls] = useState('All');
  const [section, setSection] = useState('All');
  const [query, setQuery] = useState(''); // student name
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [active, setActive] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const disc = useDisclosure();
  const editDisc = useDisclosure();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const { classOptions, sectionsByClass } = useClassOptions();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const chartH = useBreakpointValue({ base: 240, md: 280, lg: 320 });

  const subjects = useMemo(() => ['All', ...Array.from(new Set(rows.map(r => r.subject).filter(Boolean)))], [rows]);
  const classes = useMemo(() => ['All', ...classOptions], [classOptions]);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (cls !== 'All') params.className = cls;
      if (section !== 'All' && section) params.section = section;
      if (subject !== 'All') params.subject = subject;
      if (studentId) params.studentId = Number(studentId);
      if (query) params.q = query;
      const res = await resultsApi.list(params);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setRows(items);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load results', status: 'error' });
      setRows([]);
    } finally { setLoading(false); }
  }, [cls, section, subject, studentId, query, toast]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const chartRows = useMemo(() => (rows.length ? rows : DEMO_RESULTS), [rows]);
  const hasRealData = Boolean(rows.length);

  const avgOverall = useMemo(() => Math.round(chartRows.reduce((a, b) => a + (Number(b.marks) || 0), 0) / (chartRows.length || 1)), [chartRows]);
  const passOverall = useMemo(() => {
    const total = chartRows.length || 1;
    const passed = chartRows.filter(r => (Number(r.marks) || 0) >= 33).length;
    return Math.round((passed / total) * 100);
  }, [chartRows]);
  const subjectsCount = useMemo(() => new Set(chartRows.map(r => r.subject)).size, [chartRows]);

  const examTrend = useMemo(() => {
    const map = new Map();
    chartRows.forEach((r) => {
      const key = r.examTitle || (r.examId ? `Exam ${r.examId}` : 'Exam');
      const list = map.get(key) || [];
      list.push(Number(r.marks) || 0);
      map.set(key, list);
    });
    const rowsAgg = Array.from(map.entries()).map(([k, arr]) => ({
      name: k,
      avg: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0,
      count: arr.length,
    }));
    rowsAgg.sort((a, b) => b.count - a.count);
    const top = rowsAgg.slice(0, 8);
    return {
      categories: top.map((r) => r.name),
      series: [{ name: 'Avg Marks', data: top.map((r) => Math.round(r.avg)) }],
    };
  }, [chartRows]);

  const gradeDonut = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    chartRows.forEach((r) => {
      const g = String(r.grade || gradeFromMarks(r.marks) || 'F').toUpperCase();
      if (counts[g] === undefined) counts[g] = 0;
      counts[g] += 1;
    });
    const labels = Object.keys(counts).filter((k) => counts[k] > 0);
    return { labels, series: labels.map((k) => counts[k]) };
  }, [chartRows]);

  const subjectAvg = useMemo(() => {
    const map = new Map();
    chartRows.forEach((r) => {
      const key = r.subject || 'Unknown';
      const list = map.get(key) || [];
      list.push(Number(r.marks) || 0);
      map.set(key, list);
    });
    const agg = Array.from(map.entries()).map(([k, arr]) => ({
      name: k,
      avg: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0,
    }));
    agg.sort((a, b) => b.avg - a.avg);
    const top = agg.slice(0, 8);
    return {
      categories: top.map((r) => r.name),
      series: [{ name: 'Avg %', data: top.map((r) => Math.round(r.avg)) }],
    };
  }, [chartRows]);

  const topStudents = useMemo(() => {
    const map = new Map();
    chartRows.forEach((r) => {
      const key = r.studentName || (r.studentId ? `ID ${r.studentId}` : 'Student');
      const list = map.get(key) || [];
      list.push(Number(r.marks) || 0);
      map.set(key, list);
    });
    const agg = Array.from(map.entries()).map(([k, arr]) => ({
      name: k,
      avg: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0,
    }));
    agg.sort((a, b) => b.avg - a.avg);
    const top = agg.slice(0, 8);
    return {
      categories: top.map((r) => r.name),
      series: [{ name: 'Avg %', data: top.map((r) => Math.round(r.avg)) }],
    };
  }, [chartRows]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Results</Heading>
          <Text color={textColorSecondary}>Summary and detailed results by subject</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAssignment />} variant='outline' colorScheme='blue' onClick={() => navigate('/admin/academics/results/generate')}>Generate Results</Button>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
        </ButtonGroup>
      </Flex>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <InputGroup maxW='240px' size='sm'>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search by student name' value={query} onChange={(e) => setQuery(e.target.value)} />
            </InputGroup>
            <Select size='sm' w="140px" value={cls} onChange={(e) => { setCls(e.target.value); setSection('All'); }}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select size='sm' w="120px" value={section} onChange={(e) => setSection(e.target.value)} isDisabled={cls === 'All'}>
              {['All', ...((sectionsByClass[cls] || []))].map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select size='sm' w="150px" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Input size='sm' placeholder='Student ID' w='120px' value={studentId} onChange={(e) => setStudentId(e.target.value.replace(/[^0-9]/g, ''))} />
          </HStack>
          <HStack spacing={3} flexWrap='wrap'>
            <Button size='sm' leftIcon={<MdRefresh />} variant='outline' onClick={fetchRows} isLoading={loading}>Refresh</Button>
            <Button size='sm' leftIcon={<MdAssignment />} variant="outline" colorScheme="blue" onClick={() => window.print()}>Export PDF</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px" mb={5}>
        <StatCard
          title="Average Score"
          value={`${avgOverall}%`}
          icon={MdTrendingUp}
          colorScheme="blue"
        />
        <StatCard
          title="Pass Rate"
          value={`${passOverall}%`}
          icon={MdDoneAll}
          colorScheme="green"
        />
        <StatCard
          title="Subjects"
          value={String(subjectsCount)}
          icon={MdBook}
          colorScheme="purple"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap="20px" mb={5}>
        <Card p={5} gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
            <Box>
              <Text fontSize="lg" fontWeight="700" color={textColor}>Marks Trend</Text>
              <Text fontSize="sm" color={textColorSecondary}>Average marks by exam</Text>
            </Box>
            <Badge colorScheme="blue">{hasRealData ? `${rows.length} rows` : 'Demo'}</Badge>
          </Flex>
          <LineChart
            height={chartH || 280}
            chartData={examTrend.series}
            chartOptions={{
              stroke: { curve: 'smooth', width: 3 },
              colors: ['#60a5fa'],
              xaxis: { categories: examTrend.categories },
              yaxis: { min: 0, max: 100 },
              tooltip: { shared: true, intersect: false },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
                    xaxis: { labels: { rotate: -40, hideOverlappingLabels: true } },
                    legend: { position: 'bottom' },
                  },
                },
              ],
            }}
          />
        </Card>

        <Card p={5}>
          <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
            <Box>
              <Text fontSize="lg" fontWeight="700" color={textColor}>Grade Distribution</Text>
              <Text fontSize="sm" color={textColorSecondary}>A/B/C/D/F breakdown</Text>
            </Box>
            <Badge colorScheme="purple">Donut</Badge>
          </Flex>
          <DonutChart
            ariaLabel="Grade distribution donut"
            height={chartH || 280}
            labels={gradeDonut.labels}
            series={gradeDonut.series}
            options={{
              colors: ['#22c55e', '#60a5fa', '#f59e0b', '#fb923c', '#ef4444'],
              legend: { position: 'bottom' },
            }}
          />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="20px" mb={5}>
        <Card p={5}>
          <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
            <Box>
              <Text fontSize="lg" fontWeight="700" color={textColor}>Subject-wise Average</Text>
              <Text fontSize="sm" color={textColorSecondary}>Top subjects by average marks</Text>
            </Box>
            <Badge colorScheme="green">Bar</Badge>
          </Flex>
          <BarChart
            ariaLabel="Subject averages"
            height={chartH || 280}
            categories={subjectAvg.categories}
            series={subjectAvg.series}
            options={{
              colors: ['#60a5fa'],
              yaxis: { min: 0, max: 100 },
              plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
              tooltip: { y: { formatter: (v) => `${Math.round(v)}%` } },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
                    xaxis: { labels: { rotate: -35, hideOverlappingLabels: true } },
                    legend: { position: 'bottom' },
                    plotOptions: { bar: { columnWidth: '70%' } },
                  },
                },
              ],
            }}
          />
        </Card>

        <Card p={5}>
          <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
            <Box>
              <Text fontSize="lg" fontWeight="700" color={textColor}>Top Students</Text>
              <Text fontSize="sm" color={textColorSecondary}>Top average performers</Text>
            </Box>
            <Badge colorScheme="blue">Top 8</Badge>
          </Flex>
          <BarChart
            ariaLabel="Top students"
            height={chartH || 280}
            categories={topStudents.categories}
            series={topStudents.series}
            options={{
              colors: ['#22c55e'],
              yaxis: { min: 0, max: 100 },
              plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
              tooltip: { y: { formatter: (v) => `${Math.round(v)}%` } },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
                    xaxis: { labels: { rotate: -35, hideOverlappingLabels: true } },
                    legend: { position: 'bottom' },
                    plotOptions: { bar: { columnWidth: '70%' } },
                  },
                },
              ],
            }}
          />
        </Card>
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Results Table
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selectedIds.length === rows.length && rows.length > 0} isIndeterminate={selectedIds.length > 0 && selectedIds.length < rows.length} onChange={(e) => setSelectedIds(e.target.checked ? rows.map((r) => r.id) : [])} />
                </Th>
                <Th>Student</Th>
                <Th>Student ID</Th>
                <Th>Class</Th>
                <Th>Exam</Th>
                <Th>Subject</Th>
                <Th isNumeric>Marks</Th>
                <Th>Grade</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={9}><Flex align='center' justify='center' py={6}>Loading...</Flex></Td></Tr>
              ) : rows.map((r) => (
                <Tr key={r.id}>
                  <Td><Checkbox isChecked={selectedIds.includes(r.id)} onChange={() => setSelectedIds(prev => prev.includes(r.id) ? prev.filter(i => i !== r.id) : [...prev, r.id])} /></Td>
                  <Td>{r.studentName}</Td>
                  <Td>{r.studentId}</Td>
                  <Td>{r.class}{r.section ? `-${r.section}` : ''}</Td>
                  <Td>{r.examTitle}</Td>
                  <Td>{r.subject}</Td>
                  <Td isNumeric>{fmt(r.marks)}</Td>
                  <Td>{fmt(r.grade)}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View Class Results' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => {
                        const params = new URLSearchParams(); if (r.class) params.set('class', r.class); if (r.section) params.set('section', r.section); if (r.examId) params.set('examId', r.examId); if (r.subject) params.set('subject', r.subject);
                        navigate(`/admin/academics/results/class-view?${params.toString()}`);
                      }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={() => { setEditItem({ ...r }); editDisc.onOpen(); }} />
                      <IconButton aria-label='Delete' icon={<MdDelete />} size='sm' variant='ghost' colorScheme='red' onClick={async () => {
                        if (!window.confirm('Delete this result entry?')) return; try { await resultsApi.remove(r.id); toast({ title: 'Deleted', status: 'success', duration: 1200 }); fetchRows(); } catch { toast({ title: 'Delete failed', status: 'error' }); }
                      }} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Detail Modal (kept for quick summary if needed) */}
      <Modal isOpen={disc.isOpen} onClose={disc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Result Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{active.studentName}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Exam</Text><Text>{active.examTitle}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Subject</Text><Text>{active.subject}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Marks</Text><Text>{fmt(active.marks)}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Grade</Text><Text>{fmt(active.grade)}</Text></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={disc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editItem && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{editItem.studentName} (ID: {editItem.studentId})</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Exam</Text><Text>{editItem.examTitle}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Subject</Text><Text>{editItem.subject}</Text></HStack>
                <HStack>
                  <Box flex='1'>
                    <Text mb={1}>Marks</Text>
                    <Input type='number' value={fmt(editItem.marks)} onChange={(e) => setEditItem(it => ({ ...it, marks: e.target.value }))} />
                  </Box>
                  <Box flex='1'>
                    <Text mb={1}>Grade</Text>
                    <Input value={fmt(editItem.grade)} onChange={(e) => setEditItem(it => ({ ...it, grade: e.target.value }))} />
                  </Box>
                </HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async () => {
              if (!editItem) return; try { await resultsApi.update(editItem.id, { marks: editItem.marks === '' ? null : Number(editItem.marks), grade: editItem.grade || null }); toast({ title: 'Result updated', status: 'success', duration: 1500 }); editDisc.onClose(); fetchRows(); } catch { toast({ title: 'Update failed', status: 'error' }); }
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
