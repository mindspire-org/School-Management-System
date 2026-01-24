import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Progress, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, Input } from '@chakra-ui/react';
import { MdAccountBalance, MdAttachMoney, MdTrendingUp, MdWarning, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit, MdDirectionsBus, MdHotel } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';
import LineChart from '../../../../components/charts/LineChart';

const mockKpis = {
  billed: 1250,
  collected: 980,
  pending: 270,
  rate: 78,
};

// Additional dashboard datasets
const todayCollection = 350000;
const outstandingAmount = 235000;
const finesCollected = 12000;
const transportEarnings = 45000;
const hostelEarnings = 38000;

const incomeVsExpense = {
  labels: ['Aug','Sep','Oct','Nov'],
  income: [300000, 320000, 310000, 330000],
  expense: [210000, 220000, 215000, 225000]
};

const paymentMode = { labels: ['Cash','Bank','Online'], values: [48, 32, 20] };

const topClasses = { labels: ['10-A','10-B','9-A','9-B','8-A'], values: [290000, 270000, 230000, 210000, 180000] };

const last30Days = { labels: ['D-30','D-24','D-18','D-12','D-6','Today'], values: [40, 55, 52, 60, 66, 72] };

const mockDefaulters = [
  { id: 'ST-101', name: 'Bilal Ahmad', class: '10-A', dues: 12000, days: 18 },
  { id: 'ST-102', name: 'Ayesha Noor', class: '9-B', dues: 11500, days: 25 },
  { id: 'ST-103', name: 'Usman Tariq', class: '10-B', dues: 9000, days: 7 },
];

const mockRecentInvoices = [
  { id: 'INV-1001', student: 'Ahsan Ali', class: '10-A', amount: 12000, status: 'Paid', date: '2025-11-01' },
  { id: 'INV-1002', student: 'Sara Khan', class: '10-A', amount: 12000, status: 'Pending', date: '2025-11-02' },
  { id: 'INV-1003', student: 'Hamza Iqbal', class: '10-B', amount: 11500, status: 'Overdue', date: '2025-10-15' },
];

