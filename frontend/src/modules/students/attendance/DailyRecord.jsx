import React, { useMemo } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Badge, Table, Thead, Tbody, Tr, Th, Td, Button, useColorModeValue, Icon, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdCheckCircle, MdTrendingUp, MdAccessTime } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents, mockAttendanceLogs } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function DailyRecord() {
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

  const todayLogs = useMemo(() => {
    const logs = mockAttendanceLogs.filter(l => l.studentName === student.name);
    if (logs.length > 0) return logs;
    return [
      { id: 's1', timestamp: '08:15:10 AM', studentName: student.name, studentId: student.rollNumber || 'STU999', rfidTag: 'RFID-SYN1', busNumber: 'BUS-001', status: 'Boarding', location: 'Main Gate' },
      { id: 's2', timestamp: '01:50:22 PM', studentName: student.name, studentId: student.rollNumber || 'STU999', rfidTag: 'RFID-SYN1', busNumber: 'BUS-001', status: 'Leaving', location: 'Main Gate' },
    ];
  }, [student]);

  const last7 = useMemo(() => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return days.map((d, i) => ({ day: d, status: i % 6 !== 5 ? 'Present' : 'Absent', in: '08:15 AM', out: '01:45 PM' }));
  }, []);

  const presentCount = last7.filter(d => d.status === 'Present').length;

  const chartData = useMemo(() => ([{ name: 'Present', data: last7.map(d => d.status === 'Present' ? 1 : 0) }]), [last7]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: last7.map(d => d.day) }, colors: ['#01B574'], dataLabels: { enabled: false }, yaxis: { max: 1 }, tooltip:{ enabled:true, y:{ formatter:(v)=> String(v) } } }), [last7]);

  const lineData = useMemo(() => ([{ name: 'Presence Index', data: last7.map(d => d.status === 'Present' ? 1 : 0) }]), [last7]);
  const lineOptions = useMemo(() => ({ xaxis: { categories: last7.map(d => d.day) }, colors: ['#3182CE'], dataLabels: { enabled: false }, stroke:{ curve:'smooth', width:3 }, tooltip:{ enabled:true, y:{ formatter:(v)=> String(v) } } }), [last7]);

  const exportCSV = () => {
    const header = ['Day','Status','Check-In','Check-Out'];
    const rows = last7.map(r => [r.day, r.status, r.in, r.out]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'student_daily_record.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Daily Attendance</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {student.class}{student.section}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Present (7d)'
            value={`${presentCount}/7`}
            trendData={[5,6,6,7,presentCount]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdTrendingUp} w='22px' h='22px' color='white' />} />}
            name='Attendance %'
            value={`${Math.round((presentCount/7)*100)}%`}
            trendData={[70,75,80,85,Math.round((presentCount/7)*100)]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />}
            name='Today Logs'
            value={String(todayLogs.length)}
            trendData={[1,1,2,2,2]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' mb='12px'>
          <Text fontWeight='bold'>Last 7 Days</Text>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />}>Print</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </HStack>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Day</Th><Th>Status</Th><Th>Check-In</Th><Th>Check-Out</Th></Tr></Thead>
          <Tbody>
            {last7.map((r, i) => (
              <Tr key={i}>
                <Td>{r.day}</Td>
                <Td><Badge colorScheme={r.status==='Present'?'green':'red'}>{r.status}</Badge></Td>
                <Td>{r.in}</Td>
                <Td>{r.out}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px'>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Presence Trend (7 days)</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontSize='md' fontWeight='bold' mb='8px'>Presence Line (7 days)</Text>
          <LineChart chartData={lineData} chartOptions={lineOptions} height={220} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
