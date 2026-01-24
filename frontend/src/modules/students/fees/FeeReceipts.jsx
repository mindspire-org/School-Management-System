import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Button, Icon, useColorModeValue, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdPrint, MdVisibility, MdAttachMoney, MdEvent } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatCurrency(n){ return new Intl.NumberFormat(undefined,{ style:'currency', currency:'PKR', maximumFractionDigits:0 }).format(n); }
function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }

export default function FeeReceipts(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

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

  const receipts = useMemo(()=>{
    const today = new Date();
    const mk = (id,title,monthOffset,amount)=>{
      const m = new Date(today.getFullYear(), today.getMonth()-monthOffset, 1);
      const paid = new Date(m.getFullYear(), m.getMonth(), 8);
      return { id, receiptNo:`RCPT-${m.getMonth()+1}${m.getFullYear()}-${student.rollNumber}`, title, month:m, amount, paidDate: paid, method:'Online' };
    };
    return [
      mk('R1','Tuition Fee',1,15000),
      mk('R2','Lab Fee',1,2500),
      mk('R3','Exam Fee',2,4000),
      mk('R4','Transport Fee',4,3000),
      mk('R5','Tuition Fee',4,15000),
    ];
  },[student]);

  const exportCsv = ()=>{
    const rows = ['Receipt,Title,Month,Amount,Paid On,Method', ...receipts.map(r=> `${r.receiptNo},${r.title},${r.month.toLocaleString(undefined,{ month:'short', year:'numeric' })},${r.amount},${formatDate(r.paidDate)},${r.method}`)];
    const blob = new Blob([rows.join('\n')],{ type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='fee-receipts.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const downloadTxt = (r)=>{
    const content = `${student.name}\n${student.rollNumber}\n${classSection}\nReceipt: ${r.receiptNo}\n${r.title} ${r.month.toLocaleString(undefined,{ month:'long', year:'numeric' })}\nAmount: ${formatCurrency(r.amount)}\nMethod: ${r.method}\nPaid: ${formatDate(r.paidDate)}`;
    const blob = new Blob([content],{ type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`${r.receiptNo}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Fee Receipts</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdFileDownload} w='22px' h='22px' color='white' />} />}
            name='Total Receipts'
            value={String(receipts.length)}
            trendData={[1,1,2,3,receipts.length]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdAttachMoney} w='22px' h='22px' color='white' />} />}
            name='Total Paid'
            value={formatCurrency(receipts.reduce((s,r)=>s+r.amount,0))}
            trendData={[1,2,2,3,4]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdEvent} w='22px' h='22px' color='white' />} />}
            name='Last Paid'
            value={formatDate(receipts.slice().sort((a,b)=>b.paidDate-a.paidDate)[0].paidDate)}
            trendData={[1,1,1,1,1]}
            trendColor='#805AD5'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3}>
          <Button size='sm' onClick={exportCsv} leftIcon={<Icon as={MdFileDownload} />}>Export CSV</Button>
          <Button size='sm' variant='outline' onClick={()=>window.print()} leftIcon={<Icon as={MdPrint} />}>Print</Button>
        </HStack>
      </Card>

      <Card p='0'>
        <Box overflowX='auto'>
          <Table size='sm' variant='striped' colorScheme='gray'>
            <Thead><Tr><Th>Receipt</Th><Th>Title</Th><Th>Month</Th><Th>Amount</Th><Th>Paid On</Th><Th>Method</Th><Th>Action</Th></Tr></Thead>
            <Tbody>
              {receipts.map(r=> (
                <Tr key={r.id}>
                  <Td><Badge colorScheme='purple'>{r.receiptNo}</Badge></Td>
                  <Td>{r.title}</Td>
                  <Td>{r.month.toLocaleString(undefined,{ month:'long', year:'numeric' })}</Td>
                  <Td>{formatCurrency(r.amount)}</Td>
                  <Td>{formatDate(r.paidDate)}</Td>
                  <Td>{r.method}</Td>
                  <Td>
                    <HStack>
                      <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(r); onOpen(); }}>Preview</Button>
                      <Button size='xs' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>downloadTxt(r)}>Download</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
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
