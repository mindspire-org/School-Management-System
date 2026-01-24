import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  Select,
  Input,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  TableContainer,
} from '@chakra-ui/react';
import { MdSearch, MdRefresh, MdFileDownload, MdSave } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import { getStatusColor } from '../../../../utils/helpers';
import * as attendanceApi from '../../../../services/api/attendance';
import * as studentsApi from '../../../../services/api/students';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AdminDailyAttendance() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const payload = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        const classes = Array.from(new Set((rows || []).map((s) => s.class).filter(Boolean)));
        const sections = Array.from(new Set((rows || []).map((s) => s.section).filter(Boolean)));
        setClassOptions(classes);
        setSectionOptions(sections);
      } catch (_) {}
    };
    if (!authLoading && isAuthenticated) loadOptions();
  }, [authLoading, isAuthenticated]);

  const kpis = useMemo(() => {
    const subset = items.map((s) => ({ id: s.id, st: statuses[s.id] }));
    const present = subset.filter((x) => x.st === 'present').length;
    const absent = subset.filter((x) => x.st === 'absent').length;
    const late = subset.filter((x) => x.st === 'late').length;
    return { present, absent, late, total: subset.length };
  }, [items, statuses]);

  const exportCSV = () => {
    const header = ['Date', 'Name', 'Roll', 'Class', 'Section', 'Status'];
    const rows = items.map((s) => [date, s.name, s.rollNumber || '', s.class || '', s.section || '', (statuses[s.id] || '-')]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadDaily = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setLoading(true);
      const data = await attendanceApi.listDaily({ date, class: cls || undefined, section: section || undefined, q: q || undefined });
      const rows = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setItems(rows);
      const st = {};
      rows.forEach((r) => {
        st[r.id] = r.status || 'present';
      });
      setStatuses(st);
    } catch (e) {
      const details = Array.isArray(e?.data?.errors) ? e.data.errors.map(x=>`${x.param}: ${x.msg}`).join(', ') : '';
      const msg = (e?.data?.message || e?.message || 'Failed to load daily attendance') + (details ? ` — ${details}` : '');
      const id = 'daily-attendance-error';
      if (!toast.isActive(id)) toast({ id, title: 'Failed to load daily attendance', description: msg, status: 'error' });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadDaily();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, date, cls, section]);

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const records = items.map((s) => ({ studentId: s.id, status: statuses[s.id] || 'present' }));
      await attendanceApi.upsertDaily({ date, records });
      toast({ title: 'Attendance saved', description: `${kpis.present} present, ${kpis.absent} absent, ${kpis.late} late`, status: 'success' });
      await loadDaily();
    } catch (e) {
      toast({ title: 'Failed to save attendance', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Daily Attendance</Text>
      <Text fontSize='md' color='gray.500' mb='16px'>Filter by class/section, mark statuses, and save.</Text>

      <Card p='16px' mb='16px'>
        <Flex gap={3} flexWrap='wrap' justify='space-between' align='center'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Input type='date' value={date} onChange={(e)=>setDate(e.target.value)} size='sm' maxW='180px' />
            <Select placeholder='Class' value={cls} onChange={(e)=>setCls(e.target.value)} size='sm' maxW='160px'>
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select placeholder='Section' value={section} onChange={(e)=>setSection(e.target.value)} size='sm' maxW='160px'>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <HStack>
              <Input placeholder='Search student' value={q} onChange={(e)=>setQ(e.target.value)} size='sm' maxW='220px' />
              <IconButton aria-label='Search' icon={<MdSearch />} size='sm' onClick={loadDaily} />
            </HStack>
          </HStack>
          <HStack>
            <Button leftIcon={<MdRefresh />} size='sm' variant='outline' onClick={()=>{ setQ(''); loadDaily(); }}>Refresh</Button>
            <Button leftIcon={<MdFileDownload />} size='sm' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
            <Button leftIcon={<MdSave />} size='sm' colorScheme='green' onClick={saveAttendance} isLoading={saving} isDisabled={items.length===0}>Save</Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0'>
        <Flex justify='space-between' align='center' p='12px' borderBottom='1px solid' borderColor='gray.100'>
          <Text fontWeight='600'>Students</Text>
          <Text fontSize='sm' color='gray.500'>{items.length} found</Text>
        </Flex>
        <TableContainer>
          <Table size='sm' variant='striped' colorScheme='gray'>
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Roll</Th>
                <Th>Class</Th>
                <Th>Status</Th>
                <Th isNumeric>Attendance %</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <Text fontWeight='600'>{s.name}</Text>
                    <Text fontSize='xs' color='gray.500'>{s.email}</Text>
                  </Td>
                  <Td>{s.rollNumber || '-'}</Td>
                  <Td>{(s.class || '-') + (s.section ? '-' + s.section : '')}</Td>
                  <Td>
                    <Select size='sm' value={statuses[s.id] || 'present'} onChange={(e)=>setStatuses((prev)=>({ ...prev, [s.id]: e.target.value }))} maxW='140px'>
                      <option value='present'>Present</option>
                      <option value='absent'>Absent</option>
                      <option value='late'>Late</option>
                    </Select>
                  </Td>
                  <Td isNumeric>
                    <Badge colorScheme={s.attendance >= 90 ? 'green' : s.attendance >= 80 ? 'yellow' : 'red'}>{s.attendance || 0}%</Badge>
                  </Td>
                </Tr>
              ))}
              {items.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Box p='12px' textAlign='center' color='gray.500'>{loading ? 'Loading...' : 'No students found.'}</Box>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
