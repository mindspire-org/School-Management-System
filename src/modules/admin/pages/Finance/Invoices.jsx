import React, { useState, useMemo } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup,
  useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input,
  InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  IconButton, Checkbox, FormControl, FormLabel, Spinner, useToast, Alert, AlertIcon
} from '@chakra-ui/react';
import { MdReceipt, MdPending, MdDoneAll, MdAdd, MdSearch, MdSend, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit, MdDelete } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import UserTypeSelector, { UserTypeFilter } from './components/UserTypeSelector';
import UserSelector from './components/UserSelector';
import NoUsersWarning, { UserRequiredNotice } from './components/NoUsersWarning';
import { useFinanceUsers, useUnifiedInvoices } from '../../../../hooks/useFinanceUsers';
import { financeApi } from '../../../../services/financeApi';

export default function Invoices() {
  const toast = useToast();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  // State
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [printingId, setPrintingId] = useState(null);

  // Modals
  const viewDisc = useDisclosure();
  const createDisc = useDisclosure();
  const editDisc = useDisclosure();

  // Create form state
  const [createForm, setCreateForm] = useState({
    userType: '',
    user: null,
    invoiceType: 'fee',
    amount: 0,
    tax: 0,
    discount: 0,
    description: '',
    dueDate: '',
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [editForm, setEditForm] = useState({
    id: null,
    amount: 0,
    tax: 0,
    discount: 0,
    status: 'pending',
    dueDate: '',
    description: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Hooks
  const { loading: usersLoading, hasUsers, counts } = useFinanceUsers();
  const {
    loading: invoicesLoading,
    invoices,
    total,
    refresh: refreshInvoices
  } = useUnifiedInvoices({
    userType: roleFilter !== 'all' ? roleFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize
  });

  const loading = usersLoading || invoicesLoading;

  // Filter invoices by search
  const filteredInvoices = useMemo(() => {
    if (!search) return invoices;
    const s = search.toLowerCase();
    return invoices.filter(i =>
      i.invoiceNumber?.toLowerCase().includes(s) ||
      i.userName?.toLowerCase().includes(s)
    );
  }, [invoices, search]);

  // Stats
  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending' || i.status === 'partial').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  }), [invoices]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Handlers
  const handleCreateOpen = () => {
    if (!hasUsers) {
      toast({
        title: 'No users available',
        description: 'Please add a Student, Teacher, or Driver first.',
        status: 'warning',
        duration: 4000,
      });
      return;
    }
    setCreateForm({
      userType: counts.students > 0 ? 'student' : counts.teachers > 0 ? 'teacher' : 'driver',
      user: null,
      invoiceType: 'fee',
      amount: 0,
      tax: 0,
      discount: 0,
      description: '',
      dueDate: '',
    });
    setFormError('');
    createDisc.onOpen();
  };

  const handleCreate = async () => {
    // Validation
    if (!createForm.userType) {
      setFormError('Please select a user type');
      return;
    }
    if (!createForm.user) {
      setFormError('Please select a user');
      return;
    }
    if (!createForm.amount || createForm.amount <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      await financeApi.createUnifiedInvoice({
        userType: createForm.userType,
        userId: createForm.user.id,
        invoiceType: createForm.invoiceType,
        amount: Number(createForm.amount),
        tax: Number(createForm.tax) || 0,
        discount: Number(createForm.discount) || 0,
        description: createForm.description,
        dueDate: createForm.dueDate || undefined,
      });

      toast({ title: 'Invoice created successfully', status: 'success', duration: 3000 });
      createDisc.onClose();
      refreshInvoices();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const exportCSV = () => {
    const header = ['Invoice', 'Type', 'User Type', 'User', 'Amount', 'Balance', 'Status', 'Due Date'];
    const data = filteredInvoices.map(i => [
      i.invoiceNumber, i.invoiceType, i.userType, i.userName,
      i.total, i.balance, i.status, i.dueDate?.slice(0, 10) || ''
    ]);
    const csv = [header, ...data].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = (checked) => setSelectedIds(checked ? filteredInvoices.map(i => i.id) : []);

  const openEdit = (invoice) => {
    setSelected(invoice);
    setEditForm({
      id: invoice.id,
      amount: Number(invoice.amount ?? invoice.total ?? 0),
      tax: Number(invoice.tax ?? 0),
      discount: Number(invoice.discount ?? 0),
      status: invoice.status || 'pending',
      dueDate: invoice.dueDate ? String(invoice.dueDate).slice(0, 10) : '',
      description: invoice.description || '',
    });
    setFormError('');
    editDisc.onOpen();
  };

  const handleUpdate = async () => {
    if (!editForm.id) return;
    setSavingEdit(true);
    try {
      await financeApi.updateUnifiedInvoice(editForm.id, {
        amount: Number(editForm.amount),
        tax: Number(editForm.tax) || 0,
        discount: Number(editForm.discount) || 0,
        status: editForm.status || undefined,
        dueDate: editForm.dueDate || undefined,
        description: editForm.description || undefined,
      });
      toast({ title: 'Invoice updated', status: 'success', duration: 2500 });
      editDisc.onClose();
      refreshInvoices();
    } catch (e) {
      toast({ title: 'Update failed', description: e?.data?.message || e.message, status: 'error', duration: 3500 });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (invoice) => {
    if (!invoice?.id) return;
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await financeApi.deleteUnifiedInvoice(invoice.id);
      toast({ title: 'Invoice deleted', status: 'success', duration: 2500 });
      refreshInvoices();
    } catch (e) {
      toast({ title: 'Delete failed', description: e?.data?.message || e.message, status: 'error', duration: 3500 });
    }
  };

  const printInvoice = (inv) => {
    const issuedAt = inv?.issuedAt ? String(inv.issuedAt).slice(0, 10) : '';
    const dueDate = inv?.dueDate ? String(inv.dueDate).slice(0, 10) : '';
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice ${inv?.invoiceNumber || ''}</title>
      <style>
        :root{--brand:#2b6cb0;--text:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f8fafc;--danger:#dc2626}
        *{box-sizing:border-box}
        body{font-family:Inter,Segoe UI,Arial,sans-serif;background:var(--bg);margin:0;padding:24px;color:var(--text)}
        .sheet{max-width:920px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08)}
        .top{padding:20px 22px;background:linear-gradient(135deg,var(--brand),#00a3ff);color:#fff;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
        .top h1{margin:0;font-size:18px;letter-spacing:.3px}
        .top .sub{margin-top:4px;font-size:12px;opacity:.92}
        .pill{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.18);font-size:11px;white-space:nowrap}
        .meta{display:flex;gap:18px;flex-wrap:wrap;padding:16px 22px;border-bottom:1px solid var(--line)}
        .chip{min-width:200px}
        .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
        .v{font-size:13px;font-weight:700;margin-top:2px}
        .content{padding:16px 22px}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th,td{border-bottom:1px solid var(--line);padding:10px 8px;font-size:13px;text-align:left}
        th{color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:11px}
        td.num{text-align:right;font-weight:700}
        .totals{margin-top:14px;display:flex;justify-content:flex-end}
        .totals .box{min-width:320px;border:1px solid var(--line);border-radius:12px;padding:12px}
        .row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
        .row strong{font-weight:800}
        .status{display:inline-block;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.04em;background:#eef2ff;color:#3730a3}
        .status.paid{background:#dcfce7;color:#166534}
        .status.overdue{background:#fee2e2;color:var(--danger)}
        .footer{padding:12px 22px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:11px;color:var(--muted)}
        @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border:none;border-radius:0}}
      </style>
      </head><body>
        <div class="sheet">
          <div class="top">
            <div>
              <h1>Invoice</h1>
              <div class="sub">Unified finance invoice</div>
            </div>
            <div class="pill">${inv?.invoiceNumber || ''}</div>
          </div>

          <div class="meta">
            <div class="chip"><div class="k">Billed To</div><div class="v">${inv?.userName || '-'}</div></div>
            <div class="chip"><div class="k">User Type</div><div class="v">${String(inv?.userType || '-').toUpperCase()}</div></div>
            <div class="chip"><div class="k">Invoice Type</div><div class="v">${String(inv?.invoiceType || '-').toUpperCase()}</div></div>
            <div class="chip"><div class="k">Issued</div><div class="v">${issuedAt || '-'}</div></div>
            <div class="chip"><div class="k">Due</div><div class="v">${dueDate || '-'}</div></div>
            <div class="chip"><div class="k">Status</div><div class="v"><span class="status ${inv?.status === 'paid' ? 'paid' : inv?.status === 'overdue' ? 'overdue' : ''}">${String(inv?.status || '').toUpperCase()}</span></div></div>
          </div>

          <div class="content">
            <div style="font-size:13px;color:var(--muted)">${inv?.description ? String(inv.description) : ''}</div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${inv?.invoiceType || 'invoice'}</td>
                  <td class="num">Rs. ${Number(inv?.amount ?? inv?.total ?? 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Tax</td>
                  <td class="num">Rs. ${Number(inv?.tax || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Discount</td>
                  <td class="num">- Rs. ${Number(inv?.discount || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="totals">
              <div class="box">
                <div class="row"><span>Total</span><strong>Rs. ${Number(inv?.total || 0).toLocaleString()}</strong></div>
                <div class="row"><span>Balance</span><strong>Rs. ${Number(inv?.balance || 0).toLocaleString()}</strong></div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div>Printed: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}</div>
            <div>Academia Pro</div>
          </div>
        </div>
        <script>window.onload=()=>{window.print();}</script>
      </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  };

  const handlePrint = async (invoice) => {
    setPrintingId(invoice?.id);
    try {
      const fresh = await financeApi.getUnifiedInvoiceById(invoice.id);
      printInvoice({ ...invoice, ...fresh });
    } catch {
      printInvoice(invoice);
    } finally {
      setPrintingId(null);
    }
  };

  if (loading && invoices.length === 0) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading invoices...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Invoices</Heading>
          <Text color={textColorSecondary}>Generate and manage unified fee invoices</Text>
        </Box>
        <Flex gap={2} align='center' wrap='wrap'>
          <Button size='sm' leftIcon={<MdAdd />} colorScheme='blue' onClick={handleCreateOpen} isDisabled={!hasUsers}>
            Create Invoice
          </Button>
          <Button size='sm' leftIcon={<MdFileDownload />} variant='outline' onClick={exportCSV}>Export CSV</Button>
          <Button size='sm' leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Generate PDF</Button>
        </Flex>
      </Flex>

      {/* No Users Warning */}
      <NoUsersWarning counts={counts} />

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard title="Total" value={String(total)} icon={MdReceipt} colorScheme="blue" />
        <StatCard title="Paid" value={String(stats.paid)} icon={MdDoneAll} colorScheme="green" />
        <StatCard title="Pending" value={String(stats.pending)} icon={MdPending} colorScheme="orange" />
        <StatCard title="Overdue" value={String(stats.overdue)} icon={MdReceipt} colorScheme="red" />
      </SimpleGrid>

      {/* Role Filter */}
      <Card p={4} mb={5}>
        <UserTypeFilter value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }} counts={counts} />
      </Card>

      {/* Filters */}
      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search invoice or user' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='180px' value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value='all'>All Status</option>
            <option value='paid'>Paid</option>
            <option value='pending'>Pending</option>
            <option value='partial'>Partial</option>
            <option value='overdue'>Overdue</option>
          </Select>
        </Flex>
      </Card>

      {/* Table */}
      <Card>
        <Box overflowX='auto'>
          <Box maxH='420px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th width='40px'>
                    <Checkbox
                      isChecked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                      isIndeterminate={selectedIds.length > 0 && selectedIds.length < filteredInvoices.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </Th>
                  <Th>Invoice</Th>
                  <Th>Type</Th>
                  <Th>User</Th>
                  <Th isNumeric>Amount</Th>
                  <Th isNumeric>Balance</Th>
                  <Th>Status</Th>
                  <Th>Due Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInvoices.length === 0 ? (
                  <Tr><Td colSpan={9} textAlign="center" py={8} color="gray.500">No invoices found</Td></Tr>
                ) : filteredInvoices.map((i) => (
                  <Tr key={i.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Checkbox isChecked={selectedIds.includes(i.id)} onChange={() => toggleSelect(i.id)} /></Td>
                    <Td><Text fontWeight='600'>{i.invoiceNumber}</Text></Td>
                    <Td>
                      <Badge colorScheme={i.userType === 'student' ? 'blue' : i.userType === 'teacher' ? 'green' : 'orange'}>
                        {i.userType}
                      </Badge>
                    </Td>
                    <Td>{i.userName}</Td>
                    <Td isNumeric>Rs. {Number(i.total).toLocaleString()}</Td>
                    <Td isNumeric>Rs. {Number(i.balance).toLocaleString()}</Td>
                    <Td><Badge colorScheme={i.status === 'paid' ? 'green' : i.status === 'pending' ? 'yellow' : i.status === 'partial' ? 'purple' : 'red'}>{i.status}</Badge></Td>
                    <Td><Text color={textColorSecondary}>{i.dueDate?.slice(0, 10) || '-'}</Text></Td>
                    <Td>
                      <Flex gap={1}>
                        <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(i); viewDisc.onOpen(); }} />
                        <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={() => openEdit(i)} />
                        <IconButton aria-label='Delete' icon={<MdDelete />} size='sm' variant='ghost' colorScheme='red' onClick={() => handleDelete(i)} />
                        <Button size='xs' leftIcon={<MdPictureAsPdf />} variant='outline' onClick={() => handlePrint(i)} isLoading={printingId === i.id}>
                          Print
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      {/* Pagination */}
      <Flex justify='space-between' align='center' mt={3} mb={8} px={2}>
        <Text fontSize='sm' color={textColorSecondary}>
          Showing {Math.min(total, (page - 1) * pageSize + 1)}–{Math.min(total, page * pageSize)} of {total}
        </Text>
        <Flex align='center' gap={3}>
          <Select size='sm' w='auto' value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </Select>
          <Button size='sm' onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={page === 1}>Prev</Button>
          <Text fontSize='sm'>Page {page} / {totalPages}</Text>
          <Button size='sm' onClick={() => setPage(p => Math.min(totalPages, p + 1))} isDisabled={page === totalPages}>Next</Button>
        </Flex>
      </Flex>

      {/* View Modal */}
      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invoice Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Invoice:</strong> {selected.invoiceNumber}</Text>
                <Text><strong>User Type:</strong> <Badge colorScheme={selected.userType === 'student' ? 'blue' : selected.userType === 'teacher' ? 'green' : 'orange'}>{selected.userType}</Badge></Text>
                <Text><strong>User:</strong> {selected.userName}</Text>
                <Text><strong>Invoice Type:</strong> {selected.invoiceType}</Text>
                <Text><strong>Amount:</strong> Rs. {Number(selected.total).toLocaleString()}</Text>
                <Text><strong>Balance:</strong> Rs. {Number(selected.balance).toLocaleString()}</Text>
                <Text><strong>Status:</strong> <Badge colorScheme={selected.status === 'paid' ? 'green' : 'yellow'}>{selected.status}</Badge></Text>
                <Text><strong>Due Date:</strong> {selected.dueDate?.slice(0, 10) || 'N/A'}</Text>
                <Text><strong>Description:</strong> {selected.description || 'N/A'}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={createDisc.isOpen} onClose={createDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <UserRequiredNotice />

            {formError && (
              <Alert status='error' mb={4} borderRadius='md'>
                <AlertIcon />
                {formError}
              </Alert>
            )}

            <FormControl mb={4} isRequired>
              <FormLabel>User Type</FormLabel>
              <UserTypeSelector
                value={createForm.userType}
                onChange={(type) => setCreateForm(f => ({ ...f, userType: type, user: null }))}
                counts={counts}
                showCounts={true}
              />
            </FormControl>

            <UserSelector
              userType={createForm.userType}
              value={createForm.user}
              onChange={(user) => setCreateForm(f => ({ ...f, user }))}
              isRequired
              label="Select User"
              error={!createForm.user && formError ? 'User is required' : ''}
            />

            <SimpleGrid columns={2} spacing={4} mt={4}>
              <FormControl isRequired>
                <FormLabel>Invoice Type</FormLabel>
                <Select value={createForm.invoiceType} onChange={(e) => setCreateForm(f => ({ ...f, invoiceType: e.target.value }))}>
                  {createForm.userType === 'student' ? (
                    <>
                      <option value='fee'>Fee</option>
                      <option value='other'>Other</option>
                    </>
                  ) : (
                    <>
                      <option value='salary'>Salary</option>
                      <option value='allowance'>Allowance</option>
                      <option value='deduction'>Deduction</option>
                      <option value='other'>Other</option>
                    </>
                  )}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Amount</FormLabel>
                <Input type='number' value={createForm.amount} onChange={(e) => setCreateForm(f => ({ ...f, amount: e.target.value }))} />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={2} spacing={4} mt={4}>
              <FormControl>
                <FormLabel>Tax</FormLabel>
                <Input type='number' value={createForm.tax} onChange={(e) => setCreateForm(f => ({ ...f, tax: e.target.value }))} />
              </FormControl>

              <FormControl>
                <FormLabel>Discount</FormLabel>
                <Input type='number' value={createForm.discount} onChange={(e) => setCreateForm(f => ({ ...f, discount: e.target.value }))} />
              </FormControl>
            </SimpleGrid>

            <FormControl mt={4}>
              <FormLabel>Due Date</FormLabel>
              <Input type='date' value={createForm.dueDate} onChange={(e) => setCreateForm(f => ({ ...f, dueDate: e.target.value }))} />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input value={createForm.description} onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder='Optional description' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={createDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={handleCreate} isLoading={creating} isDisabled={!createForm.user}>
              Create Invoice
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {formError && (
              <Alert status='error' mb={4} borderRadius='md'>
                <AlertIcon />
                {formError}
              </Alert>
            )}

            <SimpleGrid columns={2} spacing={4}>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={editForm.status} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}>
                  <option value='pending'>Pending</option>
                  <option value='partial'>Partial</option>
                  <option value='paid'>Paid</option>
                  <option value='overdue'>Overdue</option>
                  <option value='cancelled'>Cancelled</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input type='date' value={editForm.dueDate} onChange={(e) => setEditForm(f => ({ ...f, dueDate: e.target.value }))} />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={3} spacing={4} mt={4}>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input type='number' value={editForm.amount} onChange={(e) => setEditForm(f => ({ ...f, amount: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel>Tax</FormLabel>
                <Input type='number' value={editForm.tax} onChange={(e) => setEditForm(f => ({ ...f, tax: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel>Discount</FormLabel>
                <Input type='number' value={editForm.discount} onChange={(e) => setEditForm(f => ({ ...f, discount: e.target.value }))} />
              </FormControl>
            </SimpleGrid>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder='Optional description' />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={handleUpdate} isLoading={savingEdit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
