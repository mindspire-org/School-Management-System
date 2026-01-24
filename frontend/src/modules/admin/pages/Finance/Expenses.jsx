import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, NumberInput, NumberInputField, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, Textarea, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { MdSavings, MdCategory, MdStore, MdUploadFile, MdAddCircle, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit, MdCheckCircle } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';

const mockCategories = ['Utilities','Transport','Supplies','Maintenance'];
const mockVendors = ['Alpha Stationers','Metro Gas','City Transport','FixIt Services'];
const mockExpenses = [
  { id: 'EXP-5001', date: '2025-11-01', category: 'Utilities', vendor: 'Metro Gas', description: 'Gas bill - Oct', amount: 18000, status: 'Pending', receipt: '', note: '', logs:[{ date:'2025-11-01', event:'Created' }] },
  { id: 'EXP-5002', date: '2025-11-02', category: 'Supplies', vendor: 'Alpha Stationers', description: 'Exam sheets', amount: 9500, status: 'Approved', receipt: '', note: '', logs:[{ date:'2025-11-02', event:'Created' }] },
  { id: 'EXP-5003', date: '2025-11-03', category: 'Maintenance', vendor: 'FixIt Services', description: 'Projector repair', amount: 6500, status: 'Paid', receipt: '', note: '', logs:[{ date:'2025-11-03', event:'Created' }] },
];

