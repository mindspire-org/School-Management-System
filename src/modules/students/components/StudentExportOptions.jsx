import React from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useToast,
  Tooltip,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Checkbox,
  VStack,
  Divider,
} from '@chakra-ui/react';
import {
  MdDownload,
  MdPictureAsPdf,
  MdContentCopy,
  MdEmail,
  MdPrint,
  MdOutlineFileOpen,
  MdOutlineShare,
} from 'react-icons/md';
import { FaFileExcel, FaFileCsv } from 'react-icons/fa';

const StudentExportOptions = ({ students = [], totalCount = 0 }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Export options state
  const [exportOptions, setExportOptions] = React.useState({
    includePersonalInfo: true,
    includeContactInfo: true,
    includeAttendance: true,
    includePerformance: false,
    includeFees: true,
    includeTransport: true,
    includeFilters: true,
  });
  
  const handleExport = (format) => {
    // In a real app, this would handle the actual export functionality
    toast({
      title: 'Export initiated',
      description: `Exporting ${students.length || totalCount} students to ${format}...`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Close the modal if open
    if (isOpen) onClose();
  };
  
  const handleCheckboxChange = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };
  
  return (
    <>
      <HStack spacing={2}>
        <Menu>
          <Tooltip label="Export students data">
            <MenuButton
              as={Button}
              rightIcon={<MdDownload />}
              colorScheme="green"
              onClick={onOpen}
              size="sm"
            >
              Export
            </MenuButton>
          </Tooltip>
          <MenuList>
            <MenuItem 
              icon={<FaFileExcel />} 
              onClick={() => handleExport('Excel')}
            >
              Export to Excel
            </MenuItem>
            <MenuItem 
              icon={<MdPictureAsPdf />}
              onClick={() => handleExport('PDF')}
            >
              Export to PDF
            </MenuItem>
            <MenuItem 
              icon={<FaFileCsv />}
              onClick={() => handleExport('CSV')}
            >
              Export to CSV
            </MenuItem>
            <MenuItem 
              icon={<MdPrint />}
              onClick={() => handleExport('Print')}
            >
              Print List
            </MenuItem>
            <MenuItem 
              icon={<MdEmail />}
              onClick={() => handleExport('Email')}
            >
              Email Report
            </MenuItem>
            <MenuItem 
              icon={<MdOutlineShare />}
              onClick={() => handleExport('Share')}
            >
              Share Report
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      
      {/* Advanced Export Options Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Export Options</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Select the data you want to include in your export. You are about to export {students.length || totalCount} student records.
            </Text>
            
            <Divider mb={4} />
            
            <VStack align="start" spacing={3}>
              <Checkbox 
                isChecked={exportOptions.includePersonalInfo} 
                onChange={() => handleCheckboxChange('includePersonalInfo')}
              >
                Personal Information (Name, Roll Number, Class, RFID)
              </Checkbox>
              <Checkbox 
                isChecked={exportOptions.includeContactInfo} 
                onChange={() => handleCheckboxChange('includeContactInfo')}
              >
                Contact Information (Email, Address, Phone)
              </Checkbox>
              <Checkbox 
                isChecked={exportOptions.includeAttendance} 
                onChange={() => handleCheckboxChange('includeAttendance')}
              >
                Attendance Data
              </Checkbox>
              <Checkbox 
                isChecked={exportOptions.includePerformance} 
                onChange={() => handleCheckboxChange('includePerformance')}
              >
                Performance & Academic Records
              </Checkbox>
              <Checkbox 
                isChecked={exportOptions.includeFees} 
                onChange={() => handleCheckboxChange('includeFees')}
              >
                Fee Information
              </Checkbox>
              <Checkbox 
                isChecked={exportOptions.includeTransport} 
                onChange={() => handleCheckboxChange('includeTransport')}
              >
                Transport Details
              </Checkbox>
              <Checkbox 
                isChecked={exportOptions.includeFilters} 
                onChange={() => handleCheckboxChange('includeFilters')}
              >
                Apply Current Filters to Export
              </Checkbox>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Menu>
              <MenuButton as={Button} colorScheme="green" rightIcon={<MdDownload />}>
                Export As
              </MenuButton>
              <MenuList>
                <MenuItem 
                  icon={<FaFileExcel />} 
                  onClick={() => handleExport('Excel')}
                >
                  Excel (.xlsx)
                </MenuItem>
                <MenuItem 
                  icon={<MdPictureAsPdf />} 
                  onClick={() => handleExport('PDF')}
                >
                  PDF Document
                </MenuItem>
                <MenuItem 
                  icon={<FaFileCsv />} 
                  onClick={() => handleExport('CSV')}
                >
                  CSV File
                </MenuItem>
                <MenuItem 
                  icon={<MdPrint />} 
                  onClick={() => handleExport('Print')}
                >
                  Print Format
                </MenuItem>
              </MenuList>
            </Menu>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StudentExportOptions;
