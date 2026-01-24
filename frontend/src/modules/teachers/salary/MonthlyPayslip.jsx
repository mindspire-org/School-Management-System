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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdPrint, MdVisibility, MdAttachMoney, MdRemoveCircleOutline, MdCheckCircle, MdEvent } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const samplePayslip = {
  employee: 'John Doe',
  employeeId: 'T-0192',
  designation: 'Senior Teacher',
  department: 'Mathematics',
  bank: 'ABC Bank',
  account: '****2345',
  breakdown: {
    earnings: [
      { label: 'Basic Pay', amount: 80000 },
      { label: 'House Allowance', amount: 20000 },
      { label: 'Medical Allowance', amount: 10000 },
      { label: 'Transport', amount: 6000 },
    ],
    deductions: [
      { label: 'Tax', amount: 12000 },
      { label: 'Pension', amount: 6000 },
      { label: 'Loan', amount: 4000 },
    ],
  },
};

export default function MonthlyPayslip() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const [month, setMonth] = useState(monthNames[new Date().getMonth()]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const { isOpen, onOpen, onClose } = useDisclosure();

  const earningsTotal = useMemo(() => samplePayslip.breakdown.earnings.reduce((s, r) => s + r.amount, 0), []);
  const deductionsTotal = useMemo(() => samplePayslip.breakdown.deductions.reduce((s, r) => s + r.amount, 0), []);
  const net = useMemo(() => earningsTotal - deductionsTotal, [earningsTotal, deductionsTotal]);

  const kpis = useMemo(() => ({ gross: earningsTotal, deductions: deductionsTotal, net, paymentDate: `${month} ${year}` }), [earningsTotal, deductionsTotal, net, month, year]);

  const chartData = useMemo(() => ([{ name: 'Amount', data: [earningsTotal, deductionsTotal, net] }]), [earningsTotal, deductionsTotal, net]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: ['Earnings', 'Deductions', 'Net'] }, colors: ['#3182CE'], dataLabels:{ enabled:false } }), []);

  const exportCSV = () => {
    const header = ['Item','Type','Amount'];
    const rows = [
      ...samplePayslip.breakdown.earnings.map(e => [e.label, 'Earning', e.amount]),
      ...samplePayslip.breakdown.deductions.map(d => [d.label, 'Deduction', d.amount]),
      ['Total Earnings','', earningsTotal],
      ['Total Deductions','', deductionsTotal],
      ['Net','', net],
    ];
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `payslip_${month}_${year}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Monthly Payslip</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>View your current month compensation breakdown</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdAttachMoney color='white' />} />}
            name='Gross'
            value={`₹${kpis.gross.toLocaleString()}`}
            trendData={[60,70,65,75,80,78]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FF6A88 0%,#FF99AC 100%)' icon={<MdRemoveCircleOutline color='white' />} />}
            name='Deductions'
            value={`₹${kpis.deductions.toLocaleString()}`}
            trendData={[10,12,11,13,12,14]}
            trendColor='#FF6A88'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdCheckCircle color='white' />} />}
            name='Net Pay'
            value={`₹${kpis.net.toLocaleString()}`}
            trendData={[50,58,54,62,66,64]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdEvent color='white' />} />}
            name='Period'
            value={kpis.paymentDate}
            trendData={[1,1,1,1,1,1]}
            trendColor='#B721FF'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={month} onChange={e=>setMonth(e.target.value)} size='sm' maxW='160px'>
              {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Select value={year} onChange={e=>setYear(e.target.value)} size='sm' maxW='120px'>
              {['2024','2025','2026'].map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </HStack>
          <HStack>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>{ setMonth(monthNames[new Date().getMonth()]); setYear(String(new Date().getFullYear())); }}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint}/>} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </Flex>
      </Card>

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
                {samplePayslip.breakdown.earnings.map((e, idx) => (
                  <Tr key={`e-${idx}`} _hover={{ bg: hoverBg }}>
                    <Td><Badge colorScheme='green'>Earning</Badge></Td>
                    <Td>{e.label}</Td>
                    <Td isNumeric>₹{e.amount.toLocaleString()}</Td>
                  </Tr>
                ))}
                {samplePayslip.breakdown.deductions.map((d, idx) => (
                  <Tr key={`d-${idx}`} _hover={{ bg: hoverBg }}>
                    <Td><Badge colorScheme='red'>Deduction</Badge></Td>
                    <Td>{d.label}</Td>
                    <Td isNumeric>₹{d.amount.toLocaleString()}</Td>
                  </Tr>
                ))}
                <Tr>
                  <Td></Td>
                  <Td fontWeight='700'>Total Earnings</Td>
                  <Td isNumeric fontWeight='700'>₹{earningsTotal.toLocaleString()}</Td>
                </Tr>
                <Tr>
                  <Td></Td>
                  <Td fontWeight='700'>Total Deductions</Td>
                  <Td isNumeric fontWeight='700'>₹{deductionsTotal.toLocaleString()}</Td>
                </Tr>
                <Tr>
                  <Td></Td>
                  <Td fontWeight='800'>Net</Td>
                  <Td isNumeric fontWeight='800'>₹{net.toLocaleString()}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb='16px'>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Earnings / Deductions / Net</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Earnings vs Deductions</Text>
            <PieChart height={240} chartData={[earningsTotal, deductionsTotal]} chartOptions={{ labels:['Earnings','Deductions'], legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>

      <Card p='16px'>
        <Flex justify='space-between' align='center'>
          <Text fontWeight='600' color={textSecondary}>Employee</Text>
          <Button size='sm' leftIcon={<Icon as={MdVisibility}/>} onClick={onOpen}>View Details</Button>
        </Flex>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='md' isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payslip Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='start' spacing={2} fontSize='sm'>
              <HStack><Text fontWeight='600'>Employee:</Text><Text>{samplePayslip.employee} ({samplePayslip.employeeId})</Text></HStack>
              <HStack><Text fontWeight='600'>Designation:</Text><Text>{samplePayslip.designation}</Text></HStack>
              <HStack><Text fontWeight='600'>Department:</Text><Text>{samplePayslip.department}</Text></HStack>
              <HStack><Text fontWeight='600'>Bank:</Text><Text>{samplePayslip.bank} {samplePayslip.account}</Text></HStack>
              <HStack><Text fontWeight='600'>Period:</Text><Badge>{month} {year}</Badge></HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
