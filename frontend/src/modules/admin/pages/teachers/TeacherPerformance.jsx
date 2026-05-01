import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Icon,
  HStack,
  VStack,
  useColorModeValue,
  useToast,
  useDisclosure,
  Spinner,
  useBreakpointValue,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import BarChart from 'components/charts/BarChart.tsx';
import DonutChart from 'components/charts/v2/DonutChart.tsx';
import LineChart from 'components/charts/LineChart';
import {
  MdStarRate,
  MdTrendingUp,
  MdMoreVert,
  MdEdit,
  MdPreview,
  MdAssessment,
  MdBarChart,
  MdTimer,
  MdAdd,
} from 'react-icons/md';
import * as teacherApi from '../../../../services/api/teachers';

const periodOptions = [
  { label: 'Current Semester', value: 'current-semester' },
  { label: 'Last Semester', value: 'last-semester' },
  { label: 'Annual', value: 'annual' },
];

const statusOptions = ['excellent', 'good', 'average', 'needs improvement', 'pending'];

const DEMO_REVIEWS = [
  {
    id: 'demo-1',
    teacherId: 1,
    teacherName: 'Ayesha',
    subject: 'English',
    overallScore: 86,
    studentFeedbackScore: 84,
    attendanceScore: 92,
    classManagementScore: 80,
    examResultsScore: 83,
    status: 'good',
    periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  },
  {
    id: 'demo-2',
    teacherId: 2,
    teacherName: 'Bilal',
    subject: 'Mathematics',
    overallScore: 91,
    studentFeedbackScore: 88,
    attendanceScore: 95,
    classManagementScore: 89,
    examResultsScore: 92,
    status: 'excellent',
    periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'demo-3',
    teacherId: 3,
    teacherName: 'Hassan',
    subject: 'Physics',
    overallScore: 74,
    studentFeedbackScore: 76,
    attendanceScore: 70,
    classManagementScore: 73,
    examResultsScore: 75,
    status: 'average',
    periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
  },
  {
    id: 'demo-4',
    teacherId: 4,
    teacherName: 'Sana',
    subject: 'Chemistry',
    overallScore: 67,
    studentFeedbackScore: 62,
    attendanceScore: 78,
    classManagementScore: 66,
    examResultsScore: 63,
    status: 'needs improvement',
    periodEnd: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
];

const TeacherPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [detailReview, setDetailReview] = useState(null);
  const [analyticsReview, setAnalyticsReview] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [newForm, setNewForm] = useState({
    teacherId: '',
    periodType: periodOptions[0].value,
    periodLabel: '',
    periodStart: '',
    periodEnd: '',
    overallScore: '',
    studentFeedbackScore: '',
    attendanceScore: '',
    classManagementScore: '',
    examResultsScore: '',
    status: 'pending',
    improvement: '',
    remarks: '',
  });
  const [savingNew, setSavingNew] = useState(false);
  const toast = useToast();
  const detailDisclosure = useDisclosure();
  const analyticsDisclosure = useDisclosure();
  const editDisclosure = useDisclosure();
  const newDisclosure = useDisclosure();

  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const chartH = useBreakpointValue({ base: 240, md: 280, lg: 320 });

  const getColorScheme = (score) => {
    const value = Number(score || 0);
    if (value >= 90) return 'green';
    if (value >= 80) return 'blue';
    if (value >= 70) return 'orange';
    return 'red';
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'excellent':
        return 'green';
      case 'good':
        return 'blue';
      case 'average':
        return 'orange';
      case 'needs improvement':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatImprovement = (value) => {
    if (value === undefined || value === null) return '0%';
    const num = Number(value) || 0;
    const sign = num > 0 ? '+' : '';
    return `${sign}${num}%`;
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teacherApi.getPerformanceReviews({ periodType: selectedPeriod });
      setPerformanceData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPerformanceData([]);
      toast({
        title: 'Failed to load performance reviews',
        description: error?.message || 'Please try again later.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, toast]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  // Load teachers for selection in New Assessment modal
  const loadTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const res = await teacherApi.list({ page: 1, pageSize: 100 });
      setTeachers(Array.isArray(res?.rows) ? res.rows : []);
    } catch (e) {
      console.error(e);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const chartData = useMemo(() => (performanceData.length ? performanceData : DEMO_REVIEWS), [performanceData]);
  const hasRealData = Boolean(performanceData.length);

  const averageOverall = useMemo(() => {
    if (!chartData.length) return 0;
    const total = chartData.reduce((sum, item) => sum + Number(item.overallScore || 0), 0);
    return total / chartData.length;
  }, [chartData]);

  const excellentCount = useMemo(() => chartData.filter((item) => (item.status || '').toLowerCase() === 'excellent').length, [chartData]);

  const needsImprovementCount = useMemo(() => chartData.filter((item) => (item.status || '').toLowerCase() === 'needs improvement').length, [chartData]);

  const trendChart = useMemo(() => {
    const rows = [...chartData]
      .map((r, idx) => {
        const d = r.periodEnd || r.periodStart || r.updatedAt || r.createdAt;
        const stamp = d ? new Date(d).getTime() : 0;
        return { ...r, _stamp: stamp, _idx: idx };
      })
      .sort((a, b) => (a._stamp || a._idx) - (b._stamp || b._idx))
      .slice(-8);

    const categories = rows.map((r) => {
      const d = r.periodEnd || r.periodStart || r.updatedAt || r.createdAt;
      if (d) {
        try {
          return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch {
          return String(r.teacherName || `#${r.teacherId}`);
        }
      }
      return String(r.teacherName || `#${r.teacherId || r._idx + 1}`);
    });

    return {
      categories,
      series: [{ name: 'Overall', data: rows.map((r) => Math.round(Number(r.overallScore || 0))) }],
    };
  }, [chartData]);

  const statusDonut = useMemo(() => {
    const order = ['excellent', 'good', 'average', 'needs improvement', 'pending'];
    const counts = {};
    chartData.forEach((r) => {
      const s = String(r.status || 'pending').toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    const labels = order.filter((k) => counts[k]).map((k) => k.replace(/(^.|\s.)/g, (m) => m.toUpperCase()));
    const series = labels.map((l) => counts[l.toLowerCase()]);
    return { labels, series };
  }, [chartData]);

  const metricAvgBar = useMemo(() => {
    const avg = (key) => {
      if (!chartData.length) return 0;
      const total = chartData.reduce((sum, r) => sum + Number(r[key] || 0), 0);
      return Math.round(total / chartData.length);
    };
    const categories = ['Student Feedback', 'Attendance', 'Class Mgmt', 'Exam Results'];
    const data = [
      avg('studentFeedbackScore'),
      avg('attendanceScore'),
      avg('classManagementScore'),
      avg('examResultsScore'),
    ];
    return { categories, series: [{ name: 'Avg %', data }] };
  }, [chartData]);

  const topBar = useMemo(() => {
    const rows = [...chartData]
      .map((r) => ({ name: r.teacherName || `#${r.teacherId}`, value: Number(r.overallScore || 0) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    return {
      categories: rows.map((r) => r.name),
      series: [{ name: 'Overall', data: rows.map((r) => Math.round(r.value)) }],
    };
  }, [chartData]);

  const handleOpenDetail = (review) => {
    setDetailReview(review);
    detailDisclosure.onOpen();
  };

  const handleOpenAnalytics = (review) => {
    setAnalyticsReview(review);
    analyticsDisclosure.onOpen();
  };

  const handleOpenEdit = (review) => {
    setEditReview(review);
    setEditForm({
      overallScore: review?.overallScore ?? 0,
      studentFeedbackScore: review?.studentFeedbackScore ?? 0,
      attendanceScore: review?.attendanceScore ?? 0,
      classManagementScore: review?.classManagementScore ?? 0,
      examResultsScore: review?.examResultsScore ?? 0,
      improvement: review?.improvement ?? 0,
      status: review?.status || 'pending',
      remarks: review?.remarks || '',
    });
    editDisclosure.onOpen();
  };

  const closeDetailModal = () => {
    detailDisclosure.onClose();
    setDetailReview(null);
  };

  const closeAnalyticsModal = () => {
    analyticsDisclosure.onClose();
    setAnalyticsReview(null);
  };

  const closeEditModal = () => {
    editDisclosure.onClose();
    setEditReview(null);
    setEditForm(null);
  };

  const openNewModal = () => {
    setNewForm((prev) => ({ ...(prev || {}), periodType: selectedPeriod }));
    newDisclosure.onOpen();
  };

  const closeNewModal = () => {
    newDisclosure.onClose();
  };

  const updateEditField = (field, value) => {
    setEditForm((prev) => ({
      ...(prev || {}),
      [field]: value,
    }));
  };

  const handleReviewUpdated = (updated) => {
    if (!updated) return;
    setPerformanceData((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleEditSubmit = async (e) => {
    e?.preventDefault();
    if (!editReview || !editForm) return;
    setSaving(true);
    try {
      const payload = {
        status: editForm.status,
        remarks: editForm.remarks,
      };
      ['overallScore', 'studentFeedbackScore', 'attendanceScore', 'classManagementScore', 'examResultsScore', 'improvement'].forEach((field) => {
        const value = editForm[field];
        payload[field] = value === '' || value === null || value === undefined ? null : Number(value);
      });
      const updated = await teacherApi.updatePerformanceReview(editReview.id, payload);
      handleReviewUpdated(updated);
      toast({
        title: 'Performance review updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      closeEditModal();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to update review',
        description: error?.message || 'Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNewSubmit = async (e) => {
    e?.preventDefault();
    if (!newForm || !newForm.teacherId || !newForm.periodType) {
      toast({ title: 'Teacher and period are required', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setSavingNew(true);
    try {
      const payload = {
        teacherId: Number(newForm.teacherId),
        periodType: newForm.periodType,
        periodLabel: newForm.periodLabel || null,
        periodStart: newForm.periodStart || null,
        periodEnd: newForm.periodEnd || null,
        status: newForm.status || 'pending',
        remarks: newForm.remarks || null,
      };
      ['overallScore', 'studentFeedbackScore', 'attendanceScore', 'classManagementScore', 'examResultsScore', 'improvement'].forEach((f) => {
        const v = newForm[f];
        payload[f] = v === '' || v === null || v === undefined ? null : Number(v);
      });

      const created = await teacherApi.createPerformanceReview(payload);
      setPerformanceData((prev) => (created?.periodType === selectedPeriod ? [created, ...prev] : prev));
      toast({ title: 'Performance review created', status: 'success', duration: 3000, isClosable: true });
      closeNewModal();
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create review', description: error?.message || 'Please try again.', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setSavingNew(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Teacher Performance</Heading>
          <Text color={textColorSecondary}>Evaluate and track teaching staff performance</Text>
        </Box>
        <Select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          width={{ base: 'full', md: '220px' }}
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Flex>

      {/* Performance Overview Cards - redesigned */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard
          title='Average Rating'
          value={`${averageOverall.toFixed(1)}/100`}
          subValue={hasRealData ? 'Current index' : 'Demo index'}
          icon={MdStarRate}
          colorScheme='blue'
          trend='up'
          trendValue={2}
        />
        <StatCard
          title='Excellent Performers'
          value={String(excellentCount)}
          subValue={`${chartData.length ? Math.round((excellentCount / chartData.length) * 100) : 0}%`}
          icon={MdTrendingUp}
          colorScheme='green'
          note={hasRealData ? 'Of total reviews' : 'Demo data'}
        />
        <StatCard
          title='Needs Improvement'
          value={String(needsImprovementCount || 0)}
          subValue={`${chartData.length ? Math.round(((needsImprovementCount || 0) / chartData.length) * 100) : 0}%`}
          icon={MdTimer}
          colorScheme='orange'
          note={hasRealData ? 'Require attention' : 'Demo data'}
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5} mb={5}>
        <Card p='20px' gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Overall Trend</Text>
              <Text fontSize='sm' color={textColorSecondary}>Score trend for selected period</Text>
            </Box>
            <Badge colorScheme='blue'>{hasRealData ? `${performanceData.length} reviews` : 'Demo'}</Badge>
          </Flex>
          <LineChart
            height={chartH || 280}
            chartData={trendChart.series}
            chartOptions={{
              stroke: { curve: 'smooth', width: 3 },
              colors: ['#60a5fa'],
              xaxis: { categories: trendChart.categories },
              yaxis: { min: 0, max: 100 },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
                    xaxis: { labels: { rotate: -45, hideOverlappingLabels: true } },
                    legend: { position: 'bottom' },
                  },
                },
              ],
              tooltip: { shared: true, intersect: false },
            }}
          />
        </Card>

        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Status Distribution</Text>
              <Text fontSize='sm' color={textColorSecondary}>Review outcomes</Text>
            </Box>
            <Badge colorScheme='purple'>Donut</Badge>
          </Flex>
          <DonutChart
            ariaLabel='Performance status donut'
            height={chartH || 280}
            labels={statusDonut.labels}
            series={statusDonut.series}
            options={{
              colors: ['#22c55e', '#60a5fa', '#f59e0b', '#fb923c', '#94a3b8'],
              legend: { position: 'bottom' },
            }}
          />
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5} mb={5}>
        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Metric Averages</Text>
              <Text fontSize='sm' color={textColorSecondary}>Average % across reviews</Text>
            </Box>
            <Badge colorScheme='green'>Avg</Badge>
          </Flex>
          <BarChart
            ariaLabel='Metric averages'
            height={chartH || 280}
            categories={metricAvgBar.categories}
            series={metricAvgBar.series}
            options={{
              colors: ['#60a5fa'],
              yaxis: { min: 0, max: 100 },
              plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
                    legend: { position: 'bottom' },
                    plotOptions: { bar: { columnWidth: '70%' } },
                    xaxis: { labels: { rotate: -35, hideOverlappingLabels: true } },
                  },
                },
              ],
              tooltip: { y: { formatter: (v) => `${Math.round(v)}%` } },
            }}
          />
        </Card>

        <Card p='20px'>
          <Flex justify='space-between' align='center' mb='12px'>
            <Box>
              <Text fontSize='lg' fontWeight='bold'>Top Performers</Text>
              <Text fontSize='sm' color={textColorSecondary}>Highest overall scores</Text>
            </Box>
            <Badge colorScheme='blue'>Top 6</Badge>
          </Flex>
          <BarChart
            ariaLabel='Top performers'
            height={chartH || 280}
            categories={topBar.categories}
            series={topBar.series}
            options={{
              colors: ['#60a5fa'],
              yaxis: { min: 0, max: 100 },
              plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
              responsive: [
                {
                  breakpoint: 640,
                  options: {
                    legend: { position: 'bottom' },
                    plotOptions: { bar: { columnWidth: '70%' } },
                    xaxis: { labels: { rotate: -35, hideOverlappingLabels: true } },
                  },
                },
              ],
              tooltip: { y: { formatter: (v) => `${Math.round(v)}%` } },
            }}
          />
        </Card>
      </SimpleGrid>

      {/* Performance Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Performance Metrics</Text>
          <HStack spacing={3}>
            <Button leftIcon={<Icon as={MdAdd} />} colorScheme="blue" onClick={openNewModal}>
              New Assessment
            </Button>
            <Button leftIcon={<Icon as={MdAssessment} />} colorScheme="blue" variant="outline">
              Generate Report
            </Button>
          </HStack>
        </Flex>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Teacher</Th>
                <Th>Subject</Th>
                <Th>Student Feedback</Th>
                <Th>Attendance</Th>
                <Th>Class Management</Th>
                <Th>Exam Results</Th>
                <Th>Overall</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={9}>
                    <Flex align="center" justify="center" py={8}>
                      <Spinner size="sm" mr={3} />
                      <Text>Loading performance reviews...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : performanceData.length === 0 ? (
                <Tr>
                  <Td colSpan={9}>
                    <Text textAlign="center" py={6} color={textColorSecondary}>
                      No performance reviews found for the selected period.
                    </Text>
                  </Td>
                </Tr>
              ) : (
                performanceData.map((review) => (
                  <Tr key={review.id}>
                    <Td>
                      <Flex align="center">
                        <Avatar size="sm" name={review.teacherName} mr={3} />
                        <Box>
                          <Text fontWeight="medium">{review.teacherName}</Text>
                          <Text fontSize="sm" color={textColorSecondary}>
                            {review.employeeId || `Teacher #${review.teacherId}`}
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>{review.subject || '—'}</Td>
                    <Td>
                      <HStack>
                        <Progress
                          value={Number(review.studentFeedbackScore || 0)}
                          colorScheme={getColorScheme(review.studentFeedbackScore)}
                          size="sm"
                          borderRadius="md"
                          width="100px"
                        />
                        <Text fontSize="sm">{Number(review.studentFeedbackScore || 0)}%</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Progress
                          value={Number(review.attendanceScore || 0)}
                          colorScheme={getColorScheme(review.attendanceScore)}
                          size="sm"
                          borderRadius="md"
                          width="100px"
                        />
                        <Text fontSize="sm">{Number(review.attendanceScore || 0)}%</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Progress
                          value={Number(review.classManagementScore || 0)}
                          colorScheme={getColorScheme(review.classManagementScore)}
                          size="sm"
                          borderRadius="md"
                          width="100px"
                        />
                        <Text fontSize="sm">{Number(review.classManagementScore || 0)}%</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Progress
                          value={Number(review.examResultsScore || 0)}
                          colorScheme={getColorScheme(review.examResultsScore)}
                          size="sm"
                          borderRadius="md"
                          width="100px"
                        />
                        <Text fontSize="sm">{Number(review.examResultsScore || 0)}%</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Text fontSize="md" fontWeight="bold" color={`${getColorScheme(review.overallScore)}.500`}>
                          {Number(review.overallScore || 0)}%
                        </Text>
                        <Text fontSize="sm" color={(review.improvement ?? 0) >= 0 ? 'green.500' : 'red.500'}>
                          {formatImprovement(review.improvement)}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(review.status)}
                        borderRadius="full"
                        px={2}
                        py={1}
                        textTransform="capitalize"
                      >
                        {review.status || 'pending'}
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
                          <MenuItem icon={<Icon as={MdPreview} />} onClick={() => handleOpenDetail(review)}>
                            View Details
                          </MenuItem>
                          <MenuItem icon={<Icon as={MdBarChart} />} onClick={() => handleOpenAnalytics(review)}>
                            View Analytics
                          </MenuItem>
                          <MenuItem icon={<Icon as={MdEdit} />} onClick={() => handleOpenEdit(review)}>
                            Edit Assessment
                          </MenuItem>
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

      {/* Detail Modal */}
      <Modal isOpen={detailDisclosure.isOpen} onClose={closeDetailModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Performance Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {detailReview && (
              <VStack align="stretch" spacing={4} fontSize="sm">
                <Box>
                  <Text fontWeight="bold">Teacher</Text>
                  <Text>{detailReview.teacherName}</Text>
                  <Text color={textColorSecondary}>{detailReview.employeeId || `Teacher #${detailReview.teacherId}`}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Period</Text>
                  <Text>{detailReview.periodLabel || detailReview.periodType || '—'}</Text>
                  <Text color={textColorSecondary}>
                    {formatDate(detailReview.periodStart)} - {formatDate(detailReview.periodEnd)}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Status</Text>
                  <Badge colorScheme={getStatusColor(detailReview.status)} textTransform="capitalize">
                    {detailReview.status || 'pending'}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">Remarks</Text>
                  <Text whiteSpace="pre-wrap">{detailReview.remarks || 'No remarks recorded.'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Recorded</Text>
                  <Text>Created: {formatDate(detailReview.createdAt)}</Text>
                  <Text>Updated: {formatDate(detailReview.updatedAt)}</Text>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeDetailModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* New Assessment Modal */}
      <Modal isOpen={newDisclosure.isOpen} onClose={closeNewModal} size="xl">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleNewSubmit}>
          <ModalHeader>New Performance Assessment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Teacher</FormLabel>
                <Select
                  value={newForm.teacherId}
                  onChange={(e) => setNewForm((p) => ({ ...(p || {}), teacherId: e.target.value }))}
                  placeholder={loadingTeachers ? 'Loading teachers...' : 'Select teacher'}
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Period</FormLabel>
                <Select value={newForm.periodType} onChange={(e) => setNewForm((p) => ({ ...(p || {}), periodType: e.target.value }))}>
                  {periodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Period Label</FormLabel>
                <Input value={newForm.periodLabel} onChange={(e) => setNewForm((p) => ({ ...(p || {}), periodLabel: e.target.value }))} placeholder="e.g. Spring 2025" />
              </FormControl>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input type="date" value={newForm.periodStart} onChange={(e) => setNewForm((p) => ({ ...(p || {}), periodStart: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input type="date" value={newForm.periodEnd} onChange={(e) => setNewForm((p) => ({ ...(p || {}), periodEnd: e.target.value }))} />
              </FormControl>
              {[
                { label: 'Overall Score', field: 'overallScore' },
                { label: 'Student Feedback', field: 'studentFeedbackScore' },
                { label: 'Attendance', field: 'attendanceScore' },
                { label: 'Class Management', field: 'classManagementScore' },
                { label: 'Exam Results', field: 'examResultsScore' },
                { label: 'Improvement (%)', field: 'improvement' },
              ].map((input) => (
                <FormControl key={input.field}>
                  <FormLabel>{input.label}</FormLabel>
                  <Input
                    type="number"
                    min={input.field === 'improvement' ? -100 : 0}
                    max={100}
                    value={newForm[input.field]}
                    onChange={(e) => setNewForm((p) => ({ ...(p || {}), [input.field]: e.target.value }))}
                  />
                </FormControl>
              ))}
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select value={newForm.status} onChange={(e) => setNewForm((p) => ({ ...(p || {}), status: e.target.value }))}>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/(^.|\s.)/g, (m) => m.toUpperCase())}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl gridColumn={{ base: 'auto', md: 'span 2' }}>
                <FormLabel>Remarks</FormLabel>
                <Textarea rows={4} value={newForm.remarks} onChange={(e) => setNewForm((p) => ({ ...(p || {}), remarks: e.target.value }))} placeholder="Add notes or action items" />
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button onClick={closeNewModal} variant="ghost">Cancel</Button>
              <Button colorScheme="blue" type="submit" isLoading={savingNew} loadingText="Creating">Create</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Analytics Modal */}
      <Modal isOpen={analyticsDisclosure.isOpen} onClose={closeAnalyticsModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Performance Analytics</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {analyticsReview && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {[
                  { label: 'Student Feedback', value: analyticsReview.studentFeedbackScore },
                  { label: 'Attendance', value: analyticsReview.attendanceScore },
                  { label: 'Class Management', value: analyticsReview.classManagementScore },
                  { label: 'Exam Results', value: analyticsReview.examResultsScore },
                  { label: 'Overall Score', value: analyticsReview.overallScore },
                  { label: 'Improvement', value: formatImprovement(analyticsReview.improvement) },
                ].map((metric) => (
                  <Card key={metric.label} p={4}>
                    <Text fontWeight="medium" mb={2}>{metric.label}</Text>
                    {metric.label === 'Improvement' ? (
                      <Text fontSize="lg" color={(analyticsReview.improvement ?? 0) >= 0 ? 'green.500' : 'red.500'}>
                        {metric.value}
                      </Text>
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        <Progress
                          value={Number(metric.value || 0)}
                          colorScheme={getColorScheme(metric.value)}
                          size="sm"
                          borderRadius="md"
                        />
                        <Text fontSize="sm">{Number(metric.value || 0)}%</Text>
                      </VStack>
                    )}
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeAnalyticsModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editDisclosure.isOpen} onClose={closeEditModal} size="xl">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleEditSubmit}>
          <ModalHeader>Edit Performance Assessment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editForm && (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {[
                  { label: 'Overall Score', field: 'overallScore' },
                  { label: 'Student Feedback', field: 'studentFeedbackScore' },
                  { label: 'Attendance', field: 'attendanceScore' },
                  { label: 'Class Management', field: 'classManagementScore' },
                  { label: 'Exam Results', field: 'examResultsScore' },
                  { label: 'Improvement (%)', field: 'improvement' },
                ].map((input) => {
                  const isImprovementField = input.field === 'improvement';
                  return (
                    <FormControl key={input.field}>
                      <FormLabel>{input.label}</FormLabel>
                      <Input
                        type="number"
                        value={editForm[input.field]}
                        onChange={(e) => updateEditField(input.field, e.target.value)}
                        min={isImprovementField ? -100 : 0}
                        max={100}
                      />
                    </FormControl>
                  );
                })}
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={editForm.status} onChange={(e) => updateEditField('status', e.target.value)}>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace(/(^.|\s.)/g, (m) => m.toUpperCase())}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl gridColumn={{ base: 'auto', md: 'span 2' }}>
                  <FormLabel>Remarks</FormLabel>
                  <Textarea
                    rows={4}
                    value={editForm.remarks}
                    onChange={(e) => updateEditField('remarks', e.target.value)}
                    placeholder='Add notes or action items'
                  />
                </FormControl>
              </SimpleGrid>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button onClick={closeEditModal} variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit" isLoading={saving} loadingText="Saving">
                Save Changes
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TeacherPerformance;
