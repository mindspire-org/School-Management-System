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
import { 
  MdStarRate, 
  MdTrendingUp, 
  MdMoreVert,
  MdEdit,
  MdPreview,
  MdAssessment,
  MdBarChart,
  MdTimer,
} from 'react-icons/md';
import * as teacherApi from '../../../../services/api/teachers';

const periodOptions = [
  { label: 'Current Semester', value: 'current-semester' },
  { label: 'Last Semester', value: 'last-semester' },
  { label: 'Annual', value: 'annual' },
];

const statusOptions = ['excellent', 'good', 'average', 'needs improvement', 'pending'];

const TeacherPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailReview, setDetailReview] = useState(null);
  const [analyticsReview, setAnalyticsReview] = useState(null);
  const [editReview, setEditReview] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const detailDisclosure = useDisclosure();
  const analyticsDisclosure = useDisclosure();
  const editDisclosure = useDisclosure();

  // Colors
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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

  const averageOverall = useMemo(() => {
    if (!performanceData.length) return 0;
    const total = performanceData.reduce((sum, item) => sum + Number(item.overallScore || 0), 0);
    return total / performanceData.length;
  }, [performanceData]);

  const excellentCount = useMemo(() => performanceData.filter((item) => (item.status || '').toLowerCase() === 'excellent').length, [performanceData]);

  const needsImprovementCount = useMemo(() => performanceData.filter((item) => (item.status || '').toLowerCase() === 'needs improvement').length, [performanceData]);

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
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' icon={<Icon as={MdStarRate} w='24px' h='24px' color='white' />} />}
          name='Average Rating'
          value={`${averageOverall.toFixed(1)}/100`}
          growth='Current index'
          trendData={[70,75,80,85,averageOverall]}
          trendColor='#4facfe'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' icon={<Icon as={MdTrendingUp} w='24px' h='24px' color='white' />} />}
          name='Excellent Performers'
          value={String(excellentCount)}
          growth={`${performanceData.length ? Math.round((excellentCount / performanceData.length) * 100) : 0}% of total`}
          trendData={[1,2,2,3,excellentCount]}
          trendColor='#43e97b'
        />
        <MiniStatistics
          compact
          startContent={<IconBox w='48px' h='48px' bg='linear-gradient(135deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdTimer} w='24px' h='24px' color='white' />} />}
          name='Needs Improvement'
          value={String(needsImprovementCount || 0)}
          growth={`${performanceData.length ? Math.round(((needsImprovementCount || 0) / performanceData.length) * 100) : 0}% require attention`}
          trendData={[0,1,1,2,needsImprovementCount || 0]}
          trendColor='#FD7853'
        />
      </SimpleGrid>
      
      {/* Performance Table */}
      <Card overflow="hidden">
        <Flex p={4} justifyContent="space-between" alignItems="center" borderBottomWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" fontWeight="medium">Performance Metrics</Text>
          <Button leftIcon={<Icon as={MdAssessment} />} colorScheme="blue" variant="outline">
            Generate Report
          </Button>
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
