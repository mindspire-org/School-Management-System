import React, { useMemo, useState } from 'react';
import { Box, SimpleGrid, Text, HStack, VStack, Icon, useColorModeValue, Badge, Select, Input, Button, Table, Thead, Tr, Th, Tbody, Td, Tooltip, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Divider, Tag, InputGroup, InputLeftElement, Textarea, Wrap, WrapItem } from '@chakra-ui/react';
import { MdPayments, MdDownload, MdVisibility } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';
import SparklineChart from '../../components/charts/SparklineChart';
import BarChart from '../../components/charts/BarChart';

export default function DriverSalary() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'gray.600');
  const viewDisc = useDisclosure();
  const [viewItem, setViewItem] = useState(null);

  const payslips = useMemo(() => ([
    { month: '2025-11', period: 'Nov 2025', base: 45000, overtimeHrs: 14, overtimePay: 4200, allowance: 2000, deduction: 3500, tax: 2800, net: 47900, bank: 'HBL ****4321' },
    { month: '2025-10', period: 'Oct 2025', base: 45000, overtimeHrs: 18, overtimePay: 5400, allowance: 2000, deduction: 2000, tax: 2800, net: 52800, bank: 'HBL ****4321' },
    { month: '2025-09', period: 'Sep 2025', base: 45000, overtimeHrs: 10, overtimePay: 3000, allowance: 2000, deduction: 1500, tax: 2800, net: 48700, bank: 'HBL ****4321' },
    { month: '2025-08', period: 'Aug 2025', base: 45000, overtimeHrs: 22, overtimePay: 6600, allowance: 2000, deduction: 0, tax: 2800, net: 51800, bank: 'HBL ****4321' },
  ]), []);

  const [month, setMonth] = useState(payslips[0].month);
  const latest = payslips.find(p => p.month === month) || payslips[0];
  const monthsSorted = useMemo(() => payslips.slice().sort((a,b)=>a.month.localeCompare(b.month)), [payslips]);
  const totalNetYTD = useMemo(() => payslips.reduce((s,p)=>s + p.net, 0), [payslips]);
  const avgNet = useMemo(() => Math.round(totalNetYTD / payslips.length), [totalNetYTD, payslips.length]);
  const totalOvertimeHrsYTD = useMemo(() => payslips.reduce((s,p)=>s + p.overtimeHrs, 0), [payslips]);
  const trendCategories = monthsSorted.map(p=>p.period);
  const trendValues = monthsSorted.map(p=>p.net);

  const earningsItems = [
    { label: 'Base Salary', amount: latest.base },
    { label: 'Overtime Pay', amount: latest.overtimePay },
    { label: 'Allowance', amount: latest.allowance },
  ];
  const deductionItems = [
    { label: 'Deductions', amount: latest.deduction },
    { label: 'Tax', amount: latest.tax },
  ];

  const correctionDisc = useDisclosure();
  const claimDisc = useDisclosure();
  const [correctionMsg, setCorrectionMsg] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimNote, setClaimNote] = useState('');

  const exportCSV = () => {
    const header = ['Period','Base','OT Hrs','OT Pay','Allowance','Deduction','Tax','Net','Bank'];
    const rows = payslips.map(p => [p.period, p.base, p.overtimeHrs, p.overtimePay, p.allowance, p.deduction, p.tax, p.net, p.bank]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'payslips.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Salary</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Monthly payslip, earnings/deductions, and payout details</Text>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing='20px'>
        <Card p='16px' alignSelf='start'>
          <HStack justify='space-between'>
            <HStack>
              <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f6d365 0%,#fda085 100%)' icon={<Icon as={MdPayments} w='22px' h='22px' color='white' />} />
              <VStack align='start' spacing={0}>
                <Text fontWeight='600'>This Month</Text>
                <Text fontSize='sm' color={textSecondary}>{latest.period}</Text>
              </VStack>
            </HStack>
            <Badge colorScheme='green'>PKR {latest.net.toLocaleString()}</Badge>
          </HStack>
          {/* Sparkline removed to avoid extra height */}
        </Card>
        <Card p='16px' alignSelf='start'>
          <Text fontSize='lg' fontWeight='bold'>Summary</Text>
          <Select mt='8px' value={month} onChange={e=>setMonth(e.target.value)}>
            {payslips.map(p => <option key={p.month} value={p.month}>{p.period}</option>)}
          </Select>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing='10px' mt='10px'>
            <Card p='10px'>
              <Text fontSize='xs' color={textSecondary}>YTD Net</Text>
              <Text fontWeight='700'>PKR {totalNetYTD.toLocaleString()}</Text>
            </Card>
            <Card p='10px'>
              <Text fontSize='xs' color={textSecondary}>Avg Net</Text>
              <Text fontWeight='700'>PKR {avgNet.toLocaleString()}</Text>
            </Card>
            <Card p='10px'>
              <Text fontSize='xs' color={textSecondary}>OT Hours (YTD)</Text>
              <Text fontWeight='700'>{totalOvertimeHrsYTD} hrs</Text>
            </Card>
            <Card p='10px'>
              <Text fontSize='xs' color={textSecondary}>OT (This Month)</Text>
              <Text fontWeight='700'>{latest.overtimeHrs} hrs</Text>
            </Card>
          </SimpleGrid>
          <VStack align='start' spacing={1} mt='10px'>
            <Text fontSize='sm' color={textSecondary}>Base Salary: PKR {latest.base.toLocaleString()}</Text>
            <Text fontSize='sm' color={textSecondary}>Overtime: {latest.overtimeHrs} hrs (PKR {latest.overtimePay.toLocaleString()})</Text>
            <Text fontSize='sm' color={textSecondary}>Allowance: PKR {latest.allowance.toLocaleString()}</Text>
            <Text fontSize='sm' color={textSecondary}>Deductions: PKR {latest.deduction.toLocaleString()}</Text>
            <Text fontSize='sm' color={textSecondary}>Tax: PKR {latest.tax.toLocaleString()}</Text>
            <Divider my='8px' />
            <Text fontWeight='700'>Net Pay: PKR {latest.net.toLocaleString()}</Text>
            <Text fontSize='sm' color={textSecondary}>Bank: {latest.bank}</Text>
          </VStack>
          <Wrap mt='12px' spacing='10px' shouldWrapChildren>
            <Button leftIcon={<MdDownload />} onClick={exportCSV}>Export CSV</Button>
            <Button variant='outline' onClick={correctionDisc.onOpen}>Request Correction</Button>
            <Button variant='outline' onClick={claimDisc.onOpen}>New Claim</Button>
          </Wrap>
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold'>Payslip History</Text>
          <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden' mt='8px'>
            <Box maxH='360px' overflowY='auto'>
              <Table size='sm' variant='simple'>
                <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                  <Tr>
                    <Th>Period</Th>
                    <Th isNumeric>Net Pay</Th>
                    <Th>Bank</Th>
                    <Th textAlign='right'>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {payslips.map(p => (
                    <Tr key={p.month}>
                      <Td maxW='140px'><Text noOfLines={1}>{p.period}</Text></Td>
                      <Td isNumeric>PKR {p.net.toLocaleString()}</Td>
                      <Td maxW='160px'><Text noOfLines={1}>{p.bank}</Text></Td>
                      <Td isNumeric>
                        <HStack justify='flex-end'>
                          <Tooltip label='View breakdown'>
                            <IconButton size='sm' aria-label='view' icon={<MdVisibility />} onClick={()=>{ setViewItem(p); viewDisc.onOpen(); }} />
                          </Tooltip>
                          <Tooltip label='Download PDF'>
                            <IconButton size='sm' aria-label='pdf' icon={<MdDownload />} />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing='20px' mt='20px'>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold'>Net Pay Trend</Text>
          <BarChart
            height={220}
            chartData={[{ name: 'Net', data: trendValues }]}
            chartOptions={{ xaxis: { categories: trendCategories }, colors:['#01B574'], tooltip:{ enabled:true, shared:true } }}
          />
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold'>Breakdown ({latest.period})</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing='12px' mt='8px'>
            <Card p='12px'>
              <Text fontWeight='600' mb='6px'>Earnings</Text>
              {earningsItems.map(i => (
                <HStack key={i.label} justify='space-between'>
                  <Text color={textSecondary}>{i.label}</Text>
                  <Text fontWeight='700'>PKR {i.amount.toLocaleString()}</Text>
                </HStack>
              ))}
            </Card>
            <Card p='12px'>
              <Text fontWeight='600' mb='6px'>Deductions</Text>
              {deductionItems.map(i => (
                <HStack key={i.label} justify='space-between'>
                  <Text color={textSecondary}>{i.label}</Text>
                  <Text fontWeight='700'>PKR {i.amount.toLocaleString()}</Text>
                </HStack>
              ))}
            </Card>
          </SimpleGrid>
        </Card>
      </SimpleGrid>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payslip - {viewItem?.period}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='start' spacing={1}>
              <Text><b>Base:</b> PKR {viewItem?.base?.toLocaleString()}</Text>
              <Text><b>Overtime:</b> {viewItem?.overtimeHrs} hrs (PKR {viewItem?.overtimePay?.toLocaleString()})</Text>
              <Text><b>Allowance:</b> PKR {viewItem?.allowance?.toLocaleString()}</Text>
              <Text><b>Deductions:</b> PKR {viewItem?.deduction?.toLocaleString()}</Text>
              <Text><b>Tax:</b> PKR {viewItem?.tax?.toLocaleString()}</Text>
              <Divider my='6px' />
              <Text><b>Net Pay:</b> PKR {viewItem?.net?.toLocaleString()}</Text>
              <Text><b>Bank:</b> {viewItem?.bank}</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={correctionDisc.isOpen} onClose={correctionDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Correction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Text>Tell us what to fix for {latest.period}:</Text>
              <Textarea rows={4} value={correctionMsg} onChange={e=>setCorrectionMsg(e.target.value)} placeholder='Describe the discrepancy (amounts, hours, taxes...)' />
              <Input type='file' accept='image/*,application/pdf' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={correctionDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={correctionDisc.onClose}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={claimDisc.isOpen} onClose={claimDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Reimbursement Claim</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <InputGroup>
                <InputLeftElement children={'PKR'} />
                <Input type='number' placeholder='Amount' value={claimAmount} onChange={e=>setClaimAmount(e.target.value)} />
              </InputGroup>
              <Textarea rows={3} placeholder='Description' value={claimNote} onChange={e=>setClaimNote(e.target.value)} />
              <Input type='file' accept='image/*,application/pdf' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={claimDisc.onClose}>Cancel</Button>
            <Button colorScheme='green' onClick={claimDisc.onClose}>Submit Claim</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
