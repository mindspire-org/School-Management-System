import React, { useState, useMemo } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup,
  useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input,
  InputGroup, InputLeftElement, Spinner, useToast
} from '@chakra-ui/react';
import { MdWarning, MdSearch, MdFileDownload, MdPictureAsPdf, MdSend } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import { UserTypeFilter } from './components/UserTypeSelector';
import NoUsersWarning from './components/NoUsersWarning';
import { useFinanceUsers, useOutstandingFees } from '../../../../hooks/useFinanceUsers';

export default function OutstandingFees() {
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
    loading: outstandingLoading,
    outstanding,
    refresh: refreshOutstanding
  } = useOutstandingFees({
    userType: roleFilter !== 'all' ? roleFilter : undefined,
    page,
    pageSize
  });

  const loading = usersLoading || outstandingLoading;

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return outstanding;
    const s = search.toLowerCase();
    return outstanding.filter(o =>
      o.invoiceNumber?.toLowerCase().includes(s) ||
      o.userName?.toLowerCase().includes(s)
    );
  }, [outstanding, search]);

  // Stats
  const stats = useMemo(() => {
    const total = filtered.reduce((s, o) => s + Number(o.balance || 0), 0);
    const overdue = filtered.filter(o => o.daysOverdue > 0).length;
    const students = filtered.filter(o => o.userType === 'student').reduce((s, o) => s + Number(o.balance || 0), 0);
    const staff = filtered.filter(o => o.userType !== 'student').reduce((s, o) => s + Number(o.balance || 0), 0);
    return { total, overdue, students, staff };
  }, [filtered]);

  const exportCSV = () => {
    const header = ['Invoice', 'Type', 'User', 'Total', 'Balance', 'Status', 'Due Date', 'Days Overdue'];
    const data = filtered.map(o => [
      o.invoiceNumber, o.userType, o.userName,
      o.total, o.balance, o.status,
      o.dueDate?.slice(0, 10) || '', o.daysOverdue || 0
    ]);
    const csv = [header, ...data].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'outstanding_fees.csv';
    a.click();
  };

  if (loading && outstanding.length === 0) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading outstanding fees...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Outstanding Fees</Heading>
          <Text color={textColorSecondary}>Track unpaid invoices across all user types</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* No Users Warning */}
      <NoUsersWarning counts={counts} />

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Total Outstanding"
          value={`Rs. ${stats.total.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Overdue Invoices"
          value={String(stats.overdue)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#E53E3E 0%,#C53030 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Student Dues"
          value={`Rs. ${stats.students.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />}
        />
        <MiniStatistics
          name="Staff Dues"
          value={`Rs. ${stats.staff.toLocaleString()}`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />}
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
            <Input placeholder='Search invoice or user' value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <Th isNumeric>Total</Th>
                  <Th isNumeric>Balance</Th>
                  <Th>Status</Th>
                  <Th>Due Date</Th>
                  <Th isNumeric>Days Overdue</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 ? (
                  <Tr><Td colSpan={9} textAlign="center" py={8} color="gray.500">No outstanding fees found</Td></Tr>
                ) : filtered.map((o) => (
                  <Tr key={o.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='600'>{o.invoiceNumber}</Text></Td>
                    <Td>
                      <Badge colorScheme={o.userType === 'student' ? 'blue' : o.userType === 'teacher' ? 'green' : 'orange'}>
                        {o.userType}
                      </Badge>
                    </Td>
                    <Td>{o.userName}</Td>
                    <Td isNumeric>Rs. {Number(o.total).toLocaleString()}</Td>
                    <Td isNumeric fontWeight='600' color='red.500'>Rs. {Number(o.balance).toLocaleString()}</Td>
                    <Td>
                      <Badge colorScheme={o.status === 'overdue' ? 'red' : o.status === 'partial' ? 'purple' : 'yellow'}>
                        {o.status}
                      </Badge>
                    </Td>
                    <Td>{o.dueDate?.slice(0, 10) || '-'}</Td>
                    <Td isNumeric color={o.daysOverdue > 0 ? 'red.500' : 'gray.500'}>
                      {o.daysOverdue > 0 ? o.daysOverdue : '-'}
                    </Td>
                    <Td>
                      <Button size='xs' leftIcon={<MdSend />} variant='outline'>Remind</Button>
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
          Showing {filtered.length} outstanding records
        </Text>
        <Flex align='center' gap={3}>
          <Select size='sm' w='auto' value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </Flex>
      </Flex>
    </Box>
  );
}
