import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, NumberInput, NumberInputField, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, Textarea } from '@chakra-ui/react';
import { MdWork, MdPeople, MdLocalShipping, MdAddCircle, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit, MdCheckCircle } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';

const mockPayroll = [
  { id:'SAL-8001', month:'2025-10', employee:'Ahmed Khan', role:'Teacher', basic:55000, allowances:5000, deductions:2000, net:58000, status:'Pending', logs:[{ date:'2025-11-01', event:'Created' }] },
  { id:'SAL-8002', month:'2025-10', employee:'Imran', role:'Driver', basic:30000, allowances:4000, deductions:1000, net:33000, status:'Approved', logs:[{ date:'2025-11-01', event:'Created' }] },
  { id:'SAL-8003', month:'2025-10', employee:'Sara', role:'Teacher', basic:60000, allowances:6000, deductions:3000, net:63000, status:'Released', logs:[{ date:'2025-11-01', event:'Created' },{ date:'2025-11-03', event:'Released' }] },
];

export default function Payroll() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [month, setMonth] = useState('');
  const [rows, setRows] = useState(mockPayroll);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id:'', month:'', employee:'', role:'Teacher', basic:0, allowances:0, deductions:0, net:0, status:'Pending', note:'' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const filtered = useMemo(() => rows.filter(r => {
    const s = search.toLowerCase();
    const matchesSearch = !s || r.employee.toLowerCase().includes(s) || r.id.toLowerCase().includes(s) || r.role.toLowerCase().includes(s);
    const matchesRole = role==='all' || r.role===role;
    const matchesStatus = status==='all' || r.status.toLowerCase()===status;
    const matchesMonth = !month || r.month===month;
    return matchesSearch && matchesRole && matchesStatus && matchesMonth;
  }), [rows, search, role, status, month]);

  const stats = useMemo(() => {
    const total = filtered.reduce((s,r)=> s + r.net, 0);
    const pending = filtered.filter(r=>r.status==='Pending').length;
    const released = filtered.filter(r=>r.status==='Released').reduce((s,r)=> s + r.net, 0);
    const teachers = filtered.filter(r=>r.role==='Teacher').reduce((s,r)=> s + r.net, 0);
    const drivers = filtered.filter(r=>r.role==='Driver').reduce((s,r)=> s + r.net, 0);
    return { total, pending, released, teachers, drivers };
  }, [filtered]);

  const byRole = useMemo(() => {
    const labels = ['Teacher','Driver'];
    const values = [filtered.filter(r=>r.role==='Teacher').length, filtered.filter(r=>r.role==='Driver').length];
    return { labels, values };
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page-1)*pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const hasFilters = !!(search || role!=='all' || status!=='all' || month);

  const exportCSV = () => {
    const header = ['ID','Month','Employee','Role','Basic','Allowances','Deductions','Net','Status'];
    const data = filtered.map(r => [r.id, r.month, r.employee, r.role, r.basic, r.allowances, r.deductions, r.net, r.status]);
    const csv = [header, ...data].map(a=>a.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='payroll.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const header = ['ID','Month','Employee','Role','Basic','Allowances','Deductions','Net','Status'];
    const data = filtered.map(r => [r.id, r.month, r.employee, r.role, `Rs. ${r.basic.toLocaleString()}`, `Rs. ${r.allowances.toLocaleString()}`, `Rs. ${r.deductions.toLocaleString()}`, `Rs. ${r.net.toLocaleString()}`, r.status]);
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Payroll</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}h1{margin:0 0 12px;font-size:20px}
      table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px;text-align:left}th{background:#f5f5f5}</style>
      </head><body><h1>Payroll</h1>
      <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const computeNet = (f) => Math.max(0, (Number(f.basic)||0) + (Number(f.allowances)||0) - (Number(f.deductions)||0));

  const releasePayslip = (row) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Payslip ${row.id}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}.row{margin:4px 0}</style></head><body>
      <h1>Payslip</h1>
      <div class='row'><strong>ID:</strong> ${row.id}</div>
      <div class='row'><strong>Month:</strong> ${row.month}</div>
      <div class='row'><strong>Employee:</strong> ${row.employee} (${row.role})</div>
      <div class='row'><strong>Basic:</strong> Rs. ${row.basic.toLocaleString()}</div>
      <div class='row'><strong>Allowances:</strong> Rs. ${row.allowances.toLocaleString()}</div>
      <div class='row'><strong>Deductions:</strong> Rs. ${row.deductions.toLocaleString()}</div>
      <div class='row'><strong>Net Salary:</strong> Rs. ${row.net.toLocaleString()}</div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const approve = (row) => setRows(prev => prev.map(r => r.id===row.id ? { ...r, status:'Approved', logs:[...(r.logs||[]), { date:new Date().toISOString().slice(0,10), event:'Approved' }] } : r));
  const release = (row) => {
    setRows(prev => prev.map(r => r.id===row.id ? { ...r, status:'Released', logs:[...(r.logs||[]), { date:new Date().toISOString().slice(0,10), event:'Released' }] } : r));
    releasePayslip({ ...row, status:'Released' });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Payroll</Heading>
          <Text color={textColorSecondary}>Salaries, deductions/allowances, payslips, release logs</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAddCircle />} colorScheme='blue' onClick={()=>{ const id=`SAL-${Math.floor(8000+Math.random()*1000)}`; setForm({ id, month:'', employee:'', role:'Teacher', basic:0, allowances:0, deductions:0, net:0, status:'Pending', note:'' }); editDisc.onOpen(); }}>Add Salary</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={exportPDF}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Total Net" value={`Rs. ${stats.total.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdWork} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Pending" value={String(stats.pending)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdWork} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Teachers Total" value={`Rs. ${stats.teachers.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdPeople} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Drivers Total" value={`Rs. ${stats.drivers.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdLocalShipping} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Headcount by Role</Heading>
          <PieChart chartData={byRole.values} chartOptions={{ labels: byRole.labels, legend:{ position:'right' } }} />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Last 5 Net Salaries</Heading>
          <BarChart chartData={[{ name:'Net', data: filtered.slice(-5).map(r=>r.net) }]} chartOptions={{ xaxis:{ categories: filtered.slice(-5).map(r=>r.id) }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'40%' } } }} />
        </Card>
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search salary ID or employee' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='200px' value={role} onChange={(e) => setRole(e.target.value)}>
            <option value='all'>All Roles</option>
            <option value='Teacher'>Teacher</option>
            <option value='Driver'>Driver</option>
          </Select>
          <Select maxW='200px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='pending'>Pending</option>
            <option value='approved'>Approved</option>
            <option value='released'>Released</option>
          </Select>
          <Input type='month' maxW='180px' value={month} onChange={(e) => setMonth(e.target.value)} />
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple' size='sm'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th fontSize='sm' py={2}>ID</Th>
                <Th fontSize='sm' py={2}>Month</Th>
                <Th fontSize='sm' py={2}>Employee</Th>
                <Th fontSize='sm' py={2}>Role</Th>
                <Th fontSize='sm' py={2} isNumeric>Basic</Th>
                <Th fontSize='sm' py={2} isNumeric>Allowances</Th>
                <Th fontSize='sm' py={2} isNumeric>Deductions</Th>
                <Th fontSize='sm' py={2} isNumeric>Net</Th>
                <Th fontSize='sm' py={2}>Status</Th>
                <Th fontSize='sm' py={2}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pageRows.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td py={2} fontSize='sm'><Text fontWeight='600' fontSize='sm'>{r.id}</Text></Td>
                  <Td py={2} fontSize='sm'><Text color={textColorSecondary} fontSize='sm'>{r.month}</Text></Td>
                  <Td py={2} fontSize='sm'>{r.employee}</Td>
                  <Td py={2} fontSize='sm'>{r.role}</Td>
                  <Td py={2} fontSize='sm' isNumeric>Rs. {r.basic.toLocaleString()}</Td>
                  <Td py={2} fontSize='sm' isNumeric>Rs. {r.allowances.toLocaleString()}</Td>
                  <Td py={2} fontSize='sm' isNumeric>Rs. {r.deductions.toLocaleString()}</Td>
                  <Td py={2} fontSize='sm' isNumeric>Rs. {r.net.toLocaleString()}</Td>
                  <Td py={2} fontSize='sm'><Badge colorScheme={r.status==='Released'?'green':r.status==='Approved'?'purple':'yellow'}>{r.status}</Badge></Td>
                  <Td py={1}>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='xs' variant='ghost' onClick={()=>{ setSelected(r); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='xs' variant='ghost' onClick={()=>{ setForm({ ...r }); editDisc.onOpen(); }} />
                    {r.status==='Pending' && <Button size='xs' variant='outline' onClick={()=> approve(r)}>Approve</Button>}
                    {r.status!=='Released' && <Button size='xs' onClick={()=> release(r)}>Release</Button>}
                    <Button size='xs' variant='ghost' onClick={()=> releasePayslip(r)}>Payslip</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
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
          <ModalHeader>Payslip Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Month:</strong> {selected.month}</Text>
                <Text><strong>Employee:</strong> {selected.employee}</Text>
                <Text><strong>Role:</strong> {selected.role}</Text>
                <Text><strong>Basic:</strong> Rs. {selected.basic.toLocaleString()}</Text>
                <Text><strong>Allowances:</strong> Rs. {selected.allowances.toLocaleString()}</Text>
                <Text><strong>Deductions:</strong> Rs. {selected.deductions.toLocaleString()}</Text>
                <Text><strong>Net:</strong> Rs. {selected.net.toLocaleString()}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
                {!!selected.logs && (
                  <Box mt={3}>
                    <Text fontWeight='600' mb={1}>Release Logs</Text>
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
          <ModalHeader>{rows.some(r=>r.id===form.id) ? 'Edit Salary' : 'Add Salary'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={2}>
            <FormControl mb={3}>
              <FormLabel>Month</FormLabel>
              <Input type='month' value={form.month} onChange={(e)=> setForm(f=>({ ...f, month: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Employee</FormLabel>
              <Input value={form.employee} onChange={(e)=> setForm(f=>({ ...f, employee: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Role</FormLabel>
              <Select value={form.role} onChange={(e)=> setForm(f=>({ ...f, role: e.target.value }))}>
                <option value='Teacher'>Teacher</option>
                <option value='Driver'>Driver</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Basic</FormLabel>
              <NumberInput value={form.basic} min={0} onChange={(v)=> setForm(f=>({ ...f, basic: Number(v)||0, net: computeNet({ ...f, basic:Number(v)||0 }) }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Allowances</FormLabel>
              <NumberInput value={form.allowances} min={0} onChange={(v)=> setForm(f=>({ ...f, allowances: Number(v)||0, net: computeNet({ ...f, allowances:Number(v)||0 }) }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Deductions</FormLabel>
              <NumberInput value={form.deductions} min={0} onChange={(v)=> setForm(f=>({ ...f, deductions: Number(v)||0, net: computeNet({ ...f, deductions:Number(v)||0 }) }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Note</FormLabel>
              <Textarea rows={3} value={form.note} onChange={(e)=> setForm(f=>({ ...f, note: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => { const exists = prev.some(r=>r.id===form.id); const item = { ...form, net: computeNet(form), logs: exists ? prev.find(r=>r.id===form.id)?.logs || [] : [{ date:new Date().toISOString().slice(0,10), event:'Created' }] }; if(exists){ return prev.map(r => r.id===form.id ? { ...item, logs:[...item.logs, { date:new Date().toISOString().slice(0,10), event:'Edited' }] } : r);} return [item, ...prev]; }); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
