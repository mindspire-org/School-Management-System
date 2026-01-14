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
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Button,
  ButtonGroup,
  Checkbox,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdNotificationsActive, MdReportProblem, MdDone, MdWarningAmber, MdSearch, MdFileDownload, MdPictureAsPdf, MdRefresh, MdVisibility, MdMarkEmailRead, MdCheckCircle, MdAssignmentInd } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import * as alertsApi from '../../../../services/api/alerts';
import * as authApi from '../../../../services/api/auth';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AttendanceAlerts() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [active, setActive] = useState(null);
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const composeDisc = useDisclosure();
  const [users, setUsers] = useState([]);
  const [autoBackfilled, setAutoBackfilled] = useState(false);
  const [compose, setCompose] = useState({ message: '', uiSeverity: 'low', type: 'manual', role: 'student', targetUserId: '' });

  const stats = useMemo(() => {
    const active = alerts.filter((a) => String(a.status).toLowerCase() === 'active').length;
    const resolved = alerts.filter((a) => String(a.status).toLowerCase() === 'resolved').length;
    const today = new Date().toISOString().slice(0, 10);
    const newToday = alerts.filter((a) => String(a.createdAt || '').slice(0, 10) === today).length;
    return { active, resolved, newToday };
  }, [alerts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts.filter((a) =>
      (severity === 'all' || String(a.uiSeverity).toLowerCase() === severity) &&
      (status === 'all' || String(a.status).toLowerCase() === status) &&
      (!q || String(a.id).toLowerCase().includes(q) || String(a.type || '').toLowerCase().includes(q) || String(a.message || '').toLowerCase().includes(q))
    );
  }, [alerts, severity, status, query]);

  // Load recipients from backend by role (only real users joined with domain tables)
  useEffect(() => {
    if (!isAdmin || !composeDisc.isOpen) return;
    const loadRecipients = async () => {
      try {
        const res = await alertsApi.recipients({ role: compose.role });
        const list = Array.isArray(res?.items) ? res.items : [];
        setUsers(list);
        if (list.length === 0 && !autoBackfilled) {
          try {
            await authApi.backfillUsers({ role: compose.role });
            setAutoBackfilled(true);
            const res2 = await alertsApi.recipients({ role: compose.role });
            const list2 = Array.isArray(res2?.items) ? res2.items : [];
            setUsers(list2);
          } catch (_) { }
        }
      } catch (_) { }
    };
    loadRecipients();
  }, [isAdmin, composeDisc.isOpen, compose.role, autoBackfilled]);

  // Reset backfill attempt when role changes or modal opens
  useEffect(() => {
    if (composeDisc.isOpen) setAutoBackfilled(false);
  }, [compose.role, composeDisc.isOpen]);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAll = (checked) => {
    setSelected(checked ? filtered.map((a) => a.id) : []);
  };

  const mapUiToApiSeverity = (s) => s === 'high' ? 'critical' : s === 'medium' ? 'warning' : s === 'low' ? 'info' : undefined;
  const mapApiToUiSeverity = (s) => s === 'critical' ? 'High' : s === 'warning' ? 'Medium' : 'Low';

  const loadAlerts = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setLoading(true);
      const params = {
        severity: severity !== 'all' ? mapUiToApiSeverity(severity) : undefined,
        status: status !== 'all' ? status : undefined,
        q: isAdmin ? (query || undefined) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        pageSize: 200,
      };
      const res = isAdmin ? await alertsApi.list(params) : await alertsApi.listMine(params);
      const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
      const mapped = (items || []).map((a) => ({
        ...a,
        uiSeverity: mapApiToUiSeverity(String(a.severity || 'info').toLowerCase()),
        uiStatus: String(a.status || 'active').toLowerCase() === 'active' ? 'Active' : 'Resolved',
        dateText: String(a.createdAt || '').slice(0, 19).replace('T', ' '),
      }));
      setAlerts(mapped);
    } catch (_) {
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => { loadAlerts(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [severity, status, fromDate, toDate, isAdmin]);

  const markRead = async (ids) => {
    try {
      await alertsApi.markRead(ids);
      setAlerts((as) => as.map((a) => (ids.includes(a.id) ? { ...a, isRead: true } : a)));
      setSelected([]);
    } catch (_) { }
  };

  const resolve = async (ids) => {
    try {
      await alertsApi.resolve(ids);
      setAlerts((as) => as.map((a) => (ids.includes(a.id) ? { ...a, status: 'resolved', uiStatus: 'Resolved' } : a)));
      setSelected([]);
    } catch (_) { }
  };

  const openDetails = (a) => {
    setActive(a);
    onOpen();
  };

  const exportPDF = () => {
    const w = window.open('', '_blank'); if (!w) return;
    const styles = `<style>body{font-family:Arial;padding:16px;} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;font-size:12px} th{background:#f5f5f5;text-align:left}</style>`;
    const rowsHtml = filtered.map(a => {
      return `<tr><td>${a.id}</td><td>${a.type || ''}</td><td>${a.uiSeverity || ''}</td><td>${a.uiStatus || ''}</td><td>${a.dateText || ''}</td><td>${(a.message || '').replace(/\n/g, ' ')}</td></tr>`;
    }).join('');
    w.document.write(`<html><head><title>Attendance Alerts</title>${styles}</head><body><h2>Attendance Alerts</h2><table><thead><tr><th>ID</th><th>Type</th><th>Severity</th><th>Status</th><th>Date</th><th>Message</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();setTimeout(()=>window.close(),300);}</script></body></html>`);
    w.document.close();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Alerts</Heading>
          <Text color={textColorSecondary}>Proactive notifications on attendance patterns</Text>
        </Box>
        <ButtonGroup>
          {isAdmin && <Button colorScheme='blue' onClick={composeDisc.onOpen}>Send Alert</Button>}
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={loadAlerts} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue" onClick={() => {
            const header = ['ID', 'Type', 'Severity', 'Status', 'Date', 'Message'];
            const rows = filtered.map(a => [a.id, a.type || '', a.severity || '', a.status || '', String(a.createdAt || '').slice(0, 19).replace('T', ' '), (a.message || '').replace(/\n/g, ' ')]);
            const csv = [header, ...rows].map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'attendance_alerts.csv'; a.click(); URL.revokeObjectURL(url);
          }}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue" onClick={exportPDF}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard
          title="Active Alerts"
          value={String(stats.active)}
          icon={MdNotificationsActive}
          colorScheme="orange"
        />
        <StatCard
          title="New Today"
          value={String(stats.newToday)}
          icon={MdWarningAmber}
          colorScheme="blue"
        />
        <StatCard
          title="Resolved"
          value={String(stats.resolved)}
          icon={MdDone}
          colorScheme="green"
        />
      </SimpleGrid>

      {/* Filters */}
      <Card p={4} mb={5}>
        <Flex gap={3} wrap='wrap' align={{ md: 'center' }}>
          <InputGroup flex='1' minW='260px' maxW={{ base: '100%', md: '420px' }}>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.300' />
            </InputLeftElement>
            <Input placeholder='Search ID, type or message...' value={query} onChange={(e) => setQuery(e.target.value)} />
          </InputGroup>
          <Select w='200px' value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value='all'>All Severities</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </Select>
          <Select w='180px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='resolved'>Resolved</option>
          </Select>
          <Input type='date' w='180px' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type='date' w='180px' value={toDate} onChange={(e) => setToDate(e.target.value)} />
          {isAdmin && (
            <HStack ml='auto' flexShrink={0} whiteSpace='nowrap'>
              <Button size='sm' variant='outline' leftIcon={<MdMarkEmailRead />} onClick={() => markRead(selected)} isDisabled={selected.length === 0}>Mark Read</Button>
              <Button size='sm' colorScheme='green' leftIcon={<MdCheckCircle />} onClick={() => resolve(selected)} isDisabled={selected.length === 0}>Resolve</Button>
            </HStack>
          )}
        </Flex>
      </Card>

      {/* Table */}
      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selected.length === filtered.length && filtered.length > 0} isIndeterminate={selected.length > 0 && selected.length < filtered.length} onChange={(e) => selectAll(e.target.checked)} />
                </Th>
                <Th>ID</Th>
                <Th>Type</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Message</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((a) => (
                <Tr key={a.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Checkbox isChecked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} /></Td>
                  <Td><Badge>{a.id}</Badge></Td>
                  <Td><Text fontWeight='500'>{a.type}</Text></Td>
                  <Td><Badge colorScheme={a.uiSeverity === 'High' ? 'red' : a.uiSeverity === 'Medium' ? 'yellow' : 'blue'}>{a.uiSeverity}</Badge></Td>
                  <Td><Badge colorScheme={String(a.status).toLowerCase() === 'active' ? 'yellow' : 'green'}>{a.uiStatus}</Badge></Td>
                  <Td><Text color={textColorSecondary}>{a.dateText}</Text></Td>
                  <Td><Text>{a.message}</Text></Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View' icon={<MdVisibility />} size='sm' variant='ghost' onClick={() => openDetails(a)} />
                      {isAdmin && <IconButton aria-label='Mark Read' icon={<MdMarkEmailRead />} size='sm' variant='ghost' onClick={() => markRead([a.id])} />}
                      {isAdmin && <IconButton aria-label='Resolve' icon={<MdCheckCircle />} size='sm' variant='ghost' colorScheme='green' onClick={() => resolve([a.id])} />}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alert Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <Box>
                <HStack mb={3} spacing={3}>
                  <Badge>{active.id}</Badge>
                  <Badge colorScheme={active.uiSeverity === 'High' ? 'red' : active.uiSeverity === 'Medium' ? 'yellow' : 'blue'}>{active.uiSeverity}</Badge>
                  <Badge colorScheme={String(active.status).toLowerCase() === 'active' ? 'yellow' : 'green'}>{active.uiStatus}</Badge>
                </HStack>
                <Text fontWeight='600' mb={1}>{active.type}</Text>
                <Text mb={4} color={textColorSecondary}>{active.message}</Text>
                <Select placeholder='Assign to' mb={3} icon={<MdAssignmentInd />}>
                  <option>Admin</option>
                  <option>Class Teacher</option>
                  <option>Attendance Incharge</option>
                </Select>
                <Textarea placeholder='Add a note or response...' rows={4} />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>Close</Button>
            <Button leftIcon={<MdMarkEmailRead />} variant='outline' onClick={() => { if (active) markRead([active.id]); onClose(); }}>Mark Read</Button>
            <Button leftIcon={<MdCheckCircle />} colorScheme='green' ml={2} onClick={() => { if (active) resolve([active.id]); onClose(); }}>Resolve</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Compose / Send Alert (Admin) */}
      {isAdmin && (
        <Modal isOpen={composeDisc.isOpen} onClose={composeDisc.onClose} size='lg'>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Send Targeted Alert</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <Text mb={2} fontWeight='600'>Recipient</Text>
                <HStack mb={3} spacing={3}>
                  <Select maxW='200px' value={compose.role} onChange={(e) => setCompose(c => ({ ...c, role: e.target.value, targetUserId: '' }))}>
                    <option value='student'>Student</option>
                    <option value='teacher'>Teacher</option>
                    <option value='driver'>Driver</option>
                  </Select>
                  <Select placeholder='Select user' flex='1' value={compose.targetUserId} onChange={(e) => setCompose(c => ({ ...c, targetUserId: e.target.value }))}>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email} — {u.email}</option>
                    ))}
                  </Select>
                </HStack>
                <Text mb={2} fontWeight='600'>Severity & Type</Text>
                <HStack mb={3} spacing={3}>
                  <Select maxW='200px' value={compose.uiSeverity} onChange={(e) => setCompose(c => ({ ...c, uiSeverity: e.target.value }))}>
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                  </Select>
                  <Input placeholder='Type e.g. attendance, manual' value={compose.type} onChange={(e) => setCompose(c => ({ ...c, type: e.target.value }))} />
                </HStack>
                <Text mb={2} fontWeight='600'>Message</Text>
                <Textarea placeholder='Write the alert message...' rows={4} value={compose.message} onChange={(e) => setCompose(c => ({ ...c, message: e.target.value }))} />
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' mr={3} onClick={composeDisc.onClose}>Cancel</Button>
              <Button colorScheme='blue' onClick={async () => {
                try {
                  const sev = mapUiToApiSeverity(compose.uiSeverity);
                  const payload = { message: compose.message.trim(), severity: sev || 'info', type: compose.type?.trim() || null, targetUserId: compose.targetUserId ? Number(compose.targetUserId) : undefined };
                  if (!payload.message || !payload.targetUserId) return;
                  await alertsApi.create(payload);
                  composeDisc.onClose(); setCompose({ message: '', uiSeverity: 'low', type: 'manual', role: compose.role, targetUserId: '' });
                  loadAlerts();
                } catch (_) { }
              }}>Send</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
