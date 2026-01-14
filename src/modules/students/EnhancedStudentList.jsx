import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdPersonAdd } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

// Import components
import StudentStatsCards from './components/StudentStatsCards';
import StudentFiltersPanel from './components/StudentFiltersPanel';
import StudentBulkActions from './components/StudentBulkActions';
import StudentTable from './components/StudentTable';
import StudentPagination from './components/StudentPagination';
import StudentExportOptions from './components/StudentExportOptions';
import ErrorBoundary from '../../components/ErrorBoundary';

// Mock data for demonstration
const mockStudents = [
  {
    id: 1,
    name: 'Ahmed Khan',
    rollNumber: 'STD001',
    class: '10',
    section: 'A',
    rfidTag: 'RFID-1234',
    attendance: 95,
    feeStatus: 'paid',
    busAssigned: true,
    busNumber: '001',
    parentName: 'Zubair Khan',
    parentPhone: '+92 300 1234567',
    email: 'ahmed@example.com',
    status: 'active',
    lastActive: '2 hours ago',
    photo: '',
  },
  {
    id: 2,
    name: 'Fatima Ali',
    rollNumber: 'STD002',
    class: '10',
    section: 'B',
    rfidTag: 'RFID-2345',
    attendance: 88,
    feeStatus: 'pending',
    busAssigned: true,
    busNumber: '002',
    parentName: 'Tariq Ali',
    parentPhone: '+92 300 9876543',
    email: 'fatima@example.com',
    status: 'active',
    lastActive: '5 hours ago',
    photo: '',
  },
  {
    id: 3,
    name: 'Zainab Hassan',
    rollNumber: 'STD003',
    class: '11',
    section: 'A',
    rfidTag: 'RFID-3456',
    attendance: 78,
    feeStatus: 'overdue',
    busAssigned: false,
    busNumber: '',
    parentName: 'Nasir Hassan',
    parentPhone: '+92 300 5555666',
    email: 'zainab@example.com',
    status: 'inactive',
    lastActive: '1 day ago',
    photo: '',
  },
  {
    id: 4,
    name: 'Mohammad Raza',
    rollNumber: 'STD004',
    class: '11',
    section: 'B',
    rfidTag: 'RFID-4567',
    attendance: 92,
    feeStatus: 'paid',
    busAssigned: true,
    busNumber: '001',
    parentName: 'Imran Raza',
    parentPhone: '+92 300 7778888',
    email: 'mohammad@example.com',
    status: 'active',
    lastActive: '3 hours ago',
    photo: '',
  },
];

// Mock stats data
const mockStats = {
  totalStudents: 1250,
  activeStudents: 1180,
  inactiveStudents: 70,
  newThisMonth: 45,
  busUsers: 780,
  paidFeesCount: 950,
  pendingFeesCount: 180,
  overdueFeesCount: 120,
  averageAttendance: 92.4,
};

