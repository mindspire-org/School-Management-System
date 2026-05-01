import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdRefresh, MdCheckCircle, MdAccessTime, MdCancel, MdTrendingUp } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import LineChart from '../../../components/charts/LineChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { useAuth } from '../../../contexts/AuthContext';
import * as studentsApi from '../../../services/api/students';
import * as attendanceApi from '../../../services/api/attendance';

const buildRecentMonths = (count = 12) => {
  const now = new Date();
  return Array.from({ length: count }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - idx, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return {
      key: `${y}-${m}`,
      label: d.toLocaleString(undefined, { month: 'short', year: 'numeric' }),
    };
  });
};

const months = buildRecentMonths(12);

export default function MonthlyReport() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  useEffect(() => {
    let mounted = true;
    const loadSelf = async () => {
      try {
        const payload = await studentsApi.list({ pageSize: 1 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        if (mounted) setStudent(rows?.[0] || null);
      } catch {
        if (mounted) setStudent(null);
      }
    };
    if (user?.role === 'student') loadSelf();
    return () => { mounted = false; };
  }, [user?.role]);

  useEffect(() => {
    const sid = student?.id;
    if (!sid || !selectedMonth?.key) return;

    const year = Number(String(selectedMonth.key).slice(0, 4));
    const month = Number(String(selectedMonth.key).slice(5, 7));
    if (!year || !month) return;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    const load = async () => {
      setLoading(true);
      try {
        const res = await attendanceApi.list({ studentId: sid, startDate, endDate, pageSize: 200 });
        setRecords(Array.isArray(res?.items) ? res.items : []);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [student?.id, selectedMonth?.key]);

  const daily = useMemo(() => {
    const year = Number(String(selectedMonth.key).slice(0, 4));
    const month = Number(String(selectedMonth.key).slice(5, 7));
    const daysInMonth = new Date(year, month, 0).getDate();
    const byDate = new Map();
    (records || []).forEach((r) => {
      const key = String(r?.date || '').slice(0, 10);
      if (key) byDate.set(key, r);
    });

    const list = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      const key = d.toISOString().slice(0, 10);
      const rec = byDate.get(key);
      let status = 'Not Marked';
      if (rec?.status === 'present') status = 'Present';
      else if (rec?.status === 'late') status = 'Late';
      else if (rec?.status === 'absent') status = 'Absent';
      else if (rec?.status === 'leave') status = 'Leave';
      list.push({ day: i, status, in: rec?.checkInTime || '-', out: rec?.checkOutTime || '-' });
    }
    return list;
  }, [records, selectedMonth?.key]);

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
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {(student?.name || user?.name || '')}
        {student?.rollNumber ? ` • Roll ${student.rollNumber}` : ''}
        {student?.class ? ` • Class ${student.class}${student.section || ''}` : ''}
      </Text>

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

      {loading && (
        <Text fontSize='sm' color={textSecondary} mb='12px'>Loading...</Text>
      )}

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
