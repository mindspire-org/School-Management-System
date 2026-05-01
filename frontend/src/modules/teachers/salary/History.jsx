import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
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
  Spinner,
  Center,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdPrint, MdSearch, MdSavings, MdDateRange, MdAttachMoney } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { useAuth } from '../../../contexts/AuthContext';
import * as teachersApi from '../../../services/api/teachers';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SalaryHistory() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const { user } = useAuth();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [q, setQ] = useState('');
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (user?.role !== 'teacher') return;
      setLoading(true);
      setError(null);
      try {
        const data = await teachersApi.getPayrolls({});
        const rows = Array.isArray(data) ? data : [];
        // Normalize payroll rows from backend field names
        const normalized = rows.map(r => {
          const rawMonth = r.period_month || r.periodMonth || '';
          let monthLabel = '';
          let yearLabel = '';
          if (rawMonth && rawMonth.length >= 7) {
            const d = new Date(`${rawMonth}-01`);
            monthLabel = monthNames[d.getMonth()] || '';
            yearLabel = String(d.getFullYear());
          }
          const grossRaw = Number(r.base_salary ?? r.baseSalary ?? 0) + Number(r.allowances ?? 0) + Number(r.bonuses ?? 0);
          const deductionsRaw = Number(r.deductions ?? 0);
          const netRaw = grossRaw - deductionsRaw;
          const status = r.status === 'paid' ? 'Paid' : 'Unpaid';
          const paidOn = r.paid_on || r.paidOn || '';
          return {
            id: r.id,
            month: monthLabel,
            year: yearLabel,
            gross: grossRaw,
            deductions: deductionsRaw,
            net: netRaw,
            status,
            paidOn,
          };
        });
        setPayrolls(normalized);
      } catch (e) {
        setError(e?.data?.message || e?.message || 'Failed to load salary history');
        setPayrolls([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const filtered = useMemo(() => payrolls.filter(r => {
    const monthIdx = monthNames.indexOf(r.month) + 1;
    const date = `${r.year}-${String(monthIdx).padStart(2, '0')}-01`;
    const matchDate = (!from || date >= from) && (!to || date <= to);
    const matchStatus = (statusFilter === 'All' || r.status === statusFilter);
    const inQ = !q || `${r.month} ${r.year}`.toLowerCase().includes(q.toLowerCase());
    return matchDate && matchStatus && inQ;
  }), [payrolls, from, to, statusFilter, q]);

  const kpis = useMemo(() => {
    const totalPaid = filtered.reduce((s, r) => s + r.net, 0);
    const months = filtered.length;
    const avg = months ? Math.round(totalPaid / months) : 0;
    return { totalPaid, months, avg };
  }, [filtered]);

  const chartData = useMemo(() => ([{ name: 'Net Pay', data: filtered.slice(0, 6).map(r => r.net).reverse() }]), [filtered]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: filtered.slice(0, 6).map(r => `${r.month} ${r.year}`).reverse() }, colors: ['#2F855A'], dataLabels: { enabled: false } }), [filtered]);

  const statusDistribution = useMemo(() => {
    const map = { Paid: 0, Unpaid: 0 };
    filtered.forEach(r => { map[r.status] = (map[r.status] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Month', 'Year', 'Gross', 'Deductions', 'Net', 'Status', 'Paid On'];
    const rows = filtered.map(r => [r.month, r.year, r.gross, r.deductions, r.net, r.status, r.paidOn]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'salary_history.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Salary History</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>View previous payslips and download</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdSavings color='white' />} />} name='Total Paid' value={`PKR ${kpis.totalPaid.toLocaleString()}`} trendData={[80, 90, 85, 95, 100, 110]} trendColor='#01B574' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdDateRange color='white' />} />} name='Months' value={String(kpis.months)} trendData={[1, 2, 3, 4, 5, 6]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdAttachMoney color='white' />} />} name='Average' value={`PKR ${kpis.avg.toLocaleString()}`} trendData={[70, 75, 80, 78, 82, 85]} trendColor='#B721FF' />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Input type='date' value={from} onChange={e => setFrom(e.target.value)} size='sm' maxW='180px' placeholder='From' />
            <Input type='date' value={to} onChange={e => setTo(e.target.value)} size='sm' maxW='180px' placeholder='To' />
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size='sm' maxW='160px'>
              <option>All</option>
              <option>Paid</option>
              <option>Unpaid</option>
            </Select>
            <HStack>
              <Input placeholder='Search month/year' value={q} onChange={e => setQ(e.target.value)} size='sm' maxW='220px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' />
            </HStack>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={() => { setFrom(''); setTo(''); setStatusFilter('All'); setQ(''); }}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={() => window.print()}>Print</Button>
            <Button size='sm' colorScheme='green' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV} isDisabled={filtered.length === 0}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      {loading && <Center py={10}><Spinner size='xl' color='blue.500' /></Center>}

      {!loading && error && (
        <Card p='16px' mb='16px'>
          <Text color='red.500'>{error}</Text>
        </Card>
      )}

      {!loading && !error && (
        <>
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
                        <Td isNumeric>PKR {r.gross.toLocaleString()}</Td>
                        <Td isNumeric>PKR {r.deductions.toLocaleString()}</Td>
                        <Td isNumeric>PKR {r.net.toLocaleString()}</Td>
                        <Td><Badge colorScheme={r.status === 'Paid' ? 'green' : 'orange'}>{r.status}</Badge></Td>
                        <Td>{r.paidOn ? new Date(r.paidOn).toLocaleDateString() : '—'}</Td>
                      </Tr>
                    ))}
                    {filtered.length === 0 && (
                      <Tr><Td colSpan={6} textAlign='center' py={8} color={textSecondary}>No salary records found.</Td></Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Card>

          <Box display='grid' gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
            <Card p='16px'>
              <Text fontWeight='700' mb='8px'>Net Pay (Last 6)</Text>
              <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
            </Card>
            <Card p='16px'>
              <Text fontWeight='700' mb='8px'>Status Distribution</Text>
              <PieChart height={240} chartData={statusDistribution.values} chartOptions={{ labels: statusDistribution.labels, legend: { position: 'right' } }} />
            </Card>
          </Box>
        </>
      )}
    </Box>
  );
}
