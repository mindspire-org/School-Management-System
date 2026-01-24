import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, IconButton, Checkbox, FormControl, FormLabel, Tag, TagLabel, TagCloseButton, Wrap, WrapItem } from '@chakra-ui/react';
import { MdReceipt, MdPending, MdDoneAll, MdAdd, MdSearch, MdSend, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockInvoices = [
  { id: 'INV-1001', student: 'Ahsan Ali', class: '10-A', amount: 12000, balance: 0, status: 'Paid', due: '2025-11-01' },
  { id: 'INV-1002', student: 'Sara Khan', class: '10-A', amount: 12000, balance: 12000, status: 'Pending', due: '2025-11-10' },
  { id: 'INV-1003', student: 'Hamza Iqbal', class: '10-B', amount: 11500, balance: 11500, status: 'Overdue', due: '2025-10-15' },
];

export default function Invoices() {
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [rows, setRows] = useState(mockInvoices);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', status: 'Paid', due: '' });
  const createDisc = useDisclosure();
  const [createForm, setCreateForm] = useState({ id: '', student: '', class: '', amount: 0, balance: 0, status: 'Pending', due: '' });
  const bulkDisc = useDisclosure();
  const [bulkMsg, setBulkMsg] = useState('This is a reminder to clear your pending invoice.');
  const [selectedIds, setSelectedIds] = useState([]);
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return rows.filter((i) => {
      const matchesStatus = status === 'all' || i.status.toLowerCase() === status;
      const matchesSearch = !search || i.student.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
      const d = new Date(i.due);
      const afterFrom = !from || d >= new Date(from);
      const beforeTo = !to || d <= new Date(to);
      const amtOk = (!minAmt || i.amount >= Number(minAmt)) && (!maxAmt || i.amount <= Number(maxAmt));
      return matchesStatus && matchesSearch && afterFrom && beforeTo && amtOk;
    });
  }, [rows, status, search, from, to, minAmt, maxAmt]);

  const stats = useMemo(() => {
    const total = mockInvoices.length;
    const paid = mockInvoices.filter((i) => i.status === 'Paid').length;
    const pending = mockInvoices.filter((i) => i.status === 'Pending').length;
    return { total, paid, pending };
  }, []);

  const exportCSV = () => {
    const header = ['Invoice','Class','Student','Amount','Balance','Status','Due'];
    const data = filtered.map(i => [i.id, i.class, i.student, i.amount, i.balance, i.status, i.due]);
    const csv = [header, ...data].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='invoices.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const generatePDF = () => {
    const target = selectedIds.length ? rows.filter(r => selectedIds.includes(r.id)) : filtered;
    const header = ['Invoice','Class','Student','Amount','Balance','Status','Due','Age(days)'];
    const data = target.map(i => [
      i.id, i.class, i.student,
      `Rs. ${i.amount.toLocaleString()}`,
      `Rs. ${i.balance.toLocaleString()}`,
      i.status, i.due,
      String(Math.max(0, Math.round((new Date() - new Date(i.due)) / (1000*60*60*24))))
    ]);
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoices</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}h1{margin:0 0 12px;font-size:20px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style>
      </head><body><h1>Invoices</h1>
      <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const totals = useMemo(() => {
    const amount = filtered.reduce((s,i)=> s + i.amount, 0);
    const balance = filtered.reduce((s,i)=> s + i.balance, 0);
    return { amount, balance };
  }, [filtered]);

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const toggleSelectAll = (checked) => setSelectedIds(checked ? filtered.map(i=>i.id) : []);

  const totalRows = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const hasFilters = !!(search || status!=='all' || from || to || minAmt || maxAmt);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Invoices</Heading>
          <Text color={textColorSecondary}>Generate and manage fee invoices</Text>
        </Box>
        <Flex gap={2} align='center' wrap='nowrap'>
          <Button size='sm' leftIcon={<MdAdd />} colorScheme='blue' onClick={()=>{ const id = `INV-${Math.floor(1000+Math.random()*9000)}`; setCreateForm({ id, student:'', class:'', amount:0, balance:0, status:'Pending', due:'' }); createDisc.onOpen(); }}>Create Invoice</Button>
          <Button size='sm' leftIcon={<MdSend />} variant='outline' isDisabled={selectedIds.length===0} onClick={bulkDisc.onOpen}>Bulk Reminder</Button>
          <Button size='sm' leftIcon={<MdFileDownload />} variant='outline' onClick={exportCSV}>Export CSV</Button>
          <Button size='sm' leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={generatePDF}>Generate PDF</Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Total" value={String(stats.total)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdReceipt} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Paid" value={String(stats.paid)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdDoneAll} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Pending" value={String(stats.pending)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdPending} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex justify='space-between'>
          <Text color={useColorModeValue('gray.700','gray.200')} fontWeight='600'>Filtered Totals</Text>
          <Flex gap={6}>
            <Text>Amount: <strong>Rs. {totals.amount.toLocaleString()}</strong></Text>
            <Text>Balance: <strong>Rs. {totals.balance.toLocaleString()}</strong></Text>
            <Text>Selected: <strong>{selectedIds.length}</strong></Text>
          </Flex>
        </Flex>
      </Card>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search name or invoice' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='paid'>Paid</option>
            <option value='pending'>Pending</option>
            <option value='overdue'>Overdue</option>
          </Select>
          <Input type='date' maxW='180px' value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type='date' maxW='180px' value={to} onChange={(e) => setTo(e.target.value)} />
          <Input type='number' placeholder='Min Amount' maxW='160px' value={minAmt} onChange={(e) => setMinAmt(e.target.value)} />
          <Input type='number' placeholder='Max Amount' maxW='160px' value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} />
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
            {status!=='all' && (
              <WrapItem>
                <Tag size='sm' variant='subtle' colorScheme='purple'>
                  <TagLabel>Status: {status}</TagLabel>
                  <TagCloseButton onClick={()=> setStatus('all')} />
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
            {minAmt && (
              <WrapItem>
                <Tag size='sm' variant='subtle' colorScheme='orange'>
                  <TagLabel>Min: {minAmt}</TagLabel>
                  <TagCloseButton onClick={()=> setMinAmt('')} />
                </Tag>
              </WrapItem>
            )}
            {maxAmt && (
              <WrapItem>
                <Tag size='sm' variant='subtle' colorScheme='orange'>
                  <TagLabel>Max: {maxAmt}</TagLabel>
                  <TagCloseButton onClick={()=> setMaxAmt('')} />
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
                <Th width='40px'>
                  <Checkbox isChecked={selectedIds.length===filtered.length && filtered.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<filtered.length} onChange={(e)=> toggleSelectAll(e.target.checked)} />
                </Th>
                <Th>Invoice</Th>
                <Th>Class</Th>
                <Th>Student</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>Balance</Th>
                <Th>Status</Th>
                <Th>Due Date</Th>
                <Th isNumeric>Age (days)</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pageRows.map((i) => (
                <Tr key={i.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Checkbox isChecked={selectedIds.includes(i.id)} onChange={()=> toggleSelect(i.id)} /></Td>
                  <Td><Text fontWeight='600'>{i.id}</Text></Td>
                  <Td><Badge colorScheme='blue'>{i.class}</Badge></Td>
                  <Td>{i.student}</Td>
                  <Td isNumeric>Rs. {i.amount.toLocaleString()}</Td>
                  <Td isNumeric>Rs. {i.balance.toLocaleString()}</Td>
                  <Td><Badge colorScheme={i.status === 'Paid' ? 'green' : i.status === 'Pending' ? 'yellow' : 'red'}>{i.status}</Badge></Td>
                  <Td><Text color={textColorSecondary}>{i.due}</Text></Td>
                  <Td isNumeric>{Math.max(0, Math.round((new Date() - new Date(i.due)) / (1000*60*60*24)))}</Td>
                  <Td>
                    <Flex gap={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(i); viewDisc.onOpen(); }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(i); setForm({ id: i.id, status: i.status, due: i.due }); editDisc.onOpen(); }} />
                      <Button size='sm' leftIcon={<MdSend />} onClick={()=>{ setSelected(i); viewDisc.onOpen(); }}>Reminder</Button>
                      {i.status !== 'Paid' && (
                        <Button size='sm' variant='outline' onClick={()=> setRows(prev => prev.map(r => r.id===i.id ? { ...r, status: 'Paid', balance: 0 } : r))}>Mark Paid</Button>
                      )}
                    </Flex>
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
          <ModalHeader>Invoice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Invoice:</strong> {selected.id}</Text>
                <Text><strong>Student:</strong> {selected.student} ({selected.class})</Text>
                <Text><strong>Amount:</strong> Rs. {selected.amount.toLocaleString()}</Text>
                <Text><strong>Balance:</strong> Rs. {selected.balance.toLocaleString()}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
                <Text><strong>Due Date:</strong> {selected.due}</Text>
                <Text><strong>Age:</strong> {Math.max(0, Math.round((new Date() - new Date(selected.due)) / (1000*60*60*24)))} days</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
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
            <Input type='date' value={form.due} onChange={(e)=> setForm(f=>({ ...f, due: e.target.value }))} />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRows(prev => prev.map(r => r.id===form.id ? { ...r, status: form.status, due: form.due } : r));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Invoice Modal */}
      <Modal isOpen={createDisc.isOpen} onClose={createDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Invoice ID</FormLabel>
              <Input value={createForm.id} onChange={(e)=> setCreateForm(f=>({ ...f, id: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Student</FormLabel>
              <Input value={createForm.student} onChange={(e)=> setCreateForm(f=>({ ...f, student: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Class</FormLabel>
              <Input value={createForm.class} onChange={(e)=> setCreateForm(f=>({ ...f, class: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Amount</FormLabel>
              <Input type='number' value={createForm.amount} onChange={(e)=> setCreateForm(f=>({ ...f, amount: Number(e.target.value)||0 }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Due Date</FormLabel>
              <Input type='date' value={createForm.due} onChange={(e)=> setCreateForm(f=>({ ...f, due: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={createDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => [{ id:createForm.id, student:createForm.student, class:createForm.class, amount:createForm.amount, balance:createForm.amount, status:createForm.status, due:createForm.due }, ...prev]); createDisc.onClose(); }}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Reminder Modal */}
      <Modal isOpen={bulkDisc.isOpen} onClose={bulkDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Reminder ({selectedIds.length} selected)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input as='textarea' rows={4} value={bulkMsg} onChange={(e)=> setBulkMsg(e.target.value)} />
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={bulkDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ bulkDisc.onClose(); }}>Send</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
