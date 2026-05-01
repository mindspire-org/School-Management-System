import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  Button,
  Input,
  Badge,
  Select,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import Card from '../../../components/card/Card';
import * as teachersApi from '../../../services/api/teachers';

const toLocalISODate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return new Date().toISOString().slice(0, 10);
  const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export default function MyAttendance() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [date, setDate] = useState(() => toLocalISODate(new Date()));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState(null);
  const [teacher, setTeacher] = useState(null);

  const uiStatus = useMemo(() => {
    const st = String(record?.status || '').toLowerCase();
    const remarks = String(record?.remarks || '').toLowerCase();
    if (st === 'absent' && remarks === 'leave') return 'leave';
    if (st === 'present' || st === 'late' || st === 'absent') return st;
    return '';
  }, [record?.status, record?.remarks]);

  const statusColor = useMemo(() => {
    const st = uiStatus;
    if (st === 'present') return 'green';
    if (st === 'late') return 'orange';
    if (st === 'absent') return 'red';
    if (st === 'leave') return 'purple';
    return 'gray';
  }, [uiStatus]);

  const statusLabel = useMemo(() => {
    if (!uiStatus) return 'not marked';
    return uiStatus;
  }, [uiStatus]);

  useEffect(() => {
    let mounted = true;
    const loadSelf = async () => {
      try {
        const payload = await teachersApi.me();
        if (mounted) setTeacher(payload || null);
      } catch {
        if (mounted) setTeacher(null);
      }
    };
    loadSelf();
    return () => { mounted = false; };
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await teachersApi.getAttendance({ date });
      const rows = Array.isArray(res?.records) ? res.records : [];
      const found = teacher?.id
        ? rows.find((r) => String(r?.teacherId) === String(teacher.id))
        : rows[0];
      setRecord(found || null);
    } catch (e) {
      setRecord(null);
      toast({
        title: 'Failed to load attendance',
        description: e?.message || 'Request failed',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date, teacher?.id]);

  const save = async () => {
    try {
      if (!date) return;
      if (!uiStatus) {
        toast({ title: 'Please select a status', status: 'warning', duration: 2500, isClosable: true });
        return;
      }
      setSaving(true);
      const statusToSend = uiStatus === 'leave' ? 'leave' : uiStatus;
      const res = await teachersApi.markMyAttendance({ date, status: statusToSend });
      if (res?.record) setRecord(res.record);
      toast({ title: 'Attendance updated', status: 'success', duration: 2000, isClosable: true });
    } catch (e) {
      toast({ title: 'Failed to update attendance', description: e?.message || 'Request failed', status: 'error', duration: 3500, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>My Attendance</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {(teacher?.name || 'Teacher')}
        {teacher?.employeeId ? ` • ${teacher.employeeId}` : ''}
        {teacher?.department ? ` • ${teacher.department}` : ''}
      </Text>

      <Card p='16px' mb='16px'>
        <Flex justify='space-between' align='center' flexWrap='wrap' rowGap={3}>
          <HStack spacing={3}>
            <Input type='date' value={date} onChange={(e) => setDate(e.target.value)} maxW='180px' />
            <Button variant='outline' onClick={load} isLoading={loading}>Refresh</Button>
          </HStack>
          <HStack spacing={3}>
            {loading ? (
              <Spinner size='sm' />
            ) : (
              <Badge colorScheme={statusColor}>{statusLabel}</Badge>
            )}
          </HStack>
        </Flex>

        <Flex mt={4} justify='space-between' align='center' flexWrap='wrap' rowGap={3}>
          <HStack spacing={3}>
            <Select
              value={uiStatus || ''}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setRecord((prev) => (prev ? { ...prev, status: '', remarks: '' } : prev));
                  return;
                }
                if (v === 'leave') {
                  setRecord((prev) => ({
                    ...(prev || {}),
                    status: 'absent',
                    remarks: 'Leave',
                  }));
                } else {
                  setRecord((prev) => ({
                    ...(prev || {}),
                    status: v,
                    remarks: prev?.remarks === 'Leave' ? null : prev?.remarks,
                  }));
                }
              }}
              maxW='180px'
              isDisabled={loading}
              placeholder='Select status'
            >
              <option value='present'>Present</option>
              <option value='late'>Late</option>
              <option value='absent'>Absent</option>
              <option value='leave'>Leave</option>
            </Select>
            <Button colorScheme='green' onClick={save} isLoading={saving} isDisabled={loading}>
              Save
            </Button>
          </HStack>
        </Flex>
      </Card>

      <Card p='0'>
        <Table size='sm' variant='simple'>
          <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
            <Tr>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Check-In</Th>
              <Th>Check-Out</Th>
              <Th>Remarks</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{date}</Td>
              <Td><Badge colorScheme={statusColor}>{statusLabel}</Badge></Td>
              <Td>{record?.checkInTime || '-'}</Td>
              <Td>{record?.checkOutTime || '-'}</Td>
              <Td>{record?.remarks || '-'}</Td>
            </Tr>
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
}
