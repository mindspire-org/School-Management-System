import React, { useMemo } from 'react';
import { Box, Text, VStack, HStack, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdAssessment, MdPercent, MdStar } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents, mockExamResults } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function GradeCard(){
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

  const latest = useMemo(()=> mockExamResults[0], []);
  const totals = useMemo(()=>{
    const subs = latest.subjects || [];
    const totalScore = subs.reduce((a,s)=>a + (s.score||0), 0);
    const totalPossible = subs.reduce((a,s)=>a + (s.total||0), 0);
    const percent = totalPossible ? Math.round((totalScore/totalPossible)*100) : 0;
    const grade = percent>=90?'A+':percent>=80?'A':percent>=70?'B+':percent>=60?'B':percent>=50?'C':percent>=40?'D':'F';
    const best = subs.slice().sort((a,b)=> (b.score/b.total) - (a.score/a.total))[0];
    const weak = subs.slice().sort((a,b)=> (a.score/a.total) - (b.score/b.total))[0];
    return { totalScore, totalPossible, percent, grade, best, weak };
  },[latest]);

  const chartData = useMemo(()=> ([{ name:'Score', data:(latest.subjects||[]).map(s=>s.score) }]), [latest]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories:(latest.subjects||[]).map(s=>s.name) }, colors:['#805AD5'], dataLabels:{ enabled:false } }), [latest]);

  const exportCSV = () => {
    const header = ['Student','Exam','Subject','Score','Total','Grade'];
    const rows = (latest.subjects||[]).map(s => [student.name, latest.exam, s.name, s.score, s.total, s.grade]);
    const csv = [header, ...rows].map(r=> r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='student_grade_card.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Grade Card • {latest.exam}</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {student.class}{student.section}</Text>

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
            {(latest.subjects||[]).map((s,i)=> (
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
