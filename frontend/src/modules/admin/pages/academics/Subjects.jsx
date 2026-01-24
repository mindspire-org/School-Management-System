import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import {
  MdAssignment,
  MdBook,
  MdDelete,
  MdEdit,
  MdFileDownload,
  MdMoreVert,
  MdPeople,
  MdPictureAsPdf,
  MdRefresh,
  MdRemoveRedEye,
  MdSearch,
  MdTrendingUp,
} from 'react-icons/md';
import jsPDF from 'jspdf';
import * as subjectsApi from '../../../../services/api/subjects';

const normalizeSubjectRow = (row = {}) => ({
  id: row.id,
  name: row.name || 'Untitled Subject',
  code: row.code || '',
  department: row.department || '',
  description: row.description || '',
  teacherCount: Number(row.teacherCount ?? row.teacher_count ?? 0),
  primaryTeacherCount: Number(row.primaryTeacherCount ?? row.primary_teacher_count ?? 0),
  createdAt: row.createdAt || row.created_at || null,
  updatedAt: row.updatedAt || row.updated_at || null,
});

const initialFormState = {
  name: '',
  code: '',
  department: '',
  description: '',
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [createForm, setCreateForm] = useState(initialFormState);
  const [editForm, setEditForm] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [teacherNameMap, setTeacherNameMap] = useState({});
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const deleteCancelRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const fetchTeacherNames = useCallback(async () => {
    try {
      const response = await subjectsApi.listAssignments();
      const dataset = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
      if (!dataset.length) {
        setTeacherNameMap({});
        return;
      }
      const map = dataset.reduce((acc, assignment) => {
        const subjectId = assignment.subjectId ?? assignment.subject_id;
        if (!subjectId) return acc;
        const label = assignment.teacherName || assignment.teacher_name || (assignment.teacherId ? `Teacher ${assignment.teacherId}` : null);
        if (!label) return acc;
        if (!acc[subjectId]) acc[subjectId] = [];
        if (!acc[subjectId].includes(label)) acc[subjectId].push(label);
        return acc;
      }, {});
      setTeacherNameMap(map);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await subjectsApi.list();
      const dataset = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
      setSubjects(dataset.map((row) => normalizeSubjectRow(row)));
      fetchTeacherNames();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to load subjects',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchTeacherNames]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const fetchAssignments = useCallback(
    async (subjectId) => {
      setAssignmentsLoading(true);
      try {
        const response = await subjectsApi.listAssignments({ subjectId });
        const dataset = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
        setAssignments(dataset);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Failed to load assignments',
          description: error?.message || 'Please try again later.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setAssignmentsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (isViewOpen && selected) {
      fetchAssignments(selected.id);
    } else {
      setAssignments([]);
    }
  }, [isViewOpen, selected, fetchAssignments]);

  const departmentOptions = useMemo(() => {
    const set = new Set();
    subjects.forEach((subject) => {
      set.add(subject.department?.trim() || 'Unassigned');
    });
    return ['All', ...Array.from(set)];
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    let data = subjects;
    if (departmentFilter !== 'All') {
      if (departmentFilter === 'Unassigned') {
        data = data.filter((item) => !item.department);
      } else {
        data = data.filter((item) => item.department?.trim() === departmentFilter);
      }
    }
    const term = search.trim().toLowerCase();
    if (term) {
      data = data.filter((item) =>
        [item.name, item.code, item.department, item.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(term))
      );
    }
    return data;
  }, [subjects, departmentFilter, search]);

  const stats = useMemo(() => {
    const total = subjects.length;
    const departments = new Set(subjects.map((subject) => subject.department?.trim()).filter(Boolean)).size;
    const teacherLinks = subjects.reduce((sum, subject) => sum + (subject.teacherCount || 0), 0);
    const unassigned = subjects.filter((subject) => !subject.teacherCount).length;
    return { total, departments, teacherLinks, unassigned };
  }, [subjects]);

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenAdd = () => {
    setCreateForm(initialFormState);
    onAddOpen();
  };

  const closeAddModal = () => {
    onAddClose();
    setCreateForm(initialFormState);
  };

  const handleOpenView = (subject) => {
    setSelected(subject);
    onViewOpen();
  };

  const handleOpenEdit = (subject) => {
    setSelected(subject);
    setEditForm({
      name: subject.name,
      code: subject.code,
      department: subject.department,
      description: subject.description,
    });
    onEditOpen();
  };

  const closeEditModal = () => {
    onEditClose();
    setEditForm(initialFormState);
  };

  const confirmDeleteSubject = (subject) => {
    setDeleteTarget(subject);
    deleteDisclosure.onOpen();
  };

  const closeDeleteDialog = () => {
    deleteDisclosure.onClose();
    setDeleteTarget(null);
  };

  const handleCreateSubject = async () => {
    if (!createForm.name.trim()) {
      toast({ title: 'Name is required', status: 'warning', duration: 3000 });
      return;
    }
    setIsCreating(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        code: createForm.code.trim() || undefined,
        department: createForm.department.trim() || undefined,
        description: createForm.description.trim() || undefined,
      };
      await subjectsApi.create(payload);
      toast({ title: 'Subject saved', status: 'success', duration: 3000 });
      closeAddModal();
      fetchSubjects();
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to save subject', description: error?.message || 'Try again later.', status: 'error', duration: 4000 });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateSubject = async () => {
    if (!selected) return;
    const changes = {};
    ['name', 'code', 'department', 'description'].forEach((field) => {
      const value = editForm[field]?.trim?.() ?? '';
      const original = selected[field] || '';
      if (value !== original) {
        changes[field] = value || null;
      }
    });
    if (!Object.keys(changes).length) {
      toast({ title: 'No changes detected', status: 'info', duration: 2500 });
      return;
    }
    setIsSavingEdit(true);
    try {
      await subjectsApi.update(selected.id, changes);
      toast({ title: 'Subject updated', status: 'success', duration: 3000 });
      closeEditModal();
      fetchSubjects();
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to update subject', description: error?.message || 'Try again later.', status: 'error', duration: 4000 });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await subjectsApi.remove(deleteTarget.id);
      toast({ title: 'Subject deleted', status: 'success', duration: 3000 });
      closeDeleteDialog();
      fetchSubjects();
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to delete subject', description: error?.message || 'Try again later.', status: 'error', duration: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerFileDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const getExportSource = useCallback(() => (filteredSubjects.length ? filteredSubjects : subjects), [filteredSubjects, subjects]);

  const handleExportCsv = () => {
    const dataset = getExportSource();
    if (!dataset.length) {
      toast({ title: 'No subjects to export', status: 'info', duration: 2500 });
      return;
    }
    try {
      const headers = ['Name', 'Code', 'Department', 'Teachers', 'Primary Teachers', 'Description'];
      const rows = dataset.map((subject) => [
        subject.name,
        subject.code || '—',
        subject.department || 'Unassigned',
        subject.teacherCount,
        subject.primaryTeacherCount,
        subject.description || '—',
      ]);
      const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const csvContent = [headers, ...rows]
        .map((row) => row.map(escape).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      triggerFileDownload(blob, `subjects-${Date.now()}.csv`);
      toast({ title: 'CSV exported', status: 'success', duration: 2500 });
    } catch (error) {
      console.error(error);
      toast({ title: 'Export failed', description: error?.message || 'Unable to export CSV.', status: 'error', duration: 4000 });
    }
  };

  const handleExportPdf = () => {
    const dataset = getExportSource();
    if (!dataset.length) {
      toast({ title: 'No subjects to export', status: 'info', duration: 2500 });
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Subjects Overview', 14, 18);
      doc.setFontSize(10);
      let y = 28;
      dataset.forEach((subject, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${index + 1}. ${subject.name} (${subject.code || 'No code'})`, 14, y);
        y += 6;
        doc.text(
          `Dept: ${subject.department || 'Unassigned'}  |  Teachers: ${subject.teacherCount} (${subject.primaryTeacherCount} primary)`,
          14,
          y
        );
        y += 8;
      });
      doc.save(`subjects-${Date.now()}.pdf`);
      toast({ title: 'PDF exported', status: 'success', duration: 2500 });
    } catch (error) {
      console.error(error);
      toast({ title: 'Export failed', description: error?.message || 'Unable to export PDF.', status: 'error', duration: 4000 });
    }
  };

  const handleGenerateReport = () => {
    if (!subjects.length) {
      toast({ title: 'No data to include', status: 'info', duration: 2500 });
      return;
    }
    try {
      const timestamp = new Date();
      const header = [
        'Subject Report',
        `Generated: ${timestamp.toLocaleString()}`,
        `Total Subjects: ${stats.total}`,
        `Departments: ${stats.departments}`,
        `Teacher Links: ${stats.teacherLinks}`,
        `Unassigned Subjects: ${stats.unassigned}`,
        '',
        'Top Subjects by Teacher Count:',
      ];
      const topSubjects = [...subjects]
        .sort((a, b) => (b.teacherCount || 0) - (a.teacherCount || 0))
        .slice(0, 5)
        .map(
          (subject, index) =>
            `${index + 1}. ${subject.name} (${subject.department || 'Unassigned'}) - ${subject.teacherCount} teachers (${subject.primaryTeacherCount} primary)`
        );
      const breakdown = [
        '',
        'Subject Breakdown:',
        ...subjects.map(
          (subject) =>
            `- ${subject.name} (${subject.code || 'No code'}) | Dept: ${subject.department || 'Unassigned'} | Teachers: ${subject.teacherCount}/${subject.primaryTeacherCount} primary`
        ),
      ];
  const reportContent = [...header, ...topSubjects, ...breakdown].join('\n');
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      triggerFileDownload(blob, `subject-report-${Date.now()}.txt`);
      toast({ title: 'Report generated', status: 'success', duration: 2500 });
    } catch (error) {
      console.error(error);
      toast({ title: 'Report failed', description: error?.message || 'Unable to generate report.', status: 'error', duration: 4000 });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>
            Subjects
          </Heading>
          <Text color={textColorSecondary}>Manage academic subjects and teacher assignments</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={fetchSubjects} isLoading={isLoading}>
            Refresh
          </Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue" onClick={handleExportCsv}>
            Export CSV
          </Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue" onClick={handleExportPdf}>
            Export PDF
          </Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdBook color="white" />} />}
          name="Total Subjects"
          value={String(stats.total)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdPeople color="white" />} />}
          name="Departments"
          value={String(stats.departments)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)" icon={<MdTrendingUp color="white" />} />}
          name="Teacher Links"
          value={String(stats.teacherLinks)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdTrendingUp color="white" />} />}
          name="Unassigned"
          value={String(stats.unassigned)}
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack spacing={4} flexWrap="wrap">
            <Select w="200px" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <InputGroup w={{ base: '100%', md: '260px' }}>
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input placeholder="Search subject/code/department" value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
          </HStack>
          <HStack spacing={3}>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleOpenAdd}>
              Add Subject
            </Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue" onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </HStack>
        </Flex>
      </Card>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Subjects Overview
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Code</Th>
                <Th>Subject</Th>
                <Th>Department</Th>
                <Th>Teachers</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && (
                <Tr>
                  <Td colSpan={7}>
                    <Flex align="center" justify="center" py={6}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading subjects...</Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!isLoading && filteredSubjects.length === 0 && (
                <Tr>
                  <Td colSpan={7}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>
                      No subjects found. Add a subject to get started.
                    </Text>
                  </Td>
                </Tr>
              )}
              {!isLoading &&
                filteredSubjects.map((subject) => (
                  <Tr key={subject.id}>
                    <Td>{subject.code || '—'}</Td>
                    <Td>
                      <Text fontWeight="600">{subject.name}</Text>
                      <Text fontSize="sm" color={textColorSecondary} noOfLines={1}>
                        {subject.description || '—'}
                      </Text>
                    </Td>
                    <Td>{subject.department || 'Unassigned'}</Td>
                    <Td>
                        <Text fontWeight="600">
                          {teacherNameMap[subject.id]?.length
                            ? teacherNameMap[subject.id].join(', ')
                            : 'Unassigned'}
                        </Text>
                        <Text fontSize="xs" color={textColorSecondary}>
                          {subject.teacherCount
                            ? `${subject.teacherCount} assigned (${subject.primaryTeacherCount} primary)`
                            : 'No teachers assigned'}
                        </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={subject.teacherCount ? 'green' : 'orange'}>
                        {subject.teacherCount ? 'Assigned' : 'Unassigned'}
                      </Badge>
                    </Td>
                    <Td>{formatDate(subject.updatedAt)}</Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MdMoreVert />}
                          variant="ghost"
                          size="sm"
                          aria-label="Subject actions"
                        />
                        <MenuList>
                          <MenuItem icon={<MdRemoveRedEye />} onClick={() => handleOpenView(subject)}>
                            View Details
                          </MenuItem>
                          <MenuItem icon={<MdEdit />} onClick={() => handleOpenEdit(subject)}>
                            Edit Subject
                          </MenuItem>
                          <MenuItem icon={<MdAssignment />} onClick={() => navigate('/admin/teachers/list')}>
                            Manage Assignments
                          </MenuItem>
                          <MenuItem icon={<MdDelete />} color="red.500" onClick={() => confirmDeleteSubject(subject)}>
                            Delete Subject
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isAddOpen} onClose={closeAddModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={createForm.name} onChange={(e) => handleCreateChange('name', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Code</FormLabel>
                <Input value={createForm.code} onChange={(e) => handleCreateChange('code', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Department</FormLabel>
                <Input value={createForm.department} onChange={(e) => handleCreateChange('department', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => handleCreateChange('description', e.target.value)}
                />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeAddModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateSubject} isLoading={isCreating} loadingText="Saving">
              Save Subject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={deleteDisclosure.isOpen} leastDestructiveRef={deleteCancelRef} onClose={closeDeleteDialog}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Subject
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {deleteTarget?.name}? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={closeDeleteDialog} mr={3}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSubject} isLoading={isDeleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Subject Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box>
                    <Text fontWeight="600">Name</Text>
                    <Text>{selected.name}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="600">Code</Text>
                    <Text>{selected.code || '—'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="600">Department</Text>
                    <Text>{selected.department || 'Unassigned'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="600">Teachers Assigned</Text>
                    <Text>
                      {selected.teacherCount} ({selected.primaryTeacherCount} primary)
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="600">Last Updated</Text>
                    <Text>{formatDate(selected.updatedAt)}</Text>
                  </Box>
                </SimpleGrid>
                <Box mt={4}>
                  <Text fontWeight="600" mb={1}>
                    Description
                  </Text>
                  <Text>{selected.description || '—'}</Text>
                </Box>
                <Divider my={4} />
                <Text fontWeight="600" mb={2}>
                  Teacher Assignments
                </Text>
                {assignmentsLoading ? (
                  <Flex align="center" py={3}>
                    <Spinner size="sm" mr={3} />
                    <Text>Loading assignments...</Text>
                  </Flex>
                ) : assignments.length ? (
                  <VStack align="stretch" spacing={3}>
                    {assignments.map((assignment) => (
                      <Box key={assignment.id} p={3} borderWidth={1} borderRadius="md">
                        <Text fontWeight="600">{assignment.teacherName}</Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {assignment.designation || assignment.department || '—'}
                        </Text>
                        <Badge mt={2} colorScheme={assignment.isPrimary ? 'purple' : 'gray'}>
                          {assignment.isPrimary ? 'Primary Teacher' : 'Support Teacher'}
                        </Badge>
                        {assignment.classes?.length ? (
                          <Text fontSize="sm" mt={2}>
                            Classes: {assignment.classes.join(', ')}
                          </Text>
                        ) : null}
                        {assignment.academicYear ? (
                          <Text fontSize="xs" color={textColorSecondary}>
                            Academic Year: {assignment.academicYear}
                          </Text>
                        ) : null}
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color={textColorSecondary}>No teachers have been assigned to this subject yet.</Text>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" colorScheme="blue" mr={3} onClick={() => navigate('/admin/teachers/list')}>
              Manage Assignments
            </Button>
            <Button colorScheme="blue" onClick={onViewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={closeEditModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input value={editForm.name} onChange={(e) => handleEditChange('name', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Code</FormLabel>
                  <Input value={editForm.code} onChange={(e) => handleEditChange('code', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Department</FormLabel>
                  <Input value={editForm.department} onChange={(e) => handleEditChange('department', e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea rows={3} value={editForm.description} onChange={(e) => handleEditChange('description', e.target.value)} />
                </FormControl>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeEditModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUpdateSubject} isLoading={isSavingEdit} loadingText="Saving">
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
