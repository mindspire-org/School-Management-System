import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
  Input,
  Select,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { MdDownload, MdRefresh } from 'react-icons/md';
import jsPDF from 'jspdf';
import Card from '../../../../components/card/Card';
import { useAuth } from '../../../../contexts/AuthContext';
import { qrAttendanceApi } from '../../../../services/api';

const normalizeType = (t) => {
  const v = String(t || '').toLowerCase();
  if (v === 'student') return 'Student';
  if (v === 'teacher' || v === 'staff' || v === 'employee') return 'Teacher';
  return '';
};

const formatDateTime = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleString();
};

const safeFilePart = (v) => String(v || '').replace(/[^a-z0-9\-_. ]/gi, '').trim().replace(/\s+/g, '_');

export default function QRAttendanceLogs({
  defaultAttendanceType = 'all',
  lockType = false,
} = {}) {
  const toast = useToast();
  const { campusId } = useAuth();

  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [attendanceType, setAttendanceType] = useState(defaultAttendanceType);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setAttendanceType(defaultAttendanceType);
  }, [defaultAttendanceType]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        attendanceType: attendanceType === 'all' ? undefined : attendanceType,
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
      };
      const data = await qrAttendanceApi.list(params);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({
        title: 'Failed to load logs',
        description: e?.message || 'Request failed',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [attendanceType, fromDate, toDate, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, campusId]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter((r) => {
      const pid = r?.personId != null ? String(r.personId) : '';
      const name = String(r?.personName || '').toLowerCase();
      const type = String(r?.attendanceType || '').toLowerCase();
      const markedBy = String(r?.markedBy || '').toLowerCase();
      return pid.includes(s) || name.includes(s) || type.includes(s) || markedBy.includes(s);
    });
  }, [rows, search]);

  const exportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    const now = new Date();
    const typeLabel = attendanceType === 'all' ? 'All' : attendanceType;
    const period = [fromDate || null, toDate || null].filter(Boolean).join(' to ') || 'All';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('QR Attendance Logs', margin, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Campus ID: ${campusId ?? '—'}`, margin, 70);
    doc.text(`Type: ${String(typeLabel).toUpperCase()}   |   Period: ${period}`, margin, 86);
    doc.text(`Generated: ${now.toLocaleString()}`, margin, 102);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 114, pageWidth - margin, 114);

    const cols = [
      { label: 'When', w: 140 },
      { label: 'Type', w: 60 },
      { label: 'ID', w: 48 },
      { label: 'Name', w: 140 },
      { label: 'Status', w: 60 },
      { label: 'Marked By', w: 80 },
    ];

    let y = 136;

    const drawHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      let x = margin;
      cols.forEach((c) => {
        doc.text(c.label, x, y);
        x += c.w;
      });
      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 6, pageWidth - margin, y + 6);
      y += 18;
    };

    drawHeader();

    const list = filtered.slice().sort((a, b) => {
      const ad = String(a?.date || a?.createdAt || '');
      const bd = String(b?.date || b?.createdAt || '');
      return ad < bd ? 1 : -1;
    });

    for (const r of list) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = 56;
        drawHeader();
      }
      const when = formatDateTime(r?.date || r?.createdAt);
      const type = normalizeType(r?.attendanceType) || String(r?.attendanceType || '');
      const pid = r?.personId != null ? String(r.personId) : '';
      const name = String(r?.personName || '').slice(0, 26);
      const status = String(r?.status || '').toUpperCase();
      const markedBy = String(r?.markedBy || '').slice(0, 14);

      const cells = [when, type, pid, name, status, markedBy];
      doc.setFontSize(8);
      let x = margin;
      cells.forEach((val, idx) => {
        doc.text(String(val || '—'), x, y);
        x += cols[idx].w;
      });
      y += 16;
    }

    doc.save(`QR_Attendance_Logs_${safeFilePart(period)}_${safeFilePart(typeLabel)}.pdf`);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
        <Box>
          <Heading as="h3" size="lg" mb={1}>QR Attendance Logs</Heading>
          <Text color={textColorSecondary}>View and export attendance recorded via QR sessions and admin marking</Text>
        </Box>
        <HStack spacing={2} flexWrap="wrap">
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={fetchLogs} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdDownload />} colorScheme="blue" onClick={exportPdf} isDisabled={filtered.length === 0}>Export PDF</Button>
        </HStack>
      </Flex>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <Select
            maxW="200px"
            value={attendanceType}
            onChange={(e) => setAttendanceType(e.target.value)}
            isDisabled={lockType}
          >
            {!lockType && <option value="all">All Types</option>}
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </Select>
          <HStack>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} maxW="170px" />
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} maxW="170px" />
          </HStack>
          <Input
            placeholder="Search (name, id, type, marked by)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxW={{ base: '100%', md: '320px' }}
          />
        </Flex>
      </Card>

      <Card>
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Date/Time</Th>
                <Th>Type</Th>
                <Th>Person</Th>
                <Th>Status</Th>
                <Th>Marked By</Th>
                <Th>QR Code</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10}>
                    <Spinner />
                  </Td>
                </Tr>
              ) : filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={10} color={textColorSecondary}>
                    No records found
                  </Td>
                </Tr>
              ) : (
                filtered.map((r) => (
                  <Tr key={r.id} borderBottom={`1px solid ${borderColor}`}>
                    <Td>{formatDateTime(r?.date || r?.createdAt)}</Td>
                    <Td>
                      <Badge colorScheme={String(r?.attendanceType || '').toLowerCase() === 'student' ? 'blue' : 'purple'}>
                        {normalizeType(r?.attendanceType) || r?.attendanceType}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontWeight="600">{r?.personName || '—'}</Text>
                      <Text fontSize="xs" color={textColorSecondary}>ID: {r?.personId ?? '—'}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={String(r?.status || '').toLowerCase() === 'present' ? 'green' : 'orange'}>
                        {r?.status || '—'}
                      </Badge>
                    </Td>
                    <Td>{r?.markedBy || '—'}</Td>
                    <Td maxW="260px">
                      <Text fontSize="xs" noOfLines={1} title={r?.qrCode || ''}>
                        {r?.qrCode || '—'}
                      </Text>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
