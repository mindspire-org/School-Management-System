import React, { useMemo, useRef, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, NumberInput, NumberInputField } from '@chakra-ui/react';
import { MdAssignment, MdPlaylistAdd, MdEdit, MdSave, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';

const mockStructures = [
  { class: '10-A', tuition: 8000, transport: 1500, exam: 500, misc: 300, discount: 5 },
  { class: '10-B', tuition: 7800, transport: 1500, exam: 500, misc: 300, discount: 0 },
  { class: '9-A', tuition: 7000, transport: 1200, exam: 500, misc: 300, discount: 3 },
];

export default function FeeStructure() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [selected, setSelected] = useState('all');
  const [rows, setRows] = useState(mockStructures);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const copyDisc = useDisclosure();
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ class: '', tuition: 0, transport: 0, exam: 0, misc: 0, discount: 0 });
  const [copyTarget, setCopyTarget] = useState('');
  const fileRef = useRef(null);

  const totals = useMemo(() => ({
    classes: mockStructures.length,
    avgTuition: Math.round(mockStructures.reduce((s, r) => s + r.tuition, 0) / mockStructures.length),
    transport: mockStructures.reduce((s, r) => s + r.transport, 0),
  }), []);

  const headTotals = useMemo(() => {
    const t = rows.reduce((acc, r)=>{
      acc.tuition += r.tuition; acc.transport += r.transport; acc.exam += r.exam; acc.misc += r.misc; return acc;
    }, { tuition:0, transport:0, exam:0, misc:0 });
    const gross = t.tuition + t.transport + t.exam + t.misc;
    const avgDiscount = Math.round(rows.reduce((s,r)=> s + (r.discount||0), 0) / Math.max(1, rows.length));
    return { ...t, gross, avgDiscount };
  }, [rows]);

  const exportCSV = () => {
    const header = ['Class','Tuition','Transport','Exam','Misc','Discount%','Total','Net'];
    const data = rows.map(r => { const total = r.tuition + r.transport + r.exam + r.misc; const net = Math.round(total * (1 - (r.discount||0)/100)); return [r.class, r.tuition, r.transport, r.exam, r.misc, r.discount||0, total, net]; });
    const csv = [header, ...data].map(a=>a.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='fee_structure.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const importJSON = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Invalid JSON');
      const mapped = data.map(d => ({ class: String(d.class), tuition: Number(d.tuition)||0, transport: Number(d.transport)||0, exam: Number(d.exam)||0, misc: Number(d.misc)||0, discount: Number(d.discount)||0 }));
      setRows(mapped);
    } catch (e) {
      console.error('Import error', e);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='fee_structure.json'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Fee Structure</Heading>
          <Text color={textColorSecondary}>Define fee heads per class</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdPlaylistAdd />} colorScheme='blue' onClick={()=>{ setForm({ class: `Class ${rows.length+1}`, tuition: 0, transport: 0, exam: 0, misc: 0, discount: 0 }); editDisc.onOpen(); }}>Add Structure</Button>
          <Button variant='outline' onClick={copyDisc.onOpen}>Copy From Class</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button onClick={exportJSON}>Export JSON</Button>
          <Button colorScheme='purple' onClick={()=> fileRef.current?.click()}>Import JSON</Button>
          <input ref={fileRef} type='file' accept='application/json' style={{ display:'none' }} onChange={(e)=>{ const f=e.target.files?.[0]; if(f) importJSON(f); }} />
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Classes Covered" value={String(totals.classes)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdAssignment} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Avg Tuition" value={`Rs. ${totals.avgTuition.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdEdit} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Total Transport" value={`Rs. ${totals.transport.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdAssignment} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <Select maxW='220px' value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value='all'>All Classes</option>
            {mockStructures.map((s) => (
              <option key={s.class} value={s.class}>{s.class}</option>
            ))}
          </Select>
          <Input maxW='280px' placeholder='Search head or amount' />
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Head Totals (All Classes)</Heading>
          <BarChart height={220} chartData={[{ name:'Amount', data:[headTotals.tuition, headTotals.transport, headTotals.exam, headTotals.misc] }]} chartOptions={{ xaxis:{ categories:['Tuition','Transport','Exam','Misc'] }, colors:['#3182CE'], dataLabels:{ enabled:false } }} />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Gross vs Discount</Heading>
          <PieChart chartData={[headTotals.gross, Math.round(headTotals.gross*(headTotals.avgDiscount/100))]} chartOptions={{ labels:['Gross','Discount Est.'], colors:['#01B574','#E53E3E'], legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>

      <Card>
        <Box overflow='hidden'>
          <Box maxH='420px' overflowY='auto'>
          <Table variant='simple'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Class</Th>
                <Th isNumeric>Tuition</Th>
                <Th isNumeric>Transport</Th>
                <Th isNumeric>Exam</Th>
                <Th isNumeric>Misc</Th>
                <Th isNumeric>Discount %</Th>
                <Th isNumeric>Total</Th>
                <Th isNumeric>Net</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((r) => {
                const total = r.tuition + r.transport + r.exam + r.misc;
                const net = Math.round(total * (1 - (r.discount || 0) / 100));
                if (selected !== 'all' && selected !== r.class) return null;
                return (
                  <Tr key={r.class} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Badge colorScheme='blue'>{r.class}</Badge></Td>
                    <Td isNumeric>Rs. {r.tuition.toLocaleString()}</Td>
                    <Td isNumeric>Rs. {r.transport.toLocaleString()}</Td>
                    <Td isNumeric>Rs. {r.exam.toLocaleString()}</Td>
                    <Td isNumeric>Rs. {r.misc.toLocaleString()}</Td>
                    <Td isNumeric>{r.discount || 0}%</Td>
                    <Td isNumeric><Text fontWeight='600'>Rs. {total.toLocaleString()}</Text></Td>
                    <Td isNumeric><Text fontWeight='700'>Rs. {net.toLocaleString()}</Text></Td>
                    <Td>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setActive(r); viewDisc.onOpen(); }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setForm({ ...r }); editDisc.onOpen(); }} />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Structure Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <Box>
                <Text><strong>Class:</strong> {active.class}</Text>
                <Text><strong>Tuition:</strong> Rs. {active.tuition.toLocaleString()}</Text>
                <Text><strong>Transport:</strong> Rs. {active.transport.toLocaleString()}</Text>
                <Text><strong>Exam:</strong> Rs. {active.exam.toLocaleString()}</Text>
                <Text><strong>Misc:</strong> Rs. {active.misc.toLocaleString()}</Text>
                <Text><strong>Discount:</strong> {active.discount}%</Text>
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
          <ModalHeader>{rows.find(r=>r.class===form.class) ? 'Edit Structure' : 'Add Structure'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Class</FormLabel>
              <Input value={form.class} onChange={(e)=> setForm(f=>({ ...f, class: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Tuition</FormLabel>
              <NumberInput value={form.tuition} min={0} onChange={(v)=> setForm(f=>({ ...f, tuition: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Transport</FormLabel>
              <NumberInput value={form.transport} min={0} onChange={(v)=> setForm(f=>({ ...f, transport: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Exam</FormLabel>
              <NumberInput value={form.exam} min={0} onChange={(v)=> setForm(f=>({ ...f, exam: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Misc</FormLabel>
              <NumberInput value={form.misc} min={0} onChange={(v)=> setForm(f=>({ ...f, misc: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Discount %</FormLabel>
              <NumberInput value={form.discount} min={0} max={100} onChange={(v)=> setForm(f=>({ ...f, discount: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRows(prev => {
                const exists = prev.some(r => r.class===form.class);
                if (exists) return prev.map(r => r.class===form.class ? { ...form } : r);
                return [...prev, { ...form }];
              });
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={copyDisc.isOpen} onClose={copyDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Copy From Class</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>From</FormLabel>
              <Select value={copyTarget} onChange={(e)=> setCopyTarget(e.target.value)}>
                <option value=''>Select class</option>
                {rows.map(r => <option key={r.class} value={r.class}>{r.class}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>To (New Class)</FormLabel>
              <Input placeholder='e.g., 8-A' value={form.class} onChange={(e)=> setForm(f=>({ ...f, class: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={copyDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              const src = rows.find(r=>r.class===copyTarget); if(!src){ copyDisc.onClose(); return; }
              const newRow = { ...src, class: form.class || `${src.class}-Copy` };
              setRows(prev=>[...prev, newRow]);
              copyDisc.onClose();
            }}>Copy</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
