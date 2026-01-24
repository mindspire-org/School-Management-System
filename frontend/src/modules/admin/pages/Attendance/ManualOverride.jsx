import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Button,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdBuild, MdPendingActions, MdDoneAll, MdSave, MdPeople, MdSearch, MdRefresh } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import * as attendanceApi from '../../../../services/api/attendance';
import * as studentsApi from '../../../../services/api/students';
import { useAuth } from '../../../../contexts/AuthContext';

export default function ManualOverride() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('gray.50', 'gray.800');

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [overrides, setOverrides] = useState({}); // { [id]: { status, remarks } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const fetchingRef = useRef(false);

  // Load dropdown options
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

  // Load list for selected date/class/section
  const loadDaily = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setLoading(true);
      const data = await attendanceApi.listDaily({ date, class: cls || undefined, section: section || undefined, q: q || undefined });
      const rows = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setItems(rows);
      const m = {};
      rows.forEach((r) => { m[r.id] = { status: r.status || 'present', remarks: r.remarks || '' }; });
      setOverrides(m);
    } catch (e) {
      const details = Array.isArray(e?.data?.errors) ? e.data.errors.map(x=>`${x.param}: ${x.msg}`).join(', ') : '';
      const msg = (e?.data?.message || e?.message || 'Failed to load records') + (details ? ` — ${details}` : '');
      const id = 'manual-override-load-error';
      if (!toast.isActive(id)) toast({ id, title: 'Failed to load', description: msg, status: 'error' });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) loadDaily();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, date, cls, section]);

  const stats = useMemo(() => {
    const total = items.length;
    const counts = { present: 0, absent: 0, late: 0 };
    items.forEach((s) => {
      const st = overrides[s.id]?.status || 'present';
      if (counts[st] !== undefined) counts[st] += 1;
    });
    const changed = items.filter((s) => (overrides[s.id]?.status || 'present') !== (s.status || 'present') || (overrides[s.id]?.remarks || '') !== (s.remarks || ''));
    return { total, present: counts.present, absent: counts.absent, late: counts.late, changed: changed.length };
  }, [items, overrides]);

  const updateStatus = (id, status) => setOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), status } }));
  const updateRemarks = (id, remarks) => setOverrides((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), remarks } }));

  const saveOverrides = async () => {
    try {
      setSaving(true);
      const records = items.map((s) => {
        const r = { studentId: Number(s.id), status: overrides[s.id]?.status || 'present' };
        const rm = (overrides[s.id]?.remarks || '').trim();
        if (rm) r.remarks = rm; // omit if empty to pass validation
        return r;
      });
      await attendanceApi.upsertDaily({ date, records });
      toast({ title: 'Overrides applied', description: `${stats.changed} changes saved`, status: 'success' });
      await loadDaily();
    } catch (e) {
      const details = Array.isArray(e?.data?.errors) ? e.data.errors.map(x=>`${x.param}: ${x.msg}`).join(', ') : '';
      const msg = (e?.data?.message || e?.message || 'Failed to save overrides') + (details ? ` — ${details}` : '');
      toast({ title: 'Failed to save overrides', description: msg, status: 'error' });
    } finally { setSaving(false); }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Manual Override</Heading>
          <Text color={textColorSecondary}>Correct attendance entries with status and remarks</Text>
        </Box>
        <Button leftIcon={<MdSave />} colorScheme="blue" onClick={saveOverrides} isLoading={saving} isDisabled={items.length===0}>
          Save Changes
        </Button>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Total"
          value={String(stats.total)}
          startContent={
            <IconBox w='56px' h='56px' bg='linear-gradient(90deg,#4facfe 0%,#00f2fe 100%)' icon={<Icon as={MdPeople} w='28px' h='28px' color='white' />} />
          }
        />
        <MiniStatistics
          name="Present"
          value={String(stats.present)}
          startContent={
            <IconBox w='56px' h='56px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdDoneAll} w='28px' h='28px' color='white' />} />
          }
        />
        <MiniStatistics
          name="Absent"
          value={String(stats.absent)}
          startContent={
            <IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FF6A88 0%,#FF99AC 100%)' icon={<Icon as={MdPendingActions} w='28px' h='28px' color='white' />} />
          }
        />
        <MiniStatistics
          name="Edited"
          value={String(stats.changed)}
          startContent={
            <IconBox w='56px' h='56px' bg='linear-gradient(90deg,#8360c3 0%,#2ebf91 100%)' icon={<Icon as={MdBuild} w='28px' h='28px' color='white' />} />
          }
        />
      </SimpleGrid>

      {/* Filters */}
      <Card p={4} mb={4}>
        <Flex gap={3} wrap='wrap' align='center' justify='space-between'>
          <Flex gap={3} wrap='wrap'>
            <Input type='date' value={date} onChange={(e)=>setDate(e.target.value)} maxW='180px' size='sm' />
            <Select placeholder='Class' value={cls} onChange={(e)=>setCls(e.target.value)} maxW='160px' size='sm'>
              {classOptions.map((c)=>(<option key={c} value={c}>{c}</option>))}
            </Select>
            <Select placeholder='Section' value={section} onChange={(e)=>setSection(e.target.value)} maxW='160px' size='sm'>
              {sectionOptions.map((s)=>(<option key={s} value={s}>{s}</option>))}
            </Select>
            <Flex gap={2} align='center'>
              <Input placeholder='Search student' value={q} onChange={(e)=>setQ(e.target.value)} size='sm' maxW='240px' />
              <Button size='sm' leftIcon={<MdSearch />} onClick={loadDaily}>Search</Button>
            </Flex>
          </Flex>
          <Button size='sm' variant='outline' leftIcon={<MdRefresh />} onClick={loadDaily} isLoading={loading}>Refresh</Button>
        </Flex>
      </Card>

      {/* Table */}
      <Card p={0}>
        <Box overflowX='auto'>
          <Table variant='simple' size='sm'>
            <Thead bg={headerBg}>
              <Tr>
                <Th>Student</Th>
                <Th>Roll</Th>
                <Th>Class</Th>
                <Th width='180px'>Status</Th>
                <Th>Remarks</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((s) => (
                <Tr key={s.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td>
                    <Text fontWeight='600'>{s.name}</Text>
                    <Text fontSize='xs' color={textColorSecondary}>{s.email}</Text>
                  </Td>
                  <Td>{s.rollNumber || '-'}</Td>
                  <Td><Badge colorScheme='blue'>{s.class}{s.section?'-'+s.section:''}</Badge></Td>
                  <Td>
                    <Select value={overrides[s.id]?.status || 'present'} onChange={(e)=>updateStatus(s.id, e.target.value)} maxW='160px'>
                      <option value='present'>Present</option>
                      <option value='absent'>Absent</option>
                      <option value='late'>Late</option>
                    </Select>
                  </Td>
                  <Td>
                    <Input placeholder='Add remarks (optional)' value={overrides[s.id]?.remarks || ''} onChange={(e)=>updateRemarks(s.id, e.target.value)} maxW='320px' />
                  </Td>
                </Tr>
              ))}
              {items.length === 0 && (
                <Tr>
                  <Td colSpan={5}>
                    <Box p='12px' textAlign='center' color={textColorSecondary}>{loading ? 'Loading...' : 'No records found.'}</Box>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
