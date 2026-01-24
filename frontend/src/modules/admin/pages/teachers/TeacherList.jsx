import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Select,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { SearchIcon, AddIcon, DownloadIcon, ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { 
  MdMoreVert,
  MdPeople,
  MdSchool,
  MdPersonAdd,
} from 'react-icons/md';
import useApi from '../../../../hooks/useApi';
import { teachersApi } from '../../../../services/api';
import TeacherDetailsModal from './TeacherDetailsModal';
import TeacherEditModal from './TeacherEditModal';

function TeacherList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [editTeacher, setEditTeacher] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState('');
  const [editAvatarData, setEditAvatarData] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const detailsDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const editDisclosure = useDisclosure();
  const cancelDeleteRef = useRef();
  const toast = useToast();
  
  // Color mode values
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const {
    execute: fetchTeachers,
    data: teachersResponse,
    loading: loadingTeachers,
    error: teachersError,
  } = useApi(teachersApi.list);

  const {
    execute: removeTeacher,
    loading: removingTeacher,
  } = useApi((id) => teachersApi.remove(id));

  const {
    execute: updateTeacher,
    loading: updatingTeacher,
  } = useApi((id, payload) => teachersApi.update(id, payload));

  const refreshTeachers = useCallback(() => {
    fetchTeachers({ page: 1, pageSize: 200 });
  }, [fetchTeachers]);

  useEffect(() => {
    refreshTeachers();
  }, [refreshTeachers]);

  const teachers = useMemo(() => teachersResponse?.rows || [], [teachersResponse]);
  const totalTeachers = teachersResponse?.total ?? teachers.length;

  const departments = useMemo(() => {
    const set = new Set();
    teachers.forEach((t) => {
      if (t?.department) set.add(t.department);
    });
    return Array.from(set);
  }, [teachers]);

  const subjects = useMemo(() => {
    const set = new Set();
    teachers.forEach((t) => {
      if (t?.subject) set.add(t.subject);
      if (Array.isArray(t?.subjects)) {
        t.subjects.filter(Boolean).forEach((subj) => set.add(subj));
      }
    });
    return Array.from(set);
  }, [teachers]);

  const statuses = useMemo(() => {
    const set = new Set();
    teachers.forEach((t) => {
      const status = (t?.employmentStatus || t?.status || '').trim();
      if (status) set.add(status);
    });
    return Array.from(set);
  }, [teachers]);

  const statusOptions = useMemo(() => {
    const base = ['active', 'on leave', 'on_leave', 'resigned'];
    const set = new Set(base);
    statuses.forEach((s) => set.add(s));
    return Array.from(set);
  }, [statuses]);

  const currencyOptions = useMemo(() => ['PKR', 'USD', 'EUR'], []);

  const formatLabel = (value) => {
    if (!value) return '';
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const name = (teacher.name || '').toLowerCase();
      const email = (teacher.email || '').toLowerCase();
      const subject = (teacher.subject || '').toLowerCase();
      const employeeId = (teacher.employeeId || '').toLowerCase();
      const dept = (teacher.department || '').toLowerCase();
      const statusValues = [teacher.employmentStatus, teacher.status]
        .map((s) => (s || '').toLowerCase())
        .filter(Boolean);
      const subjectValues = Array.isArray(teacher.subjects)
        ? teacher.subjects.map((s) => (s || '').toLowerCase())
        : [];

      const matchesSearch = !term ||
        name.includes(term) ||
        email.includes(term) ||
        subject.includes(term) ||
        employeeId.includes(term);
      const matchesDepartment = !departmentFilter || dept === departmentFilter.toLowerCase();
      const matchesStatus = !statusFilter || statusValues.includes(statusFilter.toLowerCase());
      const matchesSubject = !subjectFilter ||
        subjectFilter.toLowerCase() === subject ||
        subjectValues.includes(subjectFilter.toLowerCase());

      return matchesSearch && matchesDepartment && matchesStatus && matchesSubject;
    });
  }, [teachers, searchTerm, departmentFilter, statusFilter, subjectFilter]);

  const stats = useMemo(() => {
    const activeCount = teachers.filter((t) => (t.employmentStatus || t.status || '').toLowerCase() === 'active').length;
    const leaveCount = teachers.filter((t) => (t.employmentStatus || t.status || '').toLowerCase().includes('leave')).length;
    const departmentCount = new Set(teachers.map((t) => t.department).filter(Boolean)).size;
    return {
      total: totalTeachers,
      active: activeCount,
      onLeave: leaveCount,
      departments: departmentCount,
    };
  }, [teachers, totalTeachers]);

  const statusColor = (status) => {
    const value = (status || '').toLowerCase();
    if (value === 'active') return 'green';
    if (value.includes('leave')) return 'orange';
    if (value.includes('resign')) return 'red';
    return 'gray';
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    if (amount === null || amount === undefined || amount === '') return '-';
    const numeric = Number(amount);
    if (Number.isNaN(numeric)) return amount;
    return `${currency} ${numeric.toLocaleString()}`;
  };

  const buildEditForm = useCallback((teacher) => ({
    name: teacher?.name || '',
    email: teacher?.email || '',
    phone: teacher?.phone || '',
    employeeId: teacher?.employeeId || '',
    department: teacher?.department || '',
    designation: teacher?.designation || '',
    qualification: teacher?.qualification || '',
    specialization: teacher?.specialization || '',
    subject: teacher?.subject || '',
    subjects: Array.isArray(teacher?.subjects) ? teacher.subjects.join(', ') : '',
    classes: Array.isArray(teacher?.classes) ? teacher.classes.join(', ') : '',
    employmentStatus: teacher?.employmentStatus || teacher?.status || 'active',
    employmentType: teacher?.employmentType || '',
    joiningDate: teacher?.joiningDate ? teacher.joiningDate.slice(0, 10) : '',
    experienceYears: teacher?.experienceYears ?? '',
    workHoursPerWeek: teacher?.workHoursPerWeek ?? '',
    baseSalary: teacher?.baseSalary ?? '',
    allowances: teacher?.allowances ?? '',
    deductions: teacher?.deductions ?? '',
    salary: teacher?.salary ?? '',
    currency: teacher?.currency || 'PKR',
    paymentMethod: teacher?.paymentMethod || '',
    bankName: teacher?.bankName || '',
    accountNumber: teacher?.accountNumber || '',
    iban: teacher?.iban || '',
    emergencyName: teacher?.emergencyName || '',
    emergencyRelation: teacher?.emergencyRelation || '',
    emergencyPhone: teacher?.emergencyPhone || '',
    address1: teacher?.address1 || '',
    address2: teacher?.address2 || '',
    city: teacher?.city || '',
    state: teacher?.state || '',
    postalCode: teacher?.postalCode || '',
  }), []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: null }));
  };

  const parseListField = (value) => {
    if (value === null || value === undefined) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed.split(',').map((entry) => entry.trim()).filter(Boolean);
  };

  const parseNumberField = (value) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const fileToBase64 = useCallback((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() || '');
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  }), []);

  const validateEditForm = () => {
    if (!editForm) return false;
    const errors = {};
    if (!editForm.name.trim()) errors.name = 'Name is required';
    if (!editForm.email.trim()) errors.email = 'Email is required';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openDetails = (teacher) => {
    setSelectedTeacher(teacher);
    detailsDisclosure.onOpen();
  };

  const openEdit = (teacher) => {
    setEditTeacher(teacher);
    setEditForm(buildEditForm(teacher));
    setEditAvatarPreview(teacher?.avatar || teacher?.photo || '');
    setEditAvatarData(null);
    setEditErrors({});
    editDisclosure.onOpen();
  };

  const closeEdit = () => {
    editDisclosure.onClose();
    setEditTeacher(null);
    setEditForm(null);
    setEditErrors({});
    setEditAvatarPreview('');
    setEditAvatarData(null);
  };

  const handleEditAvatarChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      setEditAvatarPreview(base64);
      setEditAvatarData(base64);
    } catch (error) {
      toast({
        title: 'Image upload failed',
        description: error?.message || 'Could not process the selected image.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      event.target.value = '';
    }
  }, [fileToBase64, toast]);

  const handleEditSubmit = async (e) => {
    e?.preventDefault();
    if (!editTeacher || !editForm) return;
    if (!validateEditForm()) return;

    const payload = {
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
    };

    const assign = (field, value) => {
      if (value === undefined) return;
      payload[field] = value;
    };

    assign('phone', editForm.phone.trim() || undefined);
    assign('employeeId', editForm.employeeId?.trim() || undefined);
    assign('department', editForm.department.trim() || undefined);
    assign('designation', editForm.designation.trim() || undefined);
    assign('qualification', editForm.qualification.trim() || undefined);
    assign('subject', editForm.subject.trim() || undefined);
    assign('employmentStatus', editForm.employmentStatus || undefined);
    assign('employmentType', editForm.employmentType.trim() || undefined);
    assign('joiningDate', editForm.joiningDate || undefined);
    assign('specialization', editForm.specialization.trim() || undefined);
    assign('currency', editForm.currency || undefined);
    assign('paymentMethod', editForm.paymentMethod.trim() || undefined);
    assign('bankName', editForm.bankName.trim() || undefined);
    assign('accountNumber', editForm.accountNumber.trim() || undefined);
    assign('iban', editForm.iban.trim() || undefined);
    assign('emergencyName', editForm.emergencyName.trim() || undefined);
    assign('emergencyRelation', editForm.emergencyRelation.trim() || undefined);
    assign('emergencyPhone', editForm.emergencyPhone.trim() || undefined);
    assign('address1', editForm.address1.trim() || undefined);
    assign('address2', editForm.address2.trim() || undefined);
    assign('city', editForm.city.trim() || undefined);
    assign('state', editForm.state.trim() || undefined);
    assign('postalCode', editForm.postalCode.trim() || undefined);

    assign('subjects', parseListField(editForm.subjects));
    assign('classes', parseListField(editForm.classes));
    assign('baseSalary', parseNumberField(editForm.baseSalary));
    assign('allowances', parseNumberField(editForm.allowances));
    assign('deductions', parseNumberField(editForm.deductions));
    assign('salary', parseNumberField(editForm.salary));
    assign('experienceYears', parseNumberField(editForm.experienceYears));
    assign('workHoursPerWeek', parseNumberField(editForm.workHoursPerWeek));
    assign('avatar', editAvatarData || undefined);

    const { error } = await updateTeacher(editTeacher.id, payload);
    if (error) {
      toast({
        title: 'Update failed',
        description: error?.message || 'Could not update teacher.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: 'Teacher updated',
      description: `${payload.name} has been updated.`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
    closeEdit();
    refreshTeachers();
  };

  const confirmDelete = (teacher) => {
    setTeacherToDelete(teacher);
    deleteDisclosure.onOpen();
  };

  const closeDeleteDialog = () => {
    deleteDisclosure.onClose();
    setTeacherToDelete(null);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    const { error } = await removeTeacher(teacherToDelete.id);
    if (error) {
      toast({
        title: 'Failed to delete teacher',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    toast({
      title: 'Teacher deleted',
      description: `${teacherToDelete.name || 'Teacher'} has been removed.`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
    closeDeleteDialog();
    refreshTeachers();
  };

  return (
    <Box 
      pt={{ base: '130px', md: '80px', xl: '80px' }} 
      px={4}
      bg="gray.50"
      minH="100vh"
    >
      {/* Page Header */}
      <Flex 
        mb={6} 
        justify="space-between" 
        align="center" 
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Box>
          <Heading 
            size="lg" 
            color="gray.800" 
            mb={2}
          >
            Teachers Management
          </Heading>
          <Text color="gray.600" fontSize="md">
            Manage teaching staff and their information ({filteredTeachers.length} shown of {totalTeachers})
          </Text>
        </Box>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          size="md"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
        >
          Add New Teacher
        </Button>
      </Flex>

      {/* Statistics Cards - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' icon={<Icon as={MdPeople} w='24px' h='24px' color='white' />} />}
          name='Total Teachers'
          value={String(stats.total || 0)}
          growth='+2%'
          trendData={[stats.total || 0, Math.max((stats.total || 0) - 1, 0), stats.total || 0]}
          trendColor='#4facfe'
          compact
        />
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' icon={<Icon as={MdSchool} w='24px' h='24px' color='white' />} />}
          name='Active Teachers'
          value={String(stats.active || 0)}
          growth='+1%'
          trendData={[stats.active || 0, stats.active || 0]}
          trendColor='#43e97b'
          compact
        />
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#f7971e 0%,#ffd200 100%)' icon={<Icon as={MdPersonAdd} w='24px' h='24px' color='white' />} />}
          name='On Leave'
          value={String(stats.onLeave || 0)}
          growth='+0%'
          trendData={[stats.onLeave || 0, stats.onLeave || 0]}
          trendColor='#f7971e'
          compact
        />
        <MiniStatistics
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' icon={<Icon as={MdSchool} w='24px' h='24px' color='white' />} />}
          name='Departments'
          value={String(stats.departments || 0)}
          growth='+0%'
          trendData={[stats.departments || 0, stats.departments || 0]}
          trendColor='#a18cd1'
          compact
        />
      </SimpleGrid>

      {/* Search and Filters */}
      <Card mb={6}>
        <Box p={4}>
          <Flex gap={4} direction={{ base: 'column', md: 'row' }} flexWrap='wrap'>
            <InputGroup flex={2}>
              <InputLeftElement>
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search teachers by name, email, or subject..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
              />
            </InputGroup>
            <Select 
              placeholder="All Subjects" 
              maxW="200px"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              {subjects.map((subj) => (
                <option key={subj} value={subj.toLowerCase()}>{subj}</option>
              ))}
            </Select>
            <Select 
              placeholder="All Departments" 
              maxW="200px"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept.toLowerCase()}>{dept}</option>
              ))}
            </Select>
            <Select 
              placeholder="All Status" 
              maxW="200px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status.toLowerCase()}>{status}</option>
              ))}
            </Select>
          </Flex>
          {teachersError && (
            <Alert status='error' mt={4} borderRadius='md'>
              <AlertIcon />
              {teachersError.message || 'Failed to load teachers'}
            </Alert>
          )}
        </Box>
      </Card>

      {/* Teachers Table */}
      <Card>
        <Box p={4}>
          <Flex justify="space-between" align="center">
            <Heading size="md" color="gray.800">
              Teachers List ({filteredTeachers.length})
            </Heading>
            <HStack>
              <Button size="sm" variant="outline" leftIcon={<DownloadIcon />}>
                Export
              </Button>
            </HStack>
          </Flex>
        </Box>
        
        <Box pt={0} px={4} pb={4}>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Teacher</Th>
                  <Th>Contact</Th>
                  <Th>Subject</Th>
                  <Th>Department</Th>
                  <Th>Experience</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loadingTeachers && (
                  <Tr>
                    <Td colSpan={7}>
                      <Center py={10}>
                        <Spinner />
                      </Center>
                    </Td>
                  </Tr>
                )}
                {!loadingTeachers && filteredTeachers.map((teacher) => {
                  const primarySubject = teacher.subject || (Array.isArray(teacher.subjects) ? teacher.subjects[0] : '');
                  const experienceLabel = teacher.experienceYears ? `${teacher.experienceYears} yrs` : teacher.experience || '—';
                  const teacherStatus = teacher.employmentStatus || teacher.status;
                  return (
                    <Tr key={teacher.id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <Flex align="center">
                          <Avatar 
                            size="sm" 
                            name={teacher.name} 
                            src={teacher.avatar || teacher.photo || undefined}
                            mr={3}
                          />
                          <Box>
                            <Text fontWeight="bold" color="gray.800">
                              {teacher.name || '—'}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {teacher.qualification || '—'}
                            </Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <Box>
                          <Text fontSize="sm" color="gray.800">
                            {teacher.email || '—'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {teacher.phone || '—'}
                          </Text>
                        </Box>
                      </Td>
                      <Td>
                        {primarySubject ? (
                          <Badge colorScheme="blue" variant="subtle">
                            {primarySubject}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color="gray.500">—</Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.800">
                          {teacher.department || '—'}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.800">
                          {experienceLabel}
                        </Text>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={statusColor(teacherStatus)}
                          variant="subtle"
                        >
                          {teacherStatus || '—'}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<MdMoreVert />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<ViewIcon />} onClick={() => openDetails(teacher)}>View Details</MenuItem>
                            <MenuItem icon={<EditIcon />} onClick={() => openEdit(teacher)}>Edit Teacher</MenuItem>
                            <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => confirmDelete(teacher)}>
                              Delete Teacher
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
          
          {/* Pagination */}
          {!loadingTeachers && filteredTeachers.length > 0 && (
            <Flex justify="space-between" align="center" pt={4} borderTop="1px" borderColor="gray.200" mt={4}>
              <Text fontSize="sm" color="gray.600">
                Showing 1 to {filteredTeachers.length} of {filteredTeachers.length} teachers
              </Text>
              <HStack>
                <Button size="sm" variant="outline" isDisabled>
                  Previous
                </Button>
                <Button size="sm" colorScheme="blue">
                  1
                </Button>
                <Button size="sm" variant="outline" isDisabled>
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
          
          {/* No Results */}
          {!loadingTeachers && filteredTeachers.length === 0 && (
            <Box textAlign="center" py={10}>
              <Icon as={MdPeople} boxSize={12} color="gray.400" mb={4} />
              <Text fontSize="lg" color="gray.600" mb={2}>
                No teachers found
              </Text>
              <Text fontSize="sm" color="gray.500">
                Try adjusting your search criteria or add a new teacher
              </Text>
            </Box>
          )}
        </Box>
      </Card>

      <TeacherDetailsModal
        isOpen={detailsDisclosure.isOpen}
        onClose={detailsDisclosure.onClose}
        teacher={selectedTeacher}
        statusColor={statusColor}
        formatCurrency={formatCurrency}
      />

      <TeacherEditModal
        isOpen={editDisclosure.isOpen}
        onClose={closeEdit}
        form={editForm}
        errors={editErrors}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        statusOptions={statusOptions}
        currencyOptions={currencyOptions}
        formatLabel={formatLabel}
        isSubmitting={updatingTeacher}
        avatarPreview={editAvatarPreview}
        onAvatarChange={handleEditAvatarChange}
      />

      <AlertDialog
        isOpen={deleteDisclosure.isOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Teacher
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {teacherToDelete?.name || 'this teacher'}? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={closeDeleteDialog} mr={3}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleDelete} isLoading={removingTeacher}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TeacherList;
