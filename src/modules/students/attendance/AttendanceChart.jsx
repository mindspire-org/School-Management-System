import React, { useMemo } from 'react';
import { Box, Text, SimpleGrid, VStack, useColorModeValue, Flex, Icon } from '@chakra-ui/react';
import Card from '../../../components/card/Card';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { MdCheckCircle, MdAccessTime, MdCancel } from 'react-icons/md';

export default function AttendanceChart() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user } = useAuth();
  const student = useMemo(() => {
    if (user?.role === 'student') {
      const byEmail = mockStudents.find(s => s.email?.toLowerCase() === user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s => s.name?.toLowerCase() === user.name?.toLowerCase());
      if (byName) return byName;
      return { id: 999, name: user.name, rollNumber: 'STU999', class: '10', section: 'A', email: user.email };
    }
    return mockStudents[0];
  }, [user]);

  // Build 30-day synthetic presence data for this student
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);
  const presence = useMemo(() => days.map(d => (d % 7 === 0 ? 'Absent' : (d % 10 === 5 ? 'Late' : 'Present'))), [days]);
  const presenceScore = useMemo(() => presence.map(s => (s === 'Absent' ? 0 : (s === 'Late' ? 0.8 : 1))), [presence]);
  const counts = useMemo(() => ({
    present: presence.filter(s => s === 'Present').length,
    late: presence.filter(s => s === 'Late').length,
    absent: presence.filter(s => s === 'Absent').length,
  }), [presence]);

  const lineData = useMemo(() => ([{ name: 'Presence Index', data: presenceScore }]), [presenceScore]);
  const lineOptions = useMemo(() => ({
    xaxis: { categories: days.map(String) },
    colors: ['#01B574'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
  }), [days]);

  const barData = useMemo(() => ([{ name: 'Count', data: [counts.present, counts.late, counts.absent] }]), [counts]);
  const barOptions = useMemo(() => ({
    xaxis: { categories: ['Present','Late','Absent'] },
    colors: ['#667eea'],
    dataLabels: { enabled: false },
  }), []);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Attendance Charts</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {student.class}{student.section}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Present (30d)'
            value={String(counts.present)}
            trendData={[10,12,14,15,counts.present]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />}
            name='Late (30d)'
            value={String(counts.late)}
            trendData={[2,3,4,4,counts.late]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdCancel} w='22px' h='22px' color='white' />} />}
            name='Absent (30d)'
            value={String(counts.absent)}
            trendData={[1,1,1,2,counts.absent]}
            trendColor='#f5576c'
          />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Presence over 30 days</Text>
          <LineChart chartData={lineData} chartOptions={lineOptions} height={240} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Distribution</Text>
          <BarChart chartData={barData} chartOptions={barOptions} height={240} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
