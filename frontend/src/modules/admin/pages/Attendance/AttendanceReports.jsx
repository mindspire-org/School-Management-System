import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  ButtonGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Button,
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
  Progress,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { MdAssessment, MdCalendarMonth, MdCheckCircle, MdCancel, MdAvTimer, MdFileDownload, MdRemoveRedEye, MdMoreVert } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import * as reportsApi from '../../../../services/api/reports';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AttendanceReports() {
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [range, setRange] = useState('this-month');
  const disc = useDisclosure();
  const editDisc = useDisclosure();
  const [selected, setSelected] = useState(null);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ present: 0, absent: 0, late: 0, total: 0, class: '' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const fetchingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const totals = useMemo(() => {
    const totalRecords = rows.reduce((acc, r) => acc + (r.present + r.absent + r.late), 0);
    const present = rows.reduce((acc, r) => acc + r.present, 0);
    const absent = rows.reduce((acc, r) => acc + r.absent, 0);
    const late = rows.reduce((acc, r) => acc + r.late, 0);
    const overall = totalRecords ? Math.round((present * 100) / totalRecords) : 0;
    return { overall, totalDays: totalRecords, present, absent, late };
  }, [rows]);

  const computeRange = (value) => {
    const now = new Date();
    let from = '', to = '';
    if (value === 'this-month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      from = start.toISOString().slice(0,10);
      to = new Date().toISOString().slice(0,10);
    } else if (value === 'last-month') {
      const start = new Date(now.getFullYear(), now.getMonth()-1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      from = start.toISOString().slice(0,10);
      to = end.toISOString().slice(0,10);
    } else if (value === 'last-90') {
      const start = new Date(now);
      start.setDate(now.getDate()-90);
      from = start.toISOString().slice(0,10);
      to = new Date().toISOString().slice(0,10);
    }
    return { from, to };
  };

  const loadReports = async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      setLoading(true);
      const params = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      };
      const [summary, byClass] = await Promise.all([
        reportsApi.attendanceSummary(params),
        reportsApi.attendanceByClass(params),
      ]);
      const items = Array.isArray(byClass?.items) ? byClass.items : (Array.isArray(byClass) ? byClass : []);
      const mapped = (items || []).map((i) => ({
        class: (i.class || '') + (i.section ? `-${i.section}` : ''),
        present: Number(i.present || 0),
        absent: Number(i.absent || 0),
        late: Number(i.late || 0),
        total: Number(i.total || 0),
      }));
      setRows(mapped);
    } catch (e) {
      const details = Array.isArray(e?.data?.errors) ? e.data.errors.map(x=>`${x.param}: ${x.msg}`).join(', ') : '';
      const msg = (e?.data?.message || e?.message || 'Failed to load reports') + (details ? ` — ${details}` : '');
      const id = 'attendance-reports-error';
      if (!toast.isActive(id)) toast({ id, title: 'Failed to load reports', description: msg, status: 'error' });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    const { from, to } = computeRange(range);
    setFromDate(from);
    setToDate(to);
  }, [range]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, fromDate, toDate]);

  const exportCSV = () => {
    const header = ['Class','Present','Absent','Late','Overall %'];
    const csvRows = rows.map(r => {
      const overall = (r.present + r.absent + r.late) ? Math.round((r.present * 100) / (r.present + r.absent + r.late)) : 0;
      return [r.class || '-', r.present, r.absent, r.late, overall];
    });
    const csv = [header, ...csvRows].map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'attendance_reports.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank'); if (!w) return;
    const styles = `<style>body{font-family:Arial;padding:16px;} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;font-size:12px} th{background:#f5f5f5;text-align:left}</style>`;
    const rowsHtml = rows.map(r=>{
      const total = r.present + r.absent + r.late;
      const overall = total ? Math.round((r.present*100)/total) : 0;
      return `<tr><td>${r.class||'-'}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.late}</td><td>${overall}%</td></tr>`;
    }).join('');
    w.document.write(`<html><head><title>Attendance Reports</title>${styles}</head><body><h2>Attendance Reports</h2><table><thead><tr><th>Class</th><th>Present</th><th>Absent</th><th>Late</th><th>Overall %</th></tr></thead><tbody>${rowsHtml}</tbody></table><script>window.onload=function(){window.print();setTimeout(()=>window.close(),300);}</script></body></html>`);
    w.document.close();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Header */}
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Attendance Reports</Heading>
          <Text color={textColorSecondary}>Insights and summaries across classes</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme="blue" onClick={exportPDF}>Download PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Overall %"
          value={`${totals.overall}%`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00b09b 0%,#96c93d 100%)' icon={<Icon as={MdAssessment} w='28px' h='28px' color='white' />} />}
          endContent={<Badge colorScheme='green'>{totals.overall >= 90 ? 'Excellent' : 'Good'}</Badge>}
        />
        <MiniStatistics
          name="Present Days"
          value={String(totals.present)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<Icon as={MdCheckCircle} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Absent Days"
          value={String(totals.absent)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdCancel} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Late Days"
          value={String(totals.late)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdAvTimer} w='28px' h='28px' color='white' />} />}
        />
      </SimpleGrid>

      {/* Filters */}
      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }}>
          <Select maxW='220px' value={range} onChange={(e) => setRange(e.target.value)}>
            <option value='this-month'>This Month</option>
            <option value='last-month'>Last Month</option>
            <option value='last-90'>Last 90 Days</option>
          </Select>
          <Input type='date' maxW='200px' />
          <Input type='date' maxW='200px' />
        </Flex>
      </Card>

      {/* Class Summary Table */}
      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Class</Th>
                <Th isNumeric>Present</Th>
                <Th isNumeric>Absent</Th>
                <Th isNumeric>Late</Th>
                <Th isNumeric>Overall</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row) => {
                const total = row.present + row.absent + row.late;
                const overall = total ? Math.round((row.present * 100) / total) : 0;
                return (
                  <Tr key={row.class + String(row.total)} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='500'>{row.class || '-'}</Text></Td>
                    <Td isNumeric><Badge colorScheme='green'>{row.present}</Badge></Td>
                    <Td isNumeric><Badge colorScheme='red'>{row.absent}</Badge></Td>
                    <Td isNumeric><Badge colorScheme='orange'>{row.late}</Badge></Td>
                    <Td isNumeric>
                      <Flex align='center' gap={3} justify='flex-end'>
                        <Text fontWeight='600'>{overall}%</Text>
                        <Box w='120px'>
                          <Progress value={overall} size='sm' colorScheme={overall >= 90 ? 'green' : overall >= 75 ? 'yellow' : 'red'} borderRadius='md' />
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Flex align='center' gap={1}>
                        <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected({ ...row, overall }); disc.onOpen(); }} />
                        <Menu>
                          <MenuButton as={IconButton} aria-label='More' icon={<MdMoreVert />} size='sm' variant='ghost' />
                          <MenuList>
                            <MenuItem onClick={()=>{ setSelected({ ...row, overall }); disc.onOpen(); }}>View Details</MenuItem>
                            <MenuItem onClick={()=>{ setSelected(row); setForm({ class: row.class, total: row.total, present: row.present, absent: row.absent, late: row.late }); editDisc.onOpen(); }}>Edit</MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={disc.isOpen} onClose={disc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Class Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Class</Text><Text>{selected.class}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Present</Text><Text>{selected.present} / {selected.total}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Absent</Text><Text>{selected.absent}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Late</Text><Text>{selected.late}</Text></Flex>
                <Flex justify='space-between'><Text fontWeight='600'>Overall</Text><Text>{selected.overall}%</Text></Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={disc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Class Summary</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Flex justify='space-between' mb={3}><Text fontWeight='600'>Class</Text><Text>{form.class}</Text></Flex>
              <NumberInput value={form.present} min={0} max={form.total} onChange={(v)=> setForm(f=>({ ...f, present: Number(v)||0 }))} mb={3}>
                <NumberInputField placeholder='Present' />
              </NumberInput>
              <NumberInput value={form.absent} min={0} max={form.total} onChange={(v)=> setForm(f=>({ ...f, absent: Number(v)||0 }))} mb={3}>
                <NumberInputField placeholder='Absent' />
              </NumberInput>
              <NumberInput value={form.late} min={0} max={form.total} onChange={(v)=> setForm(f=>({ ...f, late: Number(v)||0 }))}>
                <NumberInputField placeholder='Late' />
              </NumberInput>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRows(prev => prev.map(r => r.class===form.class ? { ...r, present: form.present, absent: form.absent, late: form.late } : r));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
