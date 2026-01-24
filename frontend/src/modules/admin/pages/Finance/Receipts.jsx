import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, InputGroup, Input, InputLeftElement, Select, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, NumberInput, NumberInputField, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, Textarea } from '@chakra-ui/react';
import { MdReceiptLong, MdFileDownload, MdSearch, MdPictureAsPdf, MdRemoveRedEye, MdEdit, MdShare } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockReceipts = [
  { id: 'RCPT-3001', invoice: 'INV-1001', student: 'Ahsan Ali', amount: 12000, date: '2025-11-02', method: 'Cash', txnId: 'TXN-90001', receivedBy: 'Cashier 1', status: 'Success' },
  { id: 'RCPT-3002', invoice: 'INV-1002', student: 'Sara Khan', amount: 6000, date: '2025-11-03', method: 'Bank', txnId: 'TXN-90002', receivedBy: 'Cashier 2', status: 'Success' },
  { id: 'RCPT-3003', invoice: 'INV-1003', student: 'Hamza Iqbal', amount: 11500, date: '2025-11-03', method: 'Card', txnId: 'TXN-90003', receivedBy: 'Cashier 1', status: 'Success' },
];

export default function Receipts() {
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState(mockReceipts.map(r => ({ ...r, locked: false, logs: [{ date: '2025-11-02', event: 'Created' }] })));
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const shareDisc = useDisclosure();
  const cancelDisc = useDisclosure();
  const [cancel, setCancel] = useState({ id:'', reason:'' });
  const [form, setForm] = useState({ id: '', invoice: '', student: '', amount: 0, method: 'Cash', date: '', txnId: '', receivedBy: '', status: 'Success' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const totals = useMemo(() => {
    const total = rows.length;
    const amount = rows.reduce((s, r) => s + r.amount, 0);
    return { total, amount };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchesSearch = !search || r.student.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()) || r.invoice.toLowerCase().includes(search.toLowerCase());
      const matchesMethod = method === 'all' || r.method.toLowerCase() === method;
      const d = new Date(r.date);
      const afterFrom = !from || d >= new Date(from);
      const beforeTo = !to || d <= new Date(to);
      return matchesSearch && matchesMethod && afterFrom && beforeTo;
    });
  }, [rows, search, method, from, to]);

  const exportCSV = () => {
    const header = ['Receipt','Invoice','Student','Amount','Method','Date','Txn ID','Received By','Status'];
    const data = filtered.map(r => [r.id, r.invoice, r.student, r.amount, r.method, r.date, r.txnId, r.receivedBy, r.status]);
    const csv = [header, ...data].map(a=>a.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='receipts.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const header = ['Receipt','Invoice','Student','Amount','Method','Date','Txn ID','Received By','Status'];
    const data = filtered.map(r => [r.id, r.invoice, r.student, `Rs. ${r.amount.toLocaleString()}`, r.method, r.date, r.txnId, r.receivedBy, r.status]);
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipts</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px} table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px}th{background:#f5f5f5}</style>
      </head><body><h1>Receipts</h1>
      <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const duplicateReceipt = (r) => {
    const nextId = `RCPT-${Math.floor(3000 + Math.random()*7000)}`;
    const copy = { ...r, id: nextId, logs: [...(r.logs||[]), { date: new Date().toISOString().slice(0,10), event: 'Duplicated' }] };
    setRows(prev => [copy, ...prev]);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Receipts</Heading>
          <Text color={textColorSecondary}>Download and manage receipts</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={exportPDF}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Total Receipts" value={String(totals.total)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdReceiptLong} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Total Amount" value={`Rs. ${totals.amount.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdReceiptLong} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search receipt, invoice, or student' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='200px' value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value='all'>All Methods</option>
            <option value='cash'>Cash</option>
            <option value='bank'>Bank</option>
            <option value='card'>Card</option>
          </Select>
          <Input type='date' maxW='180px' value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type='date' maxW='180px' value={to} onChange={(e) => setTo(e.target.value)} />
        </Flex>
        {(!!search || method!=='all' || !!from || !!to) && (
          <Wrap mt={3} spacing={2}>
            {search && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='blue'><TagLabel>Search: {search}</TagLabel><TagCloseButton onClick={()=> setSearch('')} /></Tag></WrapItem>)}
            {method!=='all' && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='purple'><TagLabel>Method: {method}</TagLabel><TagCloseButton onClick={()=> setMethod('all')} /></Tag></WrapItem>)}
            {from && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='teal'><TagLabel>From: {from}</TagLabel><TagCloseButton onClick={()=> setFrom('')} /></Tag></WrapItem>)}
            {to && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='teal'><TagLabel>To: {to}</TagLabel><TagCloseButton onClick={()=> setTo('')} /></Tag></WrapItem>)}
          </Wrap>
        )}
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Box maxH='420px' overflowY='auto'>
          <Table size='sm' variant='simple'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Receipt</Th>
                <Th>Invoice</Th>
                <Th>Student</Th>
                <Th isNumeric>Amount</Th>
                <Th>Method</Th>
                <Th>Date</Th>
                <Th>Txn ID</Th>
                <Th>Received By</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.id}</Text></Td>
                  <Td>{r.invoice}</Td>
                  <Td>{r.student}</Td>
                  <Td isNumeric>Rs. {r.amount.toLocaleString()}</Td>
                  <Td>{r.method}</Td>
                  <Td><Text color={textColorSecondary}>{r.date}</Text></Td>
                  <Td><Text fontFamily='mono'>{r.txnId}</Text></Td>
                  <Td>{r.receivedBy}</Td>
                  <Td><Badge colorScheme={r.locked ? 'purple' : 'green'}>{r.locked ? 'Locked' : r.status}</Badge></Td>
                  <Td>
                    <Flex gap={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(r); viewDisc.onOpen(); }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(r); setForm({ ...r }); editDisc.onOpen(); }} />
                      <Button size='sm' leftIcon={<MdFileDownload />} onClick={()=>{ const html = `<!doctype html><html><head><meta charset='utf-8'/><title>Receipt ${r.id}</title></head><body><h1>Receipt ${r.id}</h1><p>Student: ${r.student}</p><p>Invoice: ${r.invoice}</p><p>Amount: Rs. ${r.amount.toLocaleString()}</p><p>Date: ${r.date}</p><script>window.onload=()=>{window.print();}</script></body></html>`; const w=window.open('','_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close(); }}>PDF</Button>
                      <Button size='sm' variant='outline' onClick={()=> duplicateReceipt(r)}>Duplicate</Button>
                      <Button size='sm' leftIcon={<MdShare />} variant='ghost' onClick={()=>{ setSelected(r); shareDisc.onOpen(); }}>Share</Button>
                      {!r.locked && <Button size='sm' variant='outline' onClick={()=> setRows(prev => prev.map(x=> x.id===r.id ? { ...x, locked:true, logs:[...(x.logs||[]), { date:new Date().toISOString().slice(0,10), event:'Locked' }] } : x))}>Lock</Button>}
                      <Button size='sm' colorScheme='red' variant='outline' onClick={()=>{ setCancel({ id:r.id, reason:'' }); cancelDisc.onOpen(); }}>Cancel</Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </Box>
        </Box>
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Receipt Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Receipt:</strong> {selected.id}</Text>
                <Text><strong>Invoice:</strong> {selected.invoice}</Text>
                <Text><strong>Student:</strong> {selected.student}</Text>
                <Text><strong>Amount:</strong> Rs. {selected.amount.toLocaleString()}</Text>
                <Text><strong>Method:</strong> {selected.method}</Text>
                <Text><strong>Date:</strong> {selected.date}</Text>
                <Text><strong>Txn ID:</strong> {selected.txnId}</Text>
                <Text><strong>Received By:</strong> {selected.receivedBy}</Text>
                <Text><strong>Status:</strong> {selected.locked ? 'Locked' : selected.status}</Text>
                {!!selected.logs && (
                  <Box mt={3}>
                    <Text fontWeight='600' mb={1}>Audit Trail</Text>
                    {selected.logs.map((l,idx)=>(<Text key={idx} color={textColorSecondary}>• {l.date}: {l.event}</Text>))}
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Receipt</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={2}>
            <FormControl mb={3}>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={form.amount} min={0} onChange={(v)=> setForm(f=>({ ...f, amount: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Method</FormLabel>
              <Select value={form.method.toLowerCase()} onChange={(e)=> setForm(f=>({ ...f, method: e.target.value.charAt(0).toUpperCase()+e.target.value.slice(1) }))}>
                <option value='cash'>Cash</option>
                <option value='bank'>Bank</option>
                <option value='card'>Card</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Date</FormLabel>
              <Input type='date' value={form.date} onChange={(e)=> setForm(f=>({ ...f, date: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Txn ID</FormLabel>
              <Input value={form.txnId} onChange={(e)=> setForm(f=>({ ...f, txnId: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Received By</FormLabel>
              <Input value={form.receivedBy} onChange={(e)=> setForm(f=>({ ...f, receivedBy: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => prev.map(r => r.id===form.id ? { ...r, amount: form.amount, method: form.method, date: form.date, txnId: form.txnId, receivedBy: form.receivedBy, logs:[...(r.logs||[]), { date:new Date().toISOString().slice(0,10), event:'Edited' }] } : r)); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={shareDisc.isOpen} onClose={shareDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Receipt</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>Choose a channel to send the receipt link/message.</Text>
            <Button mr={3}>SMS</Button>
            <Button mr={3}>Email</Button>
            <Button>WhatsApp</Button>
            <Text mt={4} color={textColorSecondary}>Note: Hook these to your SMS/Email/WhatsApp gateway later.</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={shareDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={cancelDisc.isOpen} onClose={cancelDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Receipt</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Reason</FormLabel>
              <Textarea rows={4} value={cancel.reason} onChange={(e)=> setCancel(c=>({ ...c, reason: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={cancelDisc.onClose}>Close</Button>
            <Button colorScheme='red' onClick={()=>{
              setRows(prev => prev.map(r => r.id===cancel.id ? { ...r, status:'Cancelled', logs:[...(r.logs||[]), { date:new Date().toISOString().slice(0,10), event:`Cancelled: ${cancel.reason||'No reason'}` }] } : r));
              cancelDisc.onClose();
            }}>Cancel Receipt</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
