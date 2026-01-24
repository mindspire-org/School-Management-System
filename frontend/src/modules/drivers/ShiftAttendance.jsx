import React, { useMemo, useState } from 'react';
import { Box, SimpleGrid, Text, HStack, VStack, Badge, Icon, useColorModeValue, Button, Table, Thead, Tr, Th, Tbody, Td, Select, Input, useToast, Tooltip, IconButton } from '@chakra-ui/react';
import { MdAccessTime, MdPlayArrow, MdStop, MdDownload } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';
import BarChart from '../../components/charts/BarChart';
import SparklineChart from '../../components/charts/SparklineChart';

export default function ShiftAttendance() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const [onDuty, setOnDuty] = useState(false);
  const [since, setSince] = useState('');
  const [month, setMonth] = useState('2025-11');
  const [query, setQuery] = useState('');

  const logs = useMemo(() => ([
    { date: '2025-11-18', day: 'Tue', start: '07:30 AM', end: '02:35 PM', hours: 7.1, remarks: 'On time' },
    { date: '2025-11-19', day: 'Wed', start: '07:31 AM', end: '02:34 PM', hours: 7.0, remarks: 'On time' },
    { date: '2025-11-20', day: 'Thu', start: '07:45 AM', end: '02:42 PM', hours: 6.9, remarks: 'Late 15m' },
    { date: '2025-11-21', day: 'Fri', start: '07:29 AM', end: '02:30 PM', hours: 7.0, remarks: 'On time' },
    { date: '2025-11-22', day: 'Sat', start: '08:00 AM', end: '01:00 PM', hours: 5.0, remarks: 'Half day' },
  ]), []);

  const weeklyHours = [7.1, 7.0, 6.9, 7.0, 5.0, 0, 0];
  const presentDays = 22;
  const absentDays = 2;
  const leaveDays = 1;

  const filteredLogs = useMemo(() => {
    if (!query.trim()) return logs;
    const q = query.toLowerCase();
    return logs.filter(l => l.date.includes(q) || l.remarks.toLowerCase().includes(q));
  }, [logs, query]);

  const exportCSV = () => {
    const header = ['Date','Day','Start','End','Hours','Remarks'];
    const rows = filteredLogs.map(l => [l.date,l.day,l.start,l.end,l.hours,l.remarks]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `shift_logs_${month}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Shift & Attendance</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Start/End shift, view logs, and attendance metrics</Text>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing='20px'>
        <Card p='16px'>
          <HStack justify='space-between' mb='10px'>
            <HStack>
              <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />
              <VStack align='start' spacing={0}>
                <Text fontWeight='600'>Current Shift</Text>
                <Text fontSize='sm' color={textSecondary}>{onDuty ? `On duty • since ${since}` : 'Off duty'}</Text>
              </VStack>
            </HStack>
            <HStack>
              <Button size='sm' leftIcon={<MdPlayArrow />} onClick={()=>{ setOnDuty(true); const t=new Date().toLocaleTimeString(); setSince(t); toast({ status:'success', title:'Shift started' }); }}>Start</Button>
              <Button size='sm' variant='outline' leftIcon={<MdStop />} onClick={()=>{ if(!onDuty){ toast({ status:'info', title:'Not on duty' }); return; } setOnDuty(false); toast({ status:'success', title:'Shift ended' }); }}>End</Button>
            </HStack>
          </HStack>
          <Box mt='6px'>
            <SparklineChart data={[2,3,3,4,5,4,6,5,5,6,7,6]} color='#01B574' height={60} valueFormatter={(v)=>`${v} hrs`} />
          </Box>
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold'>Weekly Hours</Text>
          <BarChart height={220} chartData={[{ name: 'Hours', data: weeklyHours }]} chartOptions={{ xaxis: { categories: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, colors:['#4481EB'], tooltip:{ enabled:true, shared:true } }} />
        </Card>
        <Card p='16px'>
          <SimpleGrid columns={3} spacing='12px'>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Present</Text>
              <Text fontWeight='700'>{presentDays} days</Text>
            </Card>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Absent</Text>
              <Text fontWeight='700'>{absentDays} days</Text>
            </Card>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Leave</Text>
              <Text fontWeight='700'>{leaveDays} days</Text>
            </Card>
          </SimpleGrid>
        </Card>
      </SimpleGrid>

      <Card p='16px' mt='20px'>
        <HStack justify='space-between' mb='12px' flexWrap='wrap' rowGap={2}>
          <HStack>
            <Select size='sm' value={month} onChange={e=>setMonth(e.target.value)}>
              <option value='2025-11'>Nov 2025</option>
              <option value='2025-10'>Oct 2025</option>
              <option value='2025-09'>Sep 2025</option>
            </Select>
            <Input size='sm' placeholder='Search remarks/date...' value={query} onChange={e=>setQuery(e.target.value)} />
          </HStack>
          <HStack>
            <Button size='sm' leftIcon={<MdDownload />} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </HStack>
        <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
          <Box maxH='360px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                <Tr>
                  <Th>Date</Th>
                  <Th>Day</Th>
                  <Th>Start</Th>
                  <Th>End</Th>
                  <Th isNumeric>Hours</Th>
                  <Th>Remarks</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map(l => (
                  <Tr key={l.date}>
                    <Td>{l.date}</Td>
                    <Td>{l.day}</Td>
                    <Td>{l.start}</Td>
                    <Td>{l.end}</Td>
                    <Td isNumeric>{l.hours.toFixed(1)}</Td>
                    <Td maxW='300px'><Text noOfLines={1}>{l.remarks}</Text></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
