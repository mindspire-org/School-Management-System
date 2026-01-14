import React from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdFirstPage,
  MdLastPage,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from 'react-icons/md';
import Card from 'components/card/Card.js';

const StudentPagination = ({
  pagination = {
    currentPage: 1,
    totalPages: 5,
    rowsPerPage: 10,
    totalItems: 50,
  },
  handlePageChange,
  handleRowsPerPageChange,
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  // Calculate items range (e.g., "Showing 1-10 of 50 students")
  const startItem = ((pagination.currentPage - 1) * pagination.rowsPerPage) + 1;
  const endItem = Math.min(pagination.currentPage * pagination.rowsPerPage, pagination.totalItems);
  
  return (
    <Card p={4}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'center', md: 'center' }}
        justify="space-between"
      >
        <Text color={textColor} mb={{ base: 2, md: 0 }}>
          Showing {startItem} to{' '}
          {endItem} of{' '}
          {pagination.totalItems} students
        </Text>
        
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange && handlePageChange(1)}
            isDisabled={pagination.currentPage === 1}
            aria-label="First Page"
          >
            <Icon as={MdFirstPage} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange && handlePageChange(pagination.currentPage - 1)}
            isDisabled={pagination.currentPage === 1}
            aria-label="Previous Page"
          >
            <Icon as={MdKeyboardArrowLeft} />
          </Button>
          
          {/* Page number buttons */}
          <HStack spacing={1}>
            {pagination.totalPages <= 5 ? (
              // If 5 or fewer pages, show all page numbers
              [...Array(pagination.totalPages)].map((_, idx) => (
                <Button
                  key={idx + 1}
                  size="sm"
                  variant={pagination.currentPage === idx + 1 ? "solid" : "outline"}
                  colorScheme={pagination.currentPage === idx + 1 ? "blue" : "gray"}
                  onClick={() => handlePageChange && handlePageChange(idx + 1)}
                  minW="32px"
                >
                  {idx + 1}
                </Button>
              ))
            ) : (
              // If more than 5 pages, show a subset with ellipsis
              <>
                {/* Always show page 1 */}
                <Button
                  size="sm"
                  variant={pagination.currentPage === 1 ? "solid" : "outline"}
                  colorScheme={pagination.currentPage === 1 ? "blue" : "gray"}
                  onClick={() => handlePageChange && handlePageChange(1)}
                  minW="32px"
                >
                  1
                </Button>
                
                {/* Show ellipsis if current page is > 3 */}
                {pagination.currentPage > 3 && (
                  <Text fontSize="sm" px={1}>...</Text>
                )}
                
                {/* Show pages around current page */}
                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show current page and one page before/after
                  if (
                    pageNum !== 1 && 
                    pageNum !== pagination.totalPages && 
                    Math.abs(pageNum - pagination.currentPage) <= 1
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={pagination.currentPage === pageNum ? "solid" : "outline"}
                        colorScheme={pagination.currentPage === pageNum ? "blue" : "gray"}
                        onClick={() => handlePageChange && handlePageChange(pageNum)}
                        minW="32px"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  return null;
                })}
                
                {/* Show ellipsis if current page < totalPages - 2 */}
                {pagination.currentPage < pagination.totalPages - 2 && (
                  <Text fontSize="sm" px={1}>...</Text>
                )}
                
                {/* Always show last page */}
                <Button
                  size="sm"
                  variant={pagination.currentPage === pagination.totalPages ? "solid" : "outline"}
                  colorScheme={pagination.currentPage === pagination.totalPages ? "blue" : "gray"}
                  onClick={() => handlePageChange && handlePageChange(pagination.totalPages)}
                  minW="32px"
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </HStack>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange && handlePageChange(pagination.currentPage + 1)}
            isDisabled={pagination.currentPage === pagination.totalPages}
            aria-label="Next Page"
          >
            <Icon as={MdKeyboardArrowRight} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePageChange && handlePageChange(pagination.totalPages)}
            isDisabled={pagination.currentPage === pagination.totalPages}
            aria-label="Last Page"
          >
            <Icon as={MdLastPage} />
          </Button>
          
          <Select
            size="sm"
            width="80px"
            value={pagination.rowsPerPage}
            onChange={(e) => handleRowsPerPageChange && handleRowsPerPageChange(Number(e.target.value))}
            ml={2}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </HStack>
      </Flex>
    </Card>
  );
};

export default StudentPagination;
