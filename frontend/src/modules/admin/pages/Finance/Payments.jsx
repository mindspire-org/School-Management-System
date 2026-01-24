import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, IconButton, FormControl, FormLabel, NumberInput, NumberInputField, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, Textarea } from '@chakra-ui/react';
import { MdAttachMoney, MdAddCircle, MdCheckCircle, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockPayments = [
  { id: 'PAY-2001', student: 'Ahsan Ali', amount: 12000, method: 'Cash', date: '2025-11-02', status: 'Success', txnId: 'TXN-70001', receivedBy: 'Cashier 1' },
  { id: 'PAY-2002', student: 'Sara Khan', amount: 6000, method: 'Bank', date: '2025-11-03', status: 'Success', txnId: 'TXN-70002', receivedBy: 'Cashier 2' },
  { id: 'PAY-2003', student: 'Hamza Iqbal', amount: 11500, method: 'Card', date: '2025-11-03', status: 'Success', txnId: 'TXN-70003', receivedBy: 'Cashier 1' },
];

export default function Payments() {
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState(mockPayments);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', amount: 0, method: 'Cash', date: '', status: 'Pending', txnId: '', receivedBy: '', slip: '', note: '' });
  const [refund, setRefund] = useState({ id:'', amount:0, reason:'' });
  const refundDisc = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const stats = useMemo(() => {
    const total = rows.length;
    const sum = rows.reduce((s, p) => s + p.amount, 0);
    const avg = Math.round(sum / Math.max(1, total));
    return { total, sum, avg };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const matchesSearch = !search || p.student.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
      const matchesMethod = method === 'all' || p.method.toLowerCase() === method;
      const d = new Date(p.date);
      const afterFrom = !from || d >= new Date(from);
      const beforeTo = !to || d <= new Date(to);
      return matchesSearch && matchesMethod && afterFrom && beforeTo;
    });
  }, [rows, search, method, from, to]);

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const hasFilters = !!(search || method!=='all' || from || to);

  const exportCSV = () => {
    const header = ['Payment','Student','Amount','Method','Date','Status','Txn ID','Received By'];
    const data = filtered.map(p => [p.id, p.student, p.amount, p.method, p.date, p.status, p.txnId, p.receivedBy]);
    const csv = [header, ...data].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='payments.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const generateReceipt = (p) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt ${p.id}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}h1{margin:0 0 12px;font-size:20px}
      .row{margin:4px 0}</style></head><body>
      <h1>Payment Receipt</h1>
      <div class='row'><strong>Receipt:</strong> ${p.id}</div>
      <div class='row'><strong>Student:</strong> ${p.student || ''}</div>
      <div class='row'><strong>Amount:</strong> Rs. ${p.amount.toLocaleString()}</div>
      <div class='row'><strong>Method:</strong> ${p.method}</div>
      <div class='row'><strong>Date:</strong> ${p.date}</div>
      <div class='row'><strong>Txn ID:</strong> ${p.txnId}</div>
      <div class='row'><strong>Received By:</strong> ${p.receivedBy}</div>
      <div class='row'><strong>Status:</strong> ${p.status}</div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const approvePayment = (pay) => {
    setRows(prev => prev.map(r => r.id===pay.id ? { ...r, status: 'Approved' } : r));
    generateReceipt({ ...pay, status: 'Approved' });
  };

  const generatePDF = () => {
    const header = ['Payment','Student','Amount','Method','Date','Status','Txn ID','Received By'];
    const data = filtered.map(p => [
      p.id, p.student, `Rs. ${p.amount.toLocaleString()}`, p.method, p.date, p.status, p.txnId, p.receivedBy,
    ]);
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Payments</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}h1{margin:0 0 12px;font-size:20px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style>
      </head><body><h1>Payments</h1>
      <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Payments</Heading>
          <Text color={textColorSecondary}>Record and view fee payments</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAddCircle />} colorScheme='blue' onClick={()=>{ const nextId = `PAY-${Math.floor(2000 + Math.random()*8000)}`; setForm({ id: nextId, student: '', amount: 0, method: 'Cash', date: '', status: 'Pending', txnId: `TXN-${Math.floor(70000+Math.random()*20000)}`, receivedBy: 'Cashier 1', slip:'', note:'' }); editDisc.onOpen(); }}>Add Payment</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={generatePDF}>Generate PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Transactions" value={String(stats.total)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdAttachMoney} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Total Amount" value={`Rs. ${stats.sum.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdCheckCircle} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Avg Payment" value={`Rs. ${stats.avg.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdAttachMoney} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search payment or student' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='200px' value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value='all'>All Methods</option>
            <option value='cash'>Cash</option>
            <option value='bank'>Bank</option>
            <option value='card'>Card</option>
            <option value='online'>Online</option>
            <option value='jazzcash'>JazzCash</option>
            <option value='easypaisa'>EasyPaisa</option>
          </Select>
          <Input type='date' maxW='180px' value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type='date' maxW='180px' value={to} onChange={(e) => setTo(e.target.value)} />
        </Flex>
        {hasFilters && (
          <Wrap mt={3} spacing={2}>
            {search && (
              <WrapItem>
                <Tag size='sm' variant='subtle' colorScheme='blue'>
                  <TagLabel>Search: {search}</TagLabel>
                  <TagCloseButton onClick={()=> setSearch('')} />
                </Tag>
              </WrapItem>
            )}
            {method!=='all' && (
              <WrapItem>
                <Tag size='sm' variant='subtle' colorScheme='purple'>
                  <TagLabel>Method: {method}</TagLabel>
                  <TagCloseButton onClick={()=> setMethod('all')} />
                </Tag>
              </WrapItem>
            )}
            {from && (
              <WrapItem>
                <Tag size='sm' variant='subtle' colorScheme='teal'>
                  <TagLabel>From: {from}</TagLabel>
                  <TagCloseButton onClick={()=> setFrom('')} />
                </Tag>
              </WrapItem>
            )}
            {to && (
              <WrapItem>
                <Tag size='sm' variant='subtle' colorScheme='teal'>
                  <TagLabel>To: {to}</TagLabel>
                  <TagCloseButton onClick={()=> setTo('')} />
                </Tag>
              </WrapItem>
            )}
          </Wrap>
        )}
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Box maxH='420px' overflowY='auto'>
          <Table size='sm' variant='simple'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Payment</Th>
                <Th>Student</Th>
                <Th isNumeric>Amount</Th>
                <Th>Method</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Txn ID</Th>
                <Th>Received By</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pageRows.map((p) => (
                <Tr key={p.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{p.id}</Text></Td>
                  <Td>{p.student}</Td>
                  <Td isNumeric>Rs. {p.amount.toLocaleString()}</Td>
                  <Td>{p.method}</Td>
                  <Td><Text color={textColorSecondary}>{p.date}</Text></Td>
                  <Td><Badge colorScheme={p.status==='Approved'?'green':p.status==='Pending'?'yellow':'green'}>{p.status}</Badge></Td>
                  <Td><Text fontFamily='mono'>{p.txnId}</Text></Td>
                  <Td>{p.receivedBy}</Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(p); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(p); setForm({ ...p }); editDisc.onOpen(); }} />
                    {p.status==='Pending' && <Button size='sm' variant='outline' onClick={()=> approvePayment(p)}>Approve</Button>}
                    <Button size='sm' variant='ghost' onClick={()=>{ setRefund({ id:p.id, amount:0, reason:'' }); refundDisc.onOpen(); }}>Refund</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </Box>
        </Box>
      </Card>

      <Flex justify='space-between' align='center' mt={3} mb={8} px={2}>
        <Text fontSize='sm' color={textColorSecondary}>Showing {Math.min(totalRows, start+1)}–{Math.min(totalRows, start+pageSize)} of {totalRows}</Text>
        <Flex align='center' gap={3}>
          <Select size='sm' w='auto' value={pageSize} onChange={(e)=>{ setPage(1); setPageSize(Number(e.target.value)); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </Select>
          <Button size='sm' onClick={()=> setPage(p => Math.max(1, p-1))} isDisabled={page===1}>Prev</Button>
          <Text fontSize='sm'>Page {page} / {totalPages}</Text>
          <Button size='sm' onClick={()=> setPage(p => Math.min(totalPages, p+1))} isDisabled={page===totalPages}>Next</Button>
        </Flex>
      </Flex>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payment Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Payment:</strong> {selected.id}</Text>
                <Text><strong>Student:</strong> {selected.student}</Text>
                <Text><strong>Amount:</strong> Rs. {selected.amount.toLocaleString()}</Text>
                <Text><strong>Method:</strong> {selected.method}</Text>
                <Text><strong>Date:</strong> {selected.date}</Text>
                <Text><strong>Txn ID:</strong> {selected.txnId}</Text>
                <Text><strong>Received By:</strong> {selected.receivedBy}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{rows.some(r=>r.id===form.id) ? 'Edit Payment' : 'Add Payment'}</ModalHeader>
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
                <option value='online'>Online</option>
                <option value='jazzcash'>JazzCash</option>
                <option value='easypaisa'>EasyPaisa</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Date</FormLabel>
              <Input type='date' value={form.date} onChange={(e)=> setForm(f=>({ ...f, date: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Upload Slip (optional)</FormLabel>
              <Input type='file' accept='image/*,application/pdf' onChange={(e)=> setForm(f=>({ ...f, slip: e.target.files?.[0]?.name || '' }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Received By</FormLabel>
              <Input value={form.receivedBy} onChange={(e)=> setForm(f=>({ ...f, receivedBy: e.target.value }))} />
            </FormControl>
            <FormControl mt={3}>
              <FormLabel>Note</FormLabel>
              <Textarea rows={3} value={form.note} onChange={(e)=> setForm(f=>({ ...f, note: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => { const exists = prev.some(r=>r.id===form.id); if(exists){ return prev.map(r => r.id===form.id ? { ...r, amount: form.amount, method: form.method, date: form.date, receivedBy: form.receivedBy, slip: form.slip, note: form.note, status: form.status } : r);} const created = { id: form.id, student: form.student || 'New Student', amount: form.amount, method: form.method, date: form.date, status: form.status, txnId: form.txnId || `TXN-${Date.now()}`, receivedBy: form.receivedBy, slip: form.slip, note: form.note }; generateReceipt(created); return [...prev, created]; }); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Refund / Adjustment Modal */}
      <Modal isOpen={refundDisc.isOpen} onClose={refundDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Refund / Adjustment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={refund.amount} min={0} onChange={(v)=> setRefund(f=>({ ...f, amount: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Reason</FormLabel>
              <Textarea rows={3} value={refund.reason} onChange={(e)=> setRefund(f=>({ ...f, reason: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={refundDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => prev.map(r => r.id===refund.id ? { ...r, amount: Math.max(0, r.amount - refund.amount) } : r)); refundDisc.onClose(); }}>Apply</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
