import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Text, Flex, Button, ButtonGroup, SimpleGrid, Badge, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, Select, Progress, useToast, useDisclosure, Divider, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, VStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import BarChart from '../../../../components/charts/BarChart.tsx';
import PieChart from '../../../../components/charts/PieChart';
import LineChart from '../../../../components/charts/LineChart';
// Icons
import { MdSchool, MdGrade, MdStar, MdStarBorder, MdTrendingUp, MdSearch, MdFilterList, MdRemoveRedEye, MdMoreVert, MdAssignment, MdRefresh, MdFileDownload, MdPrint, MdAdd } from 'react-icons/md';
// Auth
import { useAuth } from '../../../../contexts/AuthContext';
// API
import * as studentsApi from '../../../../services/api/students';
import * as examsApi from '../../../../services/api/exams';
import * as resultsApi from '../../../../services/api/results';
import * as classesApi from '../../../../services/api/classes';
import * as gradingApi from '../../../../services/api/grading';

const DEMO_SUBJECTS = [
  { subject: 'Mathematics', avg: 86 },
  { subject: 'English', avg: 79 },
  { subject: 'Physics', avg: 74 },
  { subject: 'Chemistry', avg: 71 },
  { subject: 'Computer', avg: 88 },
];

const DEMO_RECENT = [
  { title: 'Mid Term', subject: 'Mathematics', marks: 84, grade: 'A', examDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString() },
  { title: 'Mid Term', subject: 'English', marks: 78, grade: 'B', examDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString() },
  { title: 'Mid Term', subject: 'Physics', marks: 72, grade: 'B', examDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString() },
  { title: 'Monthly Test', subject: 'Mathematics', marks: 90, grade: 'A+', examDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
  { title: 'Monthly Test', subject: 'Chemistry', marks: 70, grade: 'C', examDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
  { title: 'Final', subject: 'Computer', marks: 92, grade: 'A+', examDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() },
];

function normalizePerformance(payload) {
  const p = payload?.data || payload?.performance || payload || {};
  return {
    average: Number(p.average ?? p.avg ?? 0) || 0,
    totalExams: Number(p.totalExams ?? p.total ?? 0) || 0,
    subjects: Array.isArray(p.subjects) ? p.subjects : [],
    recentResults: Array.isArray(p.recentResults) ? p.recentResults : [],
  };
}

export default function StudentPerformancePage() {
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedClassKey, setSelectedClassKey] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [classExams, setClassExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [loadingExams, setLoadingExams] = useState(false);
  const [loading, setLoading] = useState(false);
  const [perf, setPerf] = useState({ average: 0, totalExams: 0, subjects: [], recentResults: [] });
  const [busy, setBusy] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const classOptions = useMemo(() => {
    const uniq = new Map();
    (students || []).forEach((s) => {
      const className = s?.class;
      const section = s?.section;
      if (!className || !section) return;
      const key = `${className}::${section}`;
      if (!uniq.has(key)) uniq.set(key, { className, section });
    });
    return Array.from(uniq.values()).sort((a, b) => {
      const c = String(a.className).localeCompare(String(b.className), undefined, { numeric: true });
      if (c !== 0) return c;
      return String(a.section).localeCompare(String(b.section));
    });
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!selectedClassKey) return students || [];
    const [className, section] = selectedClassKey.split('::');
    return (students || []).filter((s) => String(s?.class || '') === String(className) && String(s?.section || '') === String(section));
  }, [selectedClassKey, students]);

  // Load students
  useEffect(() => {
    const load = async () => {
      try {
        const payload = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        setStudents(rows || []);
        if ((rows || []).length) {
          const first = rows[0];
          if (first?.class && first?.section) setSelectedClassKey(`${first.class}::${first.section}`);
          setSelectedId(String(first.id));
        }
      } catch (e) {
        toast({ title: 'Failed to load students', status: 'error' });
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedClassKey) return;
    if (!filteredStudents.length) {
      setSelectedId('');
      return;
    }
    const exists = filteredStudents.some((s) => String(s?.id) === String(selectedId));
    if (!exists) setSelectedId(String(filteredStudents[0].id));
  }, [filteredStudents, selectedClassKey]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!selectedClassKey) {
          setClassExams([]);
          setSelectedExamId('');
          return;
        }
        const [className, section] = selectedClassKey.split('::');
        setLoadingExams(true);
        const res = await examsApi.list({ pageSize: 200, className, section });
        const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
        if (!mounted) return;
        setClassExams(items || []);
        if (!items.length) {
          setSelectedExamId('');
          return;
        }
        const stillExists = items.some((x) => String(x?.id) === String(selectedExamId));
        if (!selectedExamId || !stillExists) setSelectedExamId(String(items[0].id));
      } catch (_) {
        if (!mounted) return;
        setClassExams([]);
        setSelectedExamId('');
      } finally {
        if (mounted) setLoadingExams(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedClassKey]);

  // Load performance for selected
  useEffect(() => {
    if (!selectedId) return;
    const loadPerf = async () => {
      try {
        setLoading(true);
        const payload = await studentsApi.getPerformance(selectedId);
        setPerf(normalizePerformance(payload));
      } catch (e) {
        toast({ title: 'Failed to load performance', status: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadPerf();
  }, [selectedId]);

  const refresh = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const payload = await studentsApi.getPerformance(selectedId);
      setPerf(normalizePerformance(payload));
    } catch (e) {
      toast({ title: 'Refresh failed', status: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const exportCSV = () => {
    // Export recent results
    const header = ['Exam', 'Subject', 'Marks', 'Grade', 'Date'];
    const rows = (perf?.recentResults || []).map(r => [
      r.title || `#${r.examId}`,
      r.subject || '',
      r.marks ?? '',
      r.grade || '',
      r.examDate ? new Date(r.examDate).toISOString().slice(0, 10) : ''
    ]);
    const csv = [header, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'student_performance_results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const openResultCard = () => {
    if (!selectedClassKey || !selectedId || !selectedExamId) {
      toast({ title: 'Please select class, student and exam', status: 'warning' });
      return;
    }
    const [className, section] = selectedClassKey.split('::');
    const params = new URLSearchParams({ className, section, studentId: String(selectedId), examId: String(selectedExamId) });
    navigate(`/admin/academics/results/result-card?${params.toString()}`);
  };

  const safeSubjects = useMemo(() => (Array.isArray(perf?.subjects) ? perf.subjects : []), [perf]);
  const safeRecent = useMemo(() => (Array.isArray(perf?.recentResults) ? perf.recentResults : []), [perf]);

  const chartSubjects = useMemo(() => (safeSubjects.length ? safeSubjects : DEMO_SUBJECTS), [safeSubjects]);
  const chartRecent = useMemo(() => (safeRecent.length ? safeRecent : DEMO_RECENT), [safeRecent]);
  const hasRealData = Boolean(safeSubjects.length || safeRecent.length);

  const bestSubject = useMemo(() => {
    const sorted = [...chartSubjects].sort((a, b) => Number(b.avg || 0) - Number(a.avg || 0));
    const top = sorted[0];
    return {
      name: top?.subject || '—',
      avg: Number(top?.avg || 0),
    };
  }, [chartSubjects]);

  const subjectBar = useMemo(() => {
    const sorted = [...chartSubjects]
      .map((s) => ({ subject: s.subject, avg: Number(s.avg || 0) }))
      .filter((s) => Boolean(s.subject))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);
    return {
      categories: sorted.map((s) => s.subject),
      series: [{ name: 'Average %', data: sorted.map((s) => Math.round(s.avg)) }],
    };
  }, [chartSubjects]);

  const examTrend = useMemo(() => {
    // Group by exam to avoid 1 point per subject
    const m = new Map();
    chartRecent.forEach((r, idx) => {
      const rawDate = r.examDate || r.date || r.created_at || r.updated_at;
      const dateKey = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : `x-${idx}`;
      const title = r.title || (r.examId ? `Exam #${r.examId}` : `Exam ${idx + 1}`);
      const key = `${dateKey}|${title}`;
      const marks = Number(r.marks ?? r.obtainedMarks ?? 0);
      if (!m.has(key)) {
        m.set(key, { dateKey, title, sum: 0, count: 0 });
      }
      const entry = m.get(key);
      entry.sum += Number.isFinite(marks) ? marks : 0;
      entry.count += 1;
    });

    const rows = Array.from(m.values()).sort((a, b) => String(a.dateKey).localeCompare(String(b.dateKey)));
    const categories = rows.map((x) => {
      if (String(x.dateKey).startsWith('x-')) return x.title;
      try {
        return new Date(x.dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } catch {
        return x.title;
      }
    });
    const data = rows.map((x) => (x.count ? Math.round(x.sum / x.count) : 0));
    return {
      categories,
      series: [{ name: 'Avg Marks', data }],
    };
  }, [chartRecent]);

  const gradeDonut = useMemo(() => {
    const counts = {};
    chartRecent.forEach((r) => {
      const g = String(r.grade || r.resultGrade || 'N/A').toUpperCase();
      counts[g] = (counts[g] || 0) + 1;
    });
    const preferred = ['A+', 'A', 'B', 'C', 'D', 'F', 'N/A'];
    const labels = preferred.filter((k) => counts[k]).concat(Object.keys(counts).filter((k) => !preferred.includes(k)).sort());
    const series = labels.map((l) => counts[l]);
    return { labels, series };
  }, [chartRecent]);

  const averagePct = useMemo(() => {
    const v = Number(perf?.average || 0);
    if (v > 0) return Math.round(v);
    const arr = chartSubjects.map((s) => Number(s.avg || 0)).filter((n) => Number.isFinite(n));
    if (!arr.length) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }, [chartSubjects, perf]);

  const totalExams = useMemo(() => {
    const v = Number(perf?.totalExams || 0);
    if (v > 0) return v;
    const uniq = new Set(chartRecent.map((r) => String(r.title || r.examId || r.date || r.examDate || '')));
    return Math.max(0, uniq.size);
  }, [chartRecent, perf]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Student Performance & Marks
          </Text>
          <Text fontSize='md' color='gray.500'>
            Analyze performance, marks and result cards
          </Text>
        </Box>
        <Flex gap={2} align='center' flexWrap='nowrap'>
          <Select
            size='sm'
            w='180px'
            value={selectedClassKey}
            onChange={(e) => setSelectedClassKey(e.target.value)}
            placeholder='Select Class'
          >
            {classOptions.map((c) => (
              <option key={`${c.className}::${c.section}`} value={`${c.className}::${c.section}`}>
                {c.className}-{c.section}
              </option>
            ))}
          </Select>
          <Select
            size='sm'
            w='240px'
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            placeholder='Select Student'
          >
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>
            ))}
          </Select>
          <Select
            size='sm'
            w='200px'
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            placeholder={loadingExams ? 'Loading exams...' : 'Select Exam'}
            isDisabled={loadingExams}
          >
            {(classExams || []).map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title || `Exam #${ex.id}`}</option>
            ))}
          </Select>
          <Button size='sm' variant='outline' onClick={openResultCard}>
            Result Card
          </Button>
          {['admin', 'owner', 'teacher', 'super-admin'].includes(user?.role) && (
            <Button size='sm' colorScheme='blue' leftIcon={<MdAdd />} onClick={onOpen}>
              Add Performance
            </Button>
          )}
          <ButtonGroup size='sm' variant='outline' isAttached>
            <Button onClick={refresh} isLoading={busy} leftIcon={<MdRefresh />}>Refresh</Button>
            <Button onClick={exportCSV} leftIcon={<MdFileDownload />}>Export</Button>
            <Button onClick={handlePrint} leftIcon={<MdPrint />}>Print</Button>
          </ButtonGroup>
        </Flex>
      </Flex>

      {/* Add Performance Modal */}
      <AddPerformanceModal
        isOpen={isOpen}
        onClose={onClose}
        studentId={selectedId}
        onSuccess={refresh}
      />

      {/* Performance Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <StatCard
          title='Average %'
          value={`${averagePct}%`}
          icon={MdSchool}
          colorScheme='blue'
          trend='up'
          trendValue={2}
        />

        <StatCard
          title='Total Exams'
          value={String(totalExams)}
          icon={MdGrade}
          colorScheme='green'
          note={hasRealData ? 'Loaded successfully' : 'Demo data'}
        />

        <StatCard
          title='Best Subject'
          value={bestSubject.name}
          subValue={chartSubjects.length ? `${Math.round(bestSubject.avg)}%` : ''}
          icon={MdStar}
          colorScheme='orange'
        />

        <StatCard
          title='Progress'
          value={loading ? 'Loading...' : (hasRealData ? 'Updated' : 'Demo')}
          icon={MdTrendingUp}
          colorScheme='red'
          note={hasRealData ? 'Real-time data' : 'Backend returned empty'}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap='20px' mb='20px'>
        <Card p='20px' gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Exam Trend</Text>
              <Text fontSize='sm' color='gray.500'>Average marks over exams</Text>
            </Box>
            <Badge colorScheme='blue'>{hasRealData ? `${safeRecent.length} results` : 'Demo data'}</Badge>
          </Flex>
          <LineChart
            height={300}
            chartData={examTrend.series}
            chartOptions={{
              chart: { type: 'line' },
              stroke: { curve: 'smooth', width: 3 },
              colors: ['#4318FF'],
              xaxis: { categories: examTrend.categories },
              tooltip: { shared: true, intersect: false },
            }}
          />
        </Card>

        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Grade Distribution</Text>
              <Text fontSize='sm' color='gray.500'>Recent results breakdown</Text>
            </Box>
            <Badge colorScheme='purple'>Donut</Badge>
          </Flex>
          <PieChart
            type='donut'
            height={300}
            chartData={gradeDonut.series}
            chartOptions={{
              labels: gradeDonut.labels,
              legend: { position: 'bottom' },
              colors: ['#22c55e', '#16a34a', '#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#94a3b8'],
            }}
          />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap='20px' mb='20px'>
        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Subject Averages</Text>
              <Text fontSize='sm' color='gray.500'>Top subjects by average %</Text>
            </Box>
            <Badge colorScheme='green'>Top 8</Badge>
          </Flex>
          <BarChart
            ariaLabel='Subject averages'
            height={320}
            categories={subjectBar.categories}
            series={subjectBar.series}
            options={{
              yaxis: { min: 0, max: 100 },
              plotOptions: { bar: { borderRadius: 8, columnWidth: '50%' } },
              tooltip: { y: { formatter: (v) => `${Math.round(v)}%` } },
            }}
          />
        </Card>

        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Recent Results Snapshot</Text>
              <Text fontSize='sm' color='gray.500'>Latest exam/subject marks</Text>
            </Box>
            <Badge colorScheme='orange'>{hasRealData ? 'Live' : 'Demo'}</Badge>
          </Flex>
          <Box>
            {(chartRecent.slice(0, 6) || []).map((r, idx) => (
              <Flex key={idx} justify='space-between' align='center' py='8px' borderBottomWidth={idx === 5 ? 0 : '1px'} borderColor='gray.100'>
                <Box>
                  <Text fontSize='sm' fontWeight='600'>{r.subject || 'Subject'}</Text>
                  <Text fontSize='xs' color='gray.500'>{r.title || (r.examId ? `Exam #${r.examId}` : '')}</Text>
                </Box>
                <Box textAlign='right'>
                  <Text fontSize='sm' fontWeight='700'>{r.marks ?? '-'}</Text>
                  <Text fontSize='xs' color='gray.500'>{r.grade || ''}</Text>
                </Box>
              </Flex>
            ))}
            {!safeRecent.length && <Text fontSize='sm' color='gray.500'>Backend returned no results — showing demo data.</Text>}
          </Box>
        </Card>
      </SimpleGrid>

      {/* Recent Results for selected student */}
      <Card p='20px'>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Exam</Th>
                <Th>Subject</Th>
                <Th isNumeric>Marks</Th>
                <Th>Grade</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {chartRecent.map((r, idx) => (
                <Tr key={idx}>
                  <Td>{r.title || `#${r.examId}`}</Td>
                  <Td>{r.subject}</Td>
                  <Td isNumeric>{r.marks}</Td>
                  <Td>{r.grade}</Td>
                  <Td>{r.examDate ? new Date(r.examDate).toLocaleDateString() : ''}</Td>
                </Tr>
              ))}
              {!chartRecent.length && (
                <Tr><Td colSpan={5}>No results</Td></Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

// Internal Helper Component for Adding Performance
function AddPerformanceModal({ isOpen, onClose, studentId, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [gradingBands, setGradingBands] = useState(null);
  const [student, setStudent] = useState(null);

  // Load context data
  useEffect(() => {
    if (!isOpen || !studentId) return;

    const load = async () => {
      try {
        const [examRes, stRes, bandRes] = await Promise.all([
          examsApi.list({ pageSize: 100 }),
          studentsApi.getById(studentId),
          gradingApi.getDefault()
        ]);

        const examItems = Array.isArray(examRes?.items) ? examRes.items : (Array.isArray(examRes) ? examRes : []);
        setExams(examItems);
        setStudent(stRes);

        // Load subjects for the student's class
        if (stRes?.class) {
          const subRes = await classesApi.listSubjectsByClass({ className: stRes.class, section: stRes.section });
          const items = Array.isArray(subRes?.items) ? subRes.items : (Array.isArray(subRes) ? subRes : []);
          setSubjects(items.map(s => ({
            name: s.subjectName || s.name,
            marks: '',
            grade: '',
            fullMarks: s.fullMarks || 100
          })));
        }

        // Load grading bands
        const bands = bandRes?.bands || (Array.isArray(bandRes?.items) ? bandRes.items[0]?.bands : null);
        if (bands) setGradingBands(bands);

      } catch (e) {
        toast({ title: 'Failed to load details', status: 'error' });
      }
    };
    load();
  }, [isOpen, studentId]);

  const computeGrade = (marks, fullMarks) => {
    if (!gradingBands || marks === '') return '';
    const percent = (Number(marks) / Number(fullMarks)) * 100;
    const sorted = Object.entries(gradingBands)
      .map(([k, v]) => [k, Number(v)])
      .sort((a, b) => b[1] - a[1]);

    for (const [grade, min] of sorted) {
      if (percent >= min) return grade;
    }
    return 'F';
  };

  const handleSave = async () => {
    if (!selectedExamId) {
      toast({ title: 'Please select an exam', status: 'warning' });
      return;
    }

    const payload = subjects
      .filter(s => s.marks !== '')
      .map(s => ({
        studentId: Number(studentId),
        examId: Number(selectedExamId),
        subject: s.name,
        marks: Number(s.marks),
        grade: s.grade || computeGrade(s.marks, s.fullMarks)
      }));

    if (!payload.length) {
      toast({ title: 'No marks entered', status: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await resultsApi.bulkCreate(payload);
      toast({ title: 'Performance saved successfully', status: 'success' });
      onSuccess();
      onClose();
    } catch (e) {
      toast({ title: 'Failed to save results', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='xl' scrollBehavior='inside'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Performance - {student?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <FormControl isRequired>
              <FormLabel>Select Exam</FormLabel>
              <Select
                placeholder='Choose Exam'
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.title}</option>
                ))}
              </Select>
            </FormControl>

            <Divider />

            <Text fontWeight='bold'>Enter Marks</Text>
            <Table size='sm' variant='simple'>
              <Thead>
                <Tr>
                  <Th>Subject</Th>
                  <Th isNumeric>Full</Th>
                  <Th width='100px'>Marks</Th>
                  <Th width='80px'>Grade</Th>
                </Tr>
              </Thead>
              <Tbody>
                {subjects.map((sub, idx) => (
                  <Tr key={idx}>
                    <Td fontWeight='500'>{sub.name}</Td>
                    <Td isNumeric color='gray.500'>{sub.fullMarks}</Td>
                    <Td>
                      <Input
                        size='sm'
                        type='number'
                        placeholder='0-100'
                        value={sub.marks}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubjects(prev => prev.map((item, i) =>
                            i === idx
                              ? { ...item, marks: val, grade: computeGrade(val, item.fullMarks) }
                              : item
                          ));
                        }}
                      />
                    </Td>
                    <Td>
                      <Badge colorScheme='blue' fontSize='xs'>{sub.grade || '-'}</Badge>
                    </Td>
                  </Tr>
                ))}
                {!subjects.length && (
                  <Tr><Td colSpan={4} textAlign='center'>No subjects found for class {student?.class}</Td></Tr>
                )}
              </Tbody>
            </Table>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant='ghost' mr={3} onClick={onClose}>Cancel</Button>
          <Button
            colorScheme='blue'
            isLoading={loading}
            onClick={handleSave}
            isDisabled={!selectedExamId || subjects.every(s => s.marks === '')}
          >
            Save Results
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
