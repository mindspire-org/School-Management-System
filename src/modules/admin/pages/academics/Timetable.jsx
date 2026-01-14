import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Grid,
  GridItem,
  Flex,
  SimpleGrid,
  Button,
  ButtonGroup,
  IconButton,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue,
  Spinner,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { MdSchedule, MdAccessTime, MdGridOn, MdAssignment, MdUpdate, MdCalendarToday, MdChevronLeft, MdChevronRight, MdViewWeek, MdViewModule, MdFileDownload, MdPictureAsPdf, MdDelete } from 'react-icons/md';
import * as teacherApi from '../../../../services/api/teachers';
import useClassOptions from '../../../../hooks/useClassOptions';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  { id: 1, start: '08:00', end: '08:45', label: '1st Period' },
  { id: 2, start: '08:50', end: '09:35', label: '2nd Period' },
  { id: 3, start: '09:40', end: '10:25', label: '3rd Period' },
  { id: 4, start: '10:30', end: '11:15', label: '4th Period' },
  { id: 5, start: '11:20', end: '12:05', label: '5th Period' },
  { id: 6, start: '12:10', end: '12:55', label: '6th Period' },
  { id: 7, start: '13:30', end: '14:15', label: '7th Period' },
  { id: 8, start: '14:20', end: '15:05', label: '8th Period' },
];

