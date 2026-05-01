import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Select,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  Center,
  Text as ChakraText,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdPrint, MdVisibility, MdAttachMoney, MdRemoveCircleOutline, MdCheckCircle, MdEvent } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { useAuth } from '../../../contexts/AuthContext';
import * as teachersApi from '../../../services/api/teachers';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthlyPayslip() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const { user } = useAuth();

  const now = new Date();
  const [month, setMonth] = useState(monthNames[now.getMonth()]);
  const [year, setYear] = useState(String(now.getFullYear()));
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [payroll, setPayroll] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Build YYYY-MM string for the selected month/year
  const periodMonth = useMemo(() => {
    const idx = monthNames.indexOf(month) + 1;
    return `${year}-${String(idx).padStart(2, '0')}`;
  }, [month, year]);

  useEffect(() => {
    // Fetch teacher profile for display info
    const loadTeacher = async () => {
      try {
        if (user?.role !== 'teacher') return;
        const res = await teachersApi.list({});
        const rows = Array.isArray(res?.rows) ? res.rows : [];
        if (rows.length) setTeacher(rows[0]);
      } catch (_) { setTeacher(null); }
    };
    loadTeacher();
  }, [user]);

  useEffect(() => {
    const loadPayroll = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await teachersApi.getPayrolls({ month: periodMonth });
        const rows = Array.isArray(data) ? data : [];
        // Use the latest payroll for the selected month, or null if none
        setPayroll(rows.length > 0 ? rows[0] : null);
      } catch (e) {
        setError(e?.data?.message || e?.message || 'Failed to load payroll');
        setPayroll(null);
      } finally {
        setLoading(false);
      }
    };
    loadPayroll();
  }, [periodMonth]);

  // Derive earnings/deductions breakdown from payroll fields
  const breakdown = useMemo(() => {
    if (!payroll) return { earnings: [], deductions: [] };
    const earnings = [
      { label: 'Basic Pay', amount: Number(payroll.base_salary ?? payroll.baseSalary ?? 0) },
    ];
    if (Number(payroll.allowances) > 0) earnings.push({ label: 'Allowances', amount: Number(payroll.allowances) });
    if (Number(payroll.bonuses) > 0) earnings.push({ label: 'Bonuses', amount: Number(payroll.bonuses) });
    const deductions = [];
    if (Number(payroll.deductions) > 0) deductions.push({ label: 'Deductions', amount: Number(payroll.deductions) });
    return { earnings, deductions };
  }, [payroll]);

  const earningsTotal = useMemo(() => breakdown.earnings.reduce((s, r) => s + r.amount, 0), [breakdown]);
  const deductionsTotal = useMemo(() => breakdown.deductions.reduce((s, r) => s + r.amount, 0), [breakdown]);
  const net = useMemo(() => earningsTotal - deductionsTotal, [earningsTotal, deductionsTotal]);

  const kpis = useMemo(() => ({
    gross: earningsTotal,
    deductions: deductionsTotal,
    net,
    paymentDate: `${month} ${year}`,
  }), [earningsTotal, deductionsTotal, net, month, year]);

  const chartData = useMemo(() => ([{ name: 'Amount', data: [earningsTotal, deductionsTotal, net] }]), [earningsTotal, deductionsTotal, net]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: ['Earnings', 'Deductions', 'Net'] }, colors: ['#3182CE'], dataLabels: { enabled: false } }), []);

  const exportCSV = () => {
    const header = ['Item', 'Type', 'Amount'];
    const rows = [
      ...breakdown.earnings.map(e => [e.label, 'Earning', e.amount]),
      ...breakdown.deductions.map(d => [d.label, 'Deduction', d.amount]),
      ['Total Earnings', '', earningsTotal],
      ['Total Deductions', '', deductionsTotal],
      ['Net', '', net],
    ];
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `payslip_${month}_${year}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Monthly Payslip</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {teacher?.name || user?.name || 'Teacher'}{teacher?.employeeId ? ` — ${teacher.employeeId}` : ''}
      </Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdAttachMoney color='white' />} />} name='Gross' value={`PKR ${kpis.gross.toLocaleString()}`} trendData={[60, 70, 65, 75, 80, 78]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FF6A88 0%,#FF99AC 100%)' icon={<MdRemoveCircleOutline color='white' />} />} name='Deductions' value={`PKR ${kpis.deductions.toLocaleString()}`} trendData={[10, 12, 11, 13, 12, 14]} trendColor='#FF6A88' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdCheckCircle color='white' />} />} name='Net Pay' value={`PKR ${kpis.net.toLocaleString()}`} trendData={[50, 58, 54, 62, 66, 64]} trendColor='#01B574' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdEvent color='white' />} />} name='Period' value={kpis.paymentDate} trendData={[1, 1, 1, 1, 1, 1]} trendColor='#B721FF' />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={month} onChange={e => setMonth(e.target.value)} size='sm' maxW='160px'>
              {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Select value={year} onChange={e => setYear(e.target.value)} size='sm' maxW='120px'>
              {['2024', '2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={() => { setMonth(monthNames[now.getMonth()]); setYear(String(now.getFullYear())); }}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={() => window.print()}>Print</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV} isDisabled={!payroll}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

      {loading && (
        <Center py={10}><Spinner size='xl' color='blue.500' /></Center>
      )}

      {!loading && error && (
        <Card p='16px' mb='16px'>
          <Text color='red.500'>{error}</Text>
        </Card>
      )}

      {!loading && !payroll && !error && (
        <Card p='16px' mb='16px'>
          <Text color={textSecondary} textAlign='center' py={6}>
            No payroll record found for <strong>{month} {year}</strong>. Please contact HR / Admin.
          </Text>
        </Card>
      )}

      {!loading && payroll && (
        <>
          <Card p='0' mb='16px'>
            <Box overflowX='auto'>
              <Box minW='760px'>
                <Table size='sm' variant='striped' colorScheme='gray'>
                  <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
                    <Tr>
                      <Th>Type</Th>
                      <Th>Item</Th>
                      <Th isNumeric>Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {breakdown.earnings.map((e, idx) => (
                      <Tr key={`e-${idx}`} _hover={{ bg: hoverBg }}>
                        <Td><Badge colorScheme='green'>Earning</Badge></Td>
                        <Td>{e.label}</Td>
                        <Td isNumeric>PKR {e.amount.toLocaleString()}</Td>
                      </Tr>
                    ))}
                    {breakdown.deductions.map((d, idx) => (
                      <Tr key={`d-${idx}`} _hover={{ bg: hoverBg }}>
                        <Td><Badge colorScheme='red'>Deduction</Badge></Td>
                        <Td>{d.label}</Td>
                        <Td isNumeric>PKR {d.amount.toLocaleString()}</Td>
                      </Tr>
                    ))}
                    <Tr><Td></Td><Td fontWeight='700'>Total Earnings</Td><Td isNumeric fontWeight='700'>PKR {earningsTotal.toLocaleString()}</Td></Tr>
                    <Tr><Td></Td><Td fontWeight='700'>Total Deductions</Td><Td isNumeric fontWeight='700'>PKR {deductionsTotal.toLocaleString()}</Td></Tr>
                    <Tr><Td></Td><Td fontWeight='800'>Net</Td><Td isNumeric fontWeight='800'>PKR {net.toLocaleString()}</Td></Tr>
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </Card>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb='16px'>
            <Card p='16px'>
              <Text fontWeight='700' mb='8px'>Earnings / Deductions / Net</Text>
              <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
            </Card>
            <Card p='16px'>
              <Text fontWeight='700' mb='8px'>Earnings vs Deductions</Text>
              <PieChart height={240} chartData={[earningsTotal, deductionsTotal]} chartOptions={{ labels: ['Earnings', 'Deductions'], legend: { position: 'right' } }} />
            </Card>
          </SimpleGrid>

          <Card p='16px'>
            <Flex justify='space-between' align='center'>
              <Text fontWeight='600' color={textSecondary}>Payment Status: <Badge colorScheme={payroll.status === 'paid' ? 'green' : 'orange'}>{payroll.status || 'pending'}</Badge></Text>
              <Button size='sm' leftIcon={<Icon as={MdVisibility} />} onClick={onOpen}>View Details</Button>
            </Flex>
          </Card>

          <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Payslip Details — {month} {year}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack align='start' spacing={2} fontSize='sm'>
                  <HStack><Text fontWeight='600'>Employee:</Text><Text>{teacher?.name || user?.name || '—'}</Text></HStack>
                  <HStack><Text fontWeight='600'>Employee ID:</Text><Text>{teacher?.employeeId || '—'}</Text></HStack>
                  <HStack><Text fontWeight='600'>Designation:</Text><Text>{teacher?.designation || '—'}</Text></HStack>
                  <HStack><Text fontWeight='600'>Department:</Text><Text>{teacher?.department || '—'}</Text></HStack>
                  <HStack><Text fontWeight='600'>Bank:</Text><Text>{payroll.bank_name || payroll.bankName || '—'}</Text></HStack>
                  <HStack><Text fontWeight='600'>Account:</Text><Text>{payroll.account_number || payroll.accountNumber ? `****${String(payroll.account_number || payroll.accountNumber || '').slice(-4)}` : '—'}</Text></HStack>
                  <HStack><Text fontWeight='600'>Payment Method:</Text><Text>{payroll.payment_method || payroll.paymentMethod || '—'}</Text></HStack>
                  <HStack><Text fontWeight='600'>Status:</Text><Badge colorScheme={payroll.status === 'paid' ? 'green' : 'orange'}>{payroll.status || 'pending'}</Badge></HStack>
                  <HStack><Text fontWeight='600'>Period:</Text><Badge>{month} {year}</Badge></HStack>
                  {payroll.paid_on && <HStack><Text fontWeight='600'>Paid On:</Text><Text>{new Date(payroll.paid_on).toLocaleDateString()}</Text></HStack>}
                </VStack>
              </ModalBody>
              <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
}
