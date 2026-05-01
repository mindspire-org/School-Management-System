import React, { useState, useMemo } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup,
  useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input,
  InputGroup, InputLeftElement, Spinner, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel, Alert, AlertIcon
} from '@chakra-ui/react';
import { MdPayment, MdAdd, MdSearch, MdFileDownload, MdReceipt } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import { UserTypeFilter } from './components/UserTypeSelector';
import NoUsersWarning from './components/NoUsersWarning';
import { useFinanceUsers, useUnifiedPayments, useUnifiedInvoices } from '../../../../hooks/useFinanceUsers';
import { financeApi } from '../../../../services/financeApi';

export default function Payments() {
  const toast = useToast();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  // State
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [printingId, setPrintingId] = useState(null);

  // Modals
  const createDisc = useDisclosure();

  // Create form
  const [createForm, setCreateForm] = useState({
    invoiceId: '',
    amount: 0,
    method: 'cash',
    referenceNumber: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  // Hooks
  const { loading: usersLoading, hasUsers, counts } = useFinanceUsers();
  const {
    loading: paymentsLoading,
    payments,
    refresh: refreshPayments
  } = useUnifiedPayments({
    userType: roleFilter !== 'all' ? roleFilter : undefined,
    page,
    pageSize
  });

  // Get unpaid invoices for payment creation
  const { invoices: unpaidInvoices } = useUnifiedInvoices({ status: 'pending', pageSize: 100 });

  const loading = usersLoading || paymentsLoading;

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return payments;
    const s = search.toLowerCase();
    return payments.filter(p =>
      p.invoiceNumber?.toLowerCase().includes(s) ||
      p.userName?.toLowerCase().includes(s) ||
      p.referenceNumber?.toLowerCase().includes(s)
    );
  }, [payments, search]);

  // Stats
  const stats = useMemo(() => {
    const total = filtered.reduce((s, p) => s + Number(p.amount || 0), 0);
    const cash = filtered.filter(p => p.method === 'cash').reduce((s, p) => s + Number(p.amount || 0), 0);
    const bank = filtered.filter(p => p.method === 'bank').reduce((s, p) => s + Number(p.amount || 0), 0);
    const online = filtered.filter(p => p.method === 'online').reduce((s, p) => s + Number(p.amount || 0), 0);
    return { total, cash, bank, online, count: filtered.length };
  }, [filtered]);

  const handleCreateOpen = () => {
    if (unpaidInvoices.length === 0) {
      toast({
        title: 'No pending invoices',
        description: 'There are no pending invoices to pay.',
        status: 'info',
        duration: 3000,
      });
      return;
    }
    setCreateForm({
      invoiceId: unpaidInvoices[0]?.id || '',
      amount: 0,
      method: 'cash',
      referenceNumber: '',
      notes: '',
    });
    setFormError('');
    createDisc.onOpen();
  };

  const handleCreate = async () => {
    if (!createForm.invoiceId) {
      setFormError('Please select an invoice');
      return;
    }
    if (!createForm.amount || createForm.amount <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    setCreating(true);
    setFormError('');

    try {
      await financeApi.createUnifiedPayment({
        invoiceId: Number(createForm.invoiceId),
        amount: Number(createForm.amount),
        method: createForm.method,
        referenceNumber: createForm.referenceNumber || undefined,
        notes: createForm.notes || undefined,
      });

      toast({ title: 'Payment recorded successfully', status: 'success', duration: 3000 });
      createDisc.onClose();
      refreshPayments();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to record payment');
    } finally {
      setCreating(false);
    }
  };

  const exportCSV = () => {
    const header = ['Invoice', 'User Type', 'User', 'Amount', 'Method', 'Reference', 'Date'];
    const data = filtered.map(p => [
      p.invoiceNumber, p.userType, p.userName,
      p.amount, p.method, p.referenceNumber || '',
      p.paidAt?.slice(0, 10) || ''
    ]);
    const csv = [header, ...data].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'payments.csv';
    a.click();
  };

  const printReceipt = (receipt) => {
    const issuedAt = receipt?.issuedAt ? String(receipt.issuedAt).slice(0, 19).replace('T', ' ') : '';
    const paidAt = receipt?.paidAt ? String(receipt.paidAt).slice(0, 19).replace('T', ' ') : '';
    const method = receipt?.paymentMethod || 'cash';
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt ${receipt?.receiptNumber || ''}</title>
      <style>
        :root{--brand:#0ea5e9;--text:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f8fafc;--ok:#16a34a}
        *{box-sizing:border-box}
        body{font-family:Inter,Segoe UI,Arial,sans-serif;background:var(--bg);margin:0;padding:24px;color:var(--text)}
        .sheet{max-width:860px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08)}
        .top{padding:18px 22px;background:linear-gradient(135deg,var(--brand),#22c55e);color:#fff;display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
        .top h1{margin:0;font-size:18px;letter-spacing:.3px}
        .top .sub{margin-top:4px;font-size:12px;opacity:.92}
        .pill{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.18);font-size:11px;white-space:nowrap}
        .meta{display:flex;gap:18px;flex-wrap:wrap;padding:16px 22px;border-bottom:1px solid var(--line)}
        .chip{min-width:180px}
        .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
        .v{font-size:13px;font-weight:700;margin-top:2px}
        .grid{display:grid;grid-template-columns:1.2fr .8fr;gap:16px;padding:16px 22px}
        .card{border:1px solid var(--line);border-radius:12px;padding:14px}
        .card h2{margin:0 0 10px;font-size:13px}
        table{width:100%;border-collapse:collapse}
        td{padding:8px 0;border-bottom:1px dashed var(--line);font-size:13px}
        td:last-child{text-align:right;font-weight:700}
        tr:last-child td{border-bottom:none}
        .total{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
        .total .label{font-size:12px;color:var(--muted)}
        .total .amt{font-size:18px;font-weight:900;color:var(--ok)}
        .footer{padding:12px 22px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:11px;color:var(--muted)}
        @media print{body{background:#fff;padding:0}.sheet{box-shadow:none;border:none;border-radius:0}}
      </style>
      </head><body>
        <div class="sheet">
          <div class="top">
            <div>
              <h1>Payment Receipt</h1>
              <div class="sub">Generated by the finance system</div>
            </div>
            <div class="pill">${receipt?.receiptNumber || ''}</div>
          </div>

          <div class="meta">
            <div class="chip"><div class="k">Invoice</div><div class="v">${receipt?.invoiceNumber || '-'}</div></div>
            <div class="chip"><div class="k">Received From</div><div class="v">${receipt?.userName || '-'}</div></div>
            <div class="chip"><div class="k">User Type</div><div class="v">${String(receipt?.userType || '-').toUpperCase()}</div></div>
            <div class="chip"><div class="k">Method</div><div class="v">${String(method).toUpperCase()}</div></div>
            <div class="chip"><div class="k">Reference</div><div class="v">${receipt?.referenceNumber || '-'}</div></div>
            <div class="chip"><div class="k">Paid At</div><div class="v">${paidAt || '-'}</div></div>
          </div>

          <div class="grid">
            <div class="card">
              <h2>Payment Summary</h2>
              <table>
                <tr><td>Amount Received</td><td>Rs. ${Number(receipt?.amount || 0).toLocaleString()}</td></tr>
              </table>
              <div class="total">
                <div>
                  <div class="label">Total Received</div>
                </div>
                <div class="amt">Rs. ${Number(receipt?.amount || 0).toLocaleString()}</div>
              </div>
            </div>
            <div class="card">
              <h2>Receipt Info</h2>
              <table>
                <tr><td>Issued At</td><td>${issuedAt || '-'}</td></tr>
                <tr><td>Receipt ID</td><td>${receipt?.id || '-'}</td></tr>
              </table>
              <div style="margin-top:14px;font-size:12px;color:var(--muted)">This receipt is system generated.</div>
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
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  };

  const generateReceipt = async (payment) => {
    setPrintingId(payment?.id);
    try {
      const receipt = await financeApi.createReceipt(payment.id);
      toast({ title: 'Receipt generated', status: 'success', duration: 2000 });
      printReceipt(receipt);
    } catch (e) {
      toast({ title: 'Failed to generate receipt', description: e?.data?.message || e.message, status: 'error', duration: 3000 });
    } finally {
      setPrintingId(null);
    }
  };

  if (loading && payments.length === 0) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading payments...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Payments</Heading>
          <Text color={textColorSecondary}>Record and track all payments</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAdd />} colorScheme='blue' onClick={handleCreateOpen}>Record Payment</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' onClick={exportCSV}>Export CSV</Button>
        </ButtonGroup>
      </Flex>

      {/* No Users Warning */}
      <NoUsersWarning counts={counts} />

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Total Collected"
          value={`Rs. ${stats.total.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdPayment} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Cash"
          value={`Rs. ${stats.cash.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdPayment} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Bank Transfer"
          value={`Rs. ${stats.bank.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdPayment} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Online"
          value={`Rs. ${stats.online.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdPayment} w='28px' h='28px' color='white' />} />}
        />
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
            <Input placeholder='Search payment' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
        </Flex>
      </Card>

      {/* Table */}
      <Card>
        <Box overflowX='auto'>
          <Box maxH='500px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th>Invoice</Th>
                  <Th>Type</Th>
                  <Th>User</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Method</Th>
                  <Th>Reference</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 ? (
                  <Tr><Td colSpan={8} textAlign="center" py={8} color="gray.500">No payments found</Td></Tr>
                ) : filtered.map((p) => (
                  <Tr key={p.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='600'>{p.invoiceNumber}</Text></Td>
                    <Td>
                      <Badge colorScheme={p.userType === 'student' ? 'blue' : p.userType === 'teacher' ? 'green' : 'orange'}>
                        {p.userType}
                      </Badge>
                    </Td>
                    <Td>{p.userName}</Td>
                    <Td isNumeric fontWeight='600' color='green.500'>Rs. {Number(p.amount).toLocaleString()}</Td>
                    <Td><Badge>{p.method || 'cash'}</Badge></Td>
                    <Td>{p.referenceNumber || '-'}</Td>
                    <Td>{p.paidAt?.slice(0, 10) || '-'}</Td>
                    <Td>
                      <Button size='xs' leftIcon={<MdReceipt />} variant='outline' onClick={() => generateReceipt(p)} isLoading={printingId === p.id}>
                        Receipt
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      {/* Create Payment Modal */}
      <Modal isOpen={createDisc.isOpen} onClose={createDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {formError && (
              <Alert status='error' mb={4} borderRadius='md'>
                <AlertIcon />
                {formError}
              </Alert>
            )}

            <FormControl mb={4} isRequired>
              <FormLabel>Invoice</FormLabel>
              <Select value={createForm.invoiceId} onChange={(e) => setCreateForm(f => ({ ...f, invoiceId: e.target.value }))}>
                {unpaidInvoices.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.userName} (Rs. {Number(inv.balance).toLocaleString()})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Amount</FormLabel>
              <Input type='number' value={createForm.amount} onChange={(e) => setCreateForm(f => ({ ...f, amount: e.target.value }))} />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Payment Method</FormLabel>
              <Select value={createForm.method} onChange={(e) => setCreateForm(f => ({ ...f, method: e.target.value }))}>
                <option value='cash'>Cash</option>
                <option value='bank'>Bank Transfer</option>
                <option value='online'>Online</option>
                <option value='cheque'>Cheque</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Reference Number</FormLabel>
              <Input value={createForm.referenceNumber} onChange={(e) => setCreateForm(f => ({ ...f, referenceNumber: e.target.value }))} placeholder='Transaction ID, Cheque No, etc.' />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Input value={createForm.notes} onChange={(e) => setCreateForm(f => ({ ...f, notes: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={createDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={handleCreate} isLoading={creating}>
              Record Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
