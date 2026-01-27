import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, VStack, HStack, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdAssessment, MdPercent, MdStar } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { useAuth } from '../../../contexts/AuthContext';
import { resultsApi, studentsApi } from '../../../services/api';

export default function GradeCard(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const selfRes = await studentsApi.list();
        const self = selfRes?.rows?.[0] || null;
        if (!alive) return;
        setStudent(self);

        const res = await resultsApi.list();
        const items = Array.isArray(res?.items) ? res.items : [];
        if (!alive) return;
        setResults(items);

        const firstExamId = items[0]?.examId ? String(items[0].examId) : '';
        setSelectedExamId((prev) => prev || firstExamId);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load grade card');
        setResults([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, []);

  const studentLabel = useMemo(() => {
    const name = student?.name || user?.name || 'Student';
    const roll = student?.rollNumber ? ` • Roll ${student.rollNumber}` : '';
    const cls = student?.class ? ` • Class ${student.class}${student.section || ''}` : '';
    return `${name}${roll}${cls}`;
  }, [student, user]);

  const examOptions = useMemo(() => {
    const map = new Map();
    (results || []).forEach((r) => {
      const id = r?.examId ? String(r.examId) : '';
      if (!id) return;
      if (!map.has(id)) map.set(id, r?.examTitle || `Exam ${id}`);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [results]);

  const effectiveExamId = selectedExamId || examOptions[0]?.id || '';

  const selectedResults = useMemo(() => {
    if (!effectiveExamId) return [];
    return (results || []).filter((r) => String(r?.examId || '') === String(effectiveExamId));
  }, [results, effectiveExamId]);

  const examTitle = useMemo(() => {
    return selectedResults[0]?.examTitle || examOptions.find((o) => o.id === effectiveExamId)?.title || 'Grade Card';
  }, [selectedResults, examOptions, effectiveExamId]);

  const subjects = useMemo(() => {
    const seen = new Set();
    const rows = [];
    selectedResults.forEach((r) => {
      const key = r?.subject ? String(r.subject) : '-';
      if (seen.has(key)) return;
      seen.add(key);
      const marks = r?.marks === null || r?.marks === undefined ? null : Number(r.marks);
      const safeMarks = Number.isFinite(marks) ? marks : 0;
      const pct = Math.max(0, Math.min(100, safeMarks));
      const grade = r?.grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F');
      rows.push({ name: key, score: safeMarks, total: 100, grade });
    });
    return rows;
  }, [selectedResults]);

  const totals = useMemo(()=>{
    const subs = subjects || [];
    const totalScore = subs.reduce((a,s)=>a + (s.score||0), 0);
    const totalPossible = subs.reduce((a,s)=>a + (s.total||0), 0);
    const percent = totalPossible ? Math.round((totalScore/totalPossible)*100) : 0;
    const grade = percent>=90?'A+':percent>=80?'A':percent>=70?'B+':percent>=60?'B':percent>=50?'C':percent>=40?'D':'F';
    const best = subs.slice().sort((a,b)=> (b.score/b.total) - (a.score/a.total))[0];
    const weak = subs.slice().sort((a,b)=> (a.score/a.total) - (b.score/b.total))[0];
    return { totalScore, totalPossible, percent, grade, best, weak };
  },[subjects]);

  const chartData = useMemo(()=> ([{ name:'Score', data:(subjects||[]).map(s=>s.score) }]), [subjects]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories:(subjects||[]).map(s=>s.name) }, colors:['#805AD5'], dataLabels:{ enabled:false } }), [subjects]);

  const exportCSV = () => {
    const header = ['Student','Exam','Subject','Score','Total','Grade'];
    const rows = (subjects||[]).map(s => [student?.name || user?.name || 'Student', examTitle, s.name, s.score, s.total, s.grade]);
    const csv = [header, ...rows].map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='student_grade_card.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Grade Card • {examTitle}</Text>
      <Text fontSize='md' color={textSecondary} mb='10px'>{studentLabel}</Text>

      {loading ? (
        <Card p='16px' mb='16px'>
          <Text color={textSecondary}>Loading grade card...</Text>
        </Card>
      ) : null}

      {error ? (
        <Card p='16px' mb='16px'>
          <Text color='red.500'>{error}</Text>
        </Card>
      ) : null}

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' flexWrap='wrap' rowGap={3}>
          <HStack>
            <Text fontWeight='600'>Select Exam:</Text>
            <Select size='sm' value={effectiveExamId} onChange={(e) => setSelectedExamId(e.target.value)} maxW='260px'>
              {examOptions.length ? examOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.title}</option>
              )) : <option value=''>No exams</option>}
            </Select>
          </HStack>
        </HStack>
      </Card>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdAssessment} w='22px' h='22px' color='white' />} />}
            name='Total'
            value={`${totals.totalScore}/${totals.totalPossible}`}
            trendData={[0,0,totals.totalScore,totals.totalPossible,totals.totalScore]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdPercent} w='22px' h='22px' color='white' />} />}
            name='Percentage'
            value={`${totals.percent}%`}
            trendData={[60,70,80,85,totals.percent]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Text as='span' fontWeight='bold' color='white'>A</Text>} />}
            name='Grade'
            value={String(totals.grade)}
            trendData={[1,1,1,1,1]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdStar} w='22px' h='22px' color='white' />} />}
            name='Best Subject'
            value={String(totals.best?.name || '-')}
            trendData={[1,1,2,2,2]}
            trendColor='#FD7853'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' flexWrap='wrap' rowGap={3}>
          <HStack>
            <Text color={textSecondary}>Weakest Subject:</Text>
            <Badge colorScheme='red'>{totals.weak?.name || '-'}</Badge>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Subject</Th><Th>Score</Th><Th>Total</Th><Th>Grade</Th></Tr></Thead>
          <Tbody>
            {(subjects||[]).map((s,i)=> (
              <Tr key={i}>
                <Td>{s.name}</Td>
                <Td>{s.score}</Td>
                <Td>{s.total}</Td>
                <Td><Badge colorScheme='purple'>{s.grade}</Badge></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Subject Score Distribution</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={240} />
      </Card>
    </Box>
  );
}
