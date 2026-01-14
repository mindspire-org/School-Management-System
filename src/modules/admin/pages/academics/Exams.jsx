import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { MdEvent, MdSchedule, MdDoneAll, MdPlaylistAdd, MdAssignment, MdFileDownload, MdPictureAsPdf, MdSearch, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import * as examsApi from '../../../../services/api/exams';
import * as teacherApi from '../../../../services/api/teachers';
import useClassOptions from '../../../../hooks/useClassOptions';

const mapExam = (e) => ({
  id: e.id,
  name: e.title,
  start: e.startDate || e.examDate || '',
  end: e.endDate || '',
  className: e.class || e.className || '',
  section: e.section || '',
  subject: e.subject || '',
  invigilatorId: e.invigilatorId || null,
  invigilatorName: e.invigilatorName || '',
  classes: e.classes || e.class || '',
  status: e.status || 'Planned',
});
const fmtDt = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  try {
    return d.toLocaleString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d.toISOString();
  }
};

export default function Exams() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ id: null, name: '', start: '', end: '', classes: '', status: 'Planned' });
  const [loading, setLoading] = useState(false);
  const { classOptions, sectionsByClass } = useClassOptions();
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
    setForm({ id: null, name: '', className: '', section: '', subject: '', invigilatorId: '', start: '', end: '', classes: '', status: 'Planned' });
    editDisc.onOpen();
  };

  const openEdit = (row) => {
    setSelected(row);
    setForm({ ...row });
    editDisc.onOpen();
  };

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (query) params.q = query;
      if (filter !== 'All') params.status = filter;
      const res = await examsApi.list(params);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setRows(items.map(mapExam));
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load exams', status: 'error' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter, query, toast]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Load subjects and teachers for dropdowns
  useEffect(() => {
    (async () => {
      try {
        const subj = await teacherApi.listSubjects();
        setSubjects(Array.isArray(subj) ? subj : []);
      } catch { setSubjects([]); }
      try {
        const list = await teacherApi.list({ page: 1, pageSize: 200 });
        const rows = Array.isArray(list?.rows) ? list.rows : Array.isArray(list) ? list : [];
        setTeachers(rows);
      } catch { setTeachers([]); }
    })();
  }, []);

  const toDt = (v) => {
    if (!v) return '';
    // If already in yyyy-MM-ddTHH:mm, return as-is
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return v;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const saveExam = async () => {
    if (!form.name) { toast({ title: 'Name is required', status: 'warning' }); return; }
    try {
      setLoading(true);
      const payload = {
        title: form.name,
        className: form.className || null,
        section: form.section || null,
        subject: form.subject || null,
        invigilatorId: form.invigilatorId ? Number(form.invigilatorId) : null,
        startDate: form.start || null,
        endDate: form.end || null,
        classes: form.classes || null,
        status: form.status || 'Planned',
      };
      if (form.id) {
        await examsApi.update(form.id, payload);
        toast({ title: 'Exam updated', status: 'success', duration: 1500 });
      } else {
        await examsApi.create(payload);
        toast({ title: 'Exam created', status: 'success', duration: 1500 });
      }
      editDisc.onClose();
      fetchRows();
    } catch (e) {
      console.error(e);
      toast({ title: 'Save failed', status: 'error' });
    } finally { setLoading(false); }
  };

  const markCompleted = async (ids) => {
    if (!ids.length) return;
    try {
      setLoading(true);
      await Promise.all(ids.map(id => examsApi.update(id, { status: 'Completed' })));
      toast({ title: 'Marked completed', status: 'success', duration: 1500 });
      setSelectedIds([]);
      fetchRows();
    } catch (e) {
      console.error(e);
      toast({ title: 'Update failed', status: 'error' });
    } finally { setLoading(false); }
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
        <StatCard
          title="Total Exams"
          value={String(totals.all)}
          icon={MdEvent}
          colorScheme="blue"
        />
        <StatCard
          title="Planned"
          value={String(totals.planned)}
          icon={MdPlaylistAdd}
          colorScheme="green"
        />
        <StatCard
          title="Scheduled"
          value={String(totals.scheduled)}
          icon={MdSchedule}
          colorScheme="orange"
        />
        <StatCard
          title="Completed"
          value={String(totals.completed)}
          icon={MdDoneAll}
          colorScheme="purple"
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <InputGroup maxW='300px'>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search exam name, status...' value={query} onChange={(e) => setQuery(e.target.value)} />
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
            <Button leftIcon={<MdDoneAll />} variant='outline' colorScheme='green' isDisabled={!selectedIds.length} isLoading={loading} onClick={() => markCompleted(selectedIds)}>Mark Completed</Button>
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
                  <Checkbox isChecked={selectedIds.length === data.length && data.length > 0} isIndeterminate={selectedIds.length > 0 && selectedIds.length < data.length} onChange={(e) => setSelectedIds(e.target.checked ? data.map(d => d.id) : [])} />
                </Th>
                <Th>Name</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Class</Th>
                <Th>Subject</Th>
                <Th>Invigilator</Th>
                <Th>Classes</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr><Td colSpan={10}><Flex align="center" justify="center" py={6}><Spinner size="sm" mr={3} />Loading...</Flex></Td></Tr>
              ) : data.map((e) => (
                <Tr key={e.id}>
                  <Td><Checkbox isChecked={selectedIds.includes(e.id)} onChange={() => setSelectedIds(prev => prev.includes(e.id) ? prev.filter(id => id !== e.id) : [...prev, e.id])} /></Td>
                  <Td>{e.name}</Td>
                  <Td>{fmtDt(e.start)}</Td>
                  <Td>{fmtDt(e.end)}</Td>
                  <Td>{e.className}{e.section ? `-${e.section}` : ''}</Td>
                  <Td>{e.subject || '—'}</Td>
                  <Td>{e.invigilatorName || '—'}</Td>
                  <Td>{e.classes}</Td>
                  <Td><Badge colorScheme={e.status === 'Completed' ? 'green' : e.status === 'Scheduled' ? 'blue' : 'orange'}>{e.status}</Badge></Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(e); viewDisc.onOpen(); }} />
                      <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={() => openEdit(e)} />
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
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Start</Text><Text>{fmtDt(selected.start)}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>End</Text><Text>{fmtDt(selected.end)}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Class</Text><Text>{selected.className}{selected.section ? `-${selected.section}` : ''}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Subject</Text><Text>{selected.subject || '—'}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Invigilator</Text><Text>{selected.invigilatorName || '—'}</Text></HStack>
                <HStack justify='space-between' mb={2}><Text fontWeight='600'>Classes</Text><Text>{selected.classes || '—'}</Text></HStack>
                <HStack justify='space-between'><Text fontWeight='600'>Status</Text><Badge colorScheme={selected.status === 'Completed' ? 'green' : selected.status === 'Scheduled' ? 'blue' : 'orange'}>{selected.status}</Badge></HStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={viewDisc.onClose}>Close</Button>
            {selected && <Button colorScheme='blue' onClick={() => { viewDisc.onClose(); openEdit(selected); }}>Edit</Button>}
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
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              <FormControl>
                <FormLabel>Class</FormLabel>
                <Select placeholder='Select class' value={form.className || ''} onChange={(e) => setForm(f => ({ ...f, className: e.target.value, section: '' }))}>
                  {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Section (optional)</FormLabel>
                <Select placeholder='Select section' value={form.section || ''} onChange={(e) => setForm(f => ({ ...f, section: e.target.value }))} isDisabled={!form.className}>
                  {(sectionsByClass[form.className] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormControl>
            </SimpleGrid>
            <FormControl mb={3} mt={3}>
              <FormLabel>Subject</FormLabel>
              <Select placeholder='Select subject' value={form.subject || ''} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}>
                {subjects.map(s => <option key={s.id ?? s.name} value={s.name || s.code || ''}>{s.name || s.code}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Invigilator (Teacher)</FormLabel>
              <Select placeholder='Select invigilator' value={form.invigilatorId || ''} onChange={(e) => setForm(f => ({ ...f, invigilatorId: e.target.value }))}>
                {teachers.map(t => <option key={t.id ?? t.teacherId} value={String(t.id ?? t.teacherId)}>{t.name || t.fullName || 'Unnamed'}</option>)}
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Start</FormLabel>
              <Input type='datetime-local' value={toDt(form.start)} onChange={(e) => setForm(f => ({ ...f, start: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>End</FormLabel>
              <Input type='datetime-local' value={toDt(form.end)} onChange={(e) => setForm(f => ({ ...f, end: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Classes</FormLabel>
              <Input placeholder='e.g., 1-5' value={form.classes} onChange={(e) => setForm(f => ({ ...f, classes: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
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
