import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, InputGroup, Input, InputLeftElement, Select, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, NumberInput, NumberInputField, Checkbox, Textarea, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { MdWarning, MdSend, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';

const mockDues = [
  { id: 'STU-1002', name: 'Sara Khan', class: '10-A', dues: 6000, days: 10 },
  { id: 'STU-1007', name: 'Bilal Ahmad', class: '9-A', dues: 12000, days: 30 },
  { id: 'STU-1011', name: 'Maryam', class: '10-B', dues: 4000, days: 5 },
];
const mockTransport = [
  { id: 'STU-2001', name: 'Usman', route: 'R-01', dues: 2000, days: 15 },
  { id: 'STU-2002', name: 'Hina', route: 'R-03', dues: 2500, days: 45 },
];
const mockHostel = [
  { id: 'STU-3001', name: 'Ali Raza', room: 'H-12', dues: 5000, days: 35 },
  { id: 'STU-3002', name: 'Zoya', room: 'H-07', dues: 4500, days: 20 },
];

export default function OutstandingFees() {
  const [search, setSearch] = useState('');
  const [cls, setCls] = useState('all');
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState(mockDues.map(r=>({ ...r, logs:[{ date:'2025-11-01', event:'Imported' }] })));
  const [trows, setTRows] = useState(mockTransport.map(r=>({ ...r, logs:[{ date:'2025-11-01', event:'Imported' }] })));
  const [hrows, setHRows] = useState(mockHostel.map(r=>({ ...r, logs:[{ date:'2025-11-01', event:'Imported' }] })));
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const bulkDisc = useDisclosure();
  const planDisc = useDisclosure();
  const fineDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', name: '', class: '', dues: 0, days: 0 });
  const [bulkMsg, setBulkMsg] = useState('Dear Parent, your ward has outstanding fees. Kindly clear the dues at the earliest.');
  const [plan, setPlan] = useState({ id: '', name: '', installments: 3, startDate: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [fine, setFine] = useState({ perDay: 10, cap: 2000 });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const currentSet = tab===0 ? rows : tab===1 ? trows : hrows;
  const setCurrentSet = (updater) => {
    if (tab===0) setRows(updater(rows));
    else if (tab===1) setTRows(updater(trows));
    else setHRows(updater(hrows));
  };

  const totals = useMemo(() => {
    const count = currentSet.length;
    const amount = currentSet.reduce((s, d) => s + d.dues, 0);
    const overdue = currentSet.filter((d) => d.days >= 30).length;
    return { count, amount, overdue };
  }, [currentSet]);

  const filtered = useMemo(() => {
    if (tab===0) {
      return rows.filter(d => (cls==='all' || d.class===cls) && (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase())));
    }
    if (tab===1) {
      return trows.filter(d => (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()) || d.route.toLowerCase().includes(search.toLowerCase())));
    }
    return hrows.filter(d => (!search || d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()) || d.room.toLowerCase().includes(search.toLowerCase())));
  }, [rows, trows, hrows, search, cls, tab]);

  const classCharts = useMemo(() => {
    const list = rows;
    const byClass = {};
    list.forEach(d => { byClass[d.class] = (byClass[d.class]||0) + d.dues; });
    const labels = Object.keys(byClass);
    const values = labels.map(l=> byClass[l]);
    const buckets = { '0-15':0, '16-30':0, '31-60':0, '60+':0 };
    list.forEach(d => { if(d.days<=15) buckets['0-15']++; else if(d.days<=30) buckets['16-30']++; else if(d.days<=60) buckets['31-60']++; else buckets['60+']++; });
    return { labels, values, buckets };
  }, [rows]);

  const transportCharts = useMemo(() => {
    const list = trows;
    const byRoute = {};
    list.forEach(d => { byRoute[d.route] = (byRoute[d.route]||0) + d.dues; });
    const labels = Object.keys(byRoute);
    const values = labels.map(l=> byRoute[l]);
    const buckets = { '0-15':0, '16-30':0, '31-60':0, '60+':0 };
    list.forEach(d => { if(d.days<=15) buckets['0-15']++; else if(d.days<=30) buckets['16-30']++; else if(d.days<=60) buckets['31-60']++; else buckets['60+']++; });
    return { labels, values, buckets };
  }, [trows]);

  const hostelCharts = useMemo(() => {
    const list = hrows;
    const byRoom = {};
    list.forEach(d => { byRoom[d.room] = (byRoom[d.room]||0) + d.dues; });
    const labels = Object.keys(byRoom);
    const values = labels.map(l=> byRoom[l]);
    const buckets = { '0-15':0, '16-30':0, '31-60':0, '60+':0 };
    list.forEach(d => { if(d.days<=15) buckets['0-15']++; else if(d.days<=30) buckets['16-30']++; else if(d.days<=60) buckets['31-60']++; else buckets['60+']++; });
    return { labels, values, buckets };
  }, [hrows]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? filtered.map(d=>d.id) : []);
  };

  const exportCSV = () => {
    const header = ['ID','Name','Class','Dues','Days'];
    const data = filtered.map(d=>[d.id, d.name, tab===0 ? (d.class||'') : tab===1 ? (d.route||'') : (d.room||''), d.dues, d.days]);
    const csv = [header, ...data].map(a=>a.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='outstanding_fees.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = (onlySelected=false) => {
    const toPrint = onlySelected && selectedIds.length>0 ? filtered.filter(d=>selectedIds.includes(d.id)) : filtered;
    const header = ['ID','Name', tab===0?'Class':(tab===1?'Route':'Room'),'Dues','Days'];
    const data = toPrint.map(d => [d.id, d.name, tab===0 ? (d.class||'') : tab===1 ? (d.route||'') : (d.room||''), `Rs. ${d.dues.toLocaleString()}`, d.days]);
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Outstanding Fees</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:12px}th{background:#f5f5f5}</style>
      </head><body><h1>Outstanding Fees</h1>
      <table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${data.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
      <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank'); if(!w) return; w.document.open(); w.document.write(html); w.document.close();
  };

  const applyFine = () => {
    setCurrentSet(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, dues: d.dues + Math.min(fine.cap, d.days * fine.perDay) } : d));
    fineDisc.onClose();
  };

  const recordReminderLogs = (ids, channel) => {
    const stamp = new Date().toISOString().slice(0,10);
    setCurrentSet(prev => prev.map(d => ids.includes(d.id) ? { ...d, logs:[...(d.logs||[]), { date: stamp, event: `Reminder sent via ${channel}` }] } : d));
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Outstanding Fees</Heading>
          <Text color={textColorSecondary}>Students with pending dues</Text>
        </Box>
        <ButtonGroup>
          <Button onClick={()=> bulkDisc.onOpen()} leftIcon={<MdSend />} colorScheme='blue' isDisabled={selectedIds.length===0}>Bulk Reminder</Button>
          <Button variant='outline' onClick={()=> fineDisc.onOpen()} isDisabled={selectedIds.length===0}>Apply Fine</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={()=> exportPDF(false)}>Export PDF</Button>
          <Button variant='outline' onClick={()=> exportPDF(true)} isDisabled={selectedIds.length===0}>Print Notices</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Students Due" value={String(totals.count)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Total Dues" value={`Rs. ${totals.amount.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Over 30 Days" value={String(totals.overdue)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          {tab===0 && (
            <Select maxW='220px' value={cls} onChange={(e) => setCls(e.target.value)}>
              <option value='all'>All Classes</option>
              <option value='10-A'>10-A</option>
              <option value='10-B'>10-B</option>
              <option value='9-A'>9-A</option>
            </Select>
          )}
        </Flex>
      </Card>

      <Tabs index={tab} onChange={setTab} variant='enclosed-colored'>
        <TabList>
          <Tab>Class</Tab>
          <Tab>Transport</Tab>
          <Tab>Hostel</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Card mb={5}>
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} p={4}>
                <Box>
                  <Heading size='md' mb={3}>Dues by Class</Heading>
                  <BarChart chartData={[{ name:'Dues', data: classCharts.values }]} chartOptions={{ xaxis:{ categories: classCharts.labels }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'45%' } } }} />
                </Box>
                <Box>
                  <Heading size='md' mb={3}>Overdue Buckets</Heading>
                  <PieChart chartData={Object.values(classCharts.buckets)} chartOptions={{ labels: Object.keys(classCharts.buckets), legend:{ position:'right' } }} />
                </Box>
              </SimpleGrid>
            </Card>
            <Card>
              <Box overflowX='auto'>
                <Box maxH='420px' overflowY='auto'>
                <Table variant='simple' size='sm'>
                  <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                    <Tr>
                      <Th width='40px'><Checkbox isChecked={selectedIds.length===filtered.length && filtered.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<filtered.length} onChange={(e)=> toggleSelectAll(e.target.checked)} /></Th>
                      <Th>Student</Th>
                      <Th>ID</Th>
                      <Th>Class</Th>
                      <Th isNumeric>Dues</Th>
                      <Th isNumeric>Days Pending</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filtered.map((d) => (
                      <Tr key={d.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                        <Td><Checkbox isChecked={selectedIds.includes(d.id)} onChange={()=> toggleSelect(d.id)} /></Td>
                        <Td><Text fontWeight='600'>{d.name}</Text></Td>
                        <Td>{d.id}</Td>
                        <Td><Badge colorScheme='blue'>{d.class}</Badge></Td>
                        <Td isNumeric>Rs. {d.dues.toLocaleString()}</Td>
                        <Td isNumeric>{d.days}</Td>
                        <Td>
                          <Flex gap={1}>
                            <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(d); viewDisc.onOpen(); }} />
                            <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setForm({ ...d }); editDisc.onOpen(); }} />
                            <Button size='sm' leftIcon={<MdSend />} onClick={()=>{ setSelectedIds([d.id]); setBulkMsg(`Reminder: ${d.name} has dues Rs. ${d.dues}. Kindly pay soon.`); bulkDisc.onOpen(); }}>Send Reminder</Button>
                            <Button size='sm' variant='outline' onClick={()=>{ setPlan({ id: d.id, name: d.name, installments: 3, startDate: '' }); planDisc.onOpen(); }}>Create Plan</Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                </Box>
              </Box>
            </Card>
          </TabPanel>
          <TabPanel px={0}>
            <Card mb={5}>
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} p={4}>
                <Box>
                  <Heading size='md' mb={3}>Dues by Route</Heading>
                  <BarChart chartData={[{ name:'Dues', data: transportCharts.values }]} chartOptions={{ xaxis:{ categories: transportCharts.labels }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'45%' } } }} />
                </Box>
                <Box>
                  <Heading size='md' mb={3}>Overdue Buckets</Heading>
                  <PieChart chartData={Object.values(transportCharts.buckets)} chartOptions={{ labels: Object.keys(transportCharts.buckets), legend:{ position:'right' } }} />
                </Box>
              </SimpleGrid>
            </Card>
            <Card>
              <Box overflowX='auto'>
                <Box maxH='420px' overflowY='auto'>
                <Table variant='simple' size='sm'>
                  <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                    <Tr>
                      <Th width='40px'><Checkbox isChecked={selectedIds.length===filtered.length && filtered.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<filtered.length} onChange={(e)=> toggleSelectAll(e.target.checked)} /></Th>
                      <Th>Student</Th>
                      <Th>ID</Th>
                      <Th>Route</Th>
                      <Th isNumeric>Dues</Th>
                      <Th isNumeric>Days Pending</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filtered.map((d) => (
                      <Tr key={d.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                        <Td><Checkbox isChecked={selectedIds.includes(d.id)} onChange={()=> toggleSelect(d.id)} /></Td>
                        <Td><Text fontWeight='600'>{d.name}</Text></Td>
                        <Td>{d.id}</Td>
                        <Td><Badge colorScheme='purple'>{d.route}</Badge></Td>
                        <Td isNumeric>Rs. {d.dues.toLocaleString()}</Td>
                        <Td isNumeric>{d.days}</Td>
                        <Td>
                          <Flex gap={1}>
                            <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(d); viewDisc.onOpen(); }} />
                            <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setForm({ ...d }); editDisc.onOpen(); }} />
                            <Button size='sm' leftIcon={<MdSend />} onClick={()=>{ setSelectedIds([d.id]); setBulkMsg(`Reminder: ${d.name} has transport dues Rs. ${d.dues}.`); bulkDisc.onOpen(); }}>Send Reminder</Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                </Box>
              </Box>
            </Card>
          </TabPanel>
          <TabPanel px={0}>
            <Card mb={5}>
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} p={4}>
                <Box>
                  <Heading size='md' mb={3}>Dues by Room</Heading>
                  <BarChart chartData={[{ name:'Dues', data: hostelCharts.values }]} chartOptions={{ xaxis:{ categories: hostelCharts.labels }, dataLabels:{ enabled:false }, plotOptions:{ bar:{ columnWidth:'45%' } } }} />
                </Box>
                <Box>
                  <Heading size='md' mb={3}>Overdue Buckets</Heading>
                  <PieChart chartData={Object.values(hostelCharts.buckets)} chartOptions={{ labels: Object.keys(hostelCharts.buckets), legend:{ position:'right' } }} />
                </Box>
              </SimpleGrid>
            </Card>
            <Card>
              <Box overflowX='auto'>
                <Box maxH='420px' overflowY='auto'>
                <Table variant='simple' size='sm'>
                  <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                    <Tr>
                      <Th width='40px'><Checkbox isChecked={selectedIds.length===filtered.length && filtered.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<filtered.length} onChange={(e)=> toggleSelectAll(e.target.checked)} /></Th>
                      <Th>Student</Th>
                      <Th>ID</Th>
                      <Th>Room</Th>
                      <Th isNumeric>Dues</Th>
                      <Th isNumeric>Days Pending</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filtered.map((d) => (
                      <Tr key={d.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                        <Td><Checkbox isChecked={selectedIds.includes(d.id)} onChange={()=> toggleSelect(d.id)} /></Td>
                        <Td><Text fontWeight='600'>{d.name}</Text></Td>
                        <Td>{d.id}</Td>
                        <Td><Badge colorScheme='pink'>{d.room}</Badge></Td>
                        <Td isNumeric>Rs. {d.dues.toLocaleString()}</Td>
                        <Td isNumeric>{d.days}</Td>
                        <Td>
                          <Flex gap={1}>
                            <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(d); viewDisc.onOpen(); }} />
                            <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setForm({ ...d }); editDisc.onOpen(); }} />
                            <Button size='sm' leftIcon={<MdSend />} onClick={()=>{ setSelectedIds([d.id]); setBulkMsg(`Reminder: ${d.name} has hostel dues Rs. ${d.dues}.`); bulkDisc.onOpen(); }}>Send Reminder</Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                </Box>
              </Box>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Due Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Text><strong>Name:</strong> {selected.name}</Text>
                <Text><strong>ID:</strong> {selected.id}</Text>
                {tab===0 && <Text><strong>Class:</strong> {selected.class}</Text>}
                {tab===1 && <Text><strong>Route:</strong> {selected.route}</Text>}
                {tab===2 && <Text><strong>Room:</strong> {selected.room}</Text>}
                <Text><strong>Dues:</strong> Rs. {selected.dues.toLocaleString()}</Text>
                <Text><strong>Days Pending:</strong> {selected.days}</Text>
                {!!selected.logs && selected.logs.map((l,idx)=>(<Text key={idx} color={textColorSecondary}>• {l.date}: {l.event}</Text>))}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Due</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={(e)=> setForm(f=>({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Class</FormLabel>
              <Input value={form.class} onChange={(e)=> setForm(f=>({ ...f, class: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Dues</FormLabel>
              <NumberInput value={form.dues} min={0} onChange={(v)=> setForm(f=>({ ...f, dues: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Days Pending</FormLabel>
              <NumberInput value={form.days} min={0} onChange={(v)=> setForm(f=>({ ...f, days: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRows(prev => prev.map(r => r.id===form.id ? { ...form } : r));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Reminder Modal */}
      <Modal isOpen={bulkDisc.isOpen} onClose={bulkDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Reminder ({selectedIds.length} selected)</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Message</FormLabel>
              <Textarea value={bulkMsg} onChange={(e)=> setBulkMsg(e.target.value)} rows={4} />
            </FormControl>
            <FormControl mt={3}>
              <FormLabel>Channel</FormLabel>
              <Select defaultValue='SMS' id='channel-select'>
                <option>SMS</option>
                <option>Email</option>
                <option>WhatsApp</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={bulkDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ const ch = document.getElementById('channel-select')?.value || 'SMS'; recordReminderLogs(selectedIds, ch); bulkDisc.onClose(); }}>Send</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Payment Plan Modal */}
      <Modal isOpen={planDisc.isOpen} onClose={planDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Payment Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>Student: <strong>{plan.name}</strong> ({plan.id})</Text>
            <FormControl mb={3}>
              <FormLabel>Installments</FormLabel>
              <NumberInput value={plan.installments} min={1} max={12} onChange={(v)=> setPlan(p=>({ ...p, installments: Number(v)||1 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <Input type='date' value={plan.startDate} onChange={(e)=> setPlan(p=>({ ...p, startDate: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={planDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ planDisc.onClose(); }}>Create Plan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={fineDisc.isOpen} onClose={fineDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Apply Fine</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Per Day Fine (Rs)</FormLabel>
              <NumberInput value={fine.perDay} min={0} onChange={(v)=> setFine(f=>({ ...f, perDay: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Max Cap (Rs)</FormLabel>
              <NumberInput value={fine.cap} min={0} onChange={(v)=> setFine(f=>({ ...f, cap: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={fineDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={applyFine}>Apply</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
