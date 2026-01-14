import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Badge,
  Avatar,
  Checkbox,
  Spinner,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  fetchStudents,
  setFilters,
  clearFilters,
  setPagination,
  toggleStudentSelection,
  selectAllStudentsAction,
  clearSelectedStudents,
  bulkDeleteStudents,
  bulkUpdateStudents,
  selectAllStudents,
  selectFilteredStudents,
  selectPaginatedStudents,
  selectStudentStats,
  selectPagination,
  selectSelectedStudents,
  areAllStudentsSelected,
  isStudentSelected,
} from '../../redux/features/students/studentSlice';
import { SearchIcon } from '@chakra-ui/icons';
import {
  MdEdit,
  MdDelete,
  MdDownload,
  MdPrint,
  MdFilterList,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdFirstPage,
  MdLastPage,
  MdMoreVert,
  MdPersonAdd,
  MdAccessTime,
  MdBlock,
  MdSchool,
  MdDirectionsBus,
  MdPayment,
  MdContentCopy,
  MdRestartAlt,
  MdCheckCircle,
  MdCancel,
  MdPerson,
} from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

function StudentList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isStatusAlertOpen, setIsStatusAlertOpen] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const cancelRef = React.useRef();

  // Redux state
  const students = useAppSelector(selectAllStudents);
  const filteredStudents = useAppSelector(selectFilteredStudents);
  const paginatedStudents = useAppSelector(selectPaginatedStudents);
  const stats = useAppSelector(selectStudentStats);
  const pagination = useAppSelector(selectPagination);
  const selectedStudents = useAppSelector(selectSelectedStudents);
  const allSelected = useAppSelector(areAllStudentsSelected);
  const loading = useAppSelector(state => state.students.loading);
  const bulkActionLoading = useAppSelector(state => state.students.bulkActionLoading);
  const error = useAppSelector(state => state.students.error);
  
  // Filters local state (for filter form)
  const [filterValues, setFilterValues] = useState({
    class: 'all',
    section: 'all',
    status: 'all',
    transport: 'all',
    feeStatus: 'all',
    searchTerm: '',
  });
  
  // UI colors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const bgHover = useColorModeValue(
    { bg: 'secondaryGray.400' },
    { bg: 'whiteAlpha.50' }
  );
  const bgFocus = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.100' }
  );

  // Load students on mount
  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  };
  
  // Apply filters
  const applyFilters = () => {
    dispatch(setFilters(filterValues));
    // Reset pagination to first page when applying new filters
    dispatch(setPagination({ currentPage: 1 }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterValues({
      class: 'all',
      section: 'all',
      status: 'all',
      transport: 'all',
      feeStatus: 'all',
      searchTerm: '',
    });
    dispatch(clearFilters());
  };
  
  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setFilterValues(prev => ({ ...prev, searchTerm: value }));
    
    // Apply search filter with small delay
    const timer = setTimeout(() => {
      dispatch(setFilters({ searchTerm: value }));
    }, 300);
    
    return () => clearTimeout(timer);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(setPagination({ currentPage: newPage }));
  };
  
  // Handle bulk selection
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    dispatch(selectAllStudentsAction(isChecked));
  };
  
  // Handle single student selection
  const handleSelectStudent = (studentId) => {
    dispatch(toggleStudentSelection(studentId));
  };
  
  // Delete selected students
  const handleBulkDelete = () => {
    dispatch(bulkDeleteStudents(selectedStudents))
      .unwrap()
      .then(() => {
        toast({
          title: 'Students Deleted',
          description: `${selectedStudents.length} students have been deleted successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        setIsDeleteAlertOpen(false);
        dispatch(clearSelectedStudents());
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete students.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      });
  };
  
  // Update status of selected students
  const handleBulkStatusChange = (status) => {
    setStatusAction(status);
    setIsStatusAlertOpen(true);
  };
  
  const confirmStatusChange = () => {
    dispatch(bulkUpdateStudents({ studentIds: selectedStudents, data: { status: statusAction } }))
      .unwrap()
      .then(() => {
        toast({
          title: 'Status Updated',
          description: `${selectedStudents.length} students have been ${statusAction === 'active' ? 'activated' : 'deactivated'}.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        setIsStatusAlertOpen(false);
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update student status.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      });
  };
  
  // Navigate to student profile
  const goToStudentProfile = (studentId) => {
    navigate(`/admin/students/profile/${studentId}`);
  };
  
  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      default: return 'gray';
    }
  };
  
  // Fee status badge color mapping
  const getFeeStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'yellow';
      case 'overdue': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Grid
        mb="20px"
        gridTemplateColumns={{ xl: 'repeat(3, 1fr)', '2xl': '1fr 0.46fr' }}
        gap={{ base: '20px', xl: '20px' }}
        display={{ base: 'block', xl: 'grid' }}
      >
        <Box>
          <Heading as="h3" size="lg" mb="4">
            Students
          </Heading>
          <Text color="gray.500">Manage your students and their information</Text>
        </Box>
        <Flex justify="flex-end" />
      </Grid>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px" mb="20px">
        <Card>
          <Flex direction="column">
            <Flex align="center" mb="20px">
              <Icon as={MdPerson} h="24px" w="24px" color={brandColor} me="12px" />
              <Text fontSize="lg" fontWeight="700" color={textColor}>
                Total Students
              </Text>
            </Flex>
            <Text fontSize="34px" fontWeight="700" color={textColor}>
              {stats.totalStudents}
            </Text>
            <Text fontSize="sm" color={textColorSecondary} mt="8px">
              {stats.newThisMonth} new this month
            </Text>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction="column">
            <Flex align="center" mb="20px">
              <Icon as={MdCheckCircle} h="24px" w="24px" color="green.500" me="12px" />
              <Text fontSize="lg" fontWeight="700" color={textColor}>
                Active Students
              </Text>
            </Flex>
            <Text fontSize="34px" fontWeight="700" color="green.500">
              {stats.activeStudents}
            </Text>
            <Text fontSize="sm" color={textColorSecondary} mt="8px">
              {Math.round((stats.activeStudents / stats.totalStudents) * 100) || 0}% of total
            </Text>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction="column">
            <Flex align="center" mb="20px">
              <Icon as={MdCancel} h="24px" w="24px" color="red.500" me="12px" />
              <Text fontSize="lg" fontWeight="700" color={textColor}>
                Inactive Students
              </Text>
            </Flex>
            <Text fontSize="34px" fontWeight="700" color="red.500">
              {stats.inactiveStudents}
            </Text>
            <Text fontSize="sm" color={textColorSecondary} mt="8px">
              {Math.round((stats.inactiveStudents / stats.totalStudents) * 100) || 0}% of total
            </Text>
          </Flex>
        </Card>
        
        <Card>
          <Flex direction="column">
            <Flex align="center" mb="20px">
              <Icon as={MdDirectionsBus} h="24px" w="24px" color="blue.500" me="12px" />
              <Text fontSize="lg" fontWeight="700" color={textColor}>
                Bus Transport
              </Text>
            </Flex>
            <Text fontSize="34px" fontWeight="700" color="blue.500">
              {students.filter(s => s.busAssigned).length}
            </Text>
            <Text fontSize="sm" color={textColorSecondary} mt="8px">
              {Math.round((students.filter(s => s.busAssigned).length / stats.totalStudents) * 100) || 0}% of total
            </Text>
          </Flex>
        </Card>
      </SimpleGrid>

      {/* Filter and Search */}
      <Card mb="20px">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          mb="20px"
        >
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'flex-start', md: 'center' }}
            mb={{ base: '15px', md: '0px' }}
          >
            <HStack spacing={4} mb={{ base: '10px', md: '0px' }}>
              <Select
                value={filterValues.class}
                onChange={(e) => handleFilterChange('class', e.target.value)}
                width="120px"
                size="sm"
              >
                <option value="all">All Classes</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </Select>
              
              <Select
                value={filterValues.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                width="120px"
                size="sm"
              >
                <option value="all">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </Select>
              
              <Select
                value={filterValues.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                width="120px"
                size="sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
              
              <Button
                leftIcon={<MdFilterList />}
                size="sm"
                variant="outline"
                onClick={applyFilters}
              >
                Apply
              </Button>
              
              <Button
                leftIcon={<MdRestartAlt />}
                size="sm"
                variant="ghost"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </HStack>
          </Flex>
          
          <InputGroup width={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, ID, or RFID..."
              value={filterValues.searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </Flex>
      </Card>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <Card mb="20px" bg="blue.50" borderColor="blue.200">
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Text fontWeight="600">
                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              </Text>
              <Button size="sm" variant="ghost" onClick={() => dispatch(clearSelectedStudents())}>
                Clear Selection
              </Button>
            </HStack>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<MdCheckCircle />}
                onClick={() => handleBulkStatusChange('active')}
                isDisabled={bulkActionLoading}
              >
                Set Active
              </Button>
              <Button
                size="sm"
                colorScheme="orange"
                leftIcon={<MdBlock />}
                onClick={() => handleBulkStatusChange('inactive')}
                isDisabled={bulkActionLoading}
              >
                Set Inactive
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                leftIcon={<MdDelete />}
                onClick={() => setIsDeleteAlertOpen(true)}
                isDisabled={bulkActionLoading}
              >
                Delete
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  rightIcon={<Icon as={MdMoreVert} />}
                  isDisabled={bulkActionLoading}
                >
                  More
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<MdDownload />}>Export Selected</MenuItem>
                  <MenuItem icon={<MdPrint />}>Print List</MenuItem>
                  <MenuItem icon={<MdDirectionsBus />}>Assign Bus</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
          {bulkActionLoading && (
            <Flex justify="center" mt={2}>
              <Spinner size="sm" color="blue.500" mr={2} />
              <Text>Processing...</Text>
            </Flex>
          )}
        </Card>
      )}

      {/* Students Table */}
      <Card mb="20px" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th px="6px">
                  <Checkbox
                    isChecked={allSelected}
                    onChange={handleSelectAll}
                    isDisabled={loading}
                    colorScheme="brand"
                  />
                </Th>
                <Th>Student</Th>
                <Th>Roll Number</Th>
                <Th>Class</Th>
                <Th>Parent</Th>
                <Th>Transport</Th>
                <Th>Fee Status</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={9}>
                    <Flex justify="center" align="center" py={8}>
                      <Spinner size="lg" color="brand.500" mr={4} />
                      <Text>Loading students...</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : paginatedStudents.length === 0 ? (
                <Tr>
                  <Td colSpan={9}>
                    <Flex direction="column" justify="center" align="center" py={8}>
                      <Icon as={MdSchool} w={12} h={12} color="gray.400" mb={3} />
                      <Text fontSize="lg" fontWeight="medium">
                        No students found
                      </Text>
                      <Text color="gray.500">
                        {filterValues.searchTerm || filterValues.class !== 'all' 
                          ? "Try adjusting your search or filters" 
                          : "Start by adding a new student"}
                      </Text>
                      {(filterValues.searchTerm || filterValues.class !== 'all') && (
                        <Button
                          mt={4}
                          leftIcon={<MdRestartAlt />}
                          size="sm"
                          onClick={resetFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              ) : (
                paginatedStudents.map((student) => (
                  <Tr key={student.id} _hover={{ bg: 'gray.50' }}>
                    <Td px="6px">
                      <Checkbox
                        isChecked={useAppSelector(state => isStudentSelected(state, student.id))}
                        onChange={() => handleSelectStudent(student.id)}
                        colorScheme="brand"
                      />
                    </Td>
                    <Td>
                      <Flex align="center">
                        <Avatar
                          src={student.photo || ''}
                          name={student.name}
                          size="sm"
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="600" color={textColor} cursor="pointer" onClick={() => goToStudentProfile(student.id)}>
                            {student.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {student.email}
                          </Text>
                        </Box>
                      </Flex>
                    </Td>
                    <Td>{student.rollNumber}</Td>
                    <Td>{student.class}</Td>
                    <Td>
                      <Text fontWeight="500">{student.parentName}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {student.parentPhone}
                      </Text>
                    </Td>
                    <Td>
                      {student.busAssigned ? (
                        <Badge colorScheme="blue">Bus #{student.busNumber}</Badge>
                      ) : (
                        <Badge colorScheme="gray">No Bus</Badge>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme={getFeeStatusColor(student.feeStatus)}>
                        {student.feeStatus}
                      </Badge>
                      {student.feeAmount > 0 && (
                        <Text fontSize="xs" color="gray.500">
                          Due: Rs. {student.feeAmount}
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={Button}
                          variant="ghost"
                          size="sm"
                          rightIcon={<MdMoreVert />}
                        >
                          Actions
                        </MenuButton>
                        <MenuList>
                          <MenuItem 
                            icon={<MdPerson />} 
                            onClick={() => goToStudentProfile(student.id)}
                          >
                            View Profile
                          </MenuItem>
                          <MenuItem 
                            icon={<MdEdit />} 
                            as={Link}
                            to={`/admin/students/edit/${student.id}`}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem 
                            icon={<MdAccessTime />}
                            as={Link}
                            to={`/admin/students/attendance/${student.id}`}
                          >
                            Attendance
                          </MenuItem>
                          <MenuItem
                            icon={<MdPayment />}
                            as={Link}
                            to={`/admin/students/fees/${student.id}`}
                          >
                            Fees
                          </MenuItem>
                          {student.busAssigned && (
                            <MenuItem
                              icon={<MdDirectionsBus />}
                              as={Link}
                              to={`/admin/students/transport/${student.id}`}
                            >
                              Transport
                            </MenuItem>
                          )}
                          <MenuItem icon={<MdContentCopy />}>
                            Duplicate
                          </MenuItem>
                          <MenuItem 
                            icon={<MdDelete />} 
                            color="red.500"
                          >
                            Delete
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

      {/* Pagination */}
      {!loading && pagination.totalItems > 0 && (
        <Card p={4}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'center', md: 'center' }}
            justify="space-between"
          >
            <Text color="gray.600" mb={{ base: 2, md: 0 }}>
              Showing {((pagination.currentPage - 1) * pagination.rowsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.rowsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} students
            </Text>
            
            <HStack>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(1)}
                isDisabled={pagination.currentPage === 1}
              >
                <Icon as={MdFirstPage} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                isDisabled={pagination.currentPage === 1}
              >
                <Icon as={MdKeyboardArrowLeft} />
              </Button>
              
              <Text mx={2} fontWeight="medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </Text>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                isDisabled={pagination.currentPage === pagination.totalPages}
              >
                <Icon as={MdKeyboardArrowRight} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePageChange(pagination.totalPages)}
                isDisabled={pagination.currentPage === pagination.totalPages}
              >
                <Icon as={MdLastPage} />
              </Button>
              
              <Select
                size="sm"
                width="80px"
                value={pagination.rowsPerPage}
                onChange={(e) => dispatch(setPagination({ rowsPerPage: Number(e.target.value) }))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </HStack>
          </Flex>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Students
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {selectedStudents.length} students? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleBulkDelete} ml={3} isLoading={bulkActionLoading}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        isOpen={isStatusAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsStatusAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Change Student Status
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to {statusAction === 'active' ? 'activate' : 'deactivate'} {selectedStudents.length} students?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsStatusAlertOpen(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme={statusAction === 'active' ? 'blue' : 'orange'} 
                onClick={confirmStatusChange} 
                ml={3} 
                isLoading={bulkActionLoading}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default StudentList;
