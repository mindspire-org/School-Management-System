import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  Button,
  Input,
  Badge,
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

export default function MyAttendance() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [teacher, setTeacher] = useState(null);

  const statusColor = useMemo(() => {
    const st = String(record?.status || '').toLowerCase();
    if (st === 'present') return 'green';
    if (st === 'late') return 'orange';
    if (st === 'absent') return 'red';
    return 'gray';
  }, [record?.status]);

  useEffect(() => {
    let mounted = true;
    const loadSelf = async () => {
      try {
        const payload = await teachersApi.list({ pageSize: 1 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        if (mounted) setTeacher(rows?.[0] || null);
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
      setRecord(rows[0] || null);
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
  }, [date]);

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
              <Badge colorScheme={statusColor}>{record?.status || 'not marked'}</Badge>
            )}
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
              <Td><Badge colorScheme={statusColor}>{record?.status || 'not marked'}</Badge></Td>
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
