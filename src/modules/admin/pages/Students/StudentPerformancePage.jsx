import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, Flex, Button, ButtonGroup, SimpleGrid, Badge, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Select, Progress, useToast } from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import BarChart from '../../../../components/charts/BarChart.tsx';
import PieChart from '../../../../components/charts/PieChart';
import LineChart from '../../../../components/charts/LineChart';
// Icons
import { MdSchool, MdGrade, MdStar, MdStarBorder, MdTrendingUp, MdSearch, MdFilterList, MdRemoveRedEye, MdMoreVert, MdAssignment, MdRefresh, MdFileDownload, MdPrint } from 'react-icons/md';
// API
import * as studentsApi from '../../../../services/api/students';

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
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [perf, setPerf] = useState({ average: 0, totalExams: 0, subjects: [], recentResults: [] });
  const [busy, setBusy] = useState(false);

  // Load students
  useEffect(() => {
    const load = async () => {
      try {
        const payload = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        setStudents(rows || []);
        if ((rows || []).length) setSelectedId(String(rows[0].id));
      } catch (e) {
        toast({ title: 'Failed to load students', status: 'error' });
      }
    };
    load();
  }, []);

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
            Student Performance
          </Text>
          <Text fontSize='md' color='gray.500'>
            Analyze academic performance and results
          </Text>
        </Box>
        <Flex gap={2} align='center' flexWrap='nowrap'>
          <Select size='sm' w='240px' value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>
            ))}
          </Select>
          <ButtonGroup size='sm' variant='outline' isAttached>
            <Button onClick={refresh} isLoading={busy} leftIcon={<MdRefresh />}>Refresh</Button>
            <Button onClick={exportCSV} leftIcon={<MdFileDownload />}>Export</Button>
            <Button onClick={handlePrint} leftIcon={<MdPrint />}>Print</Button>
          </ButtonGroup>
        </Flex>
      </Flex>

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
