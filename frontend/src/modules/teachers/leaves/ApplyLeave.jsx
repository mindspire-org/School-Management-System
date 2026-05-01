import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Select,
  Input,
  Textarea,
  Button,
  Icon,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { MdRefresh, MdFileDownload, MdPrint, MdAdd, MdVisibility, MdEdit, MdDelete, MdEvent, MdSchedule, MdTimer } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import { leaveApi } from '../../../services/moduleApis';
import * as teachersApi from '../../../services/api/teachers';
import { useAuth } from '../../../contexts/AuthContext';

export default function ApplyLeave() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const toast = useToast();
  const { campusId } = useAuth();

  function toYMD(d) { const x = new Date(d.getTime() - d.getTimezoneOffset()*60000); return x.toISOString().slice(0,10); }

  const [form, setForm] = useState({ type: 'Sick Leave', from: toYMD(new Date()), to: toYMD(new Date()), reason: '' });
  const [rows, setRows] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [viewRow, setViewRow] = useState(null);
  const [me, setMe] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const {
    isOpen: isEditOpen,
    onOpen: openEdit,
    onClose: closeEdit
  } = useDisclosure();
  const [editForm, setEditForm] = useState({ type: 'Sick Leave', from: toYMD(new Date()), to: toYMD(new Date()), reason: '' });

  useEffect(() => {
    const loadMe = async () => {
      try {
        const profile = await teachersApi.me();
        setMe(profile);
      } catch (_) { setMe(null); }
    };
    loadMe();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await leaveApi.list({ campusId });
        const myId = me?.id;
        const mine = Array.isArray(data) ? data.filter(l => String(l.employeeId) === String(myId)) : [];
        const mapped = mine.map(l => {
          const from = l.startDate ? toYMD(new Date(l.startDate)) : '';
          const to = l.endDate ? toYMD(new Date(l.endDate)) : '';
          const d1 = from ? new Date(from) : null;
          const d2 = to ? new Date(to) : null;
          const days = (d1 && d2) ? Math.max(1, Math.round((d2 - d1) / 86400000) + 1) : 1;
          return { id: l.id, type: l.leaveType, from, to, days, status: l.status || 'Pending' };
        });
        setRows(mapped.sort((a,b)=> (new Date(b.from) - new Date(a.from))));
      } catch (_) {
        setRows([]);
      }
    };
    if (campusId && me?.id) load();
  }, [campusId, me?.id]);

  const submit = async () => {
    if (!me?.id) {
      toast({ title: 'Profile not ready', description: 'Cannot identify your employee profile.', status: 'warning' });
      return;
    }
    try {
      const payload = {
        employeeId: Number(me.id),
        employeeName: me.name || 'Unknown',
        leaveType: form.type,
        startDate: new Date(`${form.from}T00:00:00.000Z`).toISOString(),
        endDate: new Date(`${form.to}T00:00:00.000Z`).toISOString(),
        reason: form.reason || '',
        status: 'Pending',
        campusId,
      };
      await leaveApi.create(payload);
      toast({ title: 'Leave request submitted', description: 'Sent to Admin/Super Admin for approval.', status: 'success' });
      setForm({ ...form, reason: '' });
      // Reload
      const data = await leaveApi.list({ campusId });
      const mine = Array.isArray(data) ? data.filter(l => String(l.employeeId) === String(me.id)) : [];
      const mapped = mine.map(l => {
        const from = l.startDate ? toYMD(new Date(l.startDate)) : '';
        const to = l.endDate ? toYMD(new Date(l.endDate)) : '';
        const d1 = from ? new Date(from) : null;
        const d2 = to ? new Date(to) : null;
        const days = (d1 && d2) ? Math.max(1, Math.round((d2 - d1) / 86400000) + 1) : 1;
        return { id: l.id, type: l.leaveType, from, to, days, status: l.status || 'Pending' };
      });
      setRows(mapped.sort((a,b)=> (new Date(b.from) - new Date(a.from))));
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to submit request';
      toast({ title: 'Error', description: msg, status: 'error' });
    }
  };

  const startEdit = (row) => {
    setEditRow(row);
    setEditForm({ type: row.type, from: row.from, to: row.to, reason: row.reason || '' });
    openEdit();
  };

  const doUpdate = async () => {
    if (!editRow) return;
    try {
      const payload = {
        employeeId: Number(me.id),
        employeeName: me.name || 'Unknown',
        leaveType: editForm.type,
        startDate: new Date(`${editForm.from}T00:00:00.000Z`).toISOString(),
        endDate: new Date(`${editForm.to}T00:00:00.000Z`).toISOString(),
        reason: editForm.reason || '',
        campusId,
      };
      await leaveApi.update(editRow.id, payload);
      toast({ title: 'Leave request updated', status: 'success' });
      closeEdit();
      // reload
      const data = await leaveApi.list({ campusId });
      const mine = Array.isArray(data) ? data.filter(l => String(l.employeeId) === String(me.id)) : [];
      const mapped = mine.map(l => {
        const from = l.startDate ? toYMD(new Date(l.startDate)) : '';
        const to = l.endDate ? toYMD(new Date(l.endDate)) : '';
        const d1 = from ? new Date(from) : null;
        const d2 = to ? new Date(to) : null;
        const days = (d1 && d2) ? Math.max(1, Math.round((d2 - d1) / 86400000) + 1) : 1;
        return { id: l.id, type: l.leaveType, from, to, days, status: l.status || 'Pending', reason: l.reason || '' };
      });
      setRows(mapped.sort((a,b)=> (new Date(b.from) - new Date(a.from))));
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update request';
      toast({ title: 'Error', description: msg, status: 'error' });
    }
  };

  const doDelete = async (row) => {
    if (!row) return;
    if (!window.confirm('Delete this leave request?')) return;
    try {
      await leaveApi.delete(row.id);
      toast({ title: 'Leave request deleted', status: 'success' });
      // reload
      const data = await leaveApi.list({ campusId });
      const mine = Array.isArray(data) ? data.filter(l => String(l.employeeId) === String(me.id)) : [];
      const mapped = mine.map(l => {
        const from = l.startDate ? toYMD(new Date(l.startDate)) : '';
        const to = l.endDate ? toYMD(new Date(l.endDate)) : '';
        const d1 = from ? new Date(from) : null;
        const d2 = to ? new Date(to) : null;
        const days = (d1 && d2) ? Math.max(1, Math.round((d2 - d1) / 86400000) + 1) : 1;
        return { id: l.id, type: l.leaveType, from, to, days, status: l.status || 'Pending', reason: l.reason || '' };
      });
      setRows(mapped.sort((a,b)=> (new Date(b.from) - new Date(a.from))));
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to delete request';
      toast({ title: 'Error', description: msg, status: 'error' });
    }
  };

  const kpis = useMemo(() => ({
    totalTaken: rows.filter(r => r.status === 'Approved').reduce((s, r) => s + r.days, 0),
    pending: rows.filter(r => r.status === 'Pending').length,
    remaining: 20 - rows.filter(r => r.status === 'Approved').reduce((s, r) => s + r.days, 0),
  }), [rows]);

  const chartData = useMemo(() => ([{ name: 'Days', data: [
    rows.filter(r => r.type==='Sick' && r.status==='Approved').reduce((s,r)=>s+r.days,0),
    rows.filter(r => r.type==='Casual' && r.status==='Approved').reduce((s,r)=>s+r.days,0),
    rows.filter(r => r.type==='Annual' && r.status==='Approved').reduce((s,r)=>s+r.days,0),
  ] }]), [rows]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: ['Sick','Casual','Annual'] }, colors: ['#2B6CB0'] }), []);

  const statusDistribution = useMemo(() => {
    const map = { Approved: 0, Pending: 0, Rejected: 0 };
    rows.forEach(r => { map[r.status] = (map[r.status] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [rows]);

  const exportCSV = () => {
    const header = ['Type','From','To','Days','Status'];
    const csv = [header, ...rows.map(r => [r.type, r.from, r.to, r.days, r.status])]
      .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'leave_requests.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Apply Leave</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Submit a new leave request</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdEvent color='white' />} />} name='Days Taken' value={String(kpis.totalTaken)} trendData={[1,2,2,3,3,4]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdSchedule color='white' />} />} name='Pending' value={String(kpis.pending)} trendData={[1,1,2,1,2,1]} trendColor='#FD7853' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdTimer color='white' />} />} name='Remaining' value={String(kpis.remaining)} trendData={[15,16,17,18,19,20]} trendColor='#01B574' />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <VStack spacing={3} align='stretch'>
          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <Select value={form.type} onChange={e=>setForm(s=>({...s,type:e.target.value}))} maxW='200px' size='sm'>
              <option>Sick Leave</option>
              <option>Marriage Leave</option>
              <option>Urgent Leave</option>
              <option>Short Leave</option>
              <option>Emergency Leave</option>
              <option>Casual Leave</option>
              <option>Annual Leave</option>
            </Select>
            <Input type='date' value={form.from} onChange={e=>setForm(s=>({...s,from:e.target.value}))} size='sm' maxW='180px' />
            <Input type='date' value={form.to} onChange={e=>setForm(s=>({...s,to:e.target.value}))} size='sm' maxW='180px' />
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdAdd}/>} onClick={submit}>Submit</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={()=>setForm({ type:'Sick Leave', from: toYMD(new Date()), to: toYMD(new Date()), reason:'' })}>Reset</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint}/>} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export CSV</Button>
          </HStack>
          <Textarea placeholder='Reason' value={form.reason} onChange={e=>setForm(s=>({...s,reason:e.target.value}))} rows={3} />
        </VStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead position='sticky' top={0} bg={headerBg} zIndex={1} boxShadow='sm'>
            <Tr>
              <Th>Type</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Days</Th>
              <Th>Status</Th>
              <Th textAlign='right'>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map(r => (
              <Tr key={r.id} _hover={{ bg: hoverBg }}>
                <Td>{r.type}</Td>
                <Td>{r.from}</Td>
                <Td>{r.to}</Td>
                <Td>{r.days}</Td>
                <Td><Badge colorScheme={r.status==='Approved'?'green':r.status==='Pending'?'orange':'red'}>{r.status}</Badge></Td>
                <Td>
                  <HStack justify='flex-end' spacing={1}>
                    <IconButton aria-label='View' icon={<MdVisibility/>} size='sm' variant='ghost' onClick={()=>{ setViewRow(r); onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit/>} size='sm' variant='ghost' isDisabled={r.status!=='Pending'} onClick={()=> startEdit(r)} />
                    <IconButton aria-label='Delete' icon={<MdDelete/>} size='sm' variant='ghost' colorScheme='red' isDisabled={r.status!=='Pending'} onClick={()=> doDelete(r)} />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Approved Days by Type</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Request Status Distribution</Text>
          <PieChart height={240} chartData={statusDistribution.values} chartOptions={{ labels: statusDistribution.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewRow && (
              <VStack align='start' spacing={2} fontSize='sm'>
                <HStack><Text fontWeight='600'>Type:</Text><Text>{viewRow.type}</Text></HStack>
                <HStack><Text fontWeight='600'>From:</Text><Text>{viewRow.from}</Text></HStack>
                <HStack><Text fontWeight='600'>To:</Text><Text>{viewRow.to}</Text></HStack>
                <HStack><Text fontWeight='600'>Days:</Text><Text>{viewRow.days}</Text></HStack>
                <HStack><Text fontWeight='600'>Status:</Text><Badge>{viewRow.status}</Badge></HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={closeEdit} isCentered size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Leave</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select value={editForm.type} onChange={e=>setEditForm(f=>({ ...f, type: e.target.value }))}>
                <option>Sick Leave</option>
                <option>Marriage Leave</option>
                <option>Urgent Leave</option>
                <option>Short Leave</option>
                <option>Emergency Leave</option>
                <option>Casual Leave</option>
                <option>Annual Leave</option>
                <option>Unpaid Leave</option>
              </Select>
              <HStack>
                <Input type='date' value={editForm.from} onChange={e=>setEditForm(f=>({ ...f, from: e.target.value }))} />
                <Input type='date' value={editForm.to} onChange={e=>setEditForm(f=>({ ...f, to: e.target.value }))} />
              </HStack>
              <Textarea placeholder='Reason' value={editForm.reason} onChange={e=>setEditForm(f=>({ ...f, reason: e.target.value }))} rows={3} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeEdit}>Cancel</Button>
            <Button colorScheme='blue' onClick={doUpdate}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
