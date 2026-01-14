import React, { useState, useMemo } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup,
  IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select,
  Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, NumberInput, NumberInputField, Spinner, useToast, Alert, AlertIcon
} from '@chakra-ui/react';
import { MdWork, MdPeople, MdLocalShipping, MdAddCircle, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import { FaChalkboardTeacher, FaTruck } from 'react-icons/fa';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import BarChart from '../../../../components/charts/BarChart';
import PieChart from '../../../../components/charts/PieChart';
import UserSelector from './components/UserSelector';
import NoUsersWarning from './components/NoUsersWarning';
import { useFinanceUsers, usePayrollSummary } from '../../../../hooks/useFinanceUsers';
import { driversApi } from '../../../../services/financeApi';
import * as teacherApi from '../../../../services/api/teachers';

export default function Payroll() {
  const toast = useToast();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  // State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(null);

  // Modals
  const viewDisc = useDisclosure();
  const createDisc = useDisclosure();

  // Create form
  const [createForm, setCreateForm] = useState({
    role: 'teacher',
    user: null,
    periodMonth: '',
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
    bonuses: 0,
    notes: '',
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // Hooks
  const { loading: usersLoading, hasUsers, counts } = useFinanceUsers();
  const {
    loading: payrollLoading,
    payroll,
    total,
    refresh: refreshPayroll
  } = usePayrollSummary({
    role: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    periodMonth: monthFilter || undefined,
    page,
    pageSize
  });

  const loading = usersLoading || payrollLoading;

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return payroll;
    const s = search.toLowerCase();
    return payroll.filter(r =>
      r.userName?.toLowerCase().includes(s) ||
      r.role?.toLowerCase().includes(s)
    );
  }, [payroll, search]);

  // Stats
  const stats = useMemo(() => ({
    total: filtered.reduce((s, r) => s + Number(r.totalAmount || 0), 0),
    pending: filtered.filter(r => r.status === 'pending').length,
    teachersTotal: filtered.filter(r => r.role === 'teacher').reduce((s, r) => s + Number(r.totalAmount || 0), 0),
    driversTotal: filtered.filter(r => r.role === 'driver').reduce((s, r) => s + Number(r.totalAmount || 0), 0),
  }), [filtered]);

  const byRole = useMemo(() => ({
    labels: ['Teachers', 'Drivers'],
    values: [
      filtered.filter(r => r.role === 'teacher').length,
      filtered.filter(r => r.role === 'driver').length
    ]
  }), [filtered]);

  // Handlers
  const handleCreateOpen = () => {
    const hasStaff = counts.teachers > 0 || counts.drivers > 0;
    if (!hasStaff) {
      toast({
        title: 'No staff available',
        description: 'Please add a Teacher or Driver first.',
        status: 'warning',
        duration: 4000,
      });
      return;
    }
    setCreateForm({
      role: counts.teachers > 0 ? 'teacher' : 'driver',
      user: null,
      periodMonth: new Date().toISOString().slice(0, 7),
      baseSalary: 0,
      allowances: 0,
      deductions: 0,
      bonuses: 0,
      notes: '',
    });
    setFormError('');
    createDisc.onOpen();
  };

  const computeNet = (f) => Math.max(0, (Number(f.baseSalary) || 0) + (Number(f.allowances) || 0) + (Number(f.bonuses) || 0) - (Number(f.deductions) || 0));

  const handleCreate = async () => {
    if (!createForm.user) {
      setFormError('Please select an employee');
      return;
    }
    if (!createForm.periodMonth) {
      setFormError('Please select a month');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      if (createForm.role === 'teacher') {
        await teacherApi.createPayroll({
          teacherId: createForm.user.id,
          periodMonth: createForm.periodMonth,
          baseSalary: Number(createForm.baseSalary),
          allowances: Number(createForm.allowances),
          deductions: Number(createForm.deductions),
          bonuses: Number(createForm.bonuses),
          notes: createForm.notes,
        });
      } else {
        await driversApi.createPayroll(createForm.user.id, {
          periodMonth: createForm.periodMonth + '-01',
          baseSalary: Number(createForm.baseSalary),
          allowances: Number(createForm.allowances),
          deductions: Number(createForm.deductions),
          bonuses: Number(createForm.bonuses),
          notes: createForm.notes,
        });
      }

      toast({ title: 'Payroll created successfully', status: 'success', duration: 3000 });
      createDisc.onClose();
      refreshPayroll();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create payroll');
    } finally {
      setCreating(false);
    }
  };

  const exportCSV = () => {
    const header = ['ID', 'Month', 'Employee', 'Role', 'Basic', 'Allowances', 'Deductions', 'Bonuses', 'Net', 'Status'];
    const data = filtered.map(r => [
      r.id, r.periodMonth?.slice(0, 7), r.userName, r.role,
      r.baseSalary, r.allowances, r.deductions, r.bonuses,
      r.totalAmount, r.status
    ]);
    const csv = [header, ...data].map(a => a.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'payroll.csv';
    a.click();
  };

  const releasePayslip = (row) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Payslip</title>
      <style>body{font-family:Arial,sans-serif;padding:24px}.row{margin:4px 0}</style></head><body>
      <h1>Payslip</h1>
      <div class='row'><strong>Employee:</strong> ${row.userName} (${row.role})</div>
      <div class='row'><strong>Month:</strong> ${row.periodMonth?.slice(0, 7)}</div>
      <div class='row'><strong>Basic:</strong> Rs. ${Number(row.baseSalary).toLocaleString()}</div>
      <div class='row'><strong>Allowances:</strong> Rs. ${Number(row.allowances).toLocaleString()}</div>
      <div class='row'><strong>Deductions:</strong> Rs. ${Number(row.deductions).toLocaleString()}</div>
      <div class='row'><strong>Bonuses:</strong> Rs. ${Number(row.bonuses || 0).toLocaleString()}</div>
      <div class='row'><strong>Net Salary:</strong> Rs. ${Number(row.totalAmount).toLocaleString()}</div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  };

  if (loading && payroll.length === 0) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading payroll...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Payroll</Heading>
          <Text color={textColorSecondary}>Manage teacher and driver salaries</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAddCircle />} colorScheme='blue' onClick={handleCreateOpen} isDisabled={counts.teachers === 0 && counts.drivers === 0}>
            Add Salary
          </Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* Warning if no teachers or drivers */}
      {counts.teachers === 0 && counts.drivers === 0 && (
        <NoUsersWarning
          counts={{ students: 0, teachers: 0, drivers: 0 }}
          message="Please add a Teacher or Driver before creating payroll records."
        />
      )}

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard title="Total Net" value={`Rs. ${stats.total.toLocaleString()}`} icon={MdWork} colorScheme="green" />
        <StatCard title="Pending" value={String(stats.pending)} icon={MdWork} colorScheme="orange" />
        <StatCard title="Teachers Total" value={`Rs. ${stats.teachersTotal.toLocaleString()}`} icon={FaChalkboardTeacher} colorScheme="blue" />
        <StatCard title="Drivers Total" value={`Rs. ${stats.driversTotal.toLocaleString()}`} icon={FaTruck} colorScheme="red" />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Heading size='md' mb={3}>Headcount by Role</Heading>
          <PieChart chartData={byRole.values} chartOptions={{ labels: byRole.labels, legend: { position: 'right' }, colors: ['#3182CE', '#DD6B20'] }} />
        </Card>
        <Card p={4}>
          <Heading size='md' mb={3}>Recent Payroll</Heading>
          <BarChart chartData={[{ name: 'Net', data: filtered.slice(0, 5).map(r => Number(r.totalAmount)) }]} chartOptions={{ xaxis: { categories: filtered.slice(0, 5).map(r => r.userName?.slice(0, 10)) }, dataLabels: { enabled: false } }} />
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search employee' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='150px' value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value='all'>All Roles</option>
            <option value='teacher'>Teachers</option>
            <option value='driver'>Drivers</option>
          </Select>
          <Select maxW='150px' value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value='all'>All Status</option>
            <option value='pending'>Pending</option>
            <option value='processing'>Processing</option>
            <option value='paid'>Paid</option>
          </Select>
          <Input type='month' maxW='180px' value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }} />
        </Flex>
      </Card>

      {/* Table */}
      <Card>
        <Box overflowX='auto'>
          <Table variant='simple' size='sm'>
            <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Month</Th>
                <Th>Employee</Th>
                <Th>Role</Th>
                <Th isNumeric>Basic</Th>
                <Th isNumeric>Allowances</Th>
                <Th isNumeric>Deductions</Th>
                <Th isNumeric>Net</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <Tr><Td colSpan={9} textAlign="center" py={8} color="gray.500">No payroll records found</Td></Tr>
              ) : filtered.map((r) => (
                <Tr key={`${r.role}-${r.id}`} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td>{r.periodMonth?.slice(0, 7)}</Td>
                  <Td><Text fontWeight='600'>{r.userName}</Text></Td>
                  <Td><Badge colorScheme={r.role === 'teacher' ? 'blue' : 'orange'}>{r.role}</Badge></Td>
                  <Td isNumeric>Rs. {Number(r.baseSalary).toLocaleString()}</Td>
                  <Td isNumeric>Rs. {Number(r.allowances).toLocaleString()}</Td>
                  <Td isNumeric>Rs. {Number(r.deductions).toLocaleString()}</Td>
                  <Td isNumeric>Rs. {Number(r.totalAmount).toLocaleString()}</Td>
                  <Td><Badge colorScheme={r.status === 'paid' ? 'green' : r.status === 'processing' ? 'purple' : 'yellow'}>{r.status}</Badge></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='xs' variant='ghost' onClick={() => { setSelected(r); viewDisc.onOpen(); }} />
                    <Button size='xs' variant='ghost' onClick={() => releasePayslip(r)}>Payslip</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* View Modal */}
      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Payroll Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Employee:</strong> {selected.userName}</Text>
                <Text><strong>Role:</strong> <Badge colorScheme={selected.role === 'teacher' ? 'blue' : 'orange'}>{selected.role}</Badge></Text>
                <Text><strong>Month:</strong> {selected.periodMonth?.slice(0, 7)}</Text>
                <Text><strong>Basic:</strong> Rs. {Number(selected.baseSalary).toLocaleString()}</Text>
                <Text><strong>Allowances:</strong> Rs. {Number(selected.allowances).toLocaleString()}</Text>
                <Text><strong>Deductions:</strong> Rs. {Number(selected.deductions).toLocaleString()}</Text>
                <Text><strong>Bonuses:</strong> Rs. {Number(selected.bonuses || 0).toLocaleString()}</Text>
                <Text><strong>Net:</strong> Rs. {Number(selected.totalAmount).toLocaleString()}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={createDisc.isOpen} onClose={createDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Salary</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {formError && (
              <Alert status='error' mb={4} borderRadius='md'>
                <AlertIcon />
                {formError}
              </Alert>
            )}

            <SimpleGrid columns={2} spacing={4} mb={4}>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select value={createForm.role} onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value, user: null }))}>
                  {counts.teachers > 0 && <option value='teacher'>Teacher</option>}
                  {counts.drivers > 0 && <option value='driver'>Driver</option>}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Month</FormLabel>
                <Input type='month' value={createForm.periodMonth} onChange={(e) => setCreateForm(f => ({ ...f, periodMonth: e.target.value }))} />
              </FormControl>
            </SimpleGrid>

            <UserSelector
              userType={createForm.role}
              value={createForm.user}
              onChange={(user) => setCreateForm(f => ({ ...f, user }))}
              isRequired
              label="Select Employee"
            />

            <SimpleGrid columns={2} spacing={4} mt={4}>
              <FormControl isRequired>
                <FormLabel>Basic Salary</FormLabel>
                <NumberInput value={createForm.baseSalary} min={0} onChange={(v) => setCreateForm(f => ({ ...f, baseSalary: Number(v) || 0 }))}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Allowances</FormLabel>
                <NumberInput value={createForm.allowances} min={0} onChange={(v) => setCreateForm(f => ({ ...f, allowances: Number(v) || 0 }))}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4} mt={4}>
              <FormControl>
                <FormLabel>Deductions</FormLabel>
                <NumberInput value={createForm.deductions} min={0} onChange={(v) => setCreateForm(f => ({ ...f, deductions: Number(v) || 0 }))}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Bonuses</FormLabel>
                <NumberInput value={createForm.bonuses} min={0} onChange={(v) => setCreateForm(f => ({ ...f, bonuses: Number(v) || 0 }))}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </SimpleGrid>

            <Box mt={4} p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius='md'>
              <Text fontWeight='600'>Net Salary: Rs. {computeNet(createForm).toLocaleString()}</Text>
            </Box>

            <FormControl mt={4}>
              <FormLabel>Notes</FormLabel>
              <Input value={createForm.notes} onChange={(e) => setCreateForm(f => ({ ...f, notes: e.target.value }))} placeholder='Optional notes' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={createDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={handleCreate} isLoading={creating} isDisabled={!createForm.user}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
