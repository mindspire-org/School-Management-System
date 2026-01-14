import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Select, Checkbox, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Input, FormControl, FormLabel, Divider, useToast, Flex } from '@chakra-ui/react';
import { MdPayment, MdPendingActions, MdAttachMoney, MdSettings } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatCurrency(n){ return new Intl.NumberFormat(undefined,{ style:'currency', currency:'PKR', maximumFractionDigits:0 }).format(n); }
function formatDate(d){ return d.toLocaleDateString(undefined,{ day:'2-digit', month:'short', year:'numeric' }); }

export default function OnlinePayment(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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

  const fees = useMemo(()=>{
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

  const pending = useMemo(()=> fees.filter(f=>f.status!=='paid'), [fees]);
  const [selected, setSelected] = useState([]);
  const [method, setMethod] = useState('card');
  const total = useMemo(()=> pending.filter(p=>selected.includes(p.id)).reduce((s,f)=>s+f.amount,0), [selected, pending]);

  const toggle = (id)=> setSelected(prev=> prev.includes(id)? prev.filter(x=>x!==id) : [...prev, id]);

  // Discounts & Fees
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState('');
  const feeRate = 0.02;
  const convenience = useMemo(()=> Math.max(50, Math.round(total * feeRate)), [total]);
  const payable = useMemo(()=> Math.max(0, total - discountAmount) + convenience, [total, discountAmount, convenience]);

  const applyDiscount = ()=>{
    let amt = 0;
    const code = discountCode.trim().toUpperCase();
    if (!total) { toast({ status:'info', title:'No items selected' }); return; }
    if (code === 'DISC100') amt = 100;
    else if (code === 'DISC5') amt = Math.round(total * 0.05);
    else { toast({ status:'error', title:'Invalid code' }); return; }
    setDiscountAmount(Math.min(amt, total));
    setDiscountApplied(code);
    toast({ status:'success', title:`Discount applied (${code})` });
  };

  // Payer & Method details
  const [terms, setTerms] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [cnic, setCnic] = useState('');

  const validCard = method==='card' ? (cardName && cardNumber.replace(/\s+/g,'').length>=12 && /^(0[1-9]|1[0-2])\/(\d{2})$/.test(cardExpiry) && cardCvv.length>=3) : true;
  const validWallet = method!=='card' ? (walletNumber.length>=10 && cnic.replace(/\D/g,'').length>=13) : true;
  const canPay = selected.length>0 && terms && validCard && validWallet && payable>0;

  const generateTxId = ()=> `TX-${Date.now().toString(36).toUpperCase()}`;
  const downloadProforma = ()=>{
    const items = pending.filter(p=>selected.includes(p.id));
    const lines = [
      `Proforma Invoice`,
      `${student.name} - ${student.rollNumber} - Class ${classSection}`,
      '',
      ...items.map(i=> `${i.title} (${i.month.toLocaleString(undefined,{ month:'short', year:'numeric' })}) - PKR ${i.amount}`),
      '',
      `Subtotal: PKR ${total}`,
      `Discount (${discountApplied||'—'}): -PKR ${discountAmount}`,
      `Convenience Fee (2% / min 50): PKR ${convenience}`,
      `Payable: PKR ${payable}`,
    ];
    const blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='proforma-invoice.txt'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Online Payment</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdPendingActions} w='22px' h='22px' color='white' />} />}
            name='Pending Items'
            value={String(pending.length)}
            trendData={[1,1,2,2,pending.length]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdAttachMoney} w='22px' h='22px' color='white' />} />}
            name='Selected Total'
            value={formatCurrency(total)}
            trendData={[0,0,1,2,3]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdSettings} w='22px' h='22px' color='white' />} />}
            name='Method'
            value={method==='card'? 'Card':'Wallet'}
            trendData={[1,1,1,1,1]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <VStack align='stretch' spacing={3}>
          <HStack spacing={3}>
            <Select size='sm' value={method} onChange={e=>setMethod(e.target.value)} maxW='220px'>
              <option value='card'>Card / Bank</option>
              <option value='easypaisa'>Easypaisa</option>
              <option value='jazzcash'>JazzCash</option>
            </Select>
            <HStack spacing={2}>
              <Input size='sm' placeholder='Discount code (DISC100 / DISC5)' value={discountCode} onChange={e=>setDiscountCode(e.target.value)} maxW='240px' />
              <Button size='sm' variant='outline' onClick={applyDiscount}>Apply</Button>
            </HStack>
            <Checkbox isChecked={terms} onChange={e=>setTerms(e.target.checked)}>Accept terms</Checkbox>
            <HStack ml='auto'>
              <Button size='sm' variant='outline' onClick={downloadProforma}>Proforma</Button>
              <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdPayment} />} isDisabled={!canPay} onClick={onOpen}>Pay {formatCurrency(payable)}</Button>
            </HStack>
          </HStack>
          <Text fontSize='sm' color={textSecondary}>Subtotal {formatCurrency(total)} • Discount {formatCurrency(discountAmount)} • Fee {formatCurrency(convenience)} • Payable {formatCurrency(payable)}</Text>
        </VStack>
      </Card>

      <SimpleGrid columns={{ base:1, md:2 }} spacing='12px' mb='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='12px'>Payer Details</Text>
          <SimpleGrid columns={{ base:1, sm:2 }} spacing={3}>
            <FormControl isReadOnly><FormLabel>Name</FormLabel><Input value={student.name} /></FormControl>
            <FormControl isReadOnly><FormLabel>Roll No.</FormLabel><Input value={student.rollNumber} /></FormControl>
            <FormControl isReadOnly><FormLabel>Class-Section</FormLabel><Input value={classSection} /></FormControl>
            <FormControl isReadOnly><FormLabel>Email</FormLabel><Input value={user?.email || ''} /></FormControl>
          </SimpleGrid>
        </Card>

        <Card p='16px'>
          <Text fontWeight='bold' mb='12px'>Payment Details</Text>
          {method==='card' ? (
            <VStack align='stretch' spacing={3}>
              <FormControl><FormLabel>Cardholder Name</FormLabel><Input placeholder='As on card' value={cardName} onChange={e=>setCardName(e.target.value)} /></FormControl>
              <FormControl><FormLabel>Card Number</FormLabel><Input placeholder='xxxx xxxx xxxx xxxx' value={cardNumber} onChange={e=>setCardNumber(e.target.value)} /></FormControl>
              <HStack>
                <FormControl><FormLabel>Expiry (MM/YY)</FormLabel><Input placeholder='MM/YY' value={cardExpiry} onChange={e=>setCardExpiry(e.target.value)} /></FormControl>
                <FormControl><FormLabel>CVV</FormLabel><Input placeholder='***' type='password' value={cardCvv} onChange={e=>setCardCvv(e.target.value)} /></FormControl>
              </HStack>
            </VStack>
          ) : (
            <VStack align='stretch' spacing={3}>
              <FormControl><FormLabel>Wallet Mobile</FormLabel><Input placeholder='03xxxxxxxxx' value={walletNumber} onChange={e=>setWalletNumber(e.target.value)} /></FormControl>
              <FormControl><FormLabel>CNIC</FormLabel><Input placeholder='35202-xxxxxxx-x' value={cnic} onChange={e=>setCnic(e.target.value)} /></FormControl>
              <Text fontSize='sm' color={textSecondary}>You will be redirected to {method==='easypaisa'?'Easypaisa':'JazzCash'} to authorize the payment.</Text>
            </VStack>
          )}
        </Card>
      </SimpleGrid>

      <Card p='0'>
        <Box overflowX='auto'>
          <Table size='sm' variant='striped' colorScheme='gray'>
            <Thead><Tr><Th>Select</Th><Th>Title</Th><Th>Month</Th><Th>Amount</Th><Th>Status</Th><Th>Due Date</Th></Tr></Thead>
            <Tbody>
              {pending.map(f=> (
                <Tr key={f.id}>
                  <Td><Checkbox isChecked={selected.includes(f.id)} onChange={()=>toggle(f.id)} /></Td>
                  <Td>{f.title}</Td>
                  <Td>{f.month.toLocaleString(undefined,{ month:'long', year:'numeric' })}</Td>
                  <Td>{formatCurrency(f.amount)}</Td>
                  <Td>{f.status==='overdue'? <Badge colorScheme='red'>Overdue</Badge>: <Badge>Pending</Badge>}</Td>
                  <Td>{formatDate(f.dueDate)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Card p='16px' mt='16px'>
        <Text fontWeight='bold' mb='8px'>Order Summary</Text>
        <VStack align='stretch' spacing={2}>
          {pending.filter(p=>selected.includes(p.id)).map(i=> (
            <HStack key={i.id} justify='space-between'>
              <Text>{i.title} • {i.month.toLocaleString(undefined,{ month:'short', year:'numeric' })}</Text>
              <Text>{formatCurrency(i.amount)}</Text>
            </HStack>
          ))}
          <Divider />
          <HStack justify='space-between'><Text color={textSecondary}>Subtotal</Text><Text>{formatCurrency(total)}</Text></HStack>
          <HStack justify='space-between'><Text color={textSecondary}>Discount {discountApplied? `(${discountApplied})`:''}</Text><Text>-{formatCurrency(discountAmount)}</Text></HStack>
          <HStack justify='space-between'><Text color={textSecondary}>Convenience Fee</Text><Text>{formatCurrency(convenience)}</Text></HStack>
          <HStack justify='space-between' fontWeight='bold'><Text>Total Payable</Text><Text>{formatCurrency(payable)}</Text></HStack>
        </VStack>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment Successful</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='start' spacing={2}>
              <Text>Transaction: {generateTxId()}</Text>
              <Text>Paid By: {student.name} • {student.rollNumber} • Class {classSection}</Text>
              <Text>Method: {method==='card'? 'Card/Bank': method}</Text>
              <Divider />
              {pending.filter(p=>selected.includes(p.id)).map(i=> (
                <HStack key={i.id} justify='space-between' w='full'>
                  <Text fontSize='sm'>{i.title} • {i.month.toLocaleString(undefined,{ month:'short', year:'numeric' })}</Text>
                  <Text fontSize='sm'>{formatCurrency(i.amount)}</Text>
                </HStack>
              ))}
              <Divider />
              <HStack justify='space-between' w='full'><Text fontSize='sm'>Subtotal</Text><Text fontSize='sm'>{formatCurrency(total)}</Text></HStack>
              <HStack justify='space-between' w='full'><Text fontSize='sm'>Discount</Text><Text fontSize='sm'>-{formatCurrency(discountAmount)}</Text></HStack>
              <HStack justify='space-between' w='full'><Text fontSize='sm'>Convenience Fee</Text><Text fontSize='sm'>{formatCurrency(convenience)}</Text></HStack>
              <HStack justify='space-between' w='full' fontWeight='bold'><Text>Total Paid</Text><Text>{formatCurrency(payable)}</Text></HStack>
              <Text>Date: {formatDate(new Date())}</Text>
            </VStack>
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
