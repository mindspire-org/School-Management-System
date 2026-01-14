import React, { useState, useMemo } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup,
  useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input,
  InputGroup, InputLeftElement, Spinner, useToast
} from '@chakra-ui/react';
import { MdReceipt, MdSearch, MdFileDownload, MdPrint } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import { UserTypeFilter } from './components/UserTypeSelector';
import NoUsersWarning from './components/NoUsersWarning';
import { useFinanceUsers, useReceipts } from '../../../../hooks/useFinanceUsers';

export default function Receipts() {
  const toast = useToast();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  // State
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Hooks
  const { loading: usersLoading, hasUsers, counts } = useFinanceUsers();
  const {
    loading: receiptsLoading,
    receipts,
    refresh: refreshReceipts
  } = useReceipts({
    userType: roleFilter !== 'all' ? roleFilter : undefined,
    page,
    pageSize
  });

  const loading = usersLoading || receiptsLoading;

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return receipts;
    const s = search.toLowerCase();
    return receipts.filter(r =>
      r.receiptNumber?.toLowerCase().includes(s) ||
      r.userName?.toLowerCase().includes(s) ||
      r.invoiceNumber?.toLowerCase().includes(s)
    );
  }, [receipts, search]);

  // Stats
  const stats = useMemo(() => {
    const total = filtered.reduce((s, r) => s + Number(r.amount || 0), 0);
    const students = filtered.filter(r => r.userType === 'student').length;
    const teachers = filtered.filter(r => r.userType === 'teacher').length;
    const drivers = filtered.filter(r => r.userType === 'driver').length;
    return { total, count: filtered.length, students, teachers, drivers };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Receipt', 'Invoice', 'User Type', 'User', 'Amount', 'Method', 'Issued At'];
    const data = filtered.map(r => [
      r.receiptNumber, r.invoiceNumber, r.userType, r.userName,
      r.amount, r.paymentMethod || '',
      r.issuedAt?.slice(0, 10) || ''
    ]);
    const csv = [header, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'receipts.csv';
    a.click();
  };

  const printReceipt = (receipt) => {
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Receipt ${receipt.receiptNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;max-width:400px;margin:0 auto}
      .header{text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:20px}
      .row{display:flex;justify-content:space-between;margin:8px 0}
      .total{font-size:18px;font-weight:bold;border-top:2px solid #333;padding-top:10px;margin-top:20px}
      </style></head><body>
      <div class="header"><h2>Receipt</h2><p>${receipt.receiptNumber}</p></div>
      <div class="row"><span>Invoice:</span><span>${receipt.invoiceNumber || 'N/A'}</span></div>
      <div class="row"><span>User:</span><span>${receipt.userName} (${receipt.userType})</span></div>
      <div class="row"><span>Payment Method:</span><span>${receipt.paymentMethod || 'Cash'}</span></div>
      <div class="row"><span>Date:</span><span>${receipt.issuedAt?.slice(0, 10) || 'N/A'}</span></div>
      <div class="row total"><span>Amount:</span><span>Rs. ${Number(receipt.amount).toLocaleString()}</span></div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  };

  if (loading && receipts.length === 0) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading receipts...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Receipts</Heading>
          <Text color={textColorSecondary}>View and print payment receipts</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' onClick={exportCSV}>Export CSV</Button>
        </ButtonGroup>
      </Flex>

      {/* No Users Warning */}
      <NoUsersWarning counts={counts} />

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Total Amount"
          value={`Rs. ${stats.total.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdReceipt} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Total Receipts"
          value={String(stats.count)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdReceipt} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Student Receipts"
          value={String(stats.students)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdReceipt} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Staff Receipts"
          value={String(stats.teachers + stats.drivers)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdReceipt} w='28px' h='28px' color='white' />} />}
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
            <Input placeholder='Search receipt' value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <Th>Receipt</Th>
                  <Th>Invoice</Th>
                  <Th>Type</Th>
                  <Th>User</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Method</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 ? (
                  <Tr><Td colSpan={8} textAlign="center" py={8} color="gray.500">No receipts found</Td></Tr>
                ) : filtered.map((r) => (
                  <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='600'>{r.receiptNumber}</Text></Td>
                    <Td>{r.invoiceNumber || '-'}</Td>
                    <Td>
                      <Badge colorScheme={r.userType === 'student' ? 'blue' : r.userType === 'teacher' ? 'green' : 'orange'}>
                        {r.userType}
                      </Badge>
                    </Td>
                    <Td>{r.userName}</Td>
                    <Td isNumeric fontWeight='600' color='green.500'>Rs. {Number(r.amount).toLocaleString()}</Td>
                    <Td><Badge>{r.paymentMethod || 'cash'}</Badge></Td>
                    <Td>{r.issuedAt?.slice(0, 10) || '-'}</Td>
                    <Td>
                      <Button size='xs' leftIcon={<MdPrint />} variant='outline' onClick={() => printReceipt(r)}>
                        Print
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
