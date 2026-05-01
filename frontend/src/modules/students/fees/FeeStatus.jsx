import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdPayment, MdFileDownload, MdPrint, MdVisibility, MdOpenInNew, MdAttachMoney, MdEvent, MdCheckCircle } from 'react-icons/md';
import Card from '../../../components/card/Card';
import BarChart from '../../../components/charts/BarChart';
import { useAuth } from '../../../contexts/AuthContext';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import * as studentsApi from '../../../services/api/students';

function formatCurrency(n){ return new Intl.NumberFormat(undefined,{ style:'currency', currency:'PKR', maximumFractionDigits:0 }).format(n); }
function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }

export default function FeeStatus(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role !== 'student') return;
        const payload = await studentsApi.list({ pageSize: 1 });
        const me = Array.isArray(payload?.rows) && payload.rows.length ? payload.rows[0] : null;
        setStudent(me);
      } catch {
        setStudent(null);
      }
    };
    load();
  }, [user?.role]);

  useEffect(() => {
    const loadFees = async () => {
      try {
        if (!student?.id) return;
        const data = await studentsApi.getFees(student.id);
        const invoices = Array.isArray(data?.invoices) ? data.invoices : [];
        setFees(invoices.map((inv) => {
          const status = inv.status === 'paid' ? 'paid' : (inv.dueDate && new Date(inv.dueDate) < new Date() ? 'overdue' : 'pending');
          return {
            id: inv.id,
            title: 'Fee Invoice',
            month: inv.issuedAt ? new Date(inv.issuedAt) : new Date(),
            amount: Number(inv.amount) || 0,
            status,
            dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
            paidDate: status === 'paid' ? (inv.issuedAt ? new Date(inv.issuedAt) : null) : null,
            method: '',
            receiptNo: status === 'paid' ? `RCPT-${inv.id}` : '',
            outstanding: Number(inv.outstanding) || 0,
          };
        }));
      } catch {
        setFees([]);
      }
    };
    loadFees();
  }, [student?.id]);

  const classSection = `${student?.class || ''}${student?.section || ''}`;

  const totals = useMemo(()=>{
    const due = fees.filter(f=>f.status!=='paid').reduce((s,f)=>s+f.amount,0);
    const paid = fees.filter(f=>f.status==='paid').reduce((s,f)=>s+f.amount,0);
    const lastPaid = fees.filter(f=>f.paidDate).sort((a,b)=>b.paidDate-a.paidDate)[0]?.paidDate || null;
    return { due, paid, lastPaid };
  },[fees]);

  const months = [...Array(6)].map((_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-i); return new Date(d.getFullYear(), d.getMonth(), 1);
  }).reverse();
  const chartData = useMemo(()=>{
    const paidSeries = months.map(m=> fees.filter(f=>f.status==='paid' && f.month.getMonth()===m.getMonth() && f.month.getFullYear()===m.getFullYear()).reduce((s,f)=>s+f.amount,0));
    const dueSeries = months.map(m=> fees.filter(f=>f.status!=='paid' && f.month.getMonth()===m.getMonth() && f.month.getFullYear()===m.getFullYear()).reduce((s,f)=>s+f.amount,0));
    return [ { name:'Paid', data: paidSeries }, { name:'Due', data: dueSeries } ];
  },[fees]);
  const chartOptions = useMemo(()=>({ xaxis:{ categories: months.map(m=>m.toLocaleString(undefined,{ month:'short' })) }, colors:['#38A169','#E53E3E'], dataLabels:{ enabled:false }, legend:{ position:'top' } }),[]);

  const downloadReceipt = (f)=>{
    const content = `${student?.name || ''}\n${student?.rollNumber || ''}\n${classSection || ''}\nReceipt: ${f.receiptNo}\n${f.title} ${f.month.toLocaleString(undefined,{ month:'long', year:'numeric' })}\nAmount: ${formatCurrency(f.amount)}\nMethod: ${f.method}`;
    const blob = new Blob([content],{ type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`${f.receiptNo}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Fee Status</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {(student?.name || user?.name || '')}
        {student?.rollNumber ? ` • Roll ${student.rollNumber}` : ''}
        {classSection ? ` • Class ${classSection}` : ''}
      </Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdAttachMoney} w='22px' h='22px' color='white' />} />}
            name='Total Due'
            value={formatCurrency(totals.due)}
            trendData={[0,1,1,2,2]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdPayment} w='22px' h='22px' color='white' />} />}
            name='Total Paid'
            value={formatCurrency(totals.paid)}
            trendData={[1,1,2,3,totals.paid]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdEvent} w='22px' h='22px' color='white' />} />}
            name='Last Payment'
            value={totals.lastPaid? formatDate(totals.lastPaid):'—'}
            trendData={[1,1,1,1,1]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Status'
            value={totals.due>0? 'Pending':'Cleared'}
            trendData={[1,1,1,1,1]}
            trendColor='#805AD5'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3}>
          <Button size='sm' leftIcon={<Icon as={MdOpenInNew} />} onClick={()=>window.location.href='/student/fees/pay'}>Pay Now</Button>
          <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Box overflowX='auto'>
          <Table size='sm' variant='striped' colorScheme='gray'>
            <Thead><Tr><Th>Title</Th><Th>Month</Th><Th>Amount</Th><Th>Status</Th><Th>Due/Paid</Th><Th>Actions</Th></Tr></Thead>
            <Tbody>
              {fees.map(f=> (
                <Tr key={f.id}>
                  <Td>{f.title}</Td>
                  <Td>{f.month.toLocaleString(undefined,{ month:'long', year:'numeric' })}</Td>
                  <Td>{formatCurrency(f.amount)}</Td>
                  <Td>{f.status==='paid'? <Badge colorScheme='green'>Paid</Badge>: f.status==='overdue'? <Badge colorScheme='red'>Overdue</Badge>: <Badge>Pending</Badge>}</Td>
                  <Td>{f.status==='paid'? formatDate(f.paidDate): formatDate(f.dueDate)}</Td>
                  <Td>
                    <HStack>
                      {f.status==='paid'? (
                        <>
                          <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(f); onOpen(); }}>View</Button>
                          <Button size='xs' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>downloadReceipt(f)}>Download</Button>
                        </>
                      ):(
                        <Button size='xs' colorScheme='purple' leftIcon={<Icon as={MdPayment} />} onClick={()=>window.location.href='/student/fees/pay'}>Pay</Button>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Paid vs Due (Last 6 Months)</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Receipt: {selected?.receiptNo}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text fontWeight='600'>{student.name} • {student.rollNumber} • Class {classSection}</Text>
                <Text color={textSecondary}>{selected.title} • {selected.month.toLocaleString(undefined,{ month:'long', year:'numeric' })}</Text>
                <Text color={textSecondary}>Amount: {formatCurrency(selected.amount)}</Text>
                <Text color={textSecondary}>Method: {selected.method}</Text>
                <Text color={textSecondary}>Paid On: {formatDate(selected.paidDate)}</Text>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
