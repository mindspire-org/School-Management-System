import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  VStack,
  Grid,
  GridItem,
  Text,
  IconButton,
  Collapse,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import {
  MdFilterList,
  MdRestartAlt,
  MdSearch,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';
import { SearchIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card.js';
import useClassOptions from '../../../hooks/useClassOptions';

const StudentFiltersPanel = ({
  filterValues,
  setFilterValues,
  applyFilters,
  resetFilters,
  activeFiltersCount = 0,
}) => {
  const { isOpen, onToggle } = useDisclosure();
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const { classOptions, sectionOptions } = useClassOptions({
    selectedClass: (filterValues?.class && filterValues.class !== 'all') ? filterValues.class : null,
  });
  
  // Handle individual filter changes
  const handleFilterChange = (field, value) => {
    if (setFilterValues) {
      setFilterValues(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    if (setFilterValues) {
      setFilterValues(prev => ({ ...prev, searchTerm: value }));
    }
  };
  
  // Active filters to display as tags
  const activeFilters = [];
  
  if (filterValues) {
    if (filterValues.class && filterValues.class !== 'all') {
      activeFilters.push({ name: 'Class', value: filterValues.class, key: 'class' });
    }
    if (filterValues.section && filterValues.section !== 'all') {
      activeFilters.push({ name: 'Section', value: filterValues.section, key: 'section' });
    }
    if (filterValues.status && filterValues.status !== 'all') {
      activeFilters.push({ name: 'Status', value: filterValues.status, key: 'status' });
    }
    if (filterValues.transport && filterValues.transport !== 'all') {
      activeFilters.push({ name: 'Transport', value: filterValues.transport, key: 'transport' });
    }
    if (filterValues.feeStatus && filterValues.feeStatus !== 'all') {
      activeFilters.push({ name: 'Fee Status', value: filterValues.feeStatus, key: 'feeStatus' });
    }
  }
  
  // Remove individual filter
  const removeFilter = (key) => {
    if (setFilterValues) {
      setFilterValues(prev => ({ ...prev, [key]: 'all' }));
    }
  };

  return (
    <Card mb="20px">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        mb={activeFilters.length > 0 ? "10px" : "0px"}
      >
        <HStack spacing={2} mb={{ base: '10px', md: '0px' }}>
          <Button
            leftIcon={<MdFilterList />}
            onClick={onToggle}
            colorScheme={isOpen ? 'blue' : 'gray'}
            variant={isOpen ? 'solid' : 'outline'}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Badge ml="1" fontSize="0.8em" colorScheme="blue">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          <Button
            leftIcon={<MdRestartAlt />}
            variant="ghost"
            onClick={resetFilters}
            isDisabled={activeFiltersCount === 0}
          >
            Reset
          </Button>
        </HStack>
        
        <InputGroup width={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by name, ID, or RFID..."
            value={filterValues && filterValues.searchTerm ? filterValues.searchTerm : ''}
            onChange={handleSearch}
          />
        </InputGroup>
      </Flex>
      
      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <Box mb={3}>
          <HStack spacing={2} flexWrap="wrap">
            {activeFilters.map(filter => (
              <Tag
                size="md"
                key={filter.key}
                borderRadius="full"
                variant="solid"
                colorScheme="blue"
              >
                <TagLabel>{filter.name}: {filter.value}</TagLabel>
                <TagCloseButton onClick={() => removeFilter(filter.key)} />
              </Tag>
            ))}
            
            {activeFilters.length > 0 && (
              <Button size="sm" variant="link" onClick={resetFilters}>
                Clear All
              </Button>
            )}
          </HStack>
        </Box>
      )}
      
      {/* Advanced filters panel */}
      <Collapse in={isOpen} animateOpacity>
        <Grid 
          templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} 
          gap={4}
          mt={4}
        >
          <GridItem>
            <Text mb={1} fontSize="sm" fontWeight="500">Class</Text>
            <Select
              value={filterValues?.class || 'all'}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              size="sm"
            >
              <option value="all">All Classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </GridItem>
          
          <GridItem>
            <Text mb={1} fontSize="sm" fontWeight="500">Section</Text>
            <Select
              value={filterValues?.section || 'all'}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              size="sm"
            >
              <option value="all">All Sections</option>
              {sectionOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </GridItem>
          
          <GridItem>
            <Text mb={1} fontSize="sm" fontWeight="500">Status</Text>
            <Select
              value={filterValues?.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              size="sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="graduated">Graduated</option>
            </Select>
          </GridItem>
          
          <GridItem>
            <Text mb={1} fontSize="sm" fontWeight="500">Transport</Text>
            <Select
              value={filterValues?.transport || 'all'}
              onChange={(e) => handleFilterChange('transport', e.target.value)}
              size="sm"
            >
              <option value="all">All Transport</option>
              <option value="bus">Bus Users</option>
              <option value="no-bus">Non-Bus Users</option>
            </Select>
          </GridItem>
          
          <GridItem>
            <Text mb={1} fontSize="sm" fontWeight="500">Fee Status</Text>
            <Select
              value={filterValues?.feeStatus || 'all'}
              onChange={(e) => handleFilterChange('feeStatus', e.target.value)}
              size="sm"
            >
              <option value="all">All Fee Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
              <option value="waived">Waived</option>
            </Select>
          </GridItem>
        </Grid>
        
        <Flex justify="flex-end" mt={4}>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </Flex>
      </Collapse>
    </Card>
  );
};

export default StudentFiltersPanel;