export default function Expenses() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [vendor, setVendor] = useState('all');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState(mockExpenses);
  const [cats, setCats] = useState(mockCategories);
  const [vendors, setVendors] = useState(mockVendors);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const catDisc = useDisclosure();
  const vendorDisc = useDisclosure();
  const [form, setForm] = useState({ id:'', date:'', category:'Utilities', vendor:'', description:'', amount:0, status:'Pending', receipt:'', note:'' });
  const [newCat, setNewCat] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const filtered = useMemo(() => rows.filter(r => {
    const s = search.toLowerCase();
    const matchesSearch = !s || r.description.toLowerCase().includes(s) || r.vendor.toLowerCase().includes(s) || r.category.toLowerCase().includes(s) || r.id.toLowerCase().includes(s);
    const matchesCat = category==='all' || r.category===category;
    const matchesVendor = vendor==='all' || r.vendor===vendor;
    const matchesStatus = status==='all' || r.status.toLowerCase()===status;
    const d = new Date(r.date);
    const afterFrom = !from || d >= new Date(from);
    const beforeTo = !to || d <= new Date(to);
    return matchesSearch && matchesCat && matchesVendor && matchesStatus && afterFrom && beforeTo;
  }), [rows, search, category, vendor, status, from, to]);

  const stats = useMemo(() => {
    const total = filtered.reduce((s,r)=> s + r.amount, 0);
    const pending = filtered.filter(r=>r.status==='Pending').length;
    const approved = filtered.filter(r=>r.status==='Approved').length;
    const paid = filtered.filter(r=>r.status==='Paid').reduce((s,r)=> s + r.amount, 0);
    const avg = Math.round(total / Math.max(1, filtered.length));
    return { total, pending, approved, paid, avg };
  }, [filtered]);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach(r => { map[r.category] = (map[r.category]||0) + r.amount; });
    const labels = Object.keys(map); const values = labels.map(l=> map[l]);
    return { labels, values };
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page-1)*pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const hasFilters = !!(search || category!=='all' || vendor!=='all' || status!=='all' || from || to);

  const exportCSV = () => {
    const header = ['ID','Date','Category','Vendor','Description','Amount','Status'];
    const data = filtered.map(r => [r.id, r.date, r.category, r.vendor, r.description, r.amount, r.status]);
    const csv = [header, ...data].map(a=>a.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='expenses.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const header = ['ID','Date','Category','Vendor','Description','Amount','Status'];
    const data = filtered.map(r => [r.id, r.date, r.category, r.vendor, r.description, `Rs. ${r.amount.toLocaleString()}`, r.status]);
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Expenses</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}h1{margin:0 0 12px;font-size:20px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style>
      </head><body><h1>Expenses</h1>
      <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const approveExpense = (exp) => {
    setRows(prev => prev.map(r => r.id===exp.id ? { ...r, status: 'Approved', logs:[...(r.logs||[]), { date:new Date().toISOString().slice(0,10), event:'Approved' }] } : r));
  };
  const markPaid = (exp) => {
    setRows(prev => prev.map(r => r.id===exp.id ? { ...r, status: 'Paid', logs:[...(r.logs||[]), { date:new Date().toISOString().slice(0,10), event:'Paid' }] } : r));
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center" gap={3}>
        <Box>
          <Heading as="h3" size="lg" mb={1}>Expenses</Heading>
          <Text color={textColorSecondary}>Categories, vendors, uploads, status and analytics</Text>
        </Box>
        <Flex gap={2} wrap='nowrap' overflowX='auto' whiteSpace='nowrap'>
          <Button size='sm' leftIcon={<MdAddCircle />} colorScheme='blue' onClick={()=>{ const id=`EXP-${Math.floor(5000+Math.random()*4000)}`; setForm({ id, date:'', category: cats[0]||'Utilities', vendor: vendors[0]||'', description:'', amount:0, status:'Pending', receipt:'', note:'' }); editDisc.onOpen(); }}>Add Expense</Button>
          <Button size='sm' leftIcon={<MdCategory />} variant='outline' onClick={catDisc.onOpen}>Categories</Button>
          <Button size='sm' leftIcon={<MdStore />} variant='outline' onClick={vendorDisc.onOpen}>Vendors</Button>
          <Button size='sm' leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button size='sm' leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={exportPDF}>Export PDF</Button>
        </Flex>
      </Flex>

      <Box overflowX='auto' mb={5}>
        <Flex gap={5} wrap='nowrap'>
          <Box minW='240px'>
            <MiniStatistics name="Total Expense" value={`Rs. ${stats.total.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdSavings} w='28px' h='28px' color='white' />} />} />
          </Box>
          <Box minW='240px'>
            <MiniStatistics name="Pending" value={String(stats.pending)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdUploadFile} w='28px' h='28px' color='white' />} />} />
          </Box>
          <Box minW='240px'>
            <MiniStatistics name="Approved" value={String(stats.approved)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdCheckCircle} w='28px' h='28px' color='white' />} />} />
          </Box>
          <Box minW='240px'>
            <MiniStatistics name="Paid" value={`Rs. ${stats.paid.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdSavings} w='28px' h='28px' color='white' />} />} />
          </Box>
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Spend by Category</Heading>
          <PieChart chartData={byCategory.values} chartOptions={{ labels: byCategory.labels, legend:{ position:'right' } }} />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Last 6 Entries (Amount)</Heading>
          <BarChart chartData={[{ name:'Amount', data: filtered.slice(-6).map(r=>r.amount) }]} chartOptions={{ xaxis:{ categories: filtered.slice(-6).map(r=>r.id) }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'40%' } } }} />
        </Card>
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search ID, description, vendor' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='200px' value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value='all'>All Categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select maxW='200px' value={vendor} onChange={(e) => setVendor(e.target.value)}>
            <option value='all'>All Vendors</option>
            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
          </Select>
          <Select maxW='180px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='pending'>Pending</option>
            <option value='approved'>Approved</option>
            <option value='paid'>Paid</option>
          </Select>
          <Input type='date' maxW='180px' value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type='date' maxW='180px' value={to} onChange={(e) => setTo(e.target.value)} />
        </Flex>
        {hasFilters && (
          <Wrap mt={3} spacing={2}>
            {search && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='blue'><TagLabel>Search: {search}</TagLabel><TagCloseButton onClick={()=> setSearch('')} /></Tag></WrapItem>)}
            {category!=='all' && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='purple'><TagLabel>Category: {category}</TagLabel><TagCloseButton onClick={()=> setCategory('all')} /></Tag></WrapItem>)}
            {vendor!=='all' && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='teal'><TagLabel>Vendor: {vendor}</TagLabel><TagCloseButton onClick={()=> setVendor('all')} /></Tag></WrapItem>)}
            {status!=='all' && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='orange'><TagLabel>Status: {status}</TagLabel><TagCloseButton onClick={()=> setStatus('all')} /></Tag></WrapItem>)}
            {from && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='pink'><TagLabel>From: {from}</TagLabel><TagCloseButton onClick={()=> setFrom('')} /></Tag></WrapItem>)}
            {to && (<WrapItem><Tag size='sm' variant='subtle' colorScheme='pink'><TagLabel>To: {to}</TagLabel><TagCloseButton onClick={()=> setTo('')} /></Tag></WrapItem>)}
          </Wrap>
        )}
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Box maxH='420px' overflowY='auto'>
          <Table variant='simple' size='sm'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>ID</Th>
                <Th>Date</Th>
                <Th>Category</Th>
                <Th>Vendor</Th>
                <Th>Description</Th>
                <Th isNumeric>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pageRows.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.id}</Text></Td>
                  <Td><Text color={textColorSecondary}>{r.date}</Text></Td>
                  <Td>{r.category}</Td>
                  <Td>{r.vendor}</Td>
                  <Td maxW='260px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>{r.description}</Td>
                  <Td isNumeric>Rs. {r.amount.toLocaleString()}</Td>
                  <Td><Badge colorScheme={r.status==='Paid'?'green':r.status==='Approved'?'purple':'yellow'}>{r.status}</Badge></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(r); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setForm({ ...r }); editDisc.onOpen(); }} />
                    {r.status==='Pending' && <Button size='sm' variant='outline' onClick={()=> approveExpense(r)}>Approve</Button>}
                    {r.status!=='Paid' && <Button size='sm' onClick={()=> markPaid(r)}>Mark Paid</Button>}
                    {r.receipt && <Button size='sm' variant='ghost' onClick={()=>{ const html = `<!doctype html><html><head><meta charset='utf-8'/><title>Receipt</title></head><body><h2>Receipt File</h2><p>${r.receipt}</p><script>window.onload=()=>{window.print();}</script></body></html>`; const w=window.open('','_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close(); }}>Receipt</Button>}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </Box>
        </Box>
      </Card>

      <Flex justify='space-between' align='center' mt={3} mb={8} px={2}>
        <Text color={textColorSecondary}>Showing {start+1}-{Math.min(start+pageSize, filtered.length)} of {filtered.length}</Text>
        <Flex align='center' gap={3}>
          <Select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} w='90px'>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </Select>
          <Button onClick={()=> setPage(p=> Math.max(1, p-1))} isDisabled={page===1}>Prev</Button>
          <Text>{page}/{pageCount}</Text>
          <Button onClick={()=> setPage(p=> Math.min(pageCount, p+1))} isDisabled={page===pageCount}>Next</Button>
        </Flex>
      </Flex>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Expense Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Date:</strong> {selected.date}</Text>
                <Text><strong>Category:</strong> {selected.category}</Text>
                <Text><strong>Vendor:</strong> {selected.vendor}</Text>
                <Text><strong>Description:</strong> {selected.description}</Text>
                <Text><strong>Amount:</strong> Rs. {selected.amount.toLocaleString()}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
                {selected.note && <Text><strong>Note:</strong> {selected.note}</Text>}
                {!!selected.logs && (
                  <Box mt={3}>
                    <Text fontWeight='600' mb={1}>Logs</Text>
                    {selected.logs.map((l,idx)=>(<Text key={idx} color={textColorSecondary}>• {l.date}: {l.event}</Text>))}
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{rows.some(r=>r.id===form.id) ? 'Edit Expense' : 'Add Expense'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={2}>
            <FormControl mb={3}>
              <FormLabel>Date</FormLabel>
              <Input type='date' value={form.date} onChange={(e)=> setForm(f=>({ ...f, date: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Category</FormLabel>
              <Select value={form.category} onChange={(e)=> setForm(f=>({ ...f, category: e.target.value }))}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Vendor</FormLabel>
              <Select value={form.vendor} onChange={(e)=> setForm(f=>({ ...f, vendor: e.target.value }))}>
                {vendors.map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Description</FormLabel>
              <Textarea rows={3} value={form.description} onChange={(e)=> setForm(f=>({ ...f, description: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Amount</FormLabel>
              <NumberInput value={form.amount} min={0} onChange={(v)=> setForm(f=>({ ...f, amount: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Status</FormLabel>
              <Select value={form.status} onChange={(e)=> setForm(f=>({ ...f, status: e.target.value }))}>
                <option value='Pending'>Pending</option>
                <option value='Approved'>Approved</option>
                <option value='Paid'>Paid</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Upload Receipt</FormLabel>
              <Input type='file' accept='image/*,application/pdf' onChange={(e)=> setForm(f=>({ ...f, receipt: e.target.files?.[0]?.name || '' }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea rows={3} value={form.note} onChange={(e)=> setForm(f=>({ ...f, note: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => { const exists = prev.some(r=>r.id===form.id); const item = { ...form, logs: exists ? prev.find(r=>r.id===form.id)?.logs || [] : [{ date:new Date().toISOString().slice(0,10), event:'Created' }] }; if(exists){ return prev.map(r => r.id===form.id ? { ...item, logs:[...item.logs, { date:new Date().toISOString().slice(0,10), event:'Edited' }] } : r);} return [item, ...prev]; }); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={catDisc.isOpen} onClose={catDisc.onClose} size='sm'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Categories</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Category</FormLabel>
              <Input value={newCat} onChange={(e)=> setNewCat(e.target.value)} placeholder='Enter name' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={catDisc.onClose}>Close</Button>
            <Button colorScheme='blue' onClick={()=>{ if(newCat && !cats.includes(newCat)) setCats(prev => [...prev, newCat]); setNewCat(''); }}>Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={vendorDisc.isOpen} onClose={vendorDisc.onClose} size='sm'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manage Vendors</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Vendor</FormLabel>
              <Input value={newVendor} onChange={(e)=> setNewVendor(e.target.value)} placeholder='Enter name' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={vendorDisc.onClose}>Close</Button>
            <Button colorScheme='blue' onClick={()=>{ if(newVendor && !vendors.includes(newVendor)) setVendors(prev => [...prev, newVendor]); setNewVendor(''); }}>Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
