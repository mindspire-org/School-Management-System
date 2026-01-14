import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Icon,
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
  Tag,
  TagLabel,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import {
  MdAdd,
  MdAssignment,
  MdBookmark,
  MdBook,
  MdCheck,
  MdDelete,
  MdEdit,
  MdMoreVert,
  MdPersonAdd,
  MdSearch,
  MdVisibility,
} from 'react-icons/md';
import * as teacherApi from '../../../../services/api/teachers';

const classOptions = [
  { id: '10A', name: '10th Grade Section A' },
  { id: '10B', name: '10th Grade Section B' },
  { id: '10C', name: '10th Grade Section C' },
  { id: '11A', name: '11th Grade Section A' },
  { id: '11B', name: '11th Grade Section B' },
  { id: '11C', name: '11th Grade Section C' },
  { id: '12A', name: '12th Grade Section A' },
  { id: '12B', name: '12th Grade Section B' },
  { id: '12C', name: '12th Grade Section C' },
];

const initialSubjectForm = {
  name: '',
  code: '',
  department: '',
  description: '',
};

const initialAssignmentForm = {
  subjectId: '',
  classes: [],
  isPrimary: false,
  academicYear: '',
  assignmentId: null,
};

const getSubjectColor = (name = '') => {
  const normalized = name.toLowerCase();
  if (normalized.includes('math')) return 'blue';
  if (normalized.includes('phys')) return 'cyan';
  if (normalized.includes('chem')) return 'pink';
  if (normalized.includes('bio')) return 'green';
  if (normalized.includes('english')) return 'purple';
  if (normalized.includes('computer')) return 'teal';
  if (normalized.includes('history')) return 'orange';
  if (normalized.includes('geo')) return 'yellow';
  if (normalized.includes('art')) return 'gray';
  return 'blue';
};

const toClassId = (cls) => {
  if (cls === undefined || cls === null) return '';
  if (typeof cls === 'string' || typeof cls === 'number') return String(cls);
  if (typeof cls === 'object') {
    if (cls.id) return String(cls.id);
    if (cls.classId) return String(cls.classId);
    if (cls.code) return String(cls.code);
    const section = cls.section ?? cls.sectionName;
    const className = cls.className ?? cls.class ?? cls.grade ?? cls.name;
    const digits = className ? String(className).match(/\d+/)?.[0] : '';
    if (digits && section) return `${digits}${section}`;
    if (className && section) return `${className}${section}`;
    if (className) return String(className);
  }
  return '';
};

const formatClassLabel = (cls) => {
  if (cls === undefined || cls === null) return '—';
  if (typeof cls === 'string' || typeof cls === 'number') return String(cls);
  if (typeof cls === 'object') {
    const section = cls.section ?? cls.sectionName;
    const className = cls.className ?? cls.class ?? cls.grade ?? cls.name;
    const year = cls.academicYear ?? cls.year;
    const base = [className, section].filter(Boolean).join('-') || toClassId(cls) || '—';
    const y = year === undefined || year === null ? '' : String(year);
    return y ? `${String(base)} (${y})` : String(base);
  }
  return String(cls);
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
};

