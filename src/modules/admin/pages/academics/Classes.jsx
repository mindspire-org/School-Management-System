import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  ButtonGroup,
  Badge,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useColorModeValue,
  IconButton,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Spinner,
  Textarea,
  Portal,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { MdClass, MdPeople, MdTrendingUp, MdSchool, MdSearch, MdAssignment, MdFileDownload, MdPictureAsPdf, MdRefresh, MdRemoveRedEye, MdEdit, MdMoreVert, MdDelete } from 'react-icons/md';
import jsPDF from 'jspdf';
import * as classesApi from '../../../../services/api/classes';
import * as teacherApi from '../../../../services/api/teachers';

const mockClasses = [
  { id: 1, name: 'Class 1', section: 'A', strength: 28, classTeacher: 'Ali Khan' },
  { id: 2, name: 'Class 1', section: 'B', strength: 26, classTeacher: 'Sara Ahmed' },
  { id: 3, name: 'Class 2', section: 'A', strength: 30, classTeacher: 'Hassan Raza' },
  { id: 4, name: 'Class 2', section: 'B', strength: 27, classTeacher: 'Amna Tariq' },
  { id: 5, name: 'Class 3', section: 'A', strength: 24, classTeacher: 'Nida Noor' },
  { id: 6, name: 'Class 3', section: 'B', strength: 25, classTeacher: 'Hamza Iqbal' },
  { id: 7, name: 'Class 4', section: 'A', strength: 29, classTeacher: 'Usman Ali' },
  { id: 8, name: 'Class 5', section: 'A', strength: 31, classTeacher: 'Shazia Parveen' },
];

const statusOptions = ['active', 'inactive', 'archived'];

const normalizeClassRow = (row = {}, fallbackId) => {
  const className = row.className || row.name || row.title || 'Class';
  const section = row.section || row.sectionName || '';
  const rawStrength = Number(row.strength ?? row.enrolledStudents ?? 0);
  const strength = Number.isFinite(rawStrength) && rawStrength >= 0 ? rawStrength : 0;
  const rawCapacity = Number(row.capacity ?? row.limit ?? 30);
  const capacity = Number.isFinite(rawCapacity) && rawCapacity > 0 ? rawCapacity : 30;
  const classTeacherId = row.classTeacherId ?? row.class_teacher_id ?? null;
  const classTeacherName = row.classTeacherName || row.classTeacher || row.teacherName || '—';

  return {
    id: row.id ?? fallbackId ?? `${className}-${section}`,
    className,
    section,
    classTeacherId: classTeacherId ? String(classTeacherId) : '',
    classTeacher: classTeacherName,
    strength,
    capacity,
    academicYear: row.academicYear || row.year || '',
    status: row.status || 'active',
    medium: row.medium || '',
    shift: row.shift || '',
    room: row.room || '',
    notes: row.notes || '',
  };
};

const buildInitialRows = () =>
  mockClasses.map((entry, idx) => normalizeClassRow({ ...entry, classTeacherName: entry.classTeacher }, `mock-${idx}`));

const initialCreateForm = {
  className: '',
  section: '',
  academicYear: '',
  classTeacherId: '',
  capacity: 30,
  strength: 0,
  room: '',
  medium: '',
  shift: '',
  status: 'active',
  notes: '',
  assignments: [],
};

const initialEditForm = {
  classTeacherId: '',
  strength: 0,
  capacity: 0,
  academicYear: '',
  room: '',
  medium: '',
  shift: '',
  status: 'active',
  notes: '',
};

