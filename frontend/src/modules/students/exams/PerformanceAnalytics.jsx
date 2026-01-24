import React, { useMemo } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, useColorModeValue, Flex, Icon } from '@chakra-ui/react';
import Card from '../../../components/card/Card';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { MdTrendingUp, MdTimeline, MdStar, MdArrowDownward } from 'react-icons/md';
import { mockStudents, mockExamResults } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function percentForExam(e){
  const totalScore = (e.totalScore || e.subjects.reduce((a,s)=>a + (s.score||0),0));
  const totalPossible = (e.totalPossible || e.subjects.reduce((a,s)=>a + (s.total||0),0));
  return totalPossible ? Math.round((totalScore/totalPossible)*100) : 0;
}

export default function PerformanceAnalytics(){
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

  const exams = useMemo(()=> mockExamResults || [], []);
  const percents = useMemo(()=> exams.map(percentForExam), [exams]);
  const averagePercent = useMemo(()=> percents.length? Math.round(percents.reduce((a,b)=>a+b,0)/percents.length):0, [percents]);
  const predictedNext = useMemo(()=> {
    if (percents.length >= 3) {
      // Weighted moving average: recent exams higher weight
      const w = [1,2,3];
      const last3 = percents.slice(-3);
      const sum = last3.reduce((acc,v,i)=> acc + v*w[i], 0);
      const ws = w.slice(0,last3.length).reduce((a,b)=>a+b,0);
      return Math.round(sum/ws);
    }
    return averagePercent;
  }, [percents, averagePercent]);

  const subjects = useMemo(()=> {
    const map = new Map();
    exams.forEach(e => (e.subjects||[]).forEach(s => {
      if (!map.has(s.name)) map.set(s.name, { total:0, count:0 });
      const v = map.get(s.name); v.total += (s.score||0)/(s.total||1); v.count += 1; map.set(s.name, v);
    }));
    return Array.from(map.entries()).map(([name, { total, count }]) => ({ name, avg: Math.round((total/count)*100) }));
  }, [exams]);

  const bestSubject = useMemo(()=> subjects.slice().sort((a,b)=>b.avg-a.avg)[0]?.name || '-', [subjects]);
  const weakSubject = useMemo(()=> subjects.slice().sort((a,b)=>a.avg-b.avg)[0]?.name || '-', [subjects]);

  const lineData = useMemo(()=> ([{ name:'% by Exam', data: percents }]), [percents]);
  const lineOptions = useMemo(()=> ({ xaxis:{ categories: exams.map(e=>e.exam) }, colors:['#01B574'], dataLabels:{ enabled:false }, stroke:{ curve:'smooth', width:3 } }), [exams]);

  const subjectBarData = useMemo(()=> ([{ name:'Avg %', data: subjects.map(s=>s.avg) }]), [subjects]);
  const subjectBarOptions = useMemo(()=> ({ xaxis:{ categories: subjects.map(s=>s.name) }, colors:['#805AD5'], dataLabels:{ enabled:false } }), [subjects]);

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Performance Analytics</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {student.class}{student.section}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdTrendingUp} w='22px' h='22px' color='white' />} />}
            name='Average %'
            value={`${averagePercent}%`}
            trendData={[60,70,75,80,averagePercent]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdTimeline} w='22px' h='22px' color='white' />} />}
            name='Predicted Next %'
            value={`${predictedNext}%`}
            trendData={[65,72,78,82,predictedNext]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdStar} w='22px' h='22px' color='white' />} />}
            name='Best Subject'
            value={bestSubject}
            trendData={[1,1,2,2,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdArrowDownward} w='22px' h='22px' color='white' />} />}
            name='Weakest Subject'
            value={weakSubject}
            trendData={[2,2,1,1,1]}
            trendColor='#f5576c'
          />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px' mb='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Exam Percent Trend</Text>
          <LineChart chartData={lineData} chartOptions={lineOptions} height={240} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Average by Subject</Text>
          <BarChart chartData={subjectBarData} chartOptions={subjectBarOptions} height={240} />
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead>
            <Tr>
              <Th>Subject</Th>
              {exams.map(e => <Th key={e.id}>{e.exam}</Th>)}
              <Th>Avg %</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subjects.map(s => (
              <Tr key={s.name}>
                <Td>{s.name}</Td>
                {exams.map(e => {
                  const sub = (e.subjects||[]).find(x => x.name === s.name) || { score: 0, total: 1 };
                  const pct = Math.round((sub.score/sub.total)*100);
                  const color = pct>=85?'green':pct>=70?'blue':pct>=50?'yellow':'red';
                  return <Td key={e.id}><Badge colorScheme={color}>{isFinite(pct)?pct:0}%</Badge></Td>;
                })}
                <Td><Badge colorScheme={s.avg>=85?'green':s.avg>=70?'blue':s.avg>=50?'yellow':'red'}>{s.avg}%</Badge></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
}