const TeacherSubjects = () => {
  const assignDisclosure = useDisclosure();
  const subjectDisclosure = useDisclosure();
  const subjectDetailsDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const viewDisclosure = subjectDetailsDisclosure; // legacy alias to avoid runtime crashes during refactor
  const deleteCancelRef = useRef();

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(false);
  const [subjectForm, setSubjectForm] = useState(initialSubjectForm);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);
  const [assignmentType, setAssignmentType] = useState('add');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSubjectAssignments, setActiveSubjectAssignments] = useState([]);
  const [assignmentRequiresTeacherPick, setAssignmentRequiresTeacherPick] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const fetchTeachers = useCallback(async () => {
    setTeacherLoading(true);
    try {
      const response = await teacherApi.list({ page: 1, pageSize: 200 });
      const rows = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
      setTeachers(rows);
    } catch (error) {
      console.error(error);
      setTeachers([]);
      toast({
        title: 'Failed to load teachers',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setTeacherLoading(false);
    }
  }, [toast]);

  const fetchSubjects = useCallback(async () => {
    setSubjectLoading(true);
    try {
      const data = await teacherApi.listSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setSubjects([]);
      toast({
        title: 'Failed to load subjects',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSubjectLoading(false);
    }
  }, [toast]);

  const fetchAssignments = useCallback(async () => {
    setAssignmentLoading(true);
    try {
      const data = await teacherApi.listSubjectAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAssignments([]);
      toast({
        title: 'Failed to load assignments',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setAssignmentLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    fetchSubjects();
    fetchAssignments();
  }, [fetchSubjects, fetchAssignments]);

  useEffect(() => {
    if (!subjectDetailsDisclosure.isOpen || !activeSubject) return;
    const filtered = assignments.filter((assignment) => assignment.subjectId === activeSubject.id);
    setActiveSubjectAssignments(filtered);
  }, [subjectDetailsDisclosure.isOpen, activeSubject, assignments]);

  const teacherMap = useMemo(() => {
    const map = new Map();
    teachers.forEach((teacher) => {
      if (teacher?.id) map.set(Number(teacher.id), teacher);
    });
    return map;
  }, [teachers]);

  const teacherAssignmentsMap = useMemo(() => {
    const map = new Map();
    assignments.forEach((assignment) => {
      const list = map.get(assignment.teacherId) || [];
      list.push(assignment);
      map.set(assignment.teacherId, list);
    });
    return map;
  }, [assignments]);

  const teacherAllocations = useMemo(() => {
    const combined = [];
    teacherAssignmentsMap.forEach((rows, teacherId) => {
      const teacher = teacherMap.get(teacherId);
      const classesSet = new Set();
      const secondarySubjects = [];
      let primarySubject = null;
      rows.forEach((row) => {
        (row.classes || []).forEach((cls) => {
          const label = formatClassLabel(cls);
          if (label && label !== '—') classesSet.add(label);
        });
        if (row.isPrimary) primarySubject = row.subjectName;
        if (!row.isPrimary) secondarySubjects.push(row.subjectName);
      });
      if (!primarySubject && rows[0]) primarySubject = rows[0].subjectName;
      combined.push({
        teacherId,
        teacherName: teacher?.name || rows[0]?.teacherName || 'Unknown Teacher',
        qualification: teacher?.qualification || teacher?.designation || rows[0]?.designation || '—',
        avatar: teacher?.avatar || teacher?.photo || '',
        experience: teacher?.experienceYears ? `${teacher.experienceYears} years` : '—',
        classes: Array.from(classesSet),
        primarySubject,
        secondarySubjects,
      });
    });
    return combined.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
  }, [teacherAssignmentsMap, teacherMap]);

  const filteredAllocations = useMemo(() => {
    if (!searchQuery) return teacherAllocations;
    const query = searchQuery.toLowerCase();
    return teacherAllocations.filter((allocation) => {
      const haystack = [
        allocation.teacherName,
        allocation.primarySubject,
        ...(allocation.secondarySubjects || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [teacherAllocations, searchQuery]);

  const subjectStats = useMemo(() => {
    const departmentCount = new Set(subjects.map((subject) => subject.department).filter(Boolean)).size;
    const totalAssignments = assignments.length;
    const teacherCount = teacherAllocations.length || teachers.length;
    const average = teacherCount ? (totalAssignments / teacherCount).toFixed(1) : '0.0';
    return {
      totalSubjects: subjects.length,
      departmentCount,
      totalAssignments,
      averagePerTeacher: average,
      teacherCount,
    };
  }, [subjects, assignments, teacherAllocations, teachers.length]);

  const handleOpenAssignModal = (teacher, type, requiresTeacherPick = false) => {
    const normalizedTeacher = teacher
      ? { ...teacher, id: Number(teacher.id ?? teacher.teacherId) }
      : null;
    setSelectedTeacher(normalizedTeacher);
    setAssignmentType(type);
    setAssignmentRequiresTeacherPick(requiresTeacherPick || !normalizedTeacher);
    if (type === 'edit') return;
    const baseForm = type === 'primary'
      ? { ...initialAssignmentForm, isPrimary: true }
      : initialAssignmentForm;
    setAssignmentForm(baseForm);
    assignDisclosure.onOpen();
  };

  const openEditAssignment = (assignment) => {
    const teacher = teacherMap.get(assignment.teacherId) || {
      id: assignment.teacherId,
      name: assignment.teacherName,
      qualification: assignment.designation,
    };
    setSelectedTeacher({ ...teacher, id: Number(teacher.id ?? teacher.teacherId ?? assignment.teacherId) });
    setAssignmentRequiresTeacherPick(false);
    setAssignmentType('edit');
    setAssignmentForm({
      subjectId: assignment.subjectId ? String(assignment.subjectId) : '',
      classes: Array.isArray(assignment.classes) ? assignment.classes.map((c) => toClassId(c)).filter(Boolean) : [],
      isPrimary: Boolean(assignment.isPrimary),
      academicYear: assignment.academicYear || '',
      assignmentId: assignment.id,
    });
    assignDisclosure.onOpen();
  };

  const handleViewSubject = (subject) => {
    setActiveSubject(subject);
    const filtered = assignments.filter((assignment) => assignment.subjectId === subject.id);
    setActiveSubjectAssignments(filtered);
    subjectDetailsDisclosure.onOpen();
  };

  const closeAssignModal = () => {
    assignDisclosure.onClose();
    setSelectedTeacher(null);
    setAssignmentForm(initialAssignmentForm);
    setAssignmentType('add');
    setAssignmentRequiresTeacherPick(false);
  };

  const handleManualTeacherSelect = (event) => {
    const teacherId = Number(event.target.value);
    if (!teacherId) {
      setSelectedTeacher(null);
      return;
    }
    const teacher = teacherMap.get(teacherId) || teachers.find((row) => Number(row.id) === teacherId);
    setSelectedTeacher(teacher ? { ...teacher, id: teacherId } : null);
  };

  const handleSaveAssignment = async () => {
    if (!selectedTeacher) {
      toast({
        title: 'Select a teacher',
        description: 'Pick a teacher before assigning subjects.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    if (assignmentType !== 'primary' && !assignmentForm.subjectId) {
      toast({
        title: 'Subject required',
        description: 'Please select a subject.',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setSavingAssignment(true);
    try {
      if (assignmentType === 'primary') {
        const teacherRows = teacherAssignmentsMap.get(selectedTeacher.id) || [];
        const target = teacherRows.find((row) => String(row.subjectId) === assignmentForm.subjectId);
        if (!target) {
          toast({
            title: 'Select a subject',
            description: 'Choose one of the assigned subjects to mark as primary.',
            status: 'warning',
            duration: 3000,
          });
          setSavingAssignment(false);
          return;
        }
        await teacherApi.updateSubjectAssignment(target.id, { isPrimary: true, teacherId: selectedTeacher.id });
      } else if (assignmentType === 'edit') {
        if (!assignmentForm.assignmentId) throw new Error('Assignment id missing');
        await teacherApi.updateSubjectAssignment(assignmentForm.assignmentId, {
          teacherId: selectedTeacher.id,
          subjectId: Number(assignmentForm.subjectId),
          classes: assignmentForm.classes,
          academicYear: assignmentForm.academicYear || null,
          isPrimary: assignmentForm.isPrimary,
        });
      } else {
        await teacherApi.assignSubject({
          teacherId: Number(selectedTeacher.id),
          subjectId: Number(assignmentForm.subjectId),
          classes: assignmentForm.classes,
          academicYear: assignmentForm.academicYear || null,
          isPrimary: assignmentForm.isPrimary,
        });
      }
      toast({
        title: 'Assignment saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await Promise.all([fetchAssignments(), fetchSubjects()]);
      closeAssignModal();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to save assignment',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!subjectForm.name.trim()) {
      toast({
        title: 'Subject name required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    setSavingSubject(true);
    try {
      await teacherApi.createSubject({
        name: subjectForm.name.trim(),
        code: subjectForm.code || null,
        department: subjectForm.department || null,
        description: subjectForm.description || null,
      });
      toast({
        title: 'Subject saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await fetchSubjects();
      setSubjectForm(initialSubjectForm);
      subjectDisclosure.onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to save subject',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setSavingSubject(false);
    }
  };

  const confirmDeleteAssignment = (assignment) => {
    setDeleteTarget(assignment);
    deleteDisclosure.onOpen();
  };

  const handleDeleteAssignment = async () => {
    if (!deleteTarget) return;
    setDeletingAssignment(true);
    try {
      await teacherApi.deleteSubjectAssignment(deleteTarget.id);
      toast({
        title: 'Assignment removed',
        status: 'success',
        duration: 3000,
      });
      await Promise.all([fetchAssignments(), fetchSubjects()]);
      setDeleteTarget(null);
      deleteDisclosure.onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to delete assignment',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setDeletingAssignment(false);
    }
  };

  const subjectOptionsForTeacher = useMemo(() => {
    return subjects;
  }, [subjects]);

  const teacherAssignmentsForSelected = useMemo(() => {
    if (!selectedTeacher) return [];
    return teacherAssignmentsMap.get(selectedTeacher.id) || [];
  }, [selectedTeacher, teacherAssignmentsMap]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading as="h3" size="lg" mb={1}>Subject Assignment</Heading>
          <Text color={textColorSecondary}>Manage subjects, teachers, and class allocations</Text>
        </Box>
        <Button leftIcon={<Icon as={MdAdd} />} colorScheme="blue" onClick={subjectDisclosure.onOpen}>
          Add New Subject
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard
          title='Total Subjects'
          value={subjectLoading ? '…' : String(subjectStats.totalSubjects)}
          subValue={`Across ${subjectStats.departmentCount} depts`}
          icon={MdBook}
          colorScheme='blue'
        />
        <StatCard
          title='Subject Allocations'
          value={assignmentLoading ? '…' : String(subjectStats.totalAssignments)}
          subValue={`${subjectStats.averagePerTeacher} per teacher`}
          icon={MdAssignment}
          colorScheme='green'
        />
        <StatCard
          title='Teachers Covered'
          value={teacherLoading ? '…' : String(subjectStats.teacherCount)}
          subValue='Active in timetable'
          icon={MdPersonAdd}
          colorScheme='purple'
        />
      </SimpleGrid>

      <Card overflow="hidden" mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor} flexWrap="wrap" gap={4}>
          <Text fontSize="lg" fontWeight="medium">Teacher Subject Allocation</Text>
          <Flex align="center" gap={3} flexWrap="wrap" justifyContent="flex-end">
            <InputGroup maxW="320px">
              <InputLeftElement pointerEvents="none">
                <Icon as={MdSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search teacher or subject"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
            <Button
              colorScheme="blue"
              leftIcon={<Icon as={MdPersonAdd} />}
              onClick={() => handleOpenAssignModal(null, 'add', true)}
              whiteSpace="nowrap"
            >
              New Teacher Subject Allocation
            </Button>
          </Flex>
        </Flex>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Teacher</Th>
                <Th>Primary Subject</Th>
                <Th>Secondary Subjects</Th>
                <Th>Classes</Th>
                <Th>Experience</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {assignmentLoading && (
                <Tr>
                  <Td colSpan={6}>
                    <Flex align="center" justify="center" py={6}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading allocations...</Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!assignmentLoading && filteredAllocations.length === 0 && (
                <Tr>
                  <Td colSpan={6}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>No allocations match the current filters.</Text>
                  </Td>
                </Tr>
              )}
              {!assignmentLoading && filteredAllocations.map((allocation) => {
                const teacher = teacherMap.get(allocation.teacherId) || {
                  id: allocation.teacherId,
                  name: allocation.teacherName,
                  qualification: allocation.qualification,
                };
                const teacherAssignments = teacherAssignmentsMap.get(allocation.teacherId) || [];
                const primaryAssignment = teacherAssignments.find((row) => row.isPrimary) || teacherAssignments[0];
                return (
                  <Tr key={allocation.teacherId} _hover={{ bg: hoverBg }}>
                    <Td>
                      <Flex align="center">
                        <Avatar size="sm" src={teacher?.avatar || teacher?.photo} name={allocation.teacherName} mr={3} />
                        <Box>
                          <Text fontWeight="medium">{allocation.teacherName}</Text>
                          <Text fontSize="xs" color={textColorSecondary}>{allocation.qualification}</Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      {allocation.primarySubject ? (
                        <Badge colorScheme={getSubjectColor(allocation.primarySubject)} px={3} py={1} borderRadius="full">
                          {allocation.primarySubject}
                        </Badge>
                      ) : (
                        <Text color={textColorSecondary}>—</Text>
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={1} flexWrap="wrap">
                        {allocation.secondarySubjects?.map((subject) => (
                          <Badge key={subject} colorScheme={getSubjectColor(subject)} variant="subtle" borderRadius="full" fontSize="xs" px={2} py={0.5}>
                            {subject}
                          </Badge>
                        ))}
                        {!allocation.secondarySubjects?.length && <Text color={textColorSecondary}>—</Text>}
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={1} flexWrap="wrap">
                        {allocation.classes.length ? (
                          allocation.classes.map((cls, idx) => (
                            <Tag key={`${formatClassLabel(cls)}-${idx}`} size="sm" borderRadius="full" colorScheme="cyan">
                              <TagLabel>{formatClassLabel(cls)}</TagLabel>
                            </Tag>
                          ))
                        ) : (
                          <Text color={textColorSecondary}>—</Text>
                        )}
                      </HStack>
                    </Td>
                    <Td>{allocation.experience || '—'}</Td>
                    <Td>
                      <Menu>
                        <MenuButton as={Button} variant="ghost" size="sm" rightIcon={<Icon as={MdMoreVert} />}>
                          Actions
                        </MenuButton>
                        <MenuList>
                          <MenuItem icon={<Icon as={MdAdd} />} onClick={() => handleOpenAssignModal(teacher, 'add')}>
                            Assign New Subject
                          </MenuItem>
                          {!!teacherAssignments.length && (
                            <MenuItem icon={<Icon as={MdBookmark} />} onClick={() => handleOpenAssignModal(teacher, 'primary')}>
                              Change Primary Subject
                            </MenuItem>
                          )}
                          {primaryAssignment && (
                            <MenuItem icon={<Icon as={MdEdit} />} onClick={() => openEditAssignment(primaryAssignment)}>
                              Edit Primary Assignment
                            </MenuItem>
                          )}
                          {primaryAssignment && (
                            <MenuItem icon={<Icon as={MdDelete} />} color="red.500" onClick={() => confirmDeleteAssignment(primaryAssignment)}>
                              Remove Primary Assignment
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor} flexWrap="wrap" gap={4}>
          <Text fontSize="lg" fontWeight="medium">Manage Subjects</Text>
          <Button variant="outline" size="sm" leftIcon={<Icon as={MdAssignment} />} onClick={fetchSubjects}>
            Refresh
          </Button>
        </Flex>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Subject</Th>
                <Th>Code</Th>
                <Th>Department</Th>
                <Th isNumeric>Teachers Assigned</Th>
                <Th isNumeric>Primary Teachers</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subjectLoading && (
                <Tr>
                  <Td colSpan={6}>
                    <Flex align="center" justify="center" py={6}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading subjects...</Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!subjectLoading && !subjects.length && (
                <Tr>
                  <Td colSpan={6}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>No subjects found. Create one to get started.</Text>
                  </Td>
                </Tr>
              )}
              {!subjectLoading && subjects.map((subject) => (
                <Tr key={subject.id} _hover={{ bg: hoverBg }}>
                  <Td>
                    <Badge colorScheme={getSubjectColor(subject.name)} px={3} py={1} borderRadius="full">
                      {subject.name}
                    </Badge>
                  </Td>
                  <Td fontFamily="mono">{subject.code || '—'}</Td>
                  <Td>{subject.department || '—'}</Td>
                  <Td isNumeric>{subject.teacherCount ?? 0}</Td>
                  <Td isNumeric>{subject.primaryTeacherCount ?? 0}</Td>
                  <Td textAlign="right">
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={<Icon as={MdVisibility} />}
                      aria-label="View subject details"
                      onClick={() => handleViewSubject(subject)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={subjectDisclosure.isOpen} onClose={subjectDisclosure.onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Subject</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Subject Name</FormLabel>
                <Input value={subjectForm.name} onChange={(event) => setSubjectForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="e.g. Mathematics" />
              </FormControl>
              <FormControl>
                <FormLabel>Code</FormLabel>
                <Input value={subjectForm.code} onChange={(event) => setSubjectForm((prev) => ({ ...prev, code: event.target.value }))} placeholder="e.g. MATH" />
              </FormControl>
              <FormControl>
                <FormLabel>Department</FormLabel>
                <Input value={subjectForm.department} onChange={(event) => setSubjectForm((prev) => ({ ...prev, department: event.target.value }))} placeholder="e.g. Science & Mathematics" />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea value={subjectForm.description} onChange={(event) => setSubjectForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Optional details" rows={3} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={subjectDisclosure.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateSubject} isLoading={savingSubject} loadingText="Saving">
              Save Subject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={assignDisclosure.isOpen} onClose={closeAssignModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {assignmentType === 'add' && 'Assign New Subject'}
            {assignmentType === 'primary' && 'Set Primary Subject'}
            {assignmentType === 'edit' && 'Edit Subject Assignment'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {(assignmentRequiresTeacherPick || !selectedTeacher) && (
                <FormControl isRequired>
                  <FormLabel>Select Teacher</FormLabel>
                  <Select
                    placeholder={teacherLoading ? 'Loading teachers…' : 'Select teacher'}
                    value={selectedTeacher?.id || ''}
                    onChange={handleManualTeacherSelect}
                    isDisabled={teacherLoading}
                  >
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
              {selectedTeacher ? (
                <>
                  <Flex align="center">
                    <Avatar src={selectedTeacher.avatar || selectedTeacher.photo} name={selectedTeacher.name} size="md" mr={3} />
                    <Box>
                      <Text fontWeight="bold">{selectedTeacher.name}</Text>
                      <Text fontSize="sm" color={textColorSecondary}>{selectedTeacher.qualification || selectedTeacher.designation || '—'}</Text>
                    </Box>
                  </Flex>
                  <Divider />
                  {assignmentType !== 'primary' && (
                    <FormControl isRequired>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        placeholder="Select subject"
                        value={assignmentForm.subjectId}
                        onChange={(event) => setAssignmentForm((prev) => ({ ...prev, subjectId: event.target.value }))}
                      >
                        {subjectOptionsForTeacher.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} {subject.code ? `(${subject.code})` : ''}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {assignmentType === 'primary' && (
                    <FormControl isRequired>
                      <FormLabel>Choose Primary Subject</FormLabel>
                      <Select
                        placeholder="Select assigned subject"
                        value={assignmentForm.subjectId}
                        onChange={(event) => setAssignmentForm((prev) => ({ ...prev, subjectId: event.target.value }))}
                      >
                        {teacherAssignmentsForSelected.map((row) => (
                          <option key={row.id} value={row.subjectId}>
                            {row.subjectName}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {assignmentType !== 'primary' && (
                    <FormControl>
                      <FormLabel>Academic Year</FormLabel>
                      <Input
                        placeholder="e.g. 2024-2025"
                        value={assignmentForm.academicYear}
                        onChange={(event) => setAssignmentForm((prev) => ({ ...prev, academicYear: event.target.value }))}
                      />
                    </FormControl>
                  )}
                  {assignmentType !== 'primary' && (
                    <FormControl>
                      <Checkbox
                        isChecked={assignmentForm.isPrimary}
                        onChange={(event) => setAssignmentForm((prev) => ({ ...prev, isPrimary: event.target.checked }))}
                      >
                        Make this the primary subject
                      </Checkbox>
                    </FormControl>
                  )}
                  {assignmentType !== 'primary' && (
                    <FormControl>
                      <FormLabel>Assign Classes</FormLabel>
                      <CheckboxGroup
                        value={assignmentForm.classes}
                        onChange={(values) => setAssignmentForm((prev) => ({ ...prev, classes: values }))}
                      >
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                          {classOptions.map((cls) => (
                            <Checkbox key={cls.id} value={cls.id}>
                              {cls.id} ({cls.name})
                            </Checkbox>
                          ))}
                        </SimpleGrid>
                      </CheckboxGroup>
                    </FormControl>
                  )}
                </>
              ) : (
                <Text color={textColorSecondary}>Select a teacher to continue.</Text>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={closeAssignModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveAssignment} isLoading={savingAssignment} loadingText="Saving">
              {assignmentType === 'primary' ? 'Update Primary' : assignmentType === 'edit' ? 'Save Changes' : 'Assign Subject'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={subjectDetailsDisclosure.isOpen} onClose={subjectDetailsDisclosure.onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Subject Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeSubject ? (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="sm" color={textColorSecondary}>Subject</Text>
                  <Heading size="sm">{activeSubject.name}</Heading>
                  <HStack spacing={3} mt={2} flexWrap="wrap">
                    <Badge>Code: {activeSubject.code || '—'}</Badge>
                    <Badge colorScheme="purple">Department: {activeSubject.department || '—'}</Badge>
                    <Badge colorScheme="blue">Teachers: {activeSubject.teacherCount ?? 0}</Badge>
                  </HStack>
                </Box>
                {activeSubject.description && (
                  <Box>
                    <Text fontSize="sm" color={textColorSecondary}>Description</Text>
                    <Text>{activeSubject.description}</Text>
                  </Box>
                )}
                <Divider />
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="medium">Assigned Teachers</Text>
                    <Badge colorScheme="green">Primary: {activeSubject.primaryTeacherCount ?? 0}</Badge>
                  </Flex>
                  {activeSubjectAssignments.length ? (
                    <VStack spacing={3} align="stretch">
                      {activeSubjectAssignments.map((assignment) => {
                        const teacher = teacherMap.get(assignment.teacherId);
                        return (
                          <Flex
                            key={assignment.id}
                            p={3}
                            borderWidth={1}
                            borderColor={borderColor}
                            borderRadius="md"
                            align="center"
                            justify="space-between"
                            gap={3}
                            flexWrap="wrap"
                          >
                            <Flex align="center" minW="200px">
                              <Avatar size="sm" src={teacher?.avatar || teacher?.photo} name={assignment.teacherName} mr={3} />
                              <Box>
                                <Text fontWeight="medium">{assignment.teacherName}</Text>
                                <Text fontSize="xs" color={textColorSecondary}>{teacher?.department || assignment.department || '—'}</Text>
                              </Box>
                            </Flex>
                            <HStack spacing={2} flexWrap="wrap">
                              <Badge colorScheme={assignment.isPrimary ? 'green' : 'gray'}>
                                {assignment.isPrimary ? 'Primary' : 'Secondary'}
                              </Badge>
                              <Text fontSize="xs" color={textColorSecondary}>{assignment.academicYear || '—'}</Text>
                              <HStack spacing={1}>
                                {assignment.classes?.map((cls, idx) => (
                                  <Tag key={`${toClassId(cls) || formatClassLabel(cls)}-${idx}`} size="sm" borderRadius="full" colorScheme="cyan">
                                    <TagLabel>{formatClassLabel(cls)}</TagLabel>
                                  </Tag>
                                ))}
                                {!assignment.classes?.length && <Text color={textColorSecondary} fontSize="xs">No classes</Text>}
                              </HStack>
                            </HStack>
                            <HStack spacing={2}>
                              <IconButton
                                size="sm"
                                variant="ghost"
                                icon={<Icon as={MdEdit} />}
                                aria-label="Edit assignment"
                                onClick={() => {
                                  subjectDetailsDisclosure.onClose();
                                  openEditAssignment(assignment);
                                }}
                              />
                              <IconButton
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                icon={<Icon as={MdDelete} />}
                                aria-label="Delete assignment"
                                onClick={() => {
                                  subjectDetailsDisclosure.onClose();
                                  confirmDeleteAssignment(assignment);
                                }}
                              />
                            </HStack>
                          </Flex>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Text color={textColorSecondary}>No teachers assigned yet.</Text>
                  )}
                </Box>
              </VStack>
            ) : (
              <Text color={textColorSecondary}>No subject selected.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={subjectDetailsDisclosure.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={deleteDisclosure.isOpen} leastDestructiveRef={deleteCancelRef} onClose={deleteDisclosure.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Subject Assignment
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to remove this subject from {deleteTarget?.teacherName}? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={deleteDisclosure.onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAssignment} ml={3} isLoading={deletingAssignment} loadingText="Deleting">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TeacherSubjects;