export default function Classes() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(() => buildInitialRows());
  const [selected, setSelected] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [form, setForm] = useState(initialEditForm);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [createClassSubjects, setCreateClassSubjects] = useState([]);
  const [editClassSubjects, setEditClassSubjects] = useState([]);
  const [isSubjectsModalOpen, setSubjectsModalOpen] = useState(false);
  const [subjectsModalItems, setSubjectsModalItems] = useState([]);
  const [subjectsModalLoading, setSubjectsModalLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const deleteDisclosure = useDisclosure();
  const deleteCancelRef = useRef();
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await classesApi.list({ page: 1, pageSize: 200 });
      const dataset = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
      setRows(dataset.map((row, idx) => normalizeClassRow(row, `remote-${idx}`)));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to load classes',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchTeachers = useCallback(async () => {
    setTeacherLoading(true);
    try {
      const response = await teacherApi.list({ page: 1, pageSize: 200 });
      const dataset = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
      setTeachers(dataset);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to load teachers',
        description: error?.message || 'Unable to populate class teachers.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setTeacherLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    (async () => {
      setSubjectsLoading(true);
      try {
        const res = await teacherApi.listSubjects();
        setSubjects(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error(e);
        setSubjects([]);
      } finally {
        setSubjectsLoading(false);
      }
    })();
  }, [fetchClasses, fetchTeachers]);

  const teacherOptions = useMemo(() => {
    return teachers
      .map((teacher) => {
        const identifier = teacher.id ?? teacher.teacherId;
        if (!identifier) return null;
        return {
          id: String(identifier),
          name: teacher.name || teacher.fullName || teacher.displayName || 'Unnamed Teacher',
        };
      })
      .filter(Boolean);
  }, [teachers]);

  const getTeacherName = useCallback(
    (id) => {
      if (id === undefined || id === null || id === '') return undefined;
      return teacherOptions.find((option) => option.id === String(id))?.name;
    },
    [teacherOptions]
  );

  const resolveTeacherLabel = useCallback(
    (record) => {
      if (!record) return 'Unassigned';
      return record.classTeacher && record.classTeacher !== '—'
        ? record.classTeacher
        : getTeacherName(record.classTeacherId) || 'Unassigned';
    },
    [getTeacherName]
  );

  const handleRefresh = () => {
    fetchClasses();
  };

  const handleOpenView = (record) => {
    setSelected(record);
    onViewOpen();
  };

  const handleOpenEdit = (record) => {
    setSelected(record);
    setForm({
      classTeacherId: record.classTeacherId || '',
      strength: record.strength ?? 0,
      capacity: record.capacity ?? 0,
      academicYear: record.academicYear || '',
      room: record.room || '',
      medium: record.medium || '',
      shift: record.shift || '',
      status: record.status || 'active',
      notes: record.notes || '',
    });
    onEditOpen();
    (async () => {
      try {
        const resp = await classesApi.getSubjects(record.id);
        const items = Array.isArray(resp?.items) ? resp.items : Array.isArray(resp) ? resp : [];
        setEditClassSubjects(items.map(it => ({ subjectId: String(it.subjectId), fullMarks: it.fullMarks ?? '', gradeScheme: it.gradeScheme || '' })));
      } catch (e) { setEditClassSubjects([]); }
    })();
  };

  const handleOpenAdd = () => {
    setCreateForm(initialCreateForm);
    onAddOpen();
  };

  const closeAddModal = () => {
    onAddClose();
    setCreateForm(initialCreateForm);
  };

  const closeEditModal = () => {
    onEditClose();
    setForm(initialEditForm);
  };

  const confirmDeleteClass = (record) => {
    setDeleteTarget(record);
    deleteDisclosure.onOpen();
  };

  const closeDeleteDialog = () => {
    deleteDisclosure.onClose();
    setDeleteTarget(null);
  };

  const handleDeleteClass = async () => {
    if (!deleteTarget) return;
    try {
      await classesApi.remove(deleteTarget.id);
      toast({ title: 'Class deleted', status: 'success', duration: 3000 });
      closeDeleteDialog();
      fetchClasses();
    } catch (error) {
      console.error(error);
      toast({ title: 'Delete failed', description: error?.message || 'Unable to delete class.', status: 'error', duration: 4000 });
    }
  };

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAssignmentRow = () => {
    setCreateForm((prev) => ({
      ...prev,
      assignments: [...(prev.assignments || []), { subjectId: '', teacherId: '', isPrimary: false }],
    }));
  };

  const handleAssignmentChange = (index, field, value) => {
    setCreateForm((prev) => {
      const next = [...(prev.assignments || [])];
      next[index] = { ...(next[index] || {}), [field]: value };
      return { ...prev, assignments: next };
    });
  };

  // Class subjects (full marks) editor helpers
  const addCreateClassSubjectRow = () => setCreateClassSubjects(prev => [...prev, { subjectId: '', fullMarks: '', gradeScheme: '' }]);
  const updateCreateClassSubjectRow = (idx, field, value) => setCreateClassSubjects(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  const removeCreateClassSubjectRow = (idx) => setCreateClassSubjects(prev => prev.filter((_, i) => i !== idx));
  const addEditClassSubjectRow = () => setEditClassSubjects(prev => [...prev, { subjectId: '', fullMarks: '', gradeScheme: '' }]);
  const updateEditClassSubjectRow = (idx, field, value) => setEditClassSubjects(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  const removeEditClassSubjectRow = (idx) => setEditClassSubjects(prev => prev.filter((_, i) => i !== idx));

  const handleRemoveAssignmentRow = (index) => {
    setCreateForm((prev) => {
      const next = [...(prev.assignments || [])];
      next.splice(index, 1);
      return { ...prev, assignments: next };
    });
  };

  const handleEditChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateClass = async () => {
    if (!createForm.className.trim() || !createForm.section.trim()) {
      setIsDeleting(true);
      toast({
        title: 'Class name and section are required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    if (createForm.capacity <= 0) {
      toast({ title: 'Capacity must be greater than zero', status: 'warning', duration: 3000 });
      setIsDeleting(false);
      return;
    }
    if (createForm.strength < 0) {
      toast({ title: 'Strength cannot be negative', status: 'warning', duration: 3000 });
      return;
    }
    setIsCreating(true);
    try {
      const payload = {
        className: createForm.className.trim(),
        section: createForm.section.trim(),
        academicYear: createForm.academicYear.trim() || undefined,
        classTeacherId: createForm.classTeacherId ? Number(createForm.classTeacherId) : undefined,
        capacity: Number(createForm.capacity) || undefined,
        enrolledStudents: Number(createForm.strength) || 0,
        room: createForm.room.trim() || undefined,
        medium: createForm.medium.trim() || undefined,
        shift: createForm.shift.trim() || undefined,
        status: createForm.status,
        notes: createForm.notes.trim() || undefined,
      };
      const sanitized = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
      );
      const created = await classesApi.create(sanitized);
      toast({ title: 'Class created', status: 'success', duration: 2000 });

      // Save class subjects with full marks
      const classSubjectsPayload = (createClassSubjects || [])
        .filter(r => r && r.subjectId)
        .map(r => ({ subjectId: Number(r.subjectId), fullMarks: r.fullMarks === '' ? null : Number(r.fullMarks), gradeScheme: r.gradeScheme || null }));
      if (classSubjectsPayload.length) {
        try { await classesApi.upsertSubjects(created.id, classSubjectsPayload); } catch (_) { }
      }

      // Assign selected subjects and teachers to this class
      const assignments = Array.isArray(createForm.assignments) ? createForm.assignments : [];
      const validAssignments = assignments.filter((a) => a && a.subjectId && a.teacherId);
      if (validAssignments.length) {
        const classTag = {
          className: created?.className || payload.className,
          section: created?.section || payload.section,
          academicYear: (created?.academicYear ?? payload.academicYear ?? '') || '',
        };
        await Promise.all(
          validAssignments.map(async (a) => {
            try {
              const teacherId = Number(a.teacherId);
              const subjectId = Number(a.subjectId);
              let classes = [classTag];
              try {
                const list = await teacherApi.listSubjectAssignments({ teacherId, subjectId });
                const existing = Array.isArray(list)
                  ? list.find((it) => (it.academicYear ?? '') === (classTag.academicYear ?? ''))
                  : null;
                if (existing && Array.isArray(existing.classes)) {
                  const existsAlready = existing.classes.some((c) =>
                    typeof c === 'string'
                      ? c === `${classTag.className} ${classTag.section}`
                      : c?.className === classTag.className && c?.section === classTag.section
                  );
                  classes = existsAlready ? existing.classes : [...existing.classes, classTag];
                }
              } catch (err) {
                console.error(err);
              }
              await teacherApi.assignSubject({
                teacherId,
                subjectId,
                isPrimary: Boolean(a.isPrimary),
                classes,
                academicYear: classTag.academicYear,
              });
            } catch (err) {
              console.error('Assignment failed', err);
            }
          })
        );
        toast({ title: 'Subject/Teacher assignments saved', status: 'success', duration: 2500 });
      }
      closeAddModal();
      fetchClasses();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to create class',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!selected) return;
    const parsedStrength = Number(form.strength) >= 0 ? Number(form.strength) : 0;
    const parsedCapacity = Number(form.capacity) >= 0 ? Number(form.capacity) : 0;
    if (parsedCapacity && parsedCapacity < parsedStrength) {
      toast({ title: 'Capacity cannot be smaller than strength', status: 'warning', duration: 3000 });
      return;
    }
    const normalize = (value) => (value ?? '').trim();
    const teacherChanged = String(form.classTeacherId || '') !== String(selected.classTeacherId || '');
    const strengthChanged = parsedStrength !== Number(selected.strength || 0);
    const capacityChanged = parsedCapacity !== Number(selected.capacity || 0);
    const academicYearChanged = normalize(form.academicYear) !== (selected.academicYear || '');
    const roomChanged = normalize(form.room) !== (selected.room || '');
    const mediumChanged = normalize(form.medium) !== (selected.medium || '');
    const shiftChanged = normalize(form.shift) !== (selected.shift || '');
    const statusChanged = form.status !== (selected.status || 'active');
    const notesChanged = normalize(form.notes) !== (selected.notes || '');

    const payload = {};
    if (teacherChanged) {
      payload.classTeacherId = form.classTeacherId ? Number(form.classTeacherId) : null;
    }
    if (strengthChanged) {
      payload.enrolledStudents = parsedStrength;
    }
    if (capacityChanged) {
      payload.capacity = parsedCapacity || null;
    }
    if (academicYearChanged) {
      const value = normalize(form.academicYear);
      payload.academicYear = value || null;
    }
    if (roomChanged) {
      const value = normalize(form.room);
      payload.room = value || null;
    }
    if (mediumChanged) {
      const value = normalize(form.medium);
      payload.medium = value || null;
    }
    if (shiftChanged) {
      const value = normalize(form.shift);
      payload.shift = value || null;
    }
    if (statusChanged) {
      payload.status = form.status;
    }
    if (notesChanged) {
      const value = normalize(form.notes);
      payload.notes = value || null;
    }

    const hasSubjectEdits = Array.isArray(editClassSubjects) && editClassSubjects.some(r => {
      if (!r) return false;
      const sid = String(r.subjectId || '').trim();
      const fm = String(r.fullMarks ?? '').trim();
      const gs = String(r.gradeScheme ?? '').trim();
      return !!sid || !!fm || !!gs;
    });
    if (Object.keys(payload).length === 0 && !hasSubjectEdits) {
      toast({ title: 'No changes to save', status: 'info', duration: 2500 });
      return;
    }
    setIsSavingEdit(true);
    try {
      const sanitized = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
      );
      if (Object.keys(sanitized).length) {
        await classesApi.update(selected.id, sanitized);
      }
      // Save class subjects updates
      const payloadSubjects = Array.isArray(editClassSubjects) ? editClassSubjects
        .filter(r => r && r.subjectId)
        .map(r => ({ subjectId: Number(r.subjectId), fullMarks: r.fullMarks === '' ? null : Number(r.fullMarks), gradeScheme: r.gradeScheme || null })) : [];
      if (payloadSubjects.length) {
        try { await classesApi.upsertSubjects(selected.id, payloadSubjects); } catch (_) { }
      } else if (hasSubjectEdits && !Object.keys(sanitized).length) {
        // User edited subject rows but didn't pick any subjectId
        toast({ title: 'Please select at least one subject to save', status: 'warning', duration: 2500 });
        return;
      }
      toast({ title: 'Class updated', status: 'success', duration: 3000 });
      setTimeout(() => { closeEditModal(); fetchClasses(); }, 50);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to update class',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredClasses = useMemo(() => {
    const base = filter === 'All' ? rows : rows.filter((c) => c.className === filter);
    const term = search.trim().toLowerCase();
    if (!term) return base;
    return base.filter(
      (c) =>
        c.className.toLowerCase().includes(term) ||
        c.section.toLowerCase().includes(term) ||
        (c.classTeacher || '').toLowerCase().includes(term)
    );
  }, [rows, filter, search]);

  const classNames = useMemo(
    () => ['All', ...Array.from(new Set(rows.map((c) => c.className)))],
    [rows]
  );

  const totalClasses = useMemo(() => new Set(rows.map((c) => c.className)).size, [rows]);
  const totalSections = rows.length;
  const totalStudents = rows.reduce((a, b) => a + (Number.isFinite(b.strength) ? b.strength : 0), 0);
  const avgStrength = totalSections ? Math.round(totalStudents / totalSections) : 0;

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

  const getExportSource = useCallback(() => (filteredClasses.length ? filteredClasses : rows), [filteredClasses, rows]);

  const handleExportCsv = () => {
    const dataset = getExportSource();
    if (!dataset.length) {
      toast({ title: 'No classes to export', status: 'info', duration: 2500 });
      return;
    }
    setExportingCsv(true);
    try {
      const headers = ['Class', 'Section', 'Strength', 'Capacity', 'Class Teacher', 'Status', 'Academic Year', 'Room'];
      const rowsToExport = dataset.map((item) => [
        item.className,
        item.section,
        item.strength,
        item.capacity,
        resolveTeacherLabel(item),
        item.status,
        item.academicYear || '—',
        item.room || '—',
      ]);
      const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const csvContent = [headers, ...rowsToExport]
        .map((row) => row.map(escape).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      triggerFileDownload(blob, `classes-${Date.now()}.csv`);
      toast({ title: 'CSV exported', status: 'success', duration: 2500 });
    } catch (error) {
      console.error(error);
      toast({ title: 'Export failed', description: error?.message || 'Unable to export CSV.', status: 'error', duration: 4000 });
    } finally {
      setExportingCsv(false);
    }
  };

  const handleExportPdf = () => {
    const dataset = getExportSource();
    if (!dataset.length) {
      toast({ title: 'No classes to export', status: 'info', duration: 2500 });
      return;
    }
    setExportingPdf(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Class Overview', 14, 18);
      doc.setFontSize(10);
      let y = 28;
      dataset.forEach((item, index) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        const teacherLabel = resolveTeacherLabel(item);
        doc.text(`${index + 1}. ${item.className} - Section ${item.section}`, 14, y);
        y += 6;
        doc.text(`Students: ${item.strength}/${item.capacity}  |  Teacher: ${teacherLabel}  |  Status: ${item.status}`, 14, y);
        y += 8;
      });
      doc.save(`classes-${Date.now()}.pdf`);
      toast({ title: 'PDF exported', status: 'success', duration: 2500 });
    } catch (error) {
      console.error(error);
      toast({ title: 'Export failed', description: error?.message || 'Unable to export PDF.', status: 'error', duration: 4000 });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleGenerateReport = () => {
    if (!rows.length) {
      toast({ title: 'No data to include in report', status: 'info', duration: 2500 });
      return;
    }
    setGeneratingReport(true);
    try {
      const timestamp = new Date();
      const header = [
        'Class Management Report',
        `Generated: ${timestamp.toLocaleString()}`,
        `Total Classes: ${totalClasses}`,
        `Sections: ${totalSections}`,
        `Students: ${totalStudents}`,
        `Average Strength: ${avgStrength}`,
        '',
        'Top Classes by Strength:',
      ];
      const topClasses = [...rows]
        .sort((a, b) => (b.strength || 0) - (a.strength || 0))
        .slice(0, 5)
        .map((item, idx) => `${idx + 1}. ${item.className} ${item.section} - ${item.strength} students (Teacher: ${resolveTeacherLabel(item)})`);
      const breakdown = [
        '',
        'Class Breakdown:',
        ...rows.map((item) =>
          `- ${item.className} ${item.section} | ${item.strength}/${item.capacity} students | Teacher: ${resolveTeacherLabel(item)} | Status: ${item.status}`
        ),
      ];
      const reportContent = [...header, ...topClasses, ...breakdown].join('\n');
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      triggerFileDownload(blob, `class-report-${Date.now()}.txt`);
      toast({ title: 'Report generated', status: 'success', duration: 2500 });
    } catch (error) {
      console.error(error);
      toast({ title: 'Report failed', description: error?.message || 'Unable to generate report.', status: 'error', duration: 4000 });
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Classes</Heading>
          <Text color={textColorSecondary}>Manage classes, sections and class teachers</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={handleRefresh} isLoading={isLoading}>
            Refresh
          </Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={handleExportCsv} isLoading={exportingCsv} loadingText="Exporting">
            Export CSV
          </Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue' onClick={handleExportPdf} isLoading={exportingPdf} loadingText="Exporting">
            Export PDF
          </Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb={5}>
        <StatCard
          title="Total Classes"
          value={String(totalClasses)}
          icon={MdClass}
          colorScheme="blue"
        />
        <StatCard
          title="Sections"
          value={String(totalSections)}
          icon={MdPeople}
          colorScheme="green"
        />
        <StatCard
          title="Students"
          value={String(totalStudents)}
          icon={MdSchool}
          colorScheme="orange"
        />
        <StatCard
          title="Avg Strength"
          value={`${avgStrength}`}
          icon={MdTrendingUp}
          colorScheme="purple"
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <Select w="200px" value={filter} onChange={(e) => setFilter(e.target.value)}>
              {classNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
            <InputGroup w={{ base: '100%', md: '260px' }}>
              <InputLeftElement pointerEvents="none">
                <MdSearch color="gray.300" />
              </InputLeftElement>
              <Input placeholder="Search section/teacher" value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
          </HStack>
          <HStack>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleOpenAdd}>
              Add Class
            </Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue" onClick={handleGenerateReport} isLoading={generatingReport} loadingText="Building">
              Generate Report
            </Button>
          </HStack>
        </Flex>
      </Card>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Classes Overview
        </Heading>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Class</Th>
                <Th>Section</Th>
                <Th>Strength</Th>
                <Th>Subjects</Th>
                <Th>Class Teacher</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading && (
                <Tr>
                  <Td colSpan={7}>
                    <Flex align="center" justify="center" py={6}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading classes...</Text>
                    </Flex>
                  </Td>
                </Tr>
              )}
              {!isLoading && filteredClasses.length === 0 && (
                <Tr>
                  <Td colSpan={7}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>No classes found. Create one to get started.</Text>
                  </Td>
                </Tr>
              )}
              {!isLoading && filteredClasses.map((c) => {
                const teacherLabel = resolveTeacherLabel(c);
                const isFull = c.capacity ? c.strength >= c.capacity : c.strength >= 30;
                return (
                  <Tr key={c.id || `${c.className}-${c.section}`}>
                    <Td>{c.className}</Td>
                    <Td>{c.section}</Td>
                    <Td>{c.strength}</Td>
                    <Td>
                      <Button size='xs' variant='outline' onClick={async () => {
                        setSubjectsModalLoading(true);
                        setSubjectsModalOpen(true);
                        let items = [];
                        const cls = String(c.className || '').trim();
                        const sec = String(c.section || '').trim();
                        try {
                          // Prefer fetching by class/section to avoid id issues
                          const byClass = await classesApi.listSubjectsByClass({ className: cls, section: sec });
                          items = Array.isArray(byClass?.items) ? byClass.items : Array.isArray(byClass) ? byClass : [];
                          // Try alternate section case if empty
                          if (!items.length && sec) {
                            const altSec1 = sec.toUpperCase();
                            const alt1 = await classesApi.listSubjectsByClass({ className: cls, section: altSec1 });
                            items = Array.isArray(alt1?.items) ? alt1.items : Array.isArray(alt1) ? alt1 : [];
                          }
                          if (!items.length && sec) {
                            const altSec2 = sec.toLowerCase();
                            const alt2 = await classesApi.listSubjectsByClass({ className: cls, section: altSec2 });
                            items = Array.isArray(alt2?.items) ? alt2.items : Array.isArray(alt2) ? alt2 : [];
                          }
                          // If still empty and numeric id exists, try direct by id
                          if (!items.length && Number.isFinite(Number(c.id))) {
                            const resp = await classesApi.getSubjects(Number(c.id));
                            items = Array.isArray(resp?.items) ? resp.items : Array.isArray(resp) ? resp : [];
                          }
                          // Fallback to teacher subject assignments
                          if (!items.length) {
                            try {
                              const tResp = await teacherApi.listSubjectsByClass({ className: cls, section: sec });
                              const tItems = Array.isArray(tResp?.items) ? tResp.items : Array.isArray(tResp) ? tResp : [];
                              items = tItems.map(s => ({ subjectName: s.name || s.subjectName || s.subject || '', fullMarks: null, gradeScheme: null }));
                            } catch { }
                          }
                        } catch {
                          items = [];
                        } finally {
                          setSubjectsModalItems(items);
                          setSubjectsModalLoading(false);
                        }
                      }}>Subjects</Button>
                    </Td>
                    <Td>{teacherLabel}</Td>
                    <Td>
                      <Badge colorScheme={isFull ? 'orange' : 'green'}>
                        {isFull ? 'Full' : 'Open'}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu placement='bottom-end' isLazy>
                        <MenuButton
                          as={IconButton}
                          icon={<MdMoreVert />}
                          variant='ghost'
                          size='sm'
                          aria-label='Class actions'
                        />
                        <Portal>
                          <MenuList zIndex={1800} minW='220px' boxShadow='xl'>
                            <MenuItem icon={<MdRemoveRedEye />} onClick={() => handleOpenView(c)}>
                              View Details
                            </MenuItem>
                            <MenuItem icon={<MdEdit />} onClick={() => handleOpenEdit(c)}>
                              Edit Class
                            </MenuItem>
                            <MenuItem icon={<MdSchool />} onClick={() => navigate('/admin/students/list')}>
                              Open Students
                            </MenuItem>
                            <MenuItem icon={<MdDelete />} color='red.500' onClick={() => confirmDeleteClass(c)}>
                              Delete Class
                            </MenuItem>
                          </MenuList>
                        </Portal>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isAddOpen} onClose={closeAddModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Class</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <FormControl isRequired>
                <FormLabel>Class Name</FormLabel>
                <Input value={createForm.className} onChange={(e) => handleCreateChange('className', e.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Section</FormLabel>
                <Input value={createForm.section} onChange={(e) => handleCreateChange('section', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Academic Year</FormLabel>
                <Input value={createForm.academicYear} onChange={(e) => handleCreateChange('academicYear', e.target.value)} placeholder="e.g. 2024-2025" />
              </FormControl>
              <FormControl>
                <FormLabel>Class Teacher</FormLabel>
                <Select
                  placeholder={teacherLoading ? 'Loading...' : 'Select teacher'}
                  value={createForm.classTeacherId}
                  onChange={(e) => handleCreateChange('classTeacherId', e.target.value)}
                  isDisabled={teacherLoading}
                >
                  <option value="">Unassigned</option>
                  {teacherOptions.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Capacity</FormLabel>
                <Input type='number' min={1} value={createForm.capacity} onChange={(e) => handleCreateChange('capacity', Number(e.target.value) || 0)} />
              </FormControl>
              <FormControl>
                <FormLabel>Strength</FormLabel>
                <Input type='number' min={0} value={createForm.strength} onChange={(e) => handleCreateChange('strength', Number(e.target.value) || 0)} />
              </FormControl>
              <FormControl>
                <FormLabel>Room</FormLabel>
                <Input value={createForm.room} onChange={(e) => handleCreateChange('room', e.target.value)} placeholder="e.g. A101" />
              </FormControl>
              <FormControl>
                <FormLabel>Medium</FormLabel>
                <Input value={createForm.medium} onChange={(e) => handleCreateChange('medium', e.target.value)} placeholder="e.g. English" />
              </FormControl>
              <FormControl>
                <FormLabel>Shift</FormLabel>
                <Input value={createForm.shift} onChange={(e) => handleCreateChange('shift', e.target.value)} placeholder="e.g. Morning" />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={createForm.status} onChange={(e) => handleCreateChange('status', e.target.value)}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>
            {/* Subject & Teacher Assignments */}
            <Box mt={6}>
              <Heading as="h4" size="sm" mb={3}>Subjects and Teachers</Heading>
              {(createForm.assignments || []).map((row, idx) => (
                <HStack key={idx} spacing={3} mb={3} align="flex-end">
                  <FormControl isRequired>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      placeholder={subjectsLoading ? 'Loading...' : 'Select subject'}
                      value={row.subjectId || ''}
                      onChange={(e) => handleAssignmentChange(idx, 'subjectId', e.target.value)}
                      isDisabled={subjectsLoading}
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Teacher</FormLabel>
                    <Select
                      placeholder={teacherLoading ? 'Loading...' : 'Select teacher'}
                      value={row.teacherId || ''}
                      onChange={(e) => handleAssignmentChange(idx, 'teacherId', e.target.value)}
                      isDisabled={teacherLoading}
                    >
                      {teacherOptions.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button colorScheme="red" variant="ghost" onClick={() => handleRemoveAssignmentRow(idx)} leftIcon={<MdDelete />}>
                    Remove
                  </Button>
                </HStack>
              ))}
              <Button size="sm" variant="outline" onClick={handleAddAssignmentRow} leftIcon={<AddIcon />}>Add Assignment</Button>
            </Box>
            <Box mt={6}>
              <Heading as="h4" size="sm" mb={3}>Class Subjects & Full Marks</Heading>
              {(createClassSubjects || []).map((row, idx) => (
                <HStack key={idx} spacing={3} mb={3} align="flex-end">
                  <FormControl isRequired>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      placeholder={subjectsLoading ? 'Loading...' : 'Select subject'}
                      value={row.subjectId || ''}
                      onChange={(e) => updateCreateClassSubjectRow(idx, 'subjectId', e.target.value)}
                      isDisabled={subjectsLoading}
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Full Marks</FormLabel>
                    <Input type='number' min={0} value={row.fullMarks} onChange={(e) => updateCreateClassSubjectRow(idx, 'fullMarks', e.target.value)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Grade Scheme</FormLabel>
                    <Input value={row.gradeScheme} onChange={(e) => updateCreateClassSubjectRow(idx, 'gradeScheme', e.target.value)} placeholder='e.g. A-F' />
                  </FormControl>
                  <IconButton aria-label="Remove subject" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => removeCreateClassSubjectRow(idx)} />
                </HStack>
              ))}
              <Button size="sm" variant="outline" onClick={addCreateClassSubjectRow} leftIcon={<AddIcon />}>Add Subject</Button>
            </Box>
            <FormControl mt={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea value={createForm.notes} onChange={(e) => handleCreateChange('notes', e.target.value)} rows={3} placeholder="Additional information" />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={closeAddModal}>
              Cancel
            </Button>
            <Button colorScheme='blue' onClick={handleCreateClass} isLoading={isCreating} loadingText="Saving">
              Save Class
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Subjects quick view modal */}
      <Modal isOpen={isSubjectsModalOpen} onClose={() => setSubjectsModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Class Subjects</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {subjectsModalLoading ? (
              <Flex align="center" justify="center" py={6}>
                <Spinner size="sm" mr={3} />
                <Text>Loading subjects…</Text>
              </Flex>
            ) : (
              <>
                {(!subjectsModalItems || subjectsModalItems.length === 0) ? (
                  <Text color={textColorSecondary}>No subjects assigned for this class yet.</Text>
                ) : (
                  <Table size='sm' variant='simple'>
                    <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                      <Tr>
                        <Th>Subject</Th>
                        <Th isNumeric>Full Marks</Th>
                        <Th>Grade Scheme</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(subjectsModalItems || []).map((it, idx) => (
                        <Tr key={`${it.subjectId ?? it.subjectName ?? idx}`}>
                          <Td>{it.subjectName || it.subject}</Td>
                          <Td isNumeric>{it.fullMarks ?? ''}</Td>
                          <Td>{it.gradeScheme || ''}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setSubjectsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={deleteDisclosure.isOpen}
        leastDestructiveRef={deleteCancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Class
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {deleteTarget?.className} (Section {deleteTarget?.section})? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteCancelRef} onClick={closeDeleteDialog} mr={3}>Cancel</Button>
              <Button colorScheme='red' onClick={handleDeleteClass} isLoading={isDeleting}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Modal isOpen={isViewOpen} onClose={onViewClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Class Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                  <Box><Text fontWeight='600'>Class</Text><Text>{selected.className}</Text></Box>
                  <Box><Text fontWeight='600'>Section</Text><Text>{selected.section}</Text></Box>
                  <Box><Text fontWeight='600'>Academic Year</Text><Text>{selected.academicYear || '—'}</Text></Box>
                  <Box><Text fontWeight='600'>Strength</Text><Text>{selected.strength}</Text></Box>
                  <Box><Text fontWeight='600'>Capacity</Text><Text>{selected.capacity || '—'}</Text></Box>
                  <Box>
                    <Text fontWeight='600'>Class Teacher</Text>
                    <Text>{resolveTeacherLabel(selected)}</Text>
                  </Box>
                  <Box><Text fontWeight='600'>Room</Text><Text>{selected.room || '—'}</Text></Box>
                  <Box><Text fontWeight='600'>Medium</Text><Text>{selected.medium || '—'}</Text></Box>
                  <Box><Text fontWeight='600'>Shift</Text><Text>{selected.shift || '—'}</Text></Box>
                  <Box>
                    <Text fontWeight='600'>Status</Text>
                    <Badge ml={2} colorScheme={selected.status === 'active' ? 'green' : selected.status === 'inactive' ? 'orange' : 'gray'} textTransform="capitalize">
                      {selected.status}
                    </Badge>
                  </Box>
                </SimpleGrid>
                {selected.notes && (
                  <Box mt={4}>
                    <Text fontWeight='600'>Notes</Text>
                    <Text>{selected.notes}</Text>
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' onClick={onViewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={closeEditModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Class</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <FormControl isDisabled>
                    <FormLabel>Class</FormLabel>
                    <Input value={`${selected.className} - Section ${selected.section}`} readOnly />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Class Teacher</FormLabel>
                    <Select
                      placeholder={teacherLoading ? 'Loading...' : 'Select teacher'}
                      value={form.classTeacherId}
                      onChange={(e) => handleEditChange('classTeacherId', e.target.value)}
                      isDisabled={teacherLoading}
                    >
                      <option value="">Unassigned</option>
                      {teacherOptions.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Academic Year</FormLabel>
                    <Input value={form.academicYear} onChange={(e) => handleEditChange('academicYear', e.target.value)} placeholder="e.g. 2024-2025" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select value={form.status} onChange={(e) => handleEditChange('status', e.target.value)}>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Strength</FormLabel>
                    <Input type='number' min={0} value={form.strength} onChange={(e) => handleEditChange('strength', Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Capacity</FormLabel>
                    <Input type='number' min={0} value={form.capacity} onChange={(e) => handleEditChange('capacity', Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Room</FormLabel>
                    <Input value={form.room} onChange={(e) => handleEditChange('room', e.target.value)} placeholder="e.g. A101" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Medium</FormLabel>
                    <Input value={form.medium} onChange={(e) => handleEditChange('medium', e.target.value)} placeholder="e.g. English" />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Shift</FormLabel>
                    <Input value={form.shift} onChange={(e) => handleEditChange('shift', e.target.value)} placeholder="e.g. Morning" />
                  </FormControl>
                </SimpleGrid>
                <FormControl mt={4}>
                  <FormLabel>Notes</FormLabel>
                  <Textarea value={form.notes} onChange={(e) => handleEditChange('notes', e.target.value)} rows={3} placeholder="Additional information" />
                </FormControl>
                <Box mt={6}>
                  <Heading as="h4" size="sm" mb={3}>Class Subjects & Full Marks</Heading>
                  {(editClassSubjects || []).map((row, idx) => (
                    <HStack key={idx} spacing={3} mb={3} align="flex-end">
                      <FormControl isRequired>
                        <FormLabel>Subject</FormLabel>
                        <Select
                          placeholder={subjectsLoading ? 'Loading...' : 'Select subject'}
                          value={row.subjectId || ''}
                          onChange={(e) => updateEditClassSubjectRow(idx, 'subjectId', e.target.value)}
                          isDisabled={subjectsLoading}
                        >
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Full Marks</FormLabel>
                        <Input type='number' min={0} value={row.fullMarks} onChange={(e) => updateEditClassSubjectRow(idx, 'fullMarks', e.target.value)} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Grade Scheme</FormLabel>
                        <Input value={row.gradeScheme} onChange={(e) => updateEditClassSubjectRow(idx, 'gradeScheme', e.target.value)} placeholder='e.g. A-F' />
                      </FormControl>
                      <IconButton aria-label="Remove subject" colorScheme="red" variant="ghost" icon={<MdDelete />} onClick={() => removeEditClassSubjectRow(idx)} />
                    </HStack>
                  ))}
                  <Button size="sm" variant="outline" onClick={addEditClassSubjectRow} leftIcon={<AddIcon />}>Add Subject</Button>
                </Box>
              </Box>
            ) : (
              <Text>No class selected.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={closeEditModal}>Cancel</Button>
            <Button colorScheme='blue' onClick={handleUpdateClass} isLoading={isSavingEdit} loadingText='Saving'>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
