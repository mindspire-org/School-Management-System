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
  ButtonGroup,
  Badge,
  Checkbox,
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
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { MdTrendingUp, MdCheckCircle, MdWarning, MdUpdate, MdAssignment, MdSearch, MdFileDownload, MdPictureAsPdf, MdRefresh, MdEdit, MdRemoveRedEye, MdDoneAll, MdDelete } from 'react-icons/md';
import * as syllabusApi from '../../../../services/api/syllabus';
import * as teacherApi from '../../../../services/api/teachers';
import useClassOptions from '../../../../hooks/useClassOptions';

export default function Syllabus() {
  const [rows, setRows] = useState([]);
  const [cls, setCls] = useState('All');
  const [subject, setSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [coveredVal, setCoveredVal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const disc = useDisclosure(); // coverage update
  const addDisc = useDisclosure();
  const editDisc = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ className: '', section: '', subject: '', chapters: 0, covered: 0, dueDate: '' });
  const { classOptions, sectionsByClass } = useClassOptions();
  const sectionOpts = useMemo(() => (newItem.className ? (sectionsByClass[newItem.className] || []) : []), [newItem.className, sectionsByClass]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await teacherApi.listSubjects();
        const items = Array.isArray(list) ? list : [];
        setSubjectOptions(items);
      } catch {
        setSubjectOptions([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await teacherApi.list({ page: 1, pageSize: 200 });
        const rows = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
        setTeachers(rows);
      } catch {
        setTeachers([]);
      }
    })();
  }, []);

  const classes = useMemo(() => ['All', ...Array.from(new Set(rows.map(i => i.className)))], [rows]);
  const subjects = useMemo(() => ['All', ...Array.from(new Set(rows.map(i => i.subject)))], [rows]);
  const filteredByClass = useMemo(() => (cls === 'All' ? rows : rows.filter(i => i.className === cls)), [cls, rows]);
  const deriveStatus = (percent, dueDate) => {
    const today = new Date();
    const due = dueDate ? new Date(dueDate) : null;
    const daysLeft = due ? Math.ceil((due - today) / (1000 * 60 * 60 * 24)) : 9999;
    if (percent >= 80) return 'On Track';
    if (percent < 40 || daysLeft < 0) return 'Behind';
    return 'At Risk';
  };

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (cls && cls !== 'All') params.className = cls;
      if (subject && subject !== 'All') params.subject = subject;
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
  }, [cls, subject, search, toast]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const data = useMemo(() => {
    const base = filteredByClass.filter(i => (subject === 'All' || i.subject === subject) && (!search || `${i.className} ${i.subject} ${i.teacherName || ''}`.toLowerCase().includes(search.toLowerCase())));
    const withStatus = base.map(r => { const percent = Math.round((r.covered / ((r.chapters || 1))) * 100); return ({ ...r, percent, status: deriveStatus(percent, r.dueDate) }); });
    return statusFilter === 'All' ? withStatus : withStatus.filter(r => r.status === statusFilter);
  }, [filteredByClass, subject, search, statusFilter]);

  const totalSubjects = data.length;
  const avgCoverage = useMemo(() => Math.round((data.reduce((a, b) => a + (b.percent / 100), 0) / (data.length || 1)) * 100), [data]);
  const completed = data.filter(r => r.percent >= 70).length;
  const behind = data.filter(r => r.percent < 40).length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Syllabus</Heading>
          <Text color={textColorSecondary}>Track syllabus coverage by class and subject</Text>
        </Box>
        <ButtonGroup>
          <Button colorScheme='blue' onClick={() => { setNewItem({ className: '', section: '', subject: '', chapters: 0, covered: 0, dueDate: '' }); addDisc.onOpen(); }}>Add Item</Button>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={fetchRows} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card mb={5}>
        <Flex
          p={4}
          justifyContent="space-between"
          alignItems="center"
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          flexWrap={{ base: 'wrap', md: 'wrap' }}
          rowGap={3}
        >
          <HStack
            flex={{ base: '1 1 100%', md: '1 1 auto' }}
            flexWrap='wrap'
            spacing={3}
          >
            <InputGroup maxW={{ base: '100%', md: '260px' }} w={{ base: '100%', md: 'auto' }}>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search class or subject' value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
            <Select w="200px" value={cls} onChange={(e) => setCls(e.target.value)}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select w="200px" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select w="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>On Track</option>
              <option>At Risk</option>
              <option>Behind</option>
            </Select>
          </HStack>
          <HStack
            flexShrink={0}
            spacing={3}
            w={{ base: '100%', md: 'auto' }}
            justifyContent={{ base: 'flex-end', md: 'flex-start' }}
            flexWrap='wrap'
          >
            <Button leftIcon={<MdUpdate />} colorScheme="blue">Update Coverage</Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue">Generate Report</Button>
          </HStack>
        </Flex>
      </Card>

      {/* Add Item Modal */}
      <Modal isOpen={addDisc.isOpen} onClose={addDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Syllabus Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              <FormControl>
                <FormLabel>Class</FormLabel>
                <Select placeholder='Select class' value={newItem.className} onChange={(e) => setNewItem({ ...newItem, className: e.target.value, section: '' })}>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Section (optional)</FormLabel>
                <Select placeholder='Select section' value={newItem.section} onChange={(e) => setNewItem({ ...newItem, section: e.target.value })} isDisabled={!sectionOpts.length}>
                  {sectionOpts.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Select placeholder='Select subject' value={newItem.subject} onChange={(e) => setNewItem({ ...newItem, subject: e.target.value })}>
                  {subjectOptions.map((s) => (
                    <option key={s.id ?? s.name} value={s.name || s.code || ''}>{s.name || s.code}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Teacher (optional)</FormLabel>
                <Select placeholder='Select teacher' value={newItem.teacherId || ''} onChange={(e) => setNewItem({ ...newItem, teacherId: e.target.value || null })}>
                  {teachers.map((t) => (
                    <option key={t.id ?? t.teacherId} value={String(t.id ?? t.teacherId)}>{t.name || t.fullName || 'Unnamed'}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Total Chapters</FormLabel>
                <Input type='number' value={newItem.chapters} onChange={(e) => setNewItem({ ...newItem, chapters: Number(e.target.value || 0) })} />
              </FormControl>
              <FormControl>
                <FormLabel>Covered Chapters</FormLabel>
                <Input type='number' value={newItem.covered} onChange={(e) => setNewItem({ ...newItem, covered: Number(e.target.value || 0) })} />
              </FormControl>
              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input type='date' value={newItem.dueDate} onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })} />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={addDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async () => {
              try {
                await syllabusApi.create(newItem);
                toast({ title: 'Item added', status: 'success', duration: 1500 });
                addDisc.onClose();
                fetchRows();
              } catch (e) {
                toast({ title: 'Create failed', status: 'error' });
              }
            }}>Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Item Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Syllabus Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editItem && (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <FormControl>
                  <FormLabel>Class</FormLabel>
                  <Select placeholder='Select class' value={editItem.className || ''} onChange={(e) => setEditItem({ ...editItem, className: e.target.value, section: '' })}>
                    {classOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Section (optional)</FormLabel>
                  <Select placeholder='Select section' value={editItem.section || ''} onChange={(e) => setEditItem({ ...editItem, section: e.target.value })}>
                    {(sectionsByClass[editItem.className] || []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Subject</FormLabel>
                  <Select placeholder='Select subject' value={editItem.subject || ''} onChange={(e) => setEditItem({ ...editItem, subject: e.target.value })}>
                    {subjectOptions.map((s) => (
                      <option key={s.id ?? s.name} value={s.name || s.code || ''}>{s.name || s.code}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Teacher (optional)</FormLabel>
                  <Select placeholder='Select teacher' value={editItem.teacherId ? String(editItem.teacherId) : ''} onChange={(e) => setEditItem({ ...editItem, teacherId: e.target.value || null })}>
                    {teachers.map((t) => (
                      <option key={t.id ?? t.teacherId} value={String(t.id ?? t.teacherId)}>{t.name || t.fullName || 'Unnamed'}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Total Chapters</FormLabel>
                  <Input type='number' value={editItem.chapters ?? 0} onChange={(e) => setEditItem({ ...editItem, chapters: Number(e.target.value || 0) })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Covered Chapters</FormLabel>
                  <Input type='number' value={editItem.covered ?? 0} onChange={(e) => setEditItem({ ...editItem, covered: Number(e.target.value || 0) })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input type='date' value={editItem.dueDate || ''} onChange={(e) => setEditItem({ ...editItem, dueDate: e.target.value })} />
                </FormControl>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async () => {
              if (!editItem) return;
              try {
                const payload = { className: editItem.className, section: editItem.section, subject: editItem.subject, teacherId: editItem.teacherId ? Number(editItem.teacherId) : null, chapters: editItem.chapters, covered: editItem.covered, dueDate: editItem.dueDate };
                await syllabusApi.update(editItem.id, payload);
                toast({ title: 'Item updated', status: 'success', duration: 1500 });
                editDisc.onClose();
                fetchRows();
              } catch (e) {
                toast({ title: 'Update failed', status: 'error' });
              }
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb={5}>
        <StatCard
          title="Avg Coverage"
          value={`${avgCoverage}%`}
          icon={MdTrendingUp}
          colorScheme="blue"
        />
        <StatCard
          title=">= 70% Covered"
          value={String(completed)}
          icon={MdCheckCircle}
          colorScheme="green"
        />
        <StatCard
          title="< 40% Covered"
          value={String(behind)}
          icon={MdWarning}
          colorScheme="orange"
        />
        <StatCard
          title="Subjects"
          value={String(totalSubjects)}
          icon={MdTrendingUp}
          colorScheme="purple"
        />
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Syllabus Progress
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selectedIds.length === data.length && data.length > 0} isIndeterminate={selectedIds.length > 0 && selectedIds.length < data.length} onChange={(e) => setSelectedIds(e.target.checked ? data.map(d => d.id) : [])} />
                </Th>
                <Th>Class</Th>
                <Th>Subject</Th>
                <Th>Teacher</Th>
                <Th>Due Date</Th>
                <Th>Status</Th>
                <Th w="240px" pr={2}>Progress Bar</Th>
                <Th w="90px" textAlign="right" pl={2}>Covered</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={9}>
                    <Flex align="center" justify="center" py={6}><Spinner size="sm" mr={3} />Loading...</Flex>
                  </Td>
                </Tr>
              ) : data.map((r) => {
                const percent = r.percent;
                return (
                  <Tr key={r.id}>
                    <Td>
                      <Checkbox isChecked={selectedIds.includes(r.id)} onChange={() => setSelectedIds(prev => prev.includes(r.id) ? prev.filter(id => id !== r.id) : [...prev, r.id])} />
                    </Td>
                    <Td><Badge colorScheme='blue'>{r.className}</Badge></Td>
                    <Td><Text fontWeight='600'>{r.subject}</Text></Td>
                    <Td>{r.teacherName || '—'}</Td>
                    <Td>{r.dueDate}</Td>
                    <Td>
                      <Badge colorScheme={r.status === 'On Track' ? 'green' : r.status === 'At Risk' ? 'yellow' : 'red'}>{r.status}</Badge>
                    </Td>
                    <Td w="240px" pr={2}>
                      <Box w="100%">
                        <Flex justify="flex-start" mb={1}>
                          <Text fontSize="xs" color={textColorSecondary}>Progress</Text>
                        </Flex>
                        <Tooltip label={`${percent}%`}>
                          <Progress value={percent} colorScheme={percent >= 70 ? 'green' : percent >= 40 ? 'orange' : 'red'} size="sm" borderRadius="md" />
                        </Tooltip>
                      </Box>
                    </Td>
                    <Td w="90px" textAlign="right" pl={2}>
                      <Text fontSize="sm" fontWeight="700" color={percent >= 70 ? 'green.500' : percent >= 40 ? 'orange.500' : 'red.500'}>
                        {percent}%
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton aria-label='View / Update Coverage' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(r); setCoveredVal(r.covered); disc.onOpen(); }} />
                        <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={() => { setEditItem({ ...r }); editDisc.onOpen(); }} />
                        <IconButton aria-label='Complete' icon={<MdDoneAll />} size='sm' variant='ghost' onClick={async () => {
                          try {
                            await syllabusApi.update(r.id, { covered: r.chapters });
                            toast({ title: 'Marked complete', status: 'success', duration: 1500 });
                            fetchRows();
                          } catch (e) {
                            toast({ title: 'Update failed', status: 'error' });
                          }
                        }} />
                        <IconButton aria-label='Delete' icon={<MdDelete />} size='sm' variant='ghost' colorScheme='red' onClick={async () => {
                          try {
                            await syllabusApi.remove(r.id);
                            toast({ title: 'Deleted', status: 'success', duration: 1200 });
                            fetchRows();
                          } catch (e) {
                            toast({ title: 'Delete failed', status: 'error' });
                          }
                        }} />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={disc.isOpen} onClose={disc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Subject Details & Update</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} mb={3}>
                  <Box><Text mb={1}><strong>Class:</strong> {selected.className}</Text></Box>
                  <Box><Text mb={1}><strong>Subject:</strong> {selected.subject}</Text></Box>
                  <Box><Text mb={1}><strong>Teacher:</strong> {selected.teacher}</Text></Box>
                  <Box><Text mb={1}><strong>Due:</strong> {selected.dueDate}</Text></Box>
                </SimpleGrid>
                <Text mb={2}><strong>Chapters:</strong> {coveredVal} / {selected.chapters}</Text>
                <Slider value={coveredVal} min={0} max={selected.chapters} onChange={setCoveredVal} colorScheme='blue'>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={disc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={async () => {
              if (!selected) return;
              try {
                await syllabusApi.update(selected.id, { covered: coveredVal });
                toast({ title: 'Coverage updated', status: 'success', duration: 1500 });
                disc.onClose();
                fetchRows();
              } catch (e) {
                toast({ title: 'Update failed', status: 'error' });
              }
            }}>Save</Button>
            <Button leftIcon={<MdDoneAll />} variant='outline' ml={2} onClick={async () => {
              if (!selected) return;
              try {
                await syllabusApi.update(selected.id, { covered: selected.chapters });
                toast({ title: 'Marked complete', status: 'success', duration: 1500 });
                disc.onClose();
                fetchRows();
              } catch (e) {
                toast({ title: 'Update failed', status: 'error' });
              }
            }}>Mark Complete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
