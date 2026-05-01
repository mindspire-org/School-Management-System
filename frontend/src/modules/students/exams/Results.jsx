import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Select, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdLibraryBooks, MdAssessment, MdPercent, MdCheckCircle } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { useAuth } from '../../../contexts/AuthContext';
import * as studentsApi from '../../../services/api/students';
import * as resultsApi from '../../../services/api/results';

export default function Results(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [items, setItems] = useState([]);
  const [examKey, setExamKey] = useState('');

  useEffect(() => {
    const fetchSelf = async () => {
      try {
        if (user?.role !== 'student') return;
        const data = await studentsApi.list({});
        const me = Array.isArray(data?.rows) && data.rows.length ? data.rows[0] : null;
        setStudent(me);
      } catch (e) {
        setStudent(null);
      }
    };
    fetchSelf();
  }, [user]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!student?.id) return;
        const list = [];
        let page = 1;
        const pageSize = 200;
        for (;;) {
          const data = await resultsApi.list({ page, pageSize, studentId: student.id });
          const items = Array.isArray(data?.items) ? data.items : [];
          list.push(...items);
          if (items.length < pageSize) break;
          page += 1;
          if (page > 50) break;
        }
        setItems(list);
        if (!examKey) {
          const first = list[0]?.examId;
          if (first) setExamKey(String(first));
        }
      } catch (e) {
        setItems([]);
      }
    };
    fetchResults();
  }, [student?.id, examKey]);

  const exams = useMemo(() => {
    const byId = new Map();
    items.forEach((r) => {
      if (!r.examId) return;
      if (!byId.has(String(r.examId))) byId.set(String(r.examId), r.examTitle || `Exam ${r.examId}`);
    });
    return Array.from(byId.entries()).map(([id, title]) => ({ id, title }));
  }, [items]);

  const examRows = useMemo(() => items.filter((r) => String(r.examId) === String(examKey)), [items, examKey]);

  const totals = useMemo(()=>{
    const subs = examRows;
    const totalScore = subs.reduce((a,s)=>a + (Number(s.marks) || 0), 0);
    const subjects = subs.length;
    const totalPossible = subjects * 100;
    const percent = subjects ? Math.round(totalScore / subjects) : 0;
    const passCount = subs.filter(s=> (Number(s.marks) || 0) >= 40).length;
    return { totalScore, totalPossible, percent, passCount, subjects };
  }, [examRows]);

  const chartData = useMemo(()=> ([{ name:'Score', data: examRows.map(s=>Number(s.marks) || 0) }]), [examRows]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: examRows.map(s=>s.subject) }, colors:['#3182CE'], dataLabels:{ enabled:false } }), [examRows]);
  const lineData = useMemo(()=> {
    const data = exams.map((e) => {
      const rows = items.filter((r) => String(r.examId) === String(e.id));
      if (!rows.length) return 0;
      const total = rows.reduce((a, r) => a + (Number(r.marks) || 0), 0);
      return Math.round(total / rows.length);
    });
    return [{ name:'% Across Exams', data }];
  }, [items, exams]);
  const lineOptions = useMemo(()=> ({ xaxis:{ categories: exams.map(e=>e.title) }, colors:['#01B574'], dataLabels:{ enabled:false }, stroke:{ curve:'smooth', width:3 } }), [exams]);

  const exportCSV = () => {
    const header = ['Exam','Subject','Score','Total','Grade'];
    const rows = examRows.map(s => [String(exams.find(e=>String(e.id)===String(examKey))?.title || ''), s.subject, s.marks, 100, s.grade]);
    const csv = [header, ...rows].map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='student_results.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Results</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student?.name || user?.name || 'Student'} • Roll {student?.rollNumber || '-'} • Class {student?.class || '-'}{student?.section || ''}</Text>

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' flexWrap='wrap' rowGap={3}>
          <HStack>
            <Text fontWeight='600'>Select Exam:</Text>
            <Select size='sm' value={examKey} onChange={e=>setExamKey(e.target.value)} maxW='220px'>
              {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />}>Print</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </HStack>
      </Card>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdLibraryBooks} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(totals.subjects)}
            trendData={[1,2,3,3,totals.subjects]}
            trendColor='#01B574'
          />
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
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdPercent} w='22px' h='22px' color='white' />} />}
            name='Percentage'
            value={`${totals.percent}%`}
            trendData={[60,70,80,85,totals.percent]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Passed'
            value={String(totals.passCount)}
            trendData={[1,1,2,3,totals.passCount]}
            trendColor='#FD7853'
          />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px' mb='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Subject Scores</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={240} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Overall Trend</Text>
          <LineChart chartData={lineData} chartOptions={lineOptions} height={240} />
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Subject</Th><Th>Score</Th><Th>Total</Th><Th>Grade</Th></Tr></Thead>
          <Tbody>
            {examRows.map((s,i)=> (
              <Tr key={`${s.id || i}`}>
                <Td>{s.subject}</Td>
                <Td>{s.marks}</Td>
                <Td>100</Td>
                <Td><Badge colorScheme='purple'>{s.grade || '-'}</Badge></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
}
