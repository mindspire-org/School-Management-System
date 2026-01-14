import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, Progress, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, NumberInput, NumberInputField, Tabs, TabList, TabPanels, Tab, TabPanel, useToast } from '@chakra-ui/react';
import { MdAssessment, MdArrowDownward, MdArrowUpward, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import LineChart from '../../../../components/charts/LineChart';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';
import * as reportsApi from '../../../../services/api/reports';

const mockSummary = { revenue: 0, refunds: 0, dues: 0, rate: 0 };
const mockClass = [
  { class: '10-A', billed: 360000, collected: 290000 },
  { class: '10-B', billed: 340000, collected: 270000 },
  { class: '9-A', billed: 280000, collected: 230000 },
];
const mockFeeHead = [
  { head: 'Tuition', billed: 900000, collected: 750000 },
  { head: 'Transport', billed: 120000, collected: 95000 },
  { head: 'Hostel', billed: 180000, collected: 150000 },
  { head: 'Exam', billed: 60000, collected: 50000 },
];
const mockTransportHostel = [
  { type: 'Transport', routes: 8, billed: 120000, collected: 95000 },
  { type: 'Hostel', rooms: 40, billed: 180000, collected: 150000 },
];
const mockFines = [
  { category: '0-30 days', count: 42, fine: 21000 },
  { category: '31-60 days', count: 18, fine: 27000 },
  { category: '60+ days', count: 9, fine: 36000 },
];

export default function Reports() {
  const [range, setRange] = useState('this-month');
  const [rows, setRows] = useState(mockClass);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ class: '', billed: 0, collected: 0 });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [reportTab, setReportTab] = useState(0); // 0: Overview, 1: Fee Head, 2: Payment Mode, 3: Transport/Hostel, 4: Overdue Fines
  const [method, setMethod] = useState('all');
  const [klass, setKlass] = useState('all');
  const [summary, setSummary] = useState(mockSummary);
  const toast = useToast();

  useEffect(() => {
    const getDateRange = (value) => {
      const today = new Date();
      let from = null;
      let to = today;
      if (value === 'this-month') {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
      } else if (value === 'last-month') {
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
      } else if (value === 'last-90') {
        from = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      }
      const toIso = to.toISOString().slice(0, 10);
      const fromIso = from ? from.toISOString().slice(0, 10) : null;
      return { fromDate: fromIso, toDate: toIso };
    };

    const loadSummary = async () => {
      try {
        const { fromDate, toDate } = getDateRange(range);
        const params = {};
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        const data = await reportsApi.financeSummary(params);
        const paidAmount = Number(data?.paidAmount || 0);
        const pendingAmount = Number(data?.pendingAmount || 0);
        const overdueAmount = Number(data?.overdueAmount || 0);
        const totalAmount = Number(data?.totalAmount || 0);
        const paidTotal = Number(data?.paidTotal || paidAmount || 0);
        const revenue = paidTotal;
        const dues = pendingAmount + overdueAmount;
        const refunds = Math.max(0, totalAmount - (paidAmount + pendingAmount + overdueAmount));
        const rate = totalAmount > 0 ? Math.round((paidAmount * 100) / totalAmount) : 0;
        setSummary({ revenue, refunds, dues, rate });
      } catch (e) {
        console.error('Failed to load finance summary', e);
        toast({
          title: 'Failed to load finance reports',
          description: e.message || 'Unable to load finance summary.',
          status: 'error',
          duration: 6000,
          isClosable: true,
        });
        setSummary(mockSummary);
      }
    };

    loadSummary();
  }, [range, toast]);

  const revVsColl = useMemo(() => ({
    cats: ['W1','W2','W3','W4'],
    revenue: [300000, 320000, 310000, 320000],
    collected: [240000, 260000, 250000, 270000],
  }), []);

  const methodBreakdown = { labels: ['Cash','Bank','Card','Online','JazzCash','EasyPaisa'], values: [40, 25, 12, 10, 7, 6] };

  const getActiveTable = () => {
    if (reportTab === 0) {
      const header = ['Class','Billed','Collected','Rate'];
      const data = rows
        .filter(r => klass==='all' || r.class===klass)
        .map(r => [r.class, r.billed, r.collected, Math.round((r.collected/r.billed)*100)]);
      return { header, data, title: 'Class-wise Collections' };
    }
    if (reportTab === 1) {
      const header = ['Fee Head','Billed','Collected','Rate'];
      const data = mockFeeHead.map(h => [h.head, h.billed, h.collected, Math.round((h.collected/h.billed)*100)]);
      return { header, data, title: 'Fee Head-wise Report' };
    }
    if (reportTab === 2) {
      const header = ['Method','Share %'];
      const data = methodBreakdown.labels.map((l,i) => [l, methodBreakdown.values[i]]);
      return { header, data, title: 'Payment Method Split' };
    }
    if (reportTab === 3) {
      const header = ['Type','Billed','Collected','Rate'];
      const data = mockTransportHostel.map(t => [t.type, t.billed, t.collected, Math.round((t.collected/t.billed)*100)]);
      return { header, data, title: 'Transport & Hostel' };
    }
    const header = ['Bucket','Count','Fine'];
    const data = mockFines.map(f => [f.category, f.count, f.fine]);
    return { header, data, title: 'Overdue Fines' };
  };

  const exportCSV = () => {
    const { header, data, title } = getActiveTable();
    const csv = [header, ...data].map(a=>a.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${title.replace(/\s+/g,'_').toLowerCase()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const { header, data, title } = getActiveTable();
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}h1{margin:0 0 12px;font-size:20px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style>
      </head><body><h1>${title}</h1>
      <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const exportXLS = () => {
    const { header, data, title } = getActiveTable();
    const table = `<table>${['<tr>'+header.map(h=>`<th>${h}</th>`).join('')+'</tr>'].concat(data.map(r=>'<tr>'+r.map(c=>`<td>${c}</td>`).join('')+'</tr>')).join('')}</table>`;
    const blob = new Blob([`\ufeff${table}`], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${title.replace(/\s+/g,'_').toLowerCase()}.xls`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Finance Reports</Heading>
          <Text color={textColorSecondary}>Comprehensive analytics with downloadable reports</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='purple' onClick={exportXLS}>Export Excel</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={exportPDF}>Download PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Revenue" value={`Rs. ${summary.revenue.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdArrowUpward} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Refunds" value={`Rs. ${summary.refunds.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdArrowDownward} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Outstanding Dues" value={`Rs. ${summary.dues.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdAssessment} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Collection Rate" value={`${summary.rate}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdAssessment} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <Select maxW='220px' value={range} onChange={(e) => setRange(e.target.value)}>
            <option value='this-month'>This Month</option>
            <option value='last-month'>Last Month</option>
            <option value='last-90'>Last 90 Days</option>
          </Select>
          <Select maxW='200px' value={klass} onChange={(e)=> setKlass(e.target.value)}>
            <option value='all'>All Classes</option>
            <option value='10-A'>10-A</option>
            <option value='10-B'>10-B</option>
            <option value='9-A'>9-A</option>
          </Select>
          <Select maxW='200px' value={method} onChange={(e)=> setMethod(e.target.value)}>
            <option value='all'>All Methods</option>
            <option value='cash'>Cash</option>
            <option value='bank'>Bank</option>
            <option value='card'>Card</option>
            <option value='online'>Online</option>
            <option value='jazzcash'>JazzCash</option>
            <option value='easypaisa'>EasyPaisa</option>
          </Select>
          <Input type='date' maxW='200px' />
          <Input type='date' maxW='200px' />
        </Flex>
      </Card>

      <Tabs index={reportTab} onChange={setReportTab} variant='enclosed-colored'>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Fee Head</Tab>
          <Tab>Payment Mode</Tab>
          <Tab>Transport/Hostel</Tab>
          <Tab>Overdue Fines</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
              <Card p={4}>
                <Heading size='md' mb={3}>Revenue vs Collections</Heading>
                <LineChart chartData={[{ name:'Revenue', data: revVsColl.revenue }, { name:'Collected', data: revVsColl.collected }]} chartOptions={{ xaxis:{ categories: revVsColl.cats }, colors:['#3182CE','#01B574'], dataLabels:{ enabled:false }, stroke:{ width:3 } }} />
              </Card>
              <Card p={4}>
                <Heading size='md' mb={3}>Payment Method Split</Heading>
                <PieChart chartData={methodBreakdown.values} chartOptions={{ labels: methodBreakdown.labels, legend:{ position:'right' } }} />
              </Card>
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
              <Card p={4}>
                <Heading size='md' mb={3}>Fee Head: Billed vs Collected</Heading>
                <BarChart chartData={[
                  { name:'Billed', data: mockFeeHead.map(h=>h.billed) },
                  { name:'Collected', data: mockFeeHead.map(h=>h.collected) },
                ]} chartOptions={{ xaxis:{ categories: mockFeeHead.map(h=>h.head) }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'45%' } } }} />
              </Card>
              <Card p={4}>
                <Heading size='md' mb={3}>Fee Head Share (Collected)</Heading>
                <PieChart chartData={mockFeeHead.map(h=>h.collected)} chartOptions={{ labels: mockFeeHead.map(h=>h.head), legend:{ position:'right' } }} />
              </Card>
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
              <Card p={4}>
                <Heading size='md' mb={3}>Payment Mode Split</Heading>
                <PieChart chartData={methodBreakdown.values} chartOptions={{ labels: methodBreakdown.labels, legend:{ position:'right' } }} />
              </Card>
              <Card p={4}>
                <Heading size='md' mb={3}>Payment Mode %</Heading>
                <BarChart chartData={[{ name:'Share %', data: methodBreakdown.values }]} chartOptions={{ xaxis:{ categories: methodBreakdown.labels }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'45%' } } }} />
              </Card>
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
              <Card p={4}>
                <Heading size='md' mb={3}>Transport/Hostel: Billed vs Collected</Heading>
                <BarChart chartData={[
                  { name:'Billed', data: mockTransportHostel.map(t=>t.billed) },
                  { name:'Collected', data: mockTransportHostel.map(t=>t.collected) },
                ]} chartOptions={{ xaxis:{ categories: mockTransportHostel.map(t=>t.type) }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'45%' } } }} />
              </Card>
              <Card p={4}>
                <Heading size='md' mb={3}>Collected Distribution</Heading>
                <PieChart chartData={mockTransportHostel.map(t=>t.collected)} chartOptions={{ labels: mockTransportHostel.map(t=>t.type), legend:{ position:'right' } }} />
              </Card>
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
              <Card p={4}>
                <Heading size='md' mb={3}>Fine Amount by Bucket</Heading>
                <BarChart chartData={[{ name:'Fine (Rs)', data: mockFines.map(f=>f.fine) }]} chartOptions={{ xaxis:{ categories: mockFines.map(f=>f.category) }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'45%' } } }} />
              </Card>
              <Card p={4}>
                <Heading size='md' mb={3}>Overdue Count</Heading>
                <PieChart chartData={mockFines.map(f=>f.count)} chartOptions={{ labels: mockFines.map(f=>f.category), legend:{ position:'right' } }} />
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Card>
        <Box overflowX='auto'>
          <Box maxH='420px' overflowY='auto'>
          <Table variant='simple' size='sm'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                {getActiveTable().header.map((h)=> (<Th key={h} isNumeric={['Billed','Collected','Rate','Share %','Count','Fine'].includes(h)}>{h}</Th>))}
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {getActiveTable().data.map((r, idx) => {
                const isClass = reportTab===0; const isRate = getActiveTable().header.includes('Rate');
                const rate = isRate ? r[r.length-1] : null;
                return (
                  <Tr key={idx} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    {r.map((c,i)=> (
                      <Td key={i} isNumeric={getActiveTable().header[i]==='Billed' || getActiveTable().header[i]==='Collected' || getActiveTable().header[i]==='Rate' || getActiveTable().header[i]==='Share %' || getActiveTable().header[i]==='Count' || getActiveTable().header[i]==='Fine'}>
                        {['Billed','Collected','Fine'].includes(getActiveTable().header[i]) ? `Rs. ${Number(c).toLocaleString()}` : getActiveTable().header[i]==='Rate' ? `${c}%` : c}
                      </Td>
                    ))}
                    <Td>
                      {isClass ? (
                        <>
                          <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ const obj = { class: r[0], billed: Number(String(r[1]).replace(/[^0-9]/g,''))||0, collected: Number(String(r[2]).replace(/[^0-9]/g,''))||0 }; setActive(obj); viewDisc.onOpen(); }} />
                          <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setForm({ class: r[0], billed: r[1], collected: r[2] }); editDisc.onOpen(); }} />
                        </>
                      ) : null}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Class Collection Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <Box>
                <Text><strong>Class:</strong> {active.class}</Text>
                <Text><strong>Billed:</strong> Rs. {active.billed.toLocaleString()}</Text>
                <Text><strong>Collected:</strong> Rs. {active.collected.toLocaleString()}</Text>
                <Text><strong>Rate:</strong> {Math.round((active.collected/active.billed)*100)}%</Text>
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
          <ModalHeader>Edit Class Totals</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Class</FormLabel>
              <Input value={form.class} onChange={(e)=> setForm(f=>({ ...f, class: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Billed</FormLabel>
              <NumberInput value={form.billed} min={0} onChange={(v)=> setForm(f=>({ ...f, billed: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Collected</FormLabel>
              <NumberInput value={form.collected} min={0} onChange={(v)=> setForm(f=>({ ...f, collected: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRows(prev => prev.map(r => r.class===form.class ? { ...form } : r));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
