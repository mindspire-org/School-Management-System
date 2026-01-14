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
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdPerson,
  MdRefresh,
  MdSchedule,
  MdSearch,
  MdSort,
  MdSupervisorAccount,
  MdToday,
} from 'react-icons/md';

import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import * as teacherApi from '../../../../services/api/teachers';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayNameToNumber = weekDays.reduce((acc, day, idx) => ({ ...acc, [day]: idx + 1 }), {});
const numberToDayName = Object.fromEntries(Object.entries(dayNameToNumber).map(([day, num]) => [num, day]));

const timeSlots = [
  { id: 1, start: '08:00', end: '08:45', label: '1st Period' },
  { id: 2, start: '08:50', end: '09:35', label: '2nd Period' },
  { id: 3, start: '09:40', end: '10:25', label: '3rd Period' },
  { id: 4, start: '10:30', end: '11:15', label: '4th Period' },
  { id: 5, start: '11:20', end: '12:05', label: '5th Period' },
  { id: 6, start: '12:05', end: '12:45', label: 'Lunch Break' },
  { id: 7, start: '12:50', end: '13:35', label: '6th Period' },
  { id: 8, start: '13:40', end: '14:25', label: '7th Period' },
  { id: 9, start: '14:30', end: '15:15', label: '8th Period' },
];

const sortMenuOptions = [
  { value: 'day-asc', label: 'Day (Mon → Sat)' },
  { value: 'day-desc', label: 'Day (Sat → Mon)' },
  { value: 'teacher-asc', label: 'Teacher A → Z' },
  { value: 'subject-asc', label: 'Subject A → Z' },
  { value: 'time-asc', label: 'Start Time (Earliest)' },
];

const initialFormState = {
  day: '',
  timeSlotId: '',
  startTime: '',
  endTime: '',
  teacherId: '',
  subject: '',
  className: '',
  section: '',
  room: '',
  timeSlotLabel: '',
};

const normalizeTime = (value) => {
  if (!value) return '';
  const str = String(value).trim();
  return str.length > 5 ? str.slice(0, 5) : str;
};

const normalizeScheduleRow = (row = {}) => ({
  id: row.id,
  teacherId: row.teacherId,
  teacherName:
    row.teacherName ||
    row.teacher?.name ||
    row.teacher?.fullName ||
    row.name ||
    [row.teacher?.firstName, row.teacher?.lastName].filter(Boolean).join(' ') ||
    'Unknown Teacher',
  employeeId: row.employeeId,
  dayOfWeek: row.dayOfWeek || dayNameToNumber[row.day] || null,
  dayName: row.dayName || row.day || numberToDayName[row.dayOfWeek] || '—',
  startTime: normalizeTime(row.startTime),
  endTime: normalizeTime(row.endTime),
  subject: row.subject || '—',
  className: row.className || row.class || '—',
  section: row.section || '',
  room: row.room || '—',
  timeSlotIndex: row.timeSlotIndex,
  timeSlotLabel: row.timeSlotLabel,
});

const getSubjectColor = (subject) => {
  const normalized = (subject || '').toLowerCase();
  if (normalized.includes('math')) return 'blue';
  if (normalized.includes('bio')) return 'green';
  if (normalized.includes('english')) return 'purple';
  if (normalized.includes('computer')) return 'orange';
  if (normalized.includes('chem')) return 'pink';
  return 'gray';
};

