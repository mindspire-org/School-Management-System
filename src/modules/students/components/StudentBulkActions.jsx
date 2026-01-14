import React from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Icon,
  Spinner,
  useColorModeValue,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  MdCheckCircle,
  MdBlock,
  MdDelete,
  MdMoreVert,
  MdDownload,
  MdPrint,
  MdDirectionsBus,
  MdSms,
  MdEmail,
  MdContentCopy,
  MdAssignment,
  MdCardMembership,
  MdPictureAsPdf,
} from 'react-icons/md';
import Card from 'components/card/Card.js';

const StudentBulkActions = ({
  selectedStudents = [],
  clearSelection,
  handleBulkDelete,
  handleBulkStatusChange,
  isLoading = false,
}) => {
  const bgColor = useColorModeValue('blue.50', 'whiteAlpha.200');
  const borderColor = useColorModeValue('blue.200', 'whiteAlpha.300');
  
  // If no students selected, don't show the toolbar
  if (selectedStudents.length === 0) return null;
  
  return (
    <Card mb="20px" bg={bgColor} borderColor={borderColor}>
      <Flex 
        justify="space-between" 
        align="center"
        direction={{ base: 'column', md: 'row' }}
      >
        <HStack spacing={2} mb={{ base: 3, md: 0 }}>
          <Text fontWeight="600">
            {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
          </Text>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={clearSelection}
            isDisabled={isLoading}
          >
            Clear Selection
          </Button>
        </HStack>
        
        <HStack spacing={2} flexWrap={{ base: 'wrap', md: 'nowrap' }} justify={{ base: 'center', md: 'flex-end' }}>
          <Tooltip label="Set selected students as active">
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<MdCheckCircle />}
              onClick={() => handleBulkStatusChange && handleBulkStatusChange('active')}
              isDisabled={isLoading}
            >
              Set Active
            </Button>
          </Tooltip>
          
          <Tooltip label="Set selected students as inactive">
            <Button
              size="sm"
              colorScheme="orange"
              leftIcon={<MdBlock />}
              onClick={() => handleBulkStatusChange && handleBulkStatusChange('inactive')}
              isDisabled={isLoading}
            >
              Set Inactive
            </Button>
          </Tooltip>
          
          <Tooltip label="Delete selected students">
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<MdDelete />}
              onClick={handleBulkDelete}
              isDisabled={isLoading}
            >
              Delete
            </Button>
          </Tooltip>
          
          <Menu closeOnSelect={false}>
            <Tooltip label="More bulk actions">
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                rightIcon={<Icon as={MdMoreVert} />}
                isDisabled={isLoading}
              >
                More
              </MenuButton>
            </Tooltip>
            <MenuList>
              <MenuItem icon={<MdDownload />}>Export Selected</MenuItem>
              <MenuItem icon={<MdPrint />}>Print List</MenuItem>
              <MenuItem icon={<MdDirectionsBus />}>Assign Bus</MenuItem>
              <MenuItem icon={<MdSms />}>Send SMS</MenuItem>
              <MenuItem icon={<MdEmail />}>Send Email</MenuItem>
              <MenuItem icon={<MdAssignment />}>Generate Reports</MenuItem>
              <MenuItem icon={<MdCardMembership />}>Print ID Cards</MenuItem>
            </MenuList>
          </Menu>
          
          <Menu>
            <Tooltip label="Export options">
              <MenuButton
                as={Button}
                size="sm"
                colorScheme="green"
                leftIcon={<MdDownload />}
                isDisabled={isLoading}
              >
                Export
              </MenuButton>
            </Tooltip>
            <MenuList>
              <MenuItem icon={<MdDownload />}>Export to Excel</MenuItem>
              <MenuItem icon={<MdPictureAsPdf />}>Export to PDF</MenuItem>
              <MenuItem icon={<MdContentCopy />}>Export to CSV</MenuItem>
              <MenuItem icon={<MdPrint />}>Print List</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {isLoading && (
        <Flex justify="center" mt={2}>
          <Spinner size="sm" color="blue.500" mr={2} />
          <Text>Processing...</Text>
        </Flex>
      )}
    </Card>
  );
};

export default StudentBulkActions;
