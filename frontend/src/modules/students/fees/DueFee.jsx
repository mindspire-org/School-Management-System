import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Select, Input, Flex } from '@chakra-ui/react';
import { MdPayment, MdFileDownload, MdPrint, MdAttachMoney, MdPendingActions, MdDateRange } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatCurrency(n){ return new Intl.NumberFormat(undefined,{ style:'currency', currency:'PKR', maximumFractionDigits:0 }).format(n); }
function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }

export default function DueFee(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();

  const student = useMemo(()=>{
    if (user?.role==='student'){
      const byEmail = mockStudents.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s=>s.name?.toLowerCase()===user.name?.toLowerCase());
      if (byName) return byName;
      return { id:999, name:user.name, rollNumber:'STU999', class:'10', section:'A', email:user.email };
    }
    return mockStudents[0];
  },[user]);
  const classSection = `${student.class}${student.section}`;

  const feesAll = useMemo(()=>{
    const today = new Date();
    const mk = (id,title,monthOffset,amount,status)=>{
      const m = new Date(today.getFullYear(), today.getMonth()-monthOffset, 1);
      const dueDate = new Date(m.getFullYear(), m.getMonth(), 10);
      const paid = status==='paid' ? new Date(m.getFullYear(), m.getMonth(), 8) : null;
      return { id, title, month:m, amount, status, dueDate, paidDate: paid };
    };
    return [
      mk('F1','Tuition Fee',0,15000,'pending'),
      mk('F2','Transport Fee',0,3000,'pending'),
      mk('F6','Library Fine',3,800,'overdue'),
      mk('F3','Lab Fee',1,2500,'paid'),
    ];
  },[student]);

  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const filtered = useMemo(()=> feesAll.filter(f=> (type==='all' || f.title.toLowerCase().includes(type)) && (!q || f.title.toLowerCase().includes(q.toLowerCase())) && f.status!=='paid'), [feesAll, q, type]);

  const totalDue = useMemo(()=> filtered.reduce((s,f)=>s+f.amount,0), [filtered]);

  const exportCsv = ()=>{
    const rows = ['Title,Month,Amount,Status,Due Date', ...filtered.map(f=> `${f.title},${f.month.toLocaleString(undefined,{ month:'short', year:'numeric' })},${f.amount},${f.status},${formatDate(f.dueDate)}`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='due-fee.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Due Fee</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdAttachMoney} w='22px' h='22px' color='white' />} />}
            name='Total Due'
            value={formatCurrency(totalDue)}
            trendData={[0,1,1,2,2]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdPendingActions} w='22px' h='22px' color='white' />} />}
            name='Pending Items'
            value={String(filtered.length)}
            trendData={[1,1,2,2,filtered.length]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdDateRange} w='22px' h='22px' color='white' />} />}
            name='Nearest Due'
            value={filtered.sort((a,b)=>a.dueDate-b.dueDate)[0]? formatDate(filtered.sort((a,b)=>a.dueDate-b.dueDate)[0].dueDate):'—'}
            trendData={[1,1,1,1,1]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={type} onChange={e=>setType(e.target.value)} maxW='220px'>
            <option value='all'>All Types</option>
            <option value='tuition'>Tuition</option>
            <option value='transport'>Transport</option>
            <option value='lab'>Lab</option>
            <option value='exam'>Exam</option>
            <option value='library'>Library</option>
          </Select>
          <Input size='sm' placeholder='Search title...' value={q} onChange={e=>setQ(e.target.value)} maxW='240px' />
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCsv}>Export CSV</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdPayment} />} onClick={()=>window.location.href='/student/fees/pay'}>Pay Selected</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0'>
        <Box overflowX='auto'>
          <Table size='sm' variant='striped' colorScheme='gray'>
            <Thead><Tr><Th>Title</Th><Th>Month</Th><Th>Amount</Th><Th>Status</Th><Th>Due Date</Th><Th>Action</Th></Tr></Thead>
            <Tbody>
              {filtered.map(f=> (
                <Tr key={f.id}>
                  <Td>{f.title}</Td>
                  <Td>{f.month.toLocaleString(undefined,{ month:'long', year:'numeric' })}</Td>
                  <Td>{formatCurrency(f.amount)}</Td>
                  <Td>{f.status==='overdue'? <Badge colorScheme='red'>Overdue</Badge>: <Badge>Pending</Badge>}</Td>
                  <Td>{formatDate(f.dueDate)}</Td>
                  <Td><Button size='xs' colorScheme='purple' leftIcon={<Icon as={MdPayment} />} onClick={()=>window.location.href='/student/fees/pay'}>Pay</Button></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
