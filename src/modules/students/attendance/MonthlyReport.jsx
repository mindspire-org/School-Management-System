import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdRefresh, MdCheckCircle, MdAccessTime, MdCancel, MdTrendingUp } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

const months = [
  { key: '2025-01', label: 'Jan 2025', days: 31 },
  { key: '2025-02', label: 'Feb 2025', days: 28 },
  { key: '2025-03', label: 'Mar 2025', days: 31 },
  { key: '2025-04', label: 'Apr 2025', days: 30 },
  { key: '2025-05', label: 'May 2025', days: 31 },
];

export default function MonthlyReport() {
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
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const daily = useMemo(() => {
    const d = [];
    for (let i = 1; i <= selectedMonth.days; i++) {
      // Simple patterned mock: weekends absent on every 7th day, else present; day 5, 15, 25 late
      const isLate = i % 10 === 5;
      const isAbsent = i % 7 === 0;
      const status = isAbsent ? 'Absent' : (isLate ? 'Late' : 'Present');
      d.push({ day: i, status, in: isAbsent ? '-' : (isLate ? '08:35 AM' : '08:15 AM'), out: isAbsent ? '-' : '01:45 PM' });
    }
    return d;
  }, [selectedMonth]);

  const summary = useMemo(() => {
    const present = daily.filter(x => x.status === 'Present').length;
    const late = daily.filter(x => x.status === 'Late').length;
    const absent = daily.filter(x => x.status === 'Absent').length;
    const percent = Math.round(((present + late) / daily.length) * 100);
    return { present, late, absent, percent };
  }, [daily]);

  const lineData = useMemo(() => ([{ name: 'Presence', data: daily.map(x => x.status === 'Absent' ? 0 : (x.status === 'Late' ? 0.8 : 1)) }]), [daily]);
  const lineOptions = useMemo(() => ({ xaxis: { categories: daily.map(x => String(x.day)) }, colors: ['#01B574'], dataLabels: { enabled: false } }), [daily]);

  const barData = useMemo(() => ([{ name: 'Counts', data: [summary.present, summary.late, summary.absent] }]), [summary]);
  const barOptions = useMemo(() => ({ xaxis: { categories: ['Present','Late','Absent'] }, colors: ['#3182CE'] }), [summary]);

  const exportCSV = () => {
    const header = ['Day','Status','Check-In','Check-Out'];
    const rows = daily.map(r => [r.day, r.status, r.in, r.out]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'student_monthly_attendance.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Monthly Attendance</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {student.class}{student.section}</Text>

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' flexWrap='wrap' rowGap={3}>
          <HStack>
            <Text fontWeight='600'>Select month:</Text>
            <Select size='sm' value={selectedMonth.key} onChange={e => setSelectedMonth(months.find(m => m.key === e.target.value))} maxW='200px'>
              {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />}>Print</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={() => setSelectedMonth(months[0])}>Reset</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </HStack>
      </Card>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Present'
            value={String(summary.present)}
            trendData={[1,1,2,2,3]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />}
            name='Late'
            value={String(summary.late)}
            trendData={[0,1,1,1,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdCancel} w='22px' h='22px' color='white' />} />}
            name='Absent'
            value={String(summary.absent)}
            trendData={[0,0,1,1,1]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdTrendingUp} w='22px' h='22px' color='white' />} />}
            name='Attendance %'
            value={`${summary.percent}%`}
            trendData={[50,60,70,75,summary.percent]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='16px' mb='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Daily Presence (Line)</Text>
          <LineChart chartData={lineData} chartOptions={lineOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='bold' mb='8px'>Summary (Bar)</Text>
          <BarChart chartData={barData} chartOptions={barOptions} height={220} />
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Day</Th><Th>Status</Th><Th>Check-In</Th><Th>Check-Out</Th></Tr></Thead>
          <Tbody>
            {daily.map((r) => (
              <Tr key={r.day}>
                <Td>{r.day}</Td>
                <Td><Badge colorScheme={r.status==='Present'?'green':(r.status==='Late'?'yellow':'red')}>{r.status}</Badge></Td>
                <Td>{r.in}</Td>
                <Td>{r.out}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
}
