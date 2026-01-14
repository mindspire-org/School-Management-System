import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Progress,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  SimpleGrid,
  Button,
  Badge,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { MdSearch, MdAdd, MdEdit, MdDelete, MdDoneAll, MdRefresh } from 'react-icons/md';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { MdTrendingUp, MdCheckCircle, MdWarning } from 'react-icons/md';
import * as syllabusApi from '../../../../services/api/syllabus';
import * as teacherApi from '../../../../services/api/teachers';

const deriveStatus = (percent, dueDate) => {
  const today = new Date();
  const due = dueDate ? new Date(dueDate) : null;
  const daysLeft = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : 9999;
  if (percent >= 80) return 'On Track';
  if (percent < 40 || daysLeft < 0) return 'Behind';
  return 'At Risk';
};

const AddEditModal = ({ isOpen, onClose, onSave, initial }) => {
  const [form, setForm] = useState({ className: '', section: '', subject: '', teacherId: '', chapters: 0, covered: 0, dueDate: '' });
  useEffect(() => {
    if (initial) {
      setForm({
        className: initial.className || '',
        section: initial.section || '',
        subject: initial.subject || '',
        teacherId: initial.teacherId ? String(initial.teacherId) : '',
        chapters: Number(initial.chapters || 0),
        covered: Number(initial.covered || 0),
        dueDate: initial.dueDate || '',
      });
    } else {
      setForm({ className: '', section: '', subject: '', teacherId: '', chapters: 0, covered: 0, dueDate: '' });
    }
  }, [initial]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initial ? 'Edit Syllabus Item' : 'Add Syllabus Item'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            <Input placeholder="Class (e.g. 9A)" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
            <Input placeholder="Section (optional)" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <Input type="number" placeholder="Total Chapters" value={form.chapters} onChange={(e) => setForm({ ...form, chapters: Number(e.target.value || 0) })} />
            <Input type="number" placeholder="Covered Chapters" value={form.covered} onChange={(e) => setForm({ ...form, covered: Number(e.target.value || 0) })} />
            <Input type="date" placeholder="Due Date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={() => onSave(form)}>
            {initial ? 'Save' : 'Add'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function TeacherSyllabus() {
  const [rows, setRows] = useState([]);
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [coveredVal, setCoveredVal] = useState(0);
  const editDisc = useDisclosure();
  const addDisc = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const loadTeachers = useCallback(async () => {
    try {
      const res = await teacherApi.list({ page: 1, pageSize: 200 });
      const rows = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
      setTeachers(rows);
    } catch {
      setTeachers([]);
    }
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (cls) params.className = cls;
      if (section) params.section = section;
      if (subject) params.subject = subject;
      if (teacherId) params.teacherId = teacherId;
      if (search) params.q = search;
      const list = await syllabusApi.list(params);
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load syllabus', status: 'error', duration: 3000 });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [cls, section, subject, teacherId, search, toast]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);
  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const classes = useMemo(() => Array.from(new Set(rows.map((i) => i.className))).sort(), [rows]);
  const subjects = useMemo(() => Array.from(new Set(rows.map((i) => i.subject))).sort(), [rows]);

  const data = useMemo(() => {
    const withStatus = rows.map((r) => {
      const percent = Math.round((r.covered / (r.chapters || 1)) * 100);
      return { ...r, percent, status: deriveStatus(percent, r.dueDate) };
    });
    return statusFilter ? withStatus.filter((r) => r.status === statusFilter) : withStatus;
  }, [rows, statusFilter]);

  const avgCoverage = useMemo(() => Math.round((data.reduce((a, b) => a + b.percent / 100, 0) / (data.length || 1)) * 100), [data]);
  const completed = data.filter((r) => r.percent >= 70).length;
  const behind = data.filter((r) => r.percent < 40).length;

  const handleAdd = async (form) => {
    try {
      await syllabusApi.create(form);
      toast({ title: 'Syllabus item added', status: 'success', duration: 2000 });
      addDisc.onClose();
      await fetchRows();
    } catch (e) {
      toast({ title: 'Add failed', description: e?.message || 'Please try again', status: 'error' });
    }
  };

  const handleSaveCoverage = async () => {
    if (!selected) return;
    try {
      await syllabusApi.update(selected.id, { covered: coveredVal });
      toast({ title: 'Coverage updated', status: 'success', duration: 2000 });
      editDisc.onClose();
      await fetchRows();
    } catch (e) {
      toast({ title: 'Update failed', description: e?.message || 'Please try again', status: 'error' });
    }
  };

  const handleDelete = async (row) => {
    try {
      await syllabusApi.remove(row.id);
      toast({ title: 'Deleted', status: 'success', duration: 1500 });
      await fetchRows();
    } catch (e) {
      toast({ title: 'Delete failed', description: e?.message || 'Please try again', status: 'error' });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>
            Teacher Syllabus
          </Heading>
          <Text color={textColorSecondary}>Manage syllabus coverage by class/subject/teacher</Text>
        </Box>
        <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={addDisc.onOpen}>
          Add Item
        </Button>
      </Flex>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack spacing={3} flexWrap="wrap">
            <InputGroup maxW={{ base: '100%', md: '260px' }} w={{ base: '100%', md: 'auto' }}>
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.400" />
              </InputLeftElement>
              <Input placeholder="Search class or subject" value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
            <Select placeholder="Class" value={cls} onChange={(e) => setCls(e.target.value)} minW="180px">
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input placeholder="Section" value={section} onChange={(e) => setSection(e.target.value)} minW="140px" />
            <Select placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} minW="180px">
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select placeholder="Teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} minW="220px">
              {teachers.map((t) => (
                <option key={t.id ?? t.teacherId} value={String(t.id ?? t.teacherId)}>
                  {t.name || t.fullName || 'Unnamed'}
                </option>
              ))}
            </Select>
            <Select placeholder="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} minW="160px">
              <option value="On Track">On Track</option>
              <option value="At Risk">At Risk</option>
              <option value="Behind">Behind</option>
            </Select>
            <Button leftIcon={<MdRefresh />} onClick={fetchRows} isLoading={loading}>
              Refresh
            </Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb={5}>
        <StatCard title="Avg Coverage" value={`${avgCoverage}%`} icon={MdTrendingUp} colorScheme="blue" />
        <StatCard title=">= 70% Covered" value={String(completed)} icon={MdCheckCircle} colorScheme="green" />
        <StatCard title="< 40% Covered" value={String(behind)} icon={MdWarning} colorScheme="orange" />
        <StatCard title="Subjects" value={String(data.length)} icon={MdTrendingUp} colorScheme="purple" />
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Syllabus Progress
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Class</Th>
                <Th>Subject</Th>
                <Th>Teacher</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th isNumeric>Covered</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={7}>
                    <Flex align="center" justify="center" py={8}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : (
                data.map((r) => {
                  const percent = r.percent;
                  return (
                    <Tr key={r.id}>
                      <Td>
                        <Badge colorScheme="blue">{r.className}{r.section ? `-${r.section}` : ''}</Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="600">{r.subject}</Text>
                      </Td>
                      <Td>{r.teacherName || '—'}</Td>
                      <Td>{r.dueDate || '—'}</Td>
                      <Td>
                        <Badge colorScheme={r.status === 'On Track' ? 'green' : r.status === 'At Risk' ? 'yellow' : 'red'}>{r.status}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Box minW="220px">
                          <Tooltip label={`${percent}%`}>
                            <Progress value={percent} colorScheme={percent >= 70 ? 'green' : percent >= 40 ? 'orange' : 'red'} size="sm" borderRadius="md" />
                          </Tooltip>
                        </Box>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="Edit">
                            <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setSelected(r); setCoveredVal(r.covered); editDisc.onOpen(); }} />
                          </Tooltip>
                          <Tooltip label="Mark Complete">
                            <IconButton aria-label="Complete" icon={<MdDoneAll />} size="sm" variant="ghost" onClick={() => syllabusApi.update(r.id, { covered: r.chapters }).then(fetchRows)} />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(r)} />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <AddEditModal isOpen={addDisc.isOpen} onClose={addDisc.onClose} onSave={handleAdd} />

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Coverage</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={3}>
                  <Box>
                    <Text mb={1}>
                      <strong>Class:</strong> {selected.className}
                    </Text>
                  </Box>
                  <Box>
                    <Text mb={1}>
                      <strong>Subject:</strong> {selected.subject}
                    </Text>
                  </Box>
                  <Box>
                    <Text mb={1}>
                      <strong>Teacher:</strong> {selected.teacherName || '—'}
                    </Text>
                  </Box>
                  <Box>
                    <Text mb={1}>
                      <strong>Due:</strong> {selected.dueDate || '—'}
                    </Text>
                  </Box>
                </SimpleGrid>
                <Text mb={2}>
                  <strong>Chapters:</strong> {coveredVal} / {selected.chapters}
                </Text>
                <Slider value={coveredVal} min={0} max={selected.chapters} onChange={setCoveredVal} colorScheme="blue">
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={editDisc.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveCoverage}>
              Save
            </Button>
            <Button variant="outline" ml={2} leftIcon={<MdDoneAll />} onClick={() => { if (!selected) return; setCoveredVal(selected.chapters); }}>
              Max
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