export default function FeeDashboard() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [rows, setRows] = useState(mockRecentInvoices);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', status: 'Paid', date: '' });

  const stats = useMemo(() => mockKpis, []);
  const months = ['Aug', 'Sep', 'Oct', 'Nov'];
  const monthlyCollected = [820, 910, 950, 980];
  const statusBreakdown = useMemo(() => {
    const paid = rows.filter(r=>r.status==='Paid').length;
    const pending = rows.filter(r=>r.status==='Pending').length;
    const overdue = rows.filter(r=>r.status==='Overdue').length;
    return [paid, pending, overdue];
  }, [rows]);

  const exportCSV = () => {
    const header = ['Invoice','Student','Class','Amount','Status','Date'];
    const data = rows.map(r => [r.id, r.student, r.class, r.amount, r.status, r.date]);
    const csv = [header, ...data].map(a=>a.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='recent_invoices.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Fee Dashboard</Heading>
          <Text color={textColorSecondary}>Overview of billing, collections and dues</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Students Billed" value={String(stats.billed)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdAccountBalance} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Collected" value={String(stats.collected)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdAttachMoney} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Pending" value={String(stats.pending)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Collection Rate" value={`${stats.rate}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Daily Collection" value={`Rs. ${todayCollection.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#01B574 0%,#319795 100%)' icon={<Icon as={MdAttachMoney} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Outstanding Fees" value={`Rs. ${outstandingAmount.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Fines Collected" value={`Rs. ${finesCollected.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#F6AD55 0%,#ED8936 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Transport Earnings" value={`Rs. ${transportEarnings.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#63B3ED 0%,#4299E1 100%)' icon={<Icon as={MdDirectionsBus} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Monthly Collections</Heading>
          <BarChart height={220} chartData={[{ name:'Collected', data: monthlyCollected }]} chartOptions={{ xaxis:{ categories: months }, colors:['#01B574'], dataLabels:{ enabled:false }, grid:{ padding:{ left:12, right:12 } } }} />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Invoice Status</Heading>
          <PieChart chartData={statusBreakdown} chartOptions={{ labels:['Paid','Pending','Overdue'], colors:['#38A169','#ECC94B','#E53E3E'], legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Income vs Expense</Heading>
          <LineChart chartData={[{ name:'Income', data: incomeVsExpense.income }, { name:'Expense', data: incomeVsExpense.expense }]} chartOptions={{ xaxis:{ categories: incomeVsExpense.labels }, colors:['#3182CE','#E53E3E'], dataLabels:{ enabled:false }, stroke:{ width:3 } }} />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Collection by Payment Mode</Heading>
          <PieChart chartData={paymentMode.values} chartOptions={{ labels: paymentMode.labels, colors:['#718096','#805AD5','#38B2AC'], legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Top Paying Classes</Heading>
          <BarChart height={220} chartData={[{ name:'Collected', data: topClasses.values }]} chartOptions={{ xaxis:{ categories: topClasses.labels }, colors:['#805AD5'], dataLabels:{ enabled:false } }} />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Last 30 Days Trend</Heading>
          <LineChart chartData={[{ name:'Collections', data: last30Days.values }]} chartOptions={{ xaxis:{ categories: last30Days.labels }, colors:['#01B574'], dataLabels:{ enabled:false }, stroke:{ width:3 } }} />
        </Card>
      </SimpleGrid>

      <Card>
        <Box overflow='hidden'>
          <Heading size='md' p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200','gray.700')}>Recent Invoices</Heading>
          <Box maxH='360px' overflowY='auto'>
          <Table variant='simple'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Invoice</Th>
                <Th>Student</Th>
                <Th>Class</Th>
                <Th isNumeric>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((i) => (
                <Tr key={i.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{i.id}</Text></Td>
                  <Td>{i.student}</Td>
                  <Td>{i.class}</Td>
                  <Td isNumeric>Rs. {i.amount.toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={i.status === 'Paid' ? 'green' : i.status === 'Pending' ? 'yellow' : 'red'}>{i.status}</Badge>
                  </Td>
                  <Td><Text color={textColorSecondary}>{i.date}</Text></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(i); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(i); setForm({ id: i.id, status: i.status, date: i.date }); editDisc.onOpen(); }} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </Box>
        </Box>
      </Card>

      <Card mt={5}>
        <Box overflow='hidden'>
          <Heading size='md' p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200','gray.700')}>Defaulters Summary</Heading>
          <Box maxH='300px' overflowY='auto'>
            <Table variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th>Student</Th>
                  <Th>Class</Th>
                  <Th isNumeric>Dues</Th>
                  <Th isNumeric>Days</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockDefaulters.map(d => (
                  <Tr key={d.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='600'>{d.name}</Text></Td>
                    <Td>{d.class}</Td>
                    <Td isNumeric>Rs. {d.dues.toLocaleString()}</Td>
                    <Td isNumeric>{d.days}</Td>
                    <Td>
                      <Button size='sm' variant='outline'>Send Reminder</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invoice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Text><strong>Invoice:</strong> {selected.id}</Text>
                <Text><strong>Student:</strong> {selected.student} ({selected.class})</Text>
                <Text><strong>Amount:</strong> Rs. {selected.amount.toLocaleString()}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
                <Text><strong>Date:</strong> {selected.date}</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select mb={3} value={form.status.toLowerCase()} onChange={(e)=> setForm(f=>({ ...f, status: e.target.value==='paid'?'Paid':e.target.value==='pending'?'Pending':'Overdue' }))}>
              <option value='paid'>Paid</option>
              <option value='pending'>Pending</option>
              <option value='overdue'>Overdue</option>
            </Select>
            <Input type='date' value={form.date} onChange={(e)=> setForm(f=>({ ...f, date: e.target.value }))} />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRows(prev => prev.map(r => r.id===form.id ? { ...r, status: form.status, date: form.date } : r));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
