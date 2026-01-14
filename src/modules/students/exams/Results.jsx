import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Select, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdLibraryBooks, MdAssessment, MdPercent, MdCheckCircle } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents, mockExamResults } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function Results(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();

  const student = useMemo(()=>{
    if (user?.role==='student'){
      const byEmail = mockStudents.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s=>s.name?.toLowerCase()===user.name?.toLowerCase());
      if (byName) return byName;
      return { id:999, name:user.name, rollNumber:'STU999', class:'10', section:'A', email:user.email };
    }
    return mockStudents[0];
  },[user]);

  const [examKey, setExamKey] = useState(mockExamResults[0]?.id || 1);
  const exam = useMemo(()=> mockExamResults.find(e=>String(e.id)===String(examKey)) || mockExamResults[0], [examKey]);

  const totals = useMemo(()=>{
    const subs = exam.subjects || [];
    const totalScore = subs.reduce((a,s)=>a + (s.score||0), 0);
    const totalPossible = subs.reduce((a,s)=>a + (s.total||0), 0);
    const percent = totalPossible ? Math.round((totalScore/totalPossible)*100) : 0;
    const passCount = subs.filter(s=> (s.score||0) >= (s.total*0.4)).length;
    return { totalScore, totalPossible, percent, passCount, subjects: subs.length };
  }, [exam]);

  const chartData = useMemo(()=> ([{ name:'Score', data:(exam.subjects||[]).map(s=>s.score) }]), [exam]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories:(exam.subjects||[]).map(s=>s.name) }, colors:['#3182CE'], dataLabels:{ enabled:false } }), [exam]);
  const lineData = useMemo(()=> ([{ name:'% Across Exams', data: mockExamResults.map(e => Math.round((e.totalScore||e.subjects.reduce((a,s)=>a+(s.score||0),0)) / (e.totalPossible||e.subjects.reduce((a,s)=>a+(s.total||0),0)) * 100)) }]), []);
  const lineOptions = useMemo(()=> ({ xaxis:{ categories: mockExamResults.map(e=>e.exam) }, colors:['#01B574'], dataLabels:{ enabled:false }, stroke:{ curve:'smooth', width:3 } }), []);

  const exportCSV = () => {
    const header = ['Exam','Subject','Score','Total','Grade'];
    const rows = (exam.subjects||[]).map(s => [exam.exam, s.name, s.score, s.total, s.grade]);
    const csv = [header, ...rows].map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='student_results.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Results</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {student.class}{student.section}</Text>

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' flexWrap='wrap' rowGap={3}>
          <HStack>
            <Text fontWeight='600'>Select Exam:</Text>
            <Select size='sm' value={examKey} onChange={e=>setExamKey(e.target.value)} maxW='220px'>
              {mockExamResults.map(e => <option key={e.id} value={e.id}>{e.exam}</option>)}
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
            {(exam.subjects||[]).map((s,i)=> (
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
    </Box>
  );
}