const resolveTeacherName = (teacher) => {
  if (!teacher) return 'Unknown Teacher';
  return (
    teacher.name ||
    teacher.fullName ||
    [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') ||
    teacher.displayName ||
    'Unnamed Teacher'
  );
};

const resolveTeacherId = (teacher) => {
  if (!teacher) return null;
  const id = teacher.id ?? teacher.teacherId;
  return id === undefined || id === null ? null : Number(id);
};

const TeacherSchedule = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortValue, setSortValue] = useState('day-asc');
  const [teachers, setTeachers] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formState, setFormState] = useState(initialFormState);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [roomTarget, setRoomTarget] = useState(null);
  const [roomValue, setRoomValue] = useState('');

  const modalDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const roomDisclosure = useDisclosure();
  const deleteCancelRef = useRef();
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

  const fetchSchedules = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const data = await teacherApi.listSchedules();
      const normalized = Array.isArray(data) ? data.map(normalizeScheduleRow) : [];
      setSchedules(normalized);
    } catch (error) {
      console.error(error);
      setSchedules([]);
      toast({
        title: 'Failed to load schedules',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setScheduleLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const teacherMap = useMemo(() => {
    const map = new Map();
    teachers.forEach((teacher) => {
      const id = resolveTeacherId(teacher);
      if (id !== null) {
        map.set(id, teacher);
      }
    });
    return map;
  }, [teachers]);

  const roomOptions = useMemo(() => {
    const set = new Set();
    schedules.forEach((s) => {
      const r = (s.room || '').trim();
      if (r && r !== '—') set.add(r);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (selectedTeacher !== 'all' && schedule.teacherId !== Number(selectedTeacher)) return false;
      if (selectedDay !== 'all' && schedule.dayName !== selectedDay) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const haystack = [
          schedule.subject,
          schedule.className,
          schedule.section,
          schedule.room,
          schedule.teacherName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [schedules, selectedTeacher, selectedDay, searchQuery]);

  const sortedSchedules = useMemo(() => {
    const sorted = [...filteredSchedules];
    sorted.sort((a, b) => {
      switch (sortValue) {
        case 'day-desc': {
          const dayCompare = (b.dayOfWeek || 0) - (a.dayOfWeek || 0);
          if (dayCompare !== 0) return dayCompare;
          return (b.startTime || '').localeCompare(a.startTime || '');
        }
        case 'teacher-asc':
          return (a.teacherName || '').localeCompare(b.teacherName || '');
        case 'subject-asc':
          return (a.subject || '').localeCompare(b.subject || '');
        case 'time-asc':
          return (a.startTime || '').localeCompare(b.startTime || '');
        case 'day-asc':
        default: {
          const dayCompare = (a.dayOfWeek || 0) - (b.dayOfWeek || 0);
          if (dayCompare !== 0) return dayCompare;
          return (a.startTime || '').localeCompare(b.startTime || '');
        }
      }
    });
    return sorted;
  }, [filteredSchedules, sortValue]);

  const scheduleStats = useMemo(() => {
    const totalClasses = schedules.length;
    const dayCounts = weekDays.map((day) => ({
      day,
      count: schedules.filter((schedule) => schedule.dayName === day).length,
    }));
    const busiestDay = dayCounts.reduce((max, current) => (current.count > max.count ? current : max), {
      day: 'N/A',
      count: 0,
    });
    const teacherLoads = teachers.map((teacher) => {
      const id = resolveTeacherId(teacher);
      const classes = id === null ? 0 : schedules.filter((schedule) => schedule.teacherId === id).length;
      return { teacher, classes };
    });
    const busiestTeacher = teacherLoads.reduce(
      (max, current) => (current.classes > max.classes ? current : max),
      { teacher: null, classes: 0 }
    );
    return {
      totalClasses,
      busiestDay,
      busiestTeacher,
    };
  }, [schedules, teachers]);

  const handleSaveRoom = async () => {
    if (!roomTarget) return;
    try {
      const updated = await teacherApi.updateScheduleSlot(roomTarget.id, { room: roomValue || null });
      const normalized = normalizeScheduleRow(updated);
      setSchedules((prev) => prev.map((it) => (it.id === normalized.id ? normalized : it)));
      toast({ title: 'Room updated', status: 'success', duration: 2500, isClosable: true });
      roomDisclosure.onClose();
      setRoomTarget(null);
      setRoomValue('');
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to update room', description: error?.message || 'Please try again.', status: 'error', duration: 4000, isClosable: true });
    }
  };

  const handleResetFilters = () => {
    setSelectedTeacher('all');
    setSelectedDay('all');
    setSearchQuery('');
  };

  const handleTimeSlotChange = (value) => {
    const slot = timeSlots.find((item) => String(item.id) === value);
    setFormState((prev) => ({
      ...prev,
      timeSlotId: value,
      startTime: slot ? slot.start : prev.startTime,
      endTime: slot ? slot.end : prev.endTime,
      timeSlotLabel: slot ? slot.label : prev.timeSlotLabel,
    }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentSchedule(null);
    setFormState(initialFormState);
    modalDisclosure.onOpen();
  };

  const openRoomModal = (schedule) => {
    setRoomTarget(schedule);
    setRoomValue(schedule?.room && schedule.room !== '—' ? schedule.room : '');
    roomDisclosure.onOpen();
  };

  const openEditModal = (schedule) => {
    setModalMode('edit');
    setCurrentSchedule(schedule);
    setFormState({
      day: schedule.dayName,
      timeSlotId: schedule.timeSlotIndex ? String(schedule.timeSlotIndex) : '',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      teacherId: String(schedule.teacherId),
      subject: schedule.subject,
      className: schedule.className,
      section: schedule.section || '',
      room: schedule.room,
      timeSlotLabel: schedule.timeSlotLabel || '',
    });
    modalDisclosure.onOpen();
  };

  const validateForm = () => {
    if (
      !formState.day ||
      !formState.startTime ||
      !formState.endTime ||
      !formState.teacherId ||
      !formState.subject ||
      !formState.className ||
      !formState.room
    ) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        status: 'warning',
        duration: 3000,
      });
      return false;
    }
    return true;
  };

  const handleSaveSchedule = async () => {
    if (!validateForm()) return;
    setSaving(true);
    const dayOfWeekValue = dayNameToNumber[formState.day];
    const payload = {
      teacherId: Number(formState.teacherId),
      dayOfWeek: dayOfWeekValue ? String(dayOfWeekValue) : undefined,
      day: formState.day,
      startTime: formState.startTime,
      endTime: formState.endTime,
      class: formState.className,
      section: formState.section || null,
      subject: formState.subject,
      room: formState.room,
      timeSlotIndex: formState.timeSlotId ? Number(formState.timeSlotId) : null,
      timeSlotLabel: formState.timeSlotLabel || undefined,
    };

    try {
      const result =
        modalMode === 'create'
          ? await teacherApi.createScheduleSlot(payload)
          : await teacherApi.updateScheduleSlot(currentSchedule.id, payload);
      const normalized = normalizeScheduleRow(result);
      setSchedules((prev) => {
        if (modalMode === 'create') {
          return [...prev, normalized];
        }
        return prev.map((item) => (item.id === normalized.id ? normalized : item));
      });
      modalDisclosure.onClose();
      setFormState(initialFormState);
      toast({
        title: `Schedule ${modalMode === 'create' ? 'created' : 'updated'}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: `Failed to ${modalMode === 'create' ? 'create' : 'update'} schedule`,
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deleteTarget) return;
    try {
      await teacherApi.deleteScheduleSlot(deleteTarget.id);
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== deleteTarget.id));
      toast({ title: 'Schedule deleted', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to delete schedule',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setDeleteTarget(null);
      deleteDisclosure.onClose();
    }
  };

  const teacherDirectory = useMemo(() => {
    return [...teachers].sort((a, b) => resolveTeacherName(a).localeCompare(resolveTeacherName(b)));
  }, [teachers]);

  const getTeacherAvatar = (teacherId) => {
    const teacher = teacherMap.get(Number(teacherId));
    return teacher?.avatar || teacher?.photo || teacher?.profilePicture || '';
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={4}>
        <Box>
          <Heading as="h3" size="lg" mb={1}>
            Teacher Schedule
          </Heading>
          <Text color={textColorSecondary}>Manage class schedule for all teachers</Text>
        </Box>
        <HStack spacing={3}>
          <Tooltip label={editingMode ? 'Exit edit mode' : 'Enable edit mode'}>
            <Button
              leftIcon={<Icon as={MdEdit} />}
              variant={editingMode ? 'solid' : 'outline'}
              colorScheme="blue"
              onClick={() => setEditingMode((prev) => !prev)}
            >
              {editingMode ? 'Done' : 'Edit Mode'}
            </Button>
          </Tooltip>
          <Button leftIcon={<Icon as={MdAdd} />} colorScheme="blue" size="md" onClick={openCreateModal}>
            Create New Schedule
          </Button>
        </HStack>
      </Flex>

      <Modal isOpen={modalDisclosure.isOpen} onClose={modalDisclosure.onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalMode === 'create' ? 'Create New Schedule' : 'Edit Schedule'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Day</FormLabel>
                <Select
                  placeholder="Select day"
                  value={formState.day}
                  onChange={(e) => setFormState((prev) => ({ ...prev, day: e.target.value }))}
                >
                  {weekDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Time Slot</FormLabel>
                <Select
                  placeholder="Select time slot"
                  value={formState.timeSlotId}
                  onChange={(e) => handleTimeSlotChange(e.target.value)}
                >
                  {timeSlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {`${slot.label} (${slot.start} - ${slot.end})`}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="time"
                    value={formState.startTime}
                    onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="time"
                    value={formState.endTime}
                    onChange={(e) => setFormState((prev) => ({ ...prev, endTime: e.target.value }))}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Teacher</FormLabel>
                <Select
                  placeholder="Select teacher"
                  value={formState.teacherId}
                  onChange={(e) => setFormState((prev) => ({ ...prev, teacherId: e.target.value }))}
                >
                  {teacherDirectory.map((teacher) => {
                    const id = resolveTeacherId(teacher);
                    if (id === null) return null;
                    return (
                      <option key={id} value={id}>
                        {resolveTeacherName(teacher)}
                      </option>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Subject</FormLabel>
                <Input
                  placeholder="e.g. Mathematics"
                  value={formState.subject}
                  onChange={(e) => setFormState((prev) => ({ ...prev, subject: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Class</FormLabel>
                <Input
                  placeholder="e.g. 10A"
                  value={formState.className}
                  onChange={(e) => setFormState((prev) => ({ ...prev, className: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Section (optional)</FormLabel>
                <Input
                  placeholder="e.g. Blue"
                  value={formState.section}
                  onChange={(e) => setFormState((prev) => ({ ...prev, section: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Room</FormLabel>
                <Input
                  placeholder="e.g. R101"
                  value={formState.room}
                  onChange={(e) => setFormState((prev) => ({ ...prev, room: e.target.value }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={modalDisclosure.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveSchedule} isLoading={saving} loadingText="Saving">
              {modalMode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard title="Total Classes" value={String(scheduleStats.totalClasses)} icon={MdSchedule} colorScheme="blue" note="Across all teachers" />
        <StatCard title="Busiest Day" value={scheduleStats.busiestDay.day} icon={MdToday} colorScheme="green" note={`${scheduleStats.busiestDay.count} classes scheduled`} />
        <StatCard title="Most Classes" value={resolveTeacherName(scheduleStats.busiestTeacher.teacher)} icon={MdSupervisorAccount} colorScheme="purple" note={`${scheduleStats.busiestTeacher.classes} classes/week`} />
      </SimpleGrid>

      <Card mb={5}>
        <Flex
          p={4}
          direction={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ base: 'flex-start', md: 'center' }}
          gap={4}
          flexWrap="wrap"
        >
          <HStack spacing={4} flexWrap="wrap">
            <Select
              icon={<MdPerson />}
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              width="200px"
            >
              <option value="all">All Teachers</option>
              {teacherDirectory.map((teacher) => {
                const id = resolveTeacherId(teacher);
                if (id === null) return null;
                return (
                  <option key={id} value={id}>
                    {resolveTeacherName(teacher)}
                  </option>
                );
              })}
            </Select>

            <Select
              icon={<MdToday />}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              width="200px"
            >
              <option value="all">All Days</option>
              {weekDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </Select>
          </HStack>

          <InputGroup maxW="250px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search subject, class, room"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Button leftIcon={<Icon as={MdRefresh} />} variant="outline" colorScheme="blue" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </Flex>
      </Card>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">
            Teacher Directory
          </Text>
          {teacherLoading && (
            <HStack spacing={2}>
              <Spinner size="sm" />
              <Text fontSize="sm" color={textColorSecondary}>
                Loading...
              </Text>
            </HStack>
          )}
        </Flex>
        <Box p={4}>
          {teacherDirectory.length === 0 ? (
            <Text color={textColorSecondary}>No teachers found.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
              {teacherDirectory.map((teacher) => {
                const id = resolveTeacherId(teacher);
                if (id === null) return null;
                const teacherName = resolveTeacherName(teacher);
                return (
                  <Flex key={id} p={4} borderWidth={1} borderColor={borderColor} borderRadius="lg" align="center" gap={4}>
                    <Avatar name={teacherName} src={teacher.avatar || teacher.photo || teacher.profilePicture} size="md" />
                    <Box>
                      <Text fontWeight="medium">{teacherName}</Text>
                      <Text fontSize="sm" color={textColorSecondary}>
                        {teacher.designation || teacher.subject || '—'}
                      </Text>
                      <Text fontSize="sm" color={textColorSecondary}>
                        {teacher.department || teacher.employmentType || ''}
                      </Text>
                    </Box>
                  </Flex>
                );
              })}
            </SimpleGrid>
          )}
        </Box>
      </Card>

      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">
            Class Schedule
          </Text>
          <Menu>
            <MenuButton as={Button} leftIcon={<Icon as={MdSort} />} variant="ghost">
              Sort
            </MenuButton>
            <MenuList>
              {sortMenuOptions.map((option) => (
                <MenuItem key={option.value} onClick={() => setSortValue(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Day</Th>
                <Th>Time</Th>
                <Th>Teacher</Th>
                <Th>Subject</Th>
                <Th>Class</Th>
                <Th>Room</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {scheduleLoading ? (
                <Tr>
                  <Td colSpan={7}>
                    <Flex align="center" justify="center" py={8}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading schedules...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : sortedSchedules.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={6}>
                    <Text color={textColorSecondary}>No classes scheduled for the selected filters.</Text>
                  </Td>
                </Tr>
              ) : (
                sortedSchedules.map((schedule) => (
                  <Tr key={schedule.id} _hover={{ bg: hoverBg }}>
                    <Td>{schedule.dayName}</Td>
                    <Td>
                      <VStack align="flex-start" spacing={0}>
                        <Text fontWeight="medium">
                          {schedule.startTime} - {schedule.endTime}
                        </Text>
                        <Text fontSize="xs" color={textColorSecondary}>
                          {schedule.timeSlotLabel || 'Custom Slot'}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Flex align="center">
                        <Avatar size="sm" src={getTeacherAvatar(schedule.teacherId)} name={schedule.teacherName} mr={2} />
                        <Box>
                          <Text fontWeight="medium">{schedule.teacherName}</Text>
                          <Text fontSize="xs" color={textColorSecondary}>
                            {teacherMap.get(schedule.teacherId)?.department || teacherMap.get(schedule.teacherId)?.designation || ''}
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Badge colorScheme={getSubjectColor(schedule.subject)} px={2} py={1}>
                        {schedule.subject}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{schedule.className}</Text>
                      {schedule.section && (
                        <Text fontSize="xs" color={textColorSecondary}>Section {schedule.section}</Text>
                      )}
                    </Td>
                    <Td onClick={() => openRoomModal(schedule)} cursor="pointer" title="Click to edit room">{schedule.room}</Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <Tooltip label={'Edit schedule'}>
                          <IconButton
                            size="sm"
                            icon={<Icon as={MdEdit} />}
                            aria-label="Edit schedule"
                            variant="ghost"
                            onClick={() => openEditModal(schedule)}
                          />
                        </Tooltip>
                        <Tooltip label={'Delete schedule'}>
                          <IconButton
                            size="sm"
                            icon={<Icon as={MdDelete} />}
                            aria-label="Delete schedule"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              setDeleteTarget(schedule);
                              deleteDisclosure.onOpen();
                            }}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <AlertDialog isOpen={deleteDisclosure.isOpen} leastDestructiveRef={deleteCancelRef} onClose={deleteDisclosure.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Schedule
            </AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to delete this schedule entry? This action cannot be undone.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={deleteDisclosure.onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSchedule} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Quick Edit Room Modal */}
      <Modal isOpen={roomDisclosure.isOpen} onClose={roomDisclosure.onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Room</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Room</FormLabel>
              <Input
                placeholder="e.g. R101"
                value={roomValue}
                onChange={(e) => setRoomValue(e.target.value)}
                list="roomOptionsList"
              />
              <datalist id="roomOptionsList">
                {roomOptions.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={roomDisclosure.onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSaveRoom}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeacherSchedule;