export default function Timetable() {
  const toast = useToast();
  const { classOptions, sectionsByClass, sectionOptions } = useClassOptions();
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [view, setView] = useState('day'); // 'day' | 'week' | 'month'
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [timetable, setTimetable] = useState({}); // local edits by date
  const [schedules, setSchedules] = useState([]); // fetched teacher schedules
  const [loading, setLoading] = useState(false);
  const editDisc = useDisclosure();
  const [editValues, setEditValues] = useState([]);
  const [editRooms, setEditRooms] = useState([]);
  const [modalPeriodCount, setModalPeriodCount] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [autoSelect, setAutoSelect] = useState(false);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const teacherOptions = useMemo(() => (
    (teachers || [])
      .map((t) => ({ id: String(t.id ?? t.teacherId), name: t.name || t.fullName || 'Unnamed Teacher' }))
      .filter((t) => t.id)
  ), [teachers]);

  // Initialize class/section from options (only when autoSelect is enabled)
  useEffect(() => {
    if (!autoSelect) return;
    if (!cls && classOptions.length) setCls(classOptions[0]);
  }, [autoSelect, classOptions, cls]);
  useEffect(() => {
    const secs = sectionsByClass[cls] || [];
    if (!cls) {
      if (!autoSelect && section) setSection('');
      return;
    }
    if (autoSelect) {
      if (!section && secs.length) setSection(secs[0]);
      if (section && secs.length && !secs.includes(section)) setSection(secs[0]);
    } else {
      if (section && secs.length && !secs.includes(section)) setSection('');
    }
  }, [autoSelect, cls, sectionsByClass, section]);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherApi.listSchedules();
      const rows = Array.isArray(data) ? data : [];
      setSchedules(rows);
    } catch (e) {
      console.error(e);
      toast({ title: 'Failed to load schedules', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const fetchTeachers = useCallback(async () => {
    setTeacherLoading(true);
    try {
      const res = await teacherApi.list({ page: 1, pageSize: 200 });
      const rows = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
      setTeachers(rows);
      if (autoSelect && !selectedTeacher && rows.length) setSelectedTeacher(String(rows[0].id ?? rows[0].teacherId));
    } catch (_) {
      setTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  }, [selectedTeacher, autoSelect]);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  // Build period slots from timeSlotIndex or startTime
  const { slotKeys, periodLabels } = useMemo(() => {
    if (!cls || !section) {
      return { slotKeys: [], periodLabels: [] };
    }
    const filtered = schedules.filter((s) => (
      (s.className || s.class) === cls &&
      (s.section || '') === section
    ));
    let indices = new Set();
    let times = [];
    filtered.forEach((s) => {
      if (s.timeSlotIndex !== undefined && s.timeSlotIndex !== null) {
        indices.add(Number(s.timeSlotIndex));
      } else if (s.startTime) {
        times.push({ start: s.startTime, end: s.endTime });
      }
    });
    let slots = [];
    let labels = [];
    if (indices.size) {
      slots = Array.from(indices).sort((a, b) => a - b);
      labels = slots.map((i, idx) => `P${idx + 1}`);
    } else {
      // derive from unique start times
      const uniq = [];
      const keyer = new Set();
      times.forEach((t) => {
        const k = `${t.start}-${t.end}`;
        if (!keyer.has(k)) { keyer.add(k); uniq.push(t); }
      });
      uniq.sort((a, b) => String(a.start).localeCompare(String(b.start)));
      slots = uniq.map((_, idx) => idx);
      labels = uniq.map((t, idx) => `P${idx + 1}`);
    }
    return { slotKeys: slots, periodLabels: labels };
  }, [schedules, cls, section]);

  // Grid data by day -> slotIndex -> value
  const grid = useMemo(() => {
    const resolveSlotIndex = (s) => {
      if (s.timeSlotIndex !== undefined && s.timeSlotIndex !== null) return Number(s.timeSlotIndex);
      const idx = timeSlots.findIndex((ts) => String(ts.start) === String(s.startTime) && String(ts.end) === String(s.endTime));
      return idx >= 0 ? idx + 1 : null;
    };
    const out = {};
    days.forEach((d) => { out[d] = Array(Math.max(1, slotKeys.length)).fill(''); });
    schedules.forEach((s) => {
      const c = s.className || s.class;
      const sec = s.section || '';
      if (c !== cls || sec !== section) return;
      const day = s.dayName || s.day;
      if (!out[day]) return;
      const slotIndex = resolveSlotIndex(s);
      const idx = slotIndex ? slotKeys.indexOf(slotIndex) : -1;
      if (idx < 0 || idx >= out[day].length) return;
      const label = s.subject || '—';
      const room = s.room ? ` • ${s.room}` : '';
      out[day][idx] = label + room;
    });
    return out;
  }, [schedules, cls, section, slotKeys]);

  const totalCells = days.length * Math.max(1, periodLabels.length);
  const filledCells = useMemo(() => {
    return days.reduce((acc, d) => acc + (grid[d]?.filter(Boolean).length || 0), 0);
  }, [grid]);
  const freeCells = totalCells - filledCells;
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    days.forEach((d) => (grid[d] || []).forEach((s) => s && set.add(s.replace(/\s•.*$/, ''))));
    return set.size;
  }, [grid]);

  // Helpers
  const fmt = (d) => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };
  const dayName = (d) => days[d.getDay()];
  const monthMatrix = useMemo(() => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startDay = (d.getDay() + 6) % 7; // Monday start
    const first = new Date(d);
    first.setDate(1 - startDay);
    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        const cell = new Date(first);
        cell.setDate(first.getDate() + w * 7 + i);
        row.push(cell);
      }
      weeks.push(row);
    }
    return weeks;
  }, [selectedDate]);

  const parseLocalDate = (str) => {
    // parse 'YYYY-MM-DD' as local date to avoid timezone shifts
    if (!str) return new Date();
    const [y, m, d] = str.split('-').map((n) => Number(n));
    if (!y || !m || !d) return new Date(str);
    return new Date(y, m - 1, d);
  };

  const getScheduleForDate = (date) => {
    const key = `${cls}-${section}`;
    const map = timetable[key] || {};
    const k = fmt(date);
    if (map[k]) return map[k];
    const dn = dayName(date);
    return grid[dn] || Array(Math.max(1, periodLabels.length)).fill('');
  };

  const setScheduleForDate = (date, values) => {
    const k = `${cls}-${section}`;
    setTimetable((prev) => ({ ...prev, [k]: { ...(prev[k] || {}), [fmt(date)]: values } }));
  };

  const resolveSlotIndex = (s) => {
    if (s?.timeSlotIndex !== undefined && s?.timeSlotIndex !== null) return Number(s.timeSlotIndex);
    const idx = timeSlots.findIndex((ts) => String(ts.start) === String(s?.startTime) && String(ts.end) === String(s?.endTime));
    return idx >= 0 ? idx + 1 : null;
  };

  const openEditForDate = (date) => {
    if (!cls || !section || !selectedTeacher) return;
    const existing = [...getScheduleForDate(date)];
    const baseCount = periodLabels.length || 6;
    const count = Math.max(existing.length || 0, baseCount);
    const padded = [...existing];
    while (padded.length < count) padded.push('');

    // rooms based on current schedules for that day/teacher/class/section
    const dn = dayName(date);
    const teacherId = Number(selectedTeacher) || null;
    const rel = schedules.filter((s) => (s.className || s.class) === cls && (s.section || '') === section && (s.dayName || s.day) === dn && Number(s.teacherId) === teacherId);
    const byIndex = new Map();
    rel.forEach((s) => { const k = resolveSlotIndex(s); if (k) byIndex.set(k, s); });
    const rooms = Array.from({ length: count }, (_, i) => (byIndex.get(i + 1)?.room || ''));
    const subjectsOnly = padded.map((val) => (val ? String(val).replace(/\s•.*$/, '') : ''));

    setModalPeriodCount(count);
    setEditValues(subjectsOnly);
    setEditRooms(rooms);
    editDisc.onOpen();
  };

  const dayNameToNumber = useMemo(() => ({ Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 }), []);

  const upsertBackendForDate = async (date, values, rooms) => {
    if (!cls || !section) return;
    const dn = dayName(date);
    const dow = dayNameToNumber[dn];
    const teacherId = Number(selectedTeacher) || null;
    if (!teacherId) return;
    const rel = schedules.filter((s) => (s.dayName || s.day) === dn && Number(s.teacherId) === teacherId);
    const byIndex = new Map();
    rel.forEach((s) => { const idx = resolveSlotIndex(s); if (idx) byIndex.set(idx, s); });
    for (let i = 0; i < values.length; i++) {
      const subject = String(values[i] || '').trim();
      const room = String((rooms && rooms[i]) || '').trim();
      const slotIndex = i + 1;
      const slotMeta = timeSlots[slotIndex - 1] || { start: '08:00', end: '08:45', label: `P${slotIndex}` };
      const existing = byIndex.get(slotIndex);
      if (subject) {
        if (existing) {
          const updates = {};
          if (existing.subject !== subject) updates.subject = subject;
          const exClass = existing.className || existing.class;
          if (exClass !== cls) updates.class = cls;
          const exSec = existing.section || '';
          if (exSec !== section) updates.section = section;
          if (Number(existing.timeSlotIndex) !== slotIndex) updates.timeSlotIndex = slotIndex;
          if (existing.startTime !== slotMeta.start) updates.startTime = slotMeta.start;
          if (existing.endTime !== slotMeta.end) updates.endTime = slotMeta.end;
          if ((existing.timeSlotLabel || '') !== (slotMeta.label || `P${slotIndex}`)) updates.timeSlotLabel = slotMeta.label || `P${slotIndex}`;
          if (String(existing.dayOfWeek || existing.day) !== String(dow)) updates.dayOfWeek = String(dow);
          if ((existing.room || '') !== (room || '')) updates.room = room || null;
          if (Object.keys(updates).length) {
            await teacherApi.updateScheduleSlot(existing.id, { ...updates });
          }
        } else {
          try {
            await teacherApi.createScheduleSlot({
              teacherId,
              dayOfWeek: String(dow),
              startTime: slotMeta.start,
              endTime: slotMeta.end,
              class: cls,
              section,
              subject,
              room: room || null,
              timeSlotIndex: slotIndex,
              timeSlotLabel: slotMeta.label || `P${slotIndex}`,
            });
          } catch (e) {
            const msg = String(e?.message || '').toLowerCase();
            if (msg.includes('duplicate') || msg.includes('unique')) {
              const fresh = await teacherApi.listSchedules({ teacherId, dayOfWeek: String(dow) });
              const rows = Array.isArray(fresh) ? fresh : Array.isArray(fresh?.rows) ? fresh.rows : [];
              let target = rows.find((r) => Number(r.timeSlotIndex) === slotIndex);
              if (!target) {
                target = rows.find((r) => String(r.startTime) === String(slotMeta.start) && String(r.endTime) === String(slotMeta.end));
              }
              if (target) {
                await teacherApi.updateScheduleSlot(target.id, {
                  subject,
                  class: cls,
                  section,
                  startTime: slotMeta.start,
                  endTime: slotMeta.end,
                  timeSlotIndex: slotIndex,
                  timeSlotLabel: slotMeta.label || `P${slotIndex}`,
                  dayOfWeek: String(dow),
                  room: room || null,
                });
              } else {
                throw e;
              }
            } else {
              throw e;
            }
          }
        }
      } else if (existing) {
        await teacherApi.deleteScheduleSlot(existing.id);
      }
    }
  };

  const exportCsv = () => {
    const header = ['Teacher', 'Day', 'Start', 'End', 'Class', 'Section', 'Subject', 'Room'];
    const rows = schedules
      .filter((s) => (!cls || (s.className || s.class) === cls) && (!section || (s.section || '') === section))
      .map((s) => [s.teacherName || '', s.dayName || s.day || '', s.startTime || '', s.endTime || '', s.className || s.class || '', s.section || '', s.subject || '', s.room || '']);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable_${cls || 'all'}_${section || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = schedules.filter((s) => (!cls || (s.className || s.class) === cls) && (!section || (s.section || '') === section));
    const html = `<!doctype html><html><head><title>Timetable</title><style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px;font-family:Arial;font-size:12px}</style></head><body>
      <h2>Timetable - ${cls || 'All Classes'} ${section ? 'Section ' + section : ''}</h2>
      <table><thead><tr><th>Teacher</th><th>Day</th><th>Start</th><th>End</th><th>Class</th><th>Section</th><th>Subject</th><th>Room</th></tr></thead><tbody>
      ${rows.map((s) => `<tr><td>${s.teacherName || ''}</td><td>${s.dayName || s.day || ''}</td><td>${s.startTime || ''}</td><td>${s.endTime || ''}</td><td>${s.className || s.class || ''}</td><td>${s.section || ''}</td><td>${s.subject || ''}</td><td>${s.room || ''}</td></tr>`).join('')}
      </tbody></table>
    </body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  const showReport = () => {
    const countByDay = days.map((d) => ({ day: d, count: schedules.filter((s) => (s.dayName || s.day) === d && (!cls || (s.className || s.class) === cls) && (!section || (s.section || '') === section)).length }));
    const busiest = countByDay.reduce((a, b) => (b.count > a.count ? b : a), { day: 'N/A', count: 0 });
    toast({ title: 'Timetable Report', description: `Busiest: ${busiest.day} (${busiest.count})`, status: 'info', duration: 4000, isClosable: true });
  };

  const handleResetFilters = () => {
    setCls('');
    setSection('');
    setSelectedTeacher('');
    setSelectedDate(new Date());
    setTimetable({});
    setAutoSelect(false);
  };

  const deletePeriodForDate = async (date, idx) => {
    if (!cls || !section) return;
    const dn = dayName(date);
    const teacherId = Number(selectedTeacher) || null;
    if (!teacherId) return;
    const rel = schedules.filter((s) => (s.className || s.class) === cls && (s.section || '') === section && (s.dayName || s.day) === dn && Number(s.teacherId) === teacherId);
    const byIndex = new Map();
    const resolveSlotIndex = (s) => {
      if (s.timeSlotIndex !== undefined && s.timeSlotIndex !== null) return Number(s.timeSlotIndex);
      const k = timeSlots.findIndex((ts) => String(ts.start) === String(s.startTime) && String(ts.end) === String(s.endTime));
      return k >= 0 ? k + 1 : null;
    };
    rel.forEach((s) => { const k = resolveSlotIndex(s); if (k) byIndex.set(k, s); });
    const existing = byIndex.get(idx + 1);
    if (existing) {
      await teacherApi.deleteScheduleSlot(existing.id);
      const next = [...editValues];
      next[idx] = '';
      setEditValues(next);
      const nr = [...editRooms];
      nr[idx] = '';
      setEditRooms(nr);
      toast({ title: `Period P${idx + 1} deleted`, status: 'success', duration: 2000 });
      await fetchSchedules();
    } else {
      const next = [...editValues];
      next[idx] = '';
      setEditValues(next);
      const nr = [...editRooms];
      nr[idx] = '';
      setEditRooms(nr);
    }
  };

  const deleteWholeDay = async (date) => {
    if (!cls || !section) return;
    const dn = dayName(date);
    const teacherId = Number(selectedTeacher) || null;
    if (!teacherId) return;
    const rel = schedules.filter((s) => (s.className || s.class) === cls && (s.section || '') === section && (s.dayName || s.day) === dn && Number(s.teacherId) === teacherId);
    if (rel.length) {
      await Promise.allSettled(rel.map((r) => teacherApi.deleteScheduleSlot(r.id)));
    }
    const count = modalPeriodCount || (periodLabels.length || 6);
    setEditValues(Array.from({ length: count }, () => ''));
    setEditRooms(Array.from({ length: count }, () => ''));
    await fetchSchedules();
    toast({ title: `All periods deleted for ${dn}`, status: 'success', duration: 2200 });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Timetable</Heading>
          <Text color={textColorSecondary}>Plan lessons with day/week/month views</Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap="20px" mb={5}>
        <StatCard
          title="Total Periods"
          value={String(totalCells)}
          icon={MdSchedule}
          colorScheme="blue"
        />
        <StatCard
          title="Scheduled"
          value={String(filledCells)}
          icon={MdGridOn}
          colorScheme="green"
        />
        <StatCard
          title="Free Slots"
          value={String(freeCells)}
          icon={MdAccessTime}
          colorScheme="orange"
        />
        <StatCard
          title="Subjects"
          value={String(uniqueSubjects)}
          icon={MdGridOn}
          colorScheme="purple"
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
          {/* Left: stacked filters (old layout style) */}
          <Box flex="1" maxW={{ base: '100%', md: '520px' }}>
            <Select size="sm" w="100%" mb={3} value={cls || ''} onChange={(e) => setCls(e.target.value)} placeholder="Select class">
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select size="sm" w="100%" mb={3} value={section || ''} onChange={(e) => setSection(e.target.value)} placeholder="Select section" isDisabled={!cls}>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Select size="sm" w="100%" value={selectedTeacher || ''} onChange={(e) => setSelectedTeacher(e.target.value)} placeholder={teacherLoading ? 'Loading teachers...' : 'Select teacher'} isDisabled={teacherLoading || !cls || !section}>
              {teacherOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </Box>
          {/* Right: actions (wrap into two rows if needed) */}
          <Wrap justify="flex-end" spacing={2}>
            <WrapItem>
              <Button size="sm" variant="outline" onClick={handleResetFilters}>Reset Filters</Button>
            </WrapItem>
            <WrapItem>
              <Button size="sm" leftIcon={<MdUpdate />} colorScheme="blue" onClick={fetchSchedules} isLoading={loading} variant="solid">Refresh</Button>
            </WrapItem>
            <WrapItem>
              <Button size="sm" leftIcon={<MdAssignment />} variant="outline" colorScheme="blue" onClick={showReport} isDisabled={!cls || !section}>Generate Report</Button>
            </WrapItem>
            <WrapItem>
              <Button size="sm" leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue" onClick={exportCsv} isDisabled={!cls || !section}>Export CSV</Button>
            </WrapItem>
            <WrapItem>
              <Button size="sm" leftIcon={<MdPictureAsPdf />} variant="solid" colorScheme="blue" onClick={exportPdf} isDisabled={!cls || !section}>Export PDF</Button>
            </WrapItem>
          </Wrap>
        </Flex>
      </Card>

      {/* View Controls */}
      <Card mb={5}>
        <Flex p={4} gap={4} align="center" direction={{ base: 'column', md: 'row' }}>
          <ButtonGroup isAttached>
            <Button leftIcon={<MdCalendarToday />} variant={view === 'day' ? 'solid' : 'outline'} colorScheme='blue' onClick={() => setView('day')}>Day</Button>
            <Button leftIcon={<MdViewWeek />} variant={view === 'week' ? 'solid' : 'outline'} colorScheme='blue' onClick={() => setView('week')}>Week</Button>
            <Button leftIcon={<MdViewModule />} variant={view === 'month' ? 'solid' : 'outline'} colorScheme='blue' onClick={() => setView('month')}>Month</Button>
          </ButtonGroup>
          <HStack>
            <IconButton aria-label='Prev' icon={<MdChevronLeft />} onClick={() => {
              const d = new Date(selectedDate);
              if (view === 'day') d.setDate(d.getDate() - 1);
              else if (view === 'week') d.setDate(d.getDate() - 7);
              else d.setMonth(d.getMonth() - 1);
              setSelectedDate(d);
            }} />
            <Input type='date' value={fmt(selectedDate)} onChange={(e) => setSelectedDate(parseLocalDate(e.target.value))} maxW='220px' />
            <IconButton aria-label='Next' icon={<MdChevronRight />} onClick={() => {
              const d = new Date(selectedDate);
              if (view === 'day') d.setDate(d.getDate() + 1);
              else if (view === 'week') d.setDate(d.getDate() + 7);
              else d.setMonth(d.getMonth() + 1);
              setSelectedDate(d);
            }} />
            <Button onClick={() => setSelectedDate(new Date())}>Today</Button>
          </HStack>
        </Flex>
      </Card>

      {/* Views */}
      {view === 'day' && (
        <Card>
          <Flex p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')} align="center" justify="space-between">
            <Heading size="md">
              {cls} - Section {section} • {selectedDate.toDateString()}
            </Heading>
            <Button leftIcon={<MdDelete />} colorScheme='red' variant='outline' onClick={() => deleteWholeDay(selectedDate)} isDisabled={!cls || !section || !selectedTeacher}>Delete Day</Button>
          </Flex>
          <Box p={4}>
            <Grid templateColumns={`160px 1fr`} gap={2}>
              {periodLabels.map((p, i) => (
                <React.Fragment key={p}>
                  <GridItem><Text fontWeight='600'>{p}</Text></GridItem>
                  <GridItem>
                    <Box role='group' position='relative' borderWidth='1px' borderRadius='md' p={3} cursor='pointer' onClick={() => openEditForDate(selectedDate)}>
                      <Text>{getScheduleForDate(selectedDate)[i] || '- (click to edit)'}</Text>
                      <IconButton aria-label={`Delete P${i + 1}`} icon={<MdDelete />} size='xs' colorScheme='red' variant='ghost' position='absolute' top='4px' right='4px' opacity={0} _groupHover={{ opacity: 1 }} onClick={(e) => { e.stopPropagation(); deletePeriodForDate(selectedDate, i); }} />
                    </Box>
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        </Card>
      )}

      {view === 'week' && (() => {
        const d = new Date(selectedDate); const day = (d.getDay() + 6) % 7; const monday = new Date(d); monday.setDate(d.getDate() - day);
        const weekDays = [...Array(7)].map((_, i) => { const t = new Date(monday); t.setDate(monday.getDate() + i); return t; });
        return (
          <Card overflow="hidden">
            <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
              {cls} - Section {section} • Week of {monday.toDateString()}
            </Heading>
            <Box overflowX="auto">
              <Grid templateColumns={`120px repeat(${Math.max(1, periodLabels.length)}, 1fr)`} gap={2} p={4}>
                <GridItem />
                {periodLabels.map((p) => (
                  <GridItem key={p}>
                    <Text fontWeight="600" textAlign="center">{p}</Text>
                  </GridItem>
                ))}
                {weekDays.map((dateObj) => (
                  <React.Fragment key={fmt(dateObj)}>
                    <GridItem><Text fontWeight="600">{dayName(dateObj)}<br /><Text as='span' fontWeight='400' color={textColorSecondary}>{fmt(dateObj)}</Text></Text></GridItem>
                    {periodLabels.map((p, i) => (
                      <GridItem key={`${fmt(dateObj)}-${p}`}>
                        <Box role='group' position='relative' borderWidth="1px" borderRadius="md" p={3} textAlign="center" cursor='pointer' _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} onClick={() => { setSelectedDate(dateObj); openEditForDate(dateObj); }}>
                          <Text>{getScheduleForDate(dateObj)[i] || '-'}</Text>
                          <IconButton aria-label={`Delete ${p}`} icon={<MdDelete />} size='xs' colorScheme='red' variant='ghost' position='absolute' top='4px' right='4px' opacity={0} _groupHover={{ opacity: 1 }} onClick={(e) => { e.stopPropagation(); deletePeriodForDate(dateObj, i); }} />
                        </Box>
                      </GridItem>
                    ))}
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
          </Card>
        );
      })()}

      {view === 'month' && (
        <Card>
          <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            {cls} - Section {section} • {selectedDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </Heading>
          <Box p={4}>
            <Grid templateColumns="repeat(7, 1fr)" gap={2}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <GridItem key={d}><Text fontWeight='600' textAlign='center'>{d}</Text></GridItem>
              ))}
              {monthMatrix.map((week, wi) => week.map((d, i) => (
                <GridItem key={`${wi}-${i}`}>
                  <Box borderWidth='1px' borderRadius='md' p={2} h='90px' cursor='pointer' _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} onClick={() => { setSelectedDate(d); openEditForDate(d); }} opacity={d.getMonth() === selectedDate.getMonth() ? 1 : 0.5}>
                    <Text fontSize='sm' fontWeight='600'>{d.getDate()}</Text>
                    <Text color={textColorSecondary} fontSize='xs' mt={1}>{getScheduleForDate(d).filter(Boolean).length} periods</Text>
                  </Box>
                </GridItem>
              )))}
            </Grid>
          </Box>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Schedule • {fmt(selectedDate)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack mb={3}>
              <Text fontWeight='600'>Periods</Text>
              <Select maxW='120px' value={String(modalPeriodCount || (periodLabels.length || 6))} onChange={(e) => { const next = Number(e.target.value) || 0; setModalPeriodCount(next); setEditValues((prev) => { const arr = [...prev]; if (arr.length < next) { while (arr.length < next) arr.push(''); } else if (arr.length > next) { arr.length = next; } return arr; }); setEditRooms((prev) => { const arr = [...prev]; if (arr.length < next) { while (arr.length < next) arr.push(''); } else if (arr.length > next) { arr.length = next; } return arr; }); }}>
                {Array.from({ length: 12 }).map((_, i) => (<option key={i + 1} value={i + 1}>{i + 1}</option>))}
              </Select>
            </HStack>
            <Grid templateColumns='80px 1fr 160px 40px' gap={3}>
              {Array.from({ length: modalPeriodCount || (periodLabels.length || 6) }).map((_, idx) => (
                <React.Fragment key={`edit-${idx}`}>
                  <GridItem><Text fontWeight='600'>{`P${idx + 1}`}</Text></GridItem>
                  <GridItem>
                    <Input placeholder='Subject' value={editValues[idx] || ''} onChange={(e) => { const v = [...editValues]; v[idx] = e.target.value; setEditValues(v); }} />
                  </GridItem>
                  <GridItem>
                    <Input placeholder='Room (optional)' value={editRooms[idx] || ''} onChange={(e) => { const v = [...editRooms]; v[idx] = e.target.value; setEditRooms(v); }} />
                  </GridItem>
                  <GridItem display='flex' alignItems='center' justifyContent='center'>
                    <IconButton aria-label={`Delete P${idx + 1}`} size='sm' colorScheme='red' variant='ghost' icon={<MdDelete />} onClick={() => deletePeriodForDate(selectedDate, idx)} />
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button variant='outline' colorScheme='red' mr={3} leftIcon={<MdDelete />} onClick={() => deleteWholeDay(selectedDate)}>Delete Day</Button>
            <Button colorScheme='blue' onClick={async () => { try { const count = modalPeriodCount || (periodLabels.length || 6); const values = editValues.slice(0, count); const rooms = editRooms.slice(0, count); setScheduleForDate(selectedDate, values); await upsertBackendForDate(selectedDate, values, rooms); await fetchSchedules(); toast({ title: 'Timetable saved', status: 'success', duration: 2500, isClosable: true }); editDisc.onClose(); } catch (e) { toast({ title: 'Save failed', description: e?.message || 'Unable to save timetable', status: 'error', duration: 3500, isClosable: true }); } }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