const EnhancedStudentList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = React.useRef();
  const { isOpen: isDeleteAlertOpen, onOpen: onOpenDeleteAlert, onClose: onCloseDeleteAlert } = useDisclosure();
  const { isOpen: isStatusAlertOpen, onOpen: onOpenStatusAlert, onClose: onCloseStatusAlert } = useDisclosure();
  
  // State
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  
  // Filter state
  const [filterValues, setFilterValues] = useState({
    class: 'all',
    section: 'all',
    status: 'all',
    transport: 'all',
    feeStatus: 'all',
    searchTerm: '',
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 5,
    rowsPerPage: 10,
    totalItems: 50,
  });
  
  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);
  
  // Apply filters when filterValues change
  useEffect(() => {
    applyFilters();
  }, [filterValues]);
  
  // Simulated loading of students
  const loadStudents = () => {
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
      setPagination(prev => ({
        ...prev,
        totalItems: mockStudents.length,
        totalPages: Math.ceil(mockStudents.length / prev.rowsPerPage),
      }));
      setLoading(false);
    }, 500);
  };
  
  // Apply filters to students
  const applyFilters = () => {
    // Simple client-side filtering
    let filtered = [...students];
    
    if (filterValues.class !== 'all') {
      filtered = filtered.filter(student => student.class === filterValues.class);
    }
    
    if (filterValues.section !== 'all') {
      filtered = filtered.filter(student => student.section === filterValues.section);
    }
    
    if (filterValues.status !== 'all') {
      filtered = filtered.filter(student => student.status === filterValues.status);
    }
    
    if (filterValues.transport !== 'all') {
      if (filterValues.transport === 'bus') {
        filtered = filtered.filter(student => student.busAssigned);
      } else if (filterValues.transport === 'no-bus') {
        filtered = filtered.filter(student => !student.busAssigned);
      }
    }
    
    if (filterValues.feeStatus !== 'all') {
      filtered = filtered.filter(student => student.feeStatus === filterValues.feeStatus);
    }
    
    if (filterValues.searchTerm) {
      const term = filterValues.searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(term) ||
        student.rollNumber.toLowerCase().includes(term) ||
        student.rfidTag.toLowerCase().includes(term) ||
        student.parentName.toLowerCase().includes(term)
      );
    }
    
    setFilteredStudents(filtered);
    setPagination(prev => ({
      ...prev,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.rowsPerPage),
      currentPage: 1, // Reset to first page on filter change
    }));
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
    setFilteredStudents(students);
    setPagination(prev => ({
      ...prev,
      totalItems: students.length,
      totalPages: Math.ceil(students.length / prev.rowsPerPage),
      currentPage: 1,
    }));
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage,
    }));
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: newRowsPerPage,
      totalPages: Math.ceil(prev.totalItems / newRowsPerPage),
      currentPage: 1, // Reset to first page
    }));
  };
  
  // Handle selecting all students
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const allStudentIds = filteredStudents.map(student => student.id);
      setSelectedStudents(allStudentIds);
    } else {
      setSelectedStudents([]);
    }
  };
  
  // Handle selecting individual student
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  // Check if all students are selected
  const areAllStudentsSelected = () => {
    return filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  };
  
  // Check if a student is selected
  const isStudentSelected = (studentId) => {
    return selectedStudents.includes(studentId);
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    onOpenDeleteAlert();
  };
  
  // Confirm bulk delete
  const confirmBulkDelete = () => {
    setBulkActionLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      const remainingStudents = students.filter(student => !selectedStudents.includes(student.id));
      setStudents(remainingStudents);
      setFilteredStudents(remainingStudents);
      setSelectedStudents([]);
      setBulkActionLoading(false);
      onCloseDeleteAlert();
      
      toast({
        title: 'Students Deleted',
        description: `${selectedStudents.length} students have been deleted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1000);
  };
  
  // Handle bulk status change
  const handleBulkStatusChange = (status) => {
    setStatusAction(status);
    onOpenStatusAlert();
  };
  
  // Confirm bulk status change
  const confirmBulkStatusChange = () => {
    setBulkActionLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      const updatedStudents = students.map(student => {
        if (selectedStudents.includes(student.id)) {
          return { ...student, status: statusAction };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      setBulkActionLoading(false);
      onCloseStatusAlert();
      
      toast({
        title: 'Status Updated',
        description: `${selectedStudents.length} students have been ${statusAction === 'active' ? 'activated' : 'deactivated'}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 1000);
  };
  
  // Navigate to student profile
  const navigateToStudentProfile = (studentId) => {
    navigate(`/admin/students/profile/${studentId}`);
  };
  
  // Get paginated students
  const getPaginatedStudents = () => {
    const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
    const endIndex = startIndex + pagination.rowsPerPage;
    return filteredStudents.slice(startIndex, endIndex);
  };
  
  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterValues.class !== 'all') count++;
    if (filterValues.section !== 'all') count++;
    if (filterValues.status !== 'all') count++;
    if (filterValues.transport !== 'all') count++;
    if (filterValues.feeStatus !== 'all') count++;
    if (filterValues.searchTerm) count++;
    return count;
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
        <Flex justify="flex-end" align="center" gap={2}>
          <StudentExportOptions students={filteredStudents} totalCount={pagination.totalItems} />
        </Flex>
      </Grid>

      {/* Stats Cards */}
      <ErrorBoundary>
        <StudentStatsCards stats={mockStats} />
      </ErrorBoundary>

      {/* Filters Panel */}
      <ErrorBoundary>
        <StudentFiltersPanel
          filterValues={filterValues}
          setFilterValues={setFilterValues}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          activeFiltersCount={getActiveFiltersCount()}
        />
      </ErrorBoundary>

      {/* Bulk Actions */}
      <ErrorBoundary>
        <StudentBulkActions
          selectedStudents={selectedStudents}
          clearSelection={() => setSelectedStudents([])}
          handleBulkDelete={handleBulkDelete}
          handleBulkStatusChange={handleBulkStatusChange}
          isLoading={bulkActionLoading}
        />
      </ErrorBoundary>

      {/* Students Table */}
      <ErrorBoundary>
        <StudentTable
          students={getPaginatedStudents()}
          loading={loading}
          isStudentSelected={isStudentSelected}
          handleSelectAll={handleSelectAll}
          handleSelectStudent={handleSelectStudent}
          allSelected={areAllStudentsSelected()}
          navigateToStudentProfile={navigateToStudentProfile}
        />
      </ErrorBoundary>

      {/* Pagination */}
      {!loading && pagination.totalItems > 0 && (
        <ErrorBoundary>
          <StudentPagination
            pagination={pagination}
            handlePageChange={handlePageChange}
            handleRowsPerPageChange={handleRowsPerPageChange}
          />
        </ErrorBoundary>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDeleteAlert}
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
              <Button ref={cancelRef} onClick={onCloseDeleteAlert}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmBulkDelete} ml={3} isLoading={bulkActionLoading}>
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
        onClose={onCloseStatusAlert}
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
              <Button ref={cancelRef} onClick={onCloseStatusAlert}>
                Cancel
              </Button>
              <Button 
                colorScheme={statusAction === 'active' ? 'blue' : 'orange'} 
                onClick={confirmBulkStatusChange} 
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
};

export default EnhancedStudentList;
