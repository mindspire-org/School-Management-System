import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  ButtonGroup,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Flex,
  SimpleGrid,
  IconButton,
  Checkbox,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { MdEvent, MdSchedule, MdDoneAll, MdPlaylistAdd, MdAssignment, MdFileDownload, MdPictureAsPdf, MdSearch, MdRemoveRedEye, MdEdit } from 'react-icons/md';

const exams = [
  { id: 1, name: 'Mid Term', start: '2025-03-10', end: '2025-03-20', classes: '1-5', status: 'Scheduled' },
  { id: 2, name: 'Final Term', start: '2025-06-05', end: '2025-06-20', classes: '1-5', status: 'Planned' },
];

export default function Exams() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState(exams);
  const [selectedIds, setSelectedIds] = useState([]);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ id: null, name: '', start: '', end: '', classes: '', status: 'Planned' });
  const data = useMemo(() => {
    const base = filter === 'All' ? rows : rows.filter(e => e.status === filter);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(e => `${e.name} ${e.classes} ${e.status}`.toLowerCase().includes(q));
  }, [rows, filter, query]);
  const totals = useMemo(() => {
    const all = rows.length;
    const planned = rows.filter(e => e.status === 'Planned').length;
    const scheduled = rows.filter(e => e.status === 'Scheduled').length;
    const completed = rows.filter(e => e.status === 'Completed').length;
    return { all, planned, scheduled, completed };
  }, [rows]);

  const openCreate = () => {
    setSelected(null);
    setForm({ id: null, name: '', start: '', end: '', classes: '', status: 'Planned' });
    editDisc.onOpen();
  };

  const openEdit = (row) => {
    setSelected(row);
    setForm({ ...row });
    editDisc.onOpen();
  };

  const saveExam = () => {
    if (!form.name || !form.start || !form.end) { editDisc.onClose(); return; }
    if (form.id) {
      setRows(prev => prev.map(r => r.id === form.id ? { ...form } : r));
    } else {
      const nextId = (rows.reduce((m, r) => Math.max(m, r.id), 0) || 0) + 1;
      setRows(prev => [...prev, { ...form, id: nextId }]);
    }
    editDisc.onClose();
  };

  const markCompleted = (ids) => {
    setRows(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: 'Completed' } : r));
    setSelectedIds([]);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Exams</Heading>
          <Text color={textColorSecondary}>Create, schedule and track exams</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdEvent color="white" />} />}
          name="Total Exams"
          value={String(totals.all)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdPlaylistAdd color="white" />} />}
          name="Planned"
          value={String(totals.planned)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)" icon={<MdSchedule color="white" />} />}
          name="Scheduled"
          value={String(totals.scheduled)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdDoneAll color="white" />} />}
          name="Completed"
          value={String(totals.completed)}
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <InputGroup maxW='300px'>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search exam name, status...' value={query} onChange={(e)=>setQuery(e.target.value)} />
            </InputGroup>
            <Select w="200px" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              <option>Planned</option>
              <option>Scheduled</option>
              <option>Completed</option>
            </Select>
          </HStack>
          <HStack>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={openCreate}>Create Exam</Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue">Generate Report</Button>
          </HStack>
        </Flex>
      </Card>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Exams List
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selectedIds.length===data.length && data.length>0} isIndeterminate={selectedIds.length>0 && selectedIds.length<data.length} onChange={(e)=> setSelectedIds(e.target.checked ? data.map(d=>d.id) : [])} />
                </Th>
                <Th>Name</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Classes</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((e) => (
                <Tr key={e.id}>
                  <Td><Checkbox isChecked={selectedIds.includes(e.id)} onChange={()=> setSelectedIds(prev => prev.includes(e.id) ? prev.filter(id=>id!==e.id) : [...prev, e.id])} /></Td>
                  <Td>{e.name}</Td>
                  <Td>{e.start}</Td>
                  <Td>{e.end}</Td>
                  <Td>{e.classes}</Td>
                  <Td><Badge colorScheme={e.status === 'Completed' ? 'green' : e.status === 'Scheduled' ? 'blue' : 'orange'}>{e.status}</Badge></Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(e); viewDisc.onOpen(); }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>openEdit(e)} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* View Modal */}
      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exam Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Name</Text><Text>{selected.name}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Start</Text><Text>{selected.start}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>End</Text><Text>{selected.end}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Classes</Text><Text>{selected.classes}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Status</Text><Badge colorScheme={selected.status === 'Completed' ? 'green' : selected.status === 'Scheduled' ? 'blue' : 'orange'}>{selected.status}</Badge></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={viewDisc.onClose}>Close</Button>
            {selected && <Button colorScheme='blue' onClick={()=>{ viewDisc.onClose(); openEdit(selected); }}>Edit</Button>}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{form.id ? 'Edit Exam' : 'Create Exam'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Start</FormLabel>
              <Input type='date' value={form.start} onChange={(e)=>setForm(f=>({ ...f, start: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>End</FormLabel>
              <Input type='date' value={form.end} onChange={(e)=>setForm(f=>({ ...f, end: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Classes</FormLabel>
              <Input placeholder='e.g., 1-5' value={form.classes} onChange={(e)=>setForm(f=>({ ...f, classes: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={form.status} onChange={(e)=>setForm(f=>({ ...f, status: e.target.value }))}>
                <option>Planned</option>
                <option>Scheduled</option>
                <option>Completed</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={saveExam}>{form.id ? 'Save' : 'Create'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
