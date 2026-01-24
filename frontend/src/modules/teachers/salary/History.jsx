import React, { useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Select,
  Input,
  Button,
  Icon,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdPrint, MdSearch, MdSavings, MdDateRange, MdAttachMoney } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const seedHistory = [
  { id: 1, month: 'Jun', year: '2025', gross: 116000, deductions: 22000, net: 94000, status: 'Paid', paidOn: '2025-06-30' },
  { id: 2, month: 'May', year: '2025', gross: 116000, deductions: 21000, net: 95000, status: 'Paid', paidOn: '2025-05-31' },
  { id: 3, month: 'Apr', year: '2025', gross: 116000, deductions: 20000, net: 96000, status: 'Paid', paidOn: '2025-04-30' },
  { id: 4, month: 'Mar', year: '2025', gross: 116000, deductions: 23000, net: 93000, status: 'Paid', paidOn: '2025-03-31' },
  { id: 5, month: 'Feb', year: '2025', gross: 116000, deductions: 21000, net: 95000, status: 'Paid', paidOn: '2025-02-28' },
  { id: 6, month: 'Jan', year: '2025', gross: 116000, deductions: 22000, net: 94000, status: 'Paid', paidOn: '2025-01-31' },
];

export default function SalaryHistory() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [status, setStatus] = useState('All');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => seedHistory.filter(r => {
    const date = `${r.year}-${String(monthNames.indexOf(r.month)+1).padStart(2,'0')}-01`;
    const matchDate = (!from || date >= from) && (!to || date <= to);
    const matchStatus = (status === 'All' || r.status === status);
    const inQ = !q || `${r.month} ${r.year}`.toLowerCase().includes(q.toLowerCase());
    return matchDate && matchStatus && inQ;
  }), [from, to, status, q]);

  const kpis = useMemo(() => {
    const totalPaid = filtered.reduce((s, r) => s + r.net, 0);
    const months = filtered.length;
    const avg = months ? Math.round(totalPaid / months) : 0;
    return { totalPaid, months, avg };
  }, [filtered]);

  const chartData = useMemo(() => ([{ name: 'Net Pay', data: filtered.slice(0, 6).map(r => r.net).reverse() }]), [filtered]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: filtered.slice(0, 6).map(r => `${r.month} ${r.year}`).reverse() }, colors: ['#2F855A'] }), [filtered]);

  const statusDistribution = useMemo(() => {
    const map = { Paid: 0, Unpaid: 0 };
    filtered.forEach(r => { map[r.status] = (map[r.status] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Month','Year','Gross','Deductions','Net','Status','Paid On'];
    const rows = filtered.map(r => [r.month, r.year, r.gross, r.deductions, r.net, r.status, r.paidOn]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'salary_history.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Salary History</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>View previous payslips and download</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdSavings color='white' />} />} name='Total Paid' value={`₹${kpis.totalPaid.toLocaleString()}`} trendData={[80,90,85,95,100,110]} trendColor='#01B574' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdDateRange color='white' />} />} name='Months' value={String(kpis.months)} trendData={[1,2,3,4,5,6]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdAttachMoney color='white' />} />} name='Average' value={`₹${kpis.avg.toLocaleString()}`} trendData={[70,75,80,78,82,85]} trendColor='#B721FF' />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Input type='date' value={from} onChange={e=>setFrom(e.target.value)} size='sm' maxW='180px' placeholder='From' />
            <Input type='date' value={to} onChange={e=>setTo(e.target.value)} size='sm' maxW='180px' placeholder='To' />
            <Select value={status} onChange={e=>setStatus(e.target.value)} size='sm' maxW='160px'>
              <option>All</option>
              <option>Paid</option>
              <option>Unpaid</option>
            </Select>
            <HStack>
              <Input placeholder='Search month/year' value={q} onChange={e=>setQ(e.target.value)} size='sm' maxW='220px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{ setFrom(''); setTo(''); setStatus('All'); setQ(''); }}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint}/>} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='green' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0' mb='16px'>
        <Box overflowX='auto'>
          <Box minW='800px'>
            <Table size='sm' variant='striped' colorScheme='gray'>
              <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
                <Tr>
                  <Th>Month</Th>
                  <Th isNumeric>Gross</Th>
                  <Th isNumeric>Deductions</Th>
                  <Th isNumeric>Net</Th>
                  <Th>Status</Th>
                  <Th>Paid On</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(r => (
                  <Tr key={r.id} _hover={{ bg: hoverBg }}>
                    <Td>{r.month} {r.year}</Td>
                    <Td isNumeric>₹{r.gross.toLocaleString()}</Td>
                    <Td isNumeric>₹{r.deductions.toLocaleString()}</Td>
                    <Td isNumeric>₹{r.net.toLocaleString()}</Td>
                    <Td><Badge colorScheme={r.status==='Paid'?'green':'orange'}>{r.status}</Badge></Td>
                    <Td>{r.paidOn}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Net Pay (Last 6)</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Status Distribution</Text>
          <PieChart height={240} chartData={statusDistribution.values} chartOptions={{ labels: statusDistribution.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
