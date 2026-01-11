import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Badge, Button, ButtonGroup, useBreakpointValue, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast } from '@chakra-ui/react';
import { MdAttachMoney, MdTrendingUp, MdWarning, MdFileDownload, MdPictureAsPdf, MdCalendarMonth } from 'react-icons/md';
import { FaUserGraduate, FaChalkboardTeacher, FaTruck } from 'react-icons/fa';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { UserTypeFilter } from './components/UserTypeSelector';
import NoUsersWarning from './components/NoUsersWarning';
import { useFinanceUsers, useDashboardAnalytics, useDashboardStats, useUnifiedInvoices } from '../../../../hooks/useFinanceUsers';
import AreaChart from '../../../../components/charts/v2/AreaChart';
import BarChart from '../../../../components/charts/v2/BarChart';
import DonutChart from '../../../../components/charts/v2/DonutChart';

export default function FeeDashboard() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const chartHeight = useBreakpointValue({ base: 220, sm: 240, md: 280, lg: 300, xl: 320 });
  const legendPosition = useBreakpointValue({ base: 'bottom', xl: 'right' });
  const isMobile = useBreakpointValue({ base: true, md: false });
  const primaryBlue = '#60a5fa';

  // Hooks
  const { loading: usersLoading, counts } = useFinanceUsers();
  const { loading: statsLoading, stats, updateParams: updateStatsParams } = useDashboardStats({});
  const { loading: analyticsLoading, analytics, updateParams: updateAnalyticsParams } = useDashboardAnalytics({ days: 14 });
  const { loading: invoicesLoading, invoices, updateParams: updateInvoiceParams } = useUnifiedInvoices({ pageSize: 5 });

  const [roleFilter, setRoleFilter] = useState('all');

  const loading = usersLoading || statsLoading || analyticsLoading;

  const userTypeFromRoleFilter = useMemo(() => {
    if (roleFilter === 'student') return 'student';
    if (roleFilter === 'teacher') return 'teacher';
    if (roleFilter === 'driver') return 'driver';
    return undefined; // 'all'
  }, [roleFilter]);

  useEffect(() => {
    // We do NOT update stats params here so it always fetches GLOBAL stats
    // updateStatsParams({ userType: userTypeFromRoleFilter }); 

    updateAnalyticsParams({ userType: userTypeFromRoleFilter, days: 14 });
    updateInvoiceParams({ userType: userTypeFromRoleFilter, page: 1, pageSize: 5 });
  }, [updateAnalyticsParams, updateInvoiceParams, userTypeFromRoleFilter]); // Removed updateStatsParams dependency

  // Safe counts with defaults
  const safeCounts = counts && typeof counts === 'object'
    ? { students: Number(counts.students) || 0, teachers: Number(counts.teachers) || 0, drivers: Number(counts.drivers) || 0 }
    : { students: 0, teachers: 0, drivers: 0 };

  const collections = useMemo(() => ({
    today: Number(stats?.collections?.today) || 0,
    last7Days: Number(stats?.collections?.last7Days) || 0,
    last30Days: Number(stats?.collections?.last30Days) || 0,
  }), [stats]);

  // Calculate role-based totals with null safety
  const roleStats = useMemo(() => {
    const defaultStats = { studentFees: 0, teacherPayroll: 0, driverPayroll: 0, total: 0, collected: 0, outstanding: 0, collectionRate: 0 };
    if (!stats) return defaultStats;

    // These are GLOBAL totals because we stopped filtering stats
    const studentFeesTotal = Number(stats.studentFees?.total) || 0;
    const teacherPayrollTotal = Number(stats.teacherPayroll?.total) || 0;
    const driverPayrollTotal = Number(stats.driverPayroll?.total) || 0;

    const studentFeesPaid = Number(stats.studentFees?.paid) || 0;
    const teacherPayrollPaid = Number(stats.teacherPayroll?.paid) || 0;
    const driverPayrollPaid = Number(stats.driverPayroll?.paid) || 0;

    const studentOutstanding = Number(stats.studentFees?.outstanding) || 0;
    const teacherOutstanding = Number(stats.teacherPayroll?.pending) || 0;
    const driverOutstanding = Number(stats.driverPayroll?.pending) || 0;

    // Calculate context-specific metrics based on filter
    let outstanding = 0;
    let paidBase = 0;
    let totalBase = 0;

    if (roleFilter === 'all') {
      outstanding = studentOutstanding + teacherOutstanding + driverOutstanding;
      paidBase = studentFeesPaid + teacherPayrollPaid + driverPayrollPaid;
      totalBase = studentFeesTotal + teacherPayrollTotal + driverPayrollTotal;
    } else if (roleFilter === 'student') {
      outstanding = studentOutstanding;
      paidBase = studentFeesPaid;
      totalBase = studentFeesTotal;
    } else if (roleFilter === 'teacher') {
      outstanding = teacherOutstanding;
      paidBase = teacherPayrollPaid;
      totalBase = teacherPayrollTotal;
    } else if (roleFilter === 'driver') {
      outstanding = driverOutstanding;
      paidBase = driverPayrollPaid;
      totalBase = driverPayrollTotal;
    }

    const total = studentFeesTotal + teacherPayrollTotal + driverPayrollTotal;
    const collectionRate = totalBase > 0 ? Math.round((paidBase / totalBase) * 100) : 0;

    return {
      studentFees: studentFeesTotal,     // Always Global
      teacherPayroll: teacherPayrollTotal, // Always Global
      driverPayroll: driverPayrollTotal,   // Always Global
      total,
      collected: Number(collections.last30Days) || 0,
      outstanding: outstanding,          // Filtered
      collectionRate,                    // Filtered
    };
  }, [collections.last30Days, roleFilter, stats]);

  const safeDonutSeries = (series) => {
    const s = Array.isArray(series) ? series.map((v) => Number(v) || 0) : [];
    const sum = s.reduce((a, b) => a + b, 0);
    return sum > 0 ? s : [];
  };

  // Invoice status breakdown
  const statusBreakdown = safeDonutSeries(
    stats?.invoices
      ? [Number(stats.invoices.paid) || 0, Number(stats.invoices.pending) || 0, Number(stats.invoices.overdue) || 0]
      : []
  );

  const collectionsTrend = useMemo(() => ({
    categories: analytics?.collectionsTrend?.categories || [],
    series: analytics?.collectionsTrend?.series || [],
  }), [analytics]);

  const paymentMethods = useMemo(() => ({
    labels: analytics?.paymentMethods?.labels || [],
    series: safeDonutSeries(analytics?.paymentMethods?.series || []),
  }), [analytics]);

  const overdueAging = useMemo(() => ({
    categories: analytics?.overdueAging?.categories || [],
    series: analytics?.overdueAging?.series || [],
  }), [analytics]);

  const topDefaulters = useMemo(() => ({
    categories: analytics?.topOutstanding?.categories || [],
    series: analytics?.topOutstanding?.series || [],
  }), [analytics]);

  const exportCSV = () => {
    const safeInvoices = invoices || [];
    const header = ['Invoice', 'User Type', 'User', 'Amount', 'Status', 'Date'];
    const data = safeInvoices.map(i => [i.invoiceNumber, i.userType, i.userName, i.total, i.status, i.issuedAt?.slice(0, 10)]);
    const csv = [header, ...data].map(a => a.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recent_invoices.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported successfully', status: 'success', duration: 2000 });
  };

  if (loading) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }} textAlign="center">
        <Spinner size="xl" />
        <Text mt={3}>Loading dashboard...</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Fee Dashboard</Heading>
          <Text color={textColorSecondary}>Unified overview of all financial operations</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* No Users Warning */}
      <NoUsersWarning counts={safeCounts} />

      {/* Role Filter Tabs */}
      <Card p={4} mb={5}>
        <UserTypeFilter value={roleFilter} onChange={setRoleFilter} counts={safeCounts} />
      </Card>

      {/* Role-based Statistics */}
      <SimpleGrid columns={{ base: 1, md: roleFilter === 'all' ? 4 : 2 }} spacing={5} mb={5}>
        {(roleFilter === 'all' || roleFilter === 'student') && (
          <StatCard
            title="Total Student Fees"
            value={`Rs. ${roleStats.studentFees.toLocaleString()}`}
            icon={FaUserGraduate}
            colorScheme="blue"
          />
        )}
        {(roleFilter === 'all' || roleFilter === 'teacher') && (
          <StatCard
            title="Total Teacher Payroll"
            value={`Rs. ${roleStats.teacherPayroll.toLocaleString()}`}
            icon={FaChalkboardTeacher}
            colorScheme="green"
          />
        )}
        {(roleFilter === 'all' || roleFilter === 'driver') && (
          <StatCard
            title="Total Driver Payroll"
            value={`Rs. ${roleStats.driverPayroll.toLocaleString()}`}
            icon={FaTruck}
            colorScheme="red"
          />
        )}
        <StatCard
          title="Collection Rate"
          value={`${roleStats.collectionRate}%`}
          icon={MdTrendingUp}
          colorScheme="orange"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard
          title="Today's Collection"
          value={`Rs. ${collections.today.toLocaleString()}`}
          icon={MdAttachMoney}
          colorScheme="green"
        />
        <StatCard
          title="Outstanding Fees"
          value={`Rs. ${roleStats.outstanding.toLocaleString()}`}
          icon={MdWarning}
          colorScheme="red"
        />
        <StatCard
          title="Last 7 Days"
          value={`Rs. ${collections.last7Days.toLocaleString()}`}
          icon={MdTrendingUp}
          colorScheme="orange"
        />
        <StatCard
          title="Last 30 Days"
          value={`Rs. ${collections.last30Days.toLocaleString()}`}
          icon={MdCalendarMonth}
          colorScheme="blue"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        {roleFilter === 'all' && (
          <Card p={4}>
            <Heading size='md' mb={3}>Role-wise Breakdown</Heading>
            <DonutChart
              height={chartHeight}
              series={safeDonutSeries([roleStats.studentFees, roleStats.teacherPayroll, roleStats.driverPayroll])}
              labels={['Student Fees', 'Teacher Payroll', 'Driver Payroll']}
              ariaLabel="Role-wise fees and payroll donut chart"
              options={{
                colors: [primaryBlue, '#22c55e', '#f59e0b'],
                legend: { position: legendPosition },
                tooltip: { y: { formatter: (v) => `Rs. ${Number(v || 0).toLocaleString()}` } },
              }}
            />
          </Card>
        )}
        <Card p={4}>
          <Heading size='md' mb={3}>Invoice Status</Heading>
          <DonutChart
            height={chartHeight}
            series={statusBreakdown}
            labels={['Paid', 'Pending', 'Overdue']}
            ariaLabel="Invoice status donut chart"
            options={{
              colors: ['#22c55e', '#f59e0b', '#ef4444'],
              legend: { position: legendPosition },
            }}
          />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Flex justify="space-between" align="center" mb={1}>
            <Heading size="md">Collections Trend</Heading>
          </Flex>
          <Text fontSize="sm" color={textColorSecondary} mb={3}>Last 14 days collected amount</Text>
          <AreaChart
            ariaLabel="Collections trend area chart"
            height={chartHeight}
            categories={collectionsTrend.categories}
            series={collectionsTrend.series}
            options={{
              colors: [primaryBlue],
              tooltip: { y: { formatter: (v) => `Rs. ${Number(v || 0).toLocaleString()}` } },
              yaxis: { labels: { formatter: (v) => `${Math.round(Number(v) || 0)}` } },
            }}
          />
        </Card>
        <Card p={4}>
          <Flex justify="space-between" align="center" mb={1}>
            <Heading size="md">Payment Methods</Heading>
          </Flex>
          <Text fontSize="sm" color={textColorSecondary} mb={3}>Share by payment method (amount)</Text>
          <DonutChart
            ariaLabel="Payment methods donut chart"
            height={chartHeight}
            labels={paymentMethods.labels}
            series={paymentMethods.series}
            options={{
              colors: [primaryBlue, '#22c55e', '#a78bfa', '#f59e0b', '#ef4444'],
              legend: { position: legendPosition },
              tooltip: { y: { formatter: (v) => `Rs. ${Number(v || 0).toLocaleString()}` } },
            }}
          />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5} mb={5}>
        <Card p={4}>
          <Flex justify="space-between" align="center" mb={1}>
            <Heading size="md">Overdue Aging</Heading>
          </Flex>
          <Text fontSize="sm" color={textColorSecondary} mb={3}>Outstanding amount by overdue bucket</Text>
          <BarChart
            ariaLabel="Overdue aging bar chart"
            height={chartHeight}
            categories={overdueAging.categories}
            series={overdueAging.series}
            options={{
              colors: [primaryBlue],
              tooltip: { y: { formatter: (v) => `Rs. ${Number(v || 0).toLocaleString()}` } },
            }}
          />
        </Card>
        <Card p={4}>
          <Flex justify="space-between" align="center" mb={1}>
            <Heading size="md">Top Outstanding</Heading>
          </Flex>
          <Text fontSize="sm" color={textColorSecondary} mb={3}>Users with highest remaining balances</Text>
          <BarChart
            ariaLabel="Top outstanding users bar chart"
            height={chartHeight}
            categories={topDefaulters.categories}
            series={topDefaulters.series}
            options={{
              colors: [primaryBlue],
              plotOptions: {
                bar: {
                  horizontal: true,
                  barHeight: topDefaulters.categories?.length <= 1 ? '28%' : '40%',
                },
              },
              xaxis: {
                labels: {
                  formatter: (v) => {
                    const n = Number(v || 0);
                    if (!Number.isFinite(n)) return '';
                    if (Math.abs(n) >= 1000000) return `Rs. ${(n / 1000000).toFixed(1)}M`;
                    if (Math.abs(n) >= 1000) return `Rs. ${(n / 1000).toFixed(1)}k`;
                    return `Rs. ${Math.round(n)}`;
                  },
                },
                tickAmount: 4,
              },
              yaxis: {
                labels: {
                  formatter: (v) => String(v || '').slice(0, 14),
                },
              },
              tooltip: { y: { formatter: (v) => `Rs. ${Number(v || 0).toLocaleString()}` } },
            }}
          />
        </Card>
      </SimpleGrid>

      {/* Recent Invoices */}
      <Card>
        <Box overflow='hidden'>
          <Heading size='md' p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            Recent Invoices
          </Heading>
          <Box maxH='360px' overflowY='auto'>
            <Table variant='simple' size='sm'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th>Invoice</Th>
                  <Th>Type</Th>
                  <Th>User</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invoicesLoading ? (
                  <Tr><Td colSpan={6} textAlign="center"><Spinner /></Td></Tr>
                ) : (!invoices || invoices.length === 0) ? (
                  <Tr><Td colSpan={6} textAlign="center" color="gray.500">No invoices found</Td></Tr>
                ) : invoices.map((i) => (
                  <Tr key={i.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='600'>{i.invoiceNumber}</Text></Td>
                    <Td>
                      <Badge colorScheme={i.userType === 'student' ? 'blue' : i.userType === 'teacher' ? 'green' : 'orange'}>
                        {i.userType}
                      </Badge>
                    </Td>
                    <Td>{i.userName}</Td>
                    <Td isNumeric>Rs. {Number(i.total || 0).toLocaleString()}</Td>
                    <Td>
                      <Badge colorScheme={i.status === 'paid' ? 'green' : i.status === 'pending' ? 'yellow' : 'red'}>
                        {i.status}
                      </Badge>
                    </Td>
                    <Td><Text color={textColorSecondary}>{i.issuedAt?.slice(0, 10)}</Text></Td>
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
