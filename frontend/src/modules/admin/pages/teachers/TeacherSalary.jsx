import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Flex,
  SimpleGrid,
  Badge,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  HStack,
  useColorModeValue,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { 
  MdAttachMoney, 
  MdCalendarToday, 
  MdLocalPrintshop,
  MdFileDownload,
  MdMoreVert,
  MdSearch,
  MdCheckCircle,
} from 'react-icons/md';
import * as teacherApi from '../../../../services/api/teachers';
import * as campusesApi from '../../../../services/api/campuses';
import { useAuth } from '../../../../contexts/AuthContext';

const statusColorMap = {
  paid: 'green',
  processing: 'blue',
  pending: 'orange',
  failed: 'red',
  cancelled: 'gray',
};

const TeacherSalary = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [payrolls, setPayrolls] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [processingMap, setProcessingMap] = useState({});
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();
  
  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.800');

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatAmount = useCallback((value) => currencyFormatter.format(Number(value || 0)), [currencyFormatter]);

  const fetchCampuses = useCallback(async () => {
    try {
      const res = await campusesApi.list({ page: 1, pageSize: 200 });
      const rows = Array.isArray(res?.rows) ? res.rows : Array.isArray(res) ? res : [];
      setCampuses(rows);
    } catch (error) {
      console.error(error);
      setCampuses([]);
      toast({
        title: 'Failed to load campuses',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCampuses();
  }, [fetchCampuses]);

  useEffect(() => {
    if (selectedCampusId) return;

    const storedCampusId = sessionStorage.getItem('sms_campus_id') || localStorage.getItem('sms_campus_id');
    if (storedCampusId) {
      setSelectedCampusId(String(storedCampusId));
      return;
    }

    const userCampus = user?.campusId ? String(user.campusId) : '';
    if (userCampus) {
      setSelectedCampusId(userCampus);
      return;
    }

    if (campuses.length) {
      setSelectedCampusId(String(campuses[0].id));
    }
  }, [campuses, selectedCampusId, user?.campusId]);

  useEffect(() => {
    setPayrolls([]);
    setTeachers([]);
  }, [selectedCampusId]);

  useEffect(() => {
    if (!selectedCampusId) return;
    sessionStorage.setItem('sms_campus_id', String(selectedCampusId));
    localStorage.setItem('sms_campus_id', String(selectedCampusId));
  }, [selectedCampusId]);

  const fetchPayrolls = useCallback(async () => {
    if (!month) return;
    if (!selectedCampusId) return;
    setPayrollLoading(true);
    try {
      const data = await teacherApi.getPayrolls({
        month,
        campusId: selectedCampusId ? Number(selectedCampusId) : undefined,
      });
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPayrolls([]);
      toast({
        title: 'Failed to load payrolls',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setPayrollLoading(false);
    }
  }, [month, selectedCampusId, toast]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const fetchTeachers = useCallback(async () => {
    if (!selectedCampusId) return;
    setTeachersLoading(true);
    try {
      const response = await teacherApi.list({
        page: 1,
        pageSize: 200,
        campusId: selectedCampusId ? Number(selectedCampusId) : undefined,
      });
      const rows = Array.isArray(response?.rows) ? response.rows : Array.isArray(response) ? response : [];
      setTeachers(rows);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to load teachers',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setTeachersLoading(false);
    }
  }, [selectedCampusId, toast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const payrollMap = useMemo(() => {
    return payrolls.reduce((acc, row) => {
      if (row?.teacherId) acc[row.teacherId] = row;
      return acc;
    }, {});
  }, [payrolls]);

  const computeTotalAmount = useCallback(({ baseSalary = 0, allowances = 0, deductions = 0, bonuses = 0 }) => {
    const total = Number(baseSalary || 0) + Number(allowances || 0) + Number(bonuses || 0) - Number(deductions || 0);
    return Math.max(0, Number(total.toFixed(0)));
  }, []);

  const teacherRows = useMemo(() => {
    const rows = teachers.map((teacher) => {
      const payroll = payrollMap[teacher.id];
      const baseSalary = Number(payroll?.baseSalary ?? teacher.baseSalary ?? 0);
      const allowances = Number(payroll?.allowances ?? teacher.allowances ?? 0);
      const deductions = Number(payroll?.deductions ?? teacher.deductions ?? 0);
      const bonuses = Number(payroll?.bonuses ?? 0);
      const totalAmount = Number(payroll?.totalAmount ?? computeTotalAmount({ baseSalary, allowances, deductions, bonuses }));
      return {
        key: payroll?.id ?? `teacher-${teacher.id}`,
        payrollId: payroll?.id,
        teacherId: teacher.id,
        teacherName: teacher.name,
        employeeId: teacher.employeeId,
        designation: teacher.designation,
        baseSalary,
        allowances,
        deductions,
        bonuses,
        totalAmount,
        status: payroll?.status ?? 'pending',
        paidOn: payroll?.paidOn ?? null,
        paymentMethod: payroll?.paymentMethod ?? teacher.paymentMethod,
      };
    });

    const knownTeacherIds = new Set(teachers.map((teacher) => teacher.id));
    payrolls.forEach((payroll) => {
      if (!knownTeacherIds.has(payroll.teacherId)) {
        rows.push({
          key: payroll.id,
          payrollId: payroll.id,
          teacherId: payroll.teacherId,
          teacherName: payroll.teacherName || `Teacher #${payroll.teacherId}`,
          employeeId: payroll.employeeId,
          designation: payroll.designation,
          baseSalary: Number(payroll.baseSalary || 0),
          allowances: Number(payroll.allowances || 0),
          deductions: Number(payroll.deductions || 0),
          bonuses: Number(payroll.bonuses || 0),
          totalAmount: Number(payroll.totalAmount || 0),
          status: payroll.status || 'pending',
          paidOn: payroll.paidOn || null,
          paymentMethod: payroll.paymentMethod,
        });
      }
    });

    return rows;
  }, [teachers, payrollMap, payrolls, computeTotalAmount]);

  const stats = useMemo(() => {
    const totalBudget = teacherRows.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);
    const processed = teacherRows.filter((row) => row.status === 'paid').length;
    const pending = teacherRows.filter((row) => row.status === 'pending' || row.status === 'processing').length;
    return { totalBudget, processed, pending };
  }, [teacherRows]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return teacherRows;
    const query = searchQuery.toLowerCase();
    return teacherRows.filter((row) => {
      const nameMatch = row.teacherName?.toLowerCase().includes(query);
      const idMatch = row.employeeId?.toLowerCase().includes(query);
      const teacherIdMatch = String(row.teacherId || '').toLowerCase().includes(query);
      return nameMatch || idMatch || teacherIdMatch;
    });
  }, [teacherRows, searchQuery]);

  const formatStatus = (status) =>
    (status || 'pending')
      .split('_')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');

  const replacePayrollInState = (updatedPayroll) => {
    if (!updatedPayroll) return;
    setPayrolls((prev) => {
      const exists = prev.some((row) => row.id === updatedPayroll.id);
      if (exists) {
        return prev.map((row) => (row.id === updatedPayroll.id ? updatedPayroll : row));
      }
      return [...prev, updatedPayroll];
    });
  };

  const createOrUpdatePayroll = async (row, payload) => {
    if (row.payrollId) {
      return teacherApi.updatePayroll(row.payrollId, payload);
    }
    return teacherApi.createPayroll({
      teacherId: row.teacherId,
      periodMonth: month,
      baseSalary: row.baseSalary,
      allowances: row.allowances,
      deductions: row.deductions,
      bonuses: row.bonuses,
      status: payload.status,
      paidOn: payload.paidOn,
      paymentMethod: row.paymentMethod,
    });
  };

  const handleProcessPayment = async (row) => {
    if (!row || row.status === 'paid') return;
    setProcessingMap((prev) => ({ ...prev, [row.teacherId]: true }));
    try {
      const payload = {
        status: 'paid',
        paidOn: new Date().toISOString().split('T')[0],
      };
      const updated = await createOrUpdatePayroll(row, payload);
      replacePayrollInState(updated);
      toast({
        title: 'Payment processed',
        description: `${row.teacherName} marked as paid.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to process payment',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setProcessingMap((prev) => {
        const next = { ...prev };
        delete next[row.teacherId];
        return next;
      });
    }
  };

  const handleBulkProcess = async () => {
    const pendingRows = teacherRows.filter((row) => row.status === 'pending' || row.status === 'processing');
    if (!pendingRows.length) {
      toast({
        title: 'No pending payrolls',
        description: 'All payrolls are already marked as paid.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setBulkProcessing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const results = await Promise.all(
        pendingRows.map((row) =>
          createOrUpdatePayroll(row, {
            status: 'paid',
            paidOn: today,
          })
        )
      );
      setPayrolls((prev) => {
        const map = new Map(prev.map((row) => [row.id, row]));
        results.forEach((item) => {
          if (item?.id) {
            map.set(item.id, item);
          }
        });
        return Array.from(map.values());
      });
      toast({
        title: 'Bulk payment processed',
        description: `${pendingRows.length} payroll${pendingRows.length > 1 ? 's' : ''} updated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Bulk processing failed',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setBulkProcessing(false);
    }
  };
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Salary Management</Heading>
          <Text color={textColorSecondary}>Process and manage teacher salary payments</Text>
        </Box>
        <HStack>
          <Button
            leftIcon={<Icon as={MdLocalPrintshop} />}
            variant="outline"
            colorScheme="blue"
            size="md"
          >
            Print Report
          </Button>
          <Button
            leftIcon={<Icon as={MdFileDownload} />}
            colorScheme="blue"
            size="md"
          >
            Export Data
          </Button>
        </HStack>
      </Flex>

      {/* Month selector */}
      <Card mb={5}>
        <Flex p={4} direction={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ base: 'flex-start', md: 'center' }} gap={4}>
          <Box>
            <HStack spacing={4} align="flex-end" flexWrap="wrap">
              <FormControl>
                <FormLabel>Select Month</FormLabel>
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  w={{ base: 'full', md: '220px' }}
                />
              </FormControl>

              {user?.role === 'owner' || user?.role === 'admin' || user?.role === 'superadmin' ? (
                <FormControl>
                  <FormLabel>Campus</FormLabel>
                  <Select
                    value={selectedCampusId}
                    onChange={(e) => setSelectedCampusId(e.target.value)}
                    placeholder={campuses.length ? 'Select campus' : 'Loading...'}
                    w={{ base: 'full', md: '240px' }}
                    isDisabled={!campuses.length}
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
            </HStack>
          </Box>
          
          <Button 
            colorScheme="green" 
            size="md" 
            onClick={handleBulkProcess}
            leftIcon={<Icon as={MdCheckCircle} />}
            isLoading={bulkProcessing}
            loadingText="Processing"
          >
            Process All Pending Payments
          </Button>
        </Flex>
      </Card>

      {/* Stats - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdAttachMoney} w='24px' h='24px' color='white' />} />}
          name='Total Salary Budget'
          value={formatAmount(stats.totalBudget)}
          growth='Current month'
          trendData={[40,45,43,47,50,55]}
          trendColor='#01B574'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdCheckCircle} w='24px' h='24px' color='white' />} />}
          name='Processed Payments'
          value={String(stats.processed)}
          growth='Marked as paid'
          trendData={[1,2,2,3,3,stats.processed]}
          trendColor='#4481EB'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdCalendarToday} w='24px' h='24px' color='white' />} />}
          name='Pending Payments'
          value={String(stats.pending)}
          growth='Awaiting processing'
          trendData={[stats.pending, Math.max(stats.pending - 1, 0), stats.pending, stats.pending]}
          trendColor='#FD7853'
        />
      </SimpleGrid>

      {/* Salary Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Salary Details</Text>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </Flex>
        
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>Teacher</Th>
                <Th>Designation</Th>
                <Th isNumeric>Basic Salary</Th>
                <Th isNumeric>Allowances</Th>
                <Th isNumeric>Deductions</Th>
                <Th isNumeric>Bonuses</Th>
                <Th isNumeric>Total Amount</Th>
                <Th>Paid On</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payrollLoading || teachersLoading ? (
                <Tr>
                  <Td colSpan={10}>
                    <Flex align="center" justify="center" py={8}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading payrolls...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : filteredRows.length === 0 ? (
                <Tr>
                  <Td colSpan={10}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>
                      No payroll records found for the selected month.
                    </Text>
                  </Td>
                </Tr>
              ) : (
                filteredRows.map((row) => (
                  <Tr key={row.key}>
                    <Td>
                      <Box>
                        <Text fontWeight="medium">{row.teacherName}</Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {row.employeeId || `Teacher #${row.teacherId}`}
                        </Text>
                      </Box>
                    </Td>
                    <Td>{row.designation || '—'}</Td>
                    <Td isNumeric>{formatAmount(row.baseSalary)}</Td>
                    <Td isNumeric>{formatAmount(row.allowances)}</Td>
                    <Td isNumeric>{formatAmount(row.deductions)}</Td>
                    <Td isNumeric>{formatAmount(row.bonuses)}</Td>
                    <Td isNumeric fontWeight="bold">{formatAmount(row.totalAmount)}</Td>
                    <Td>{row.paidOn ? new Date(row.paidOn).toLocaleDateString() : '—'}</Td>
                    <Td>
                      <Badge
                        colorScheme={statusColorMap[row.status] || 'gray'}
                        variant="solid"
                        borderRadius="full"
                        px={2}
                        py={1}
                      >
                        {formatStatus(row.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="ghost"
                          size="sm"
                          rightIcon={<Icon as={MdMoreVert} />}
                        >
                          Actions
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            onClick={() => handleProcessPayment(row)}
                            isDisabled={row.status === 'paid' || processingMap[row.teacherId]}
                          >
                            {processingMap[row.teacherId] ? 'Processing...' : 'Process Payment'}
                          </MenuItem>
                          <MenuItem>View Details</MenuItem>
                          <MenuItem>Download Slip</MenuItem>
                        </MenuList>
                      </Menu>
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
};

export default TeacherSalary;
