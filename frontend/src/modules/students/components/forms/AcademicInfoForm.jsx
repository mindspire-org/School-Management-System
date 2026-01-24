import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  Checkbox,
  Divider,
  InputGroup,
  InputLeftAddon,
  VStack,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import {
  updateFormData,
  selectStudentFormData,
} from '../../../../redux/features/students/studentSlice';

function AcademicInfoForm() {
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectStudentFormData);
  const academicInfo = formData.academic;
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    dispatch(updateFormData({ 
      step: 'academic',
      data: { [field]: value }
    }));
  };
  
  // Handle previous education fields
  const handlePreviousEducationChange = (field, value) => {
    const updatedPreviousEducation = {
      ...academicInfo.previousEducation,
      [field]: value
    };
    
    dispatch(updateFormData({
      step: 'academic',
      data: { previousEducation: updatedPreviousEducation }
    }));
  };
  
  // Generate current year and next few years for academic year dropdown
  const getCurrentAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = -2; i < 5; i++) {
      const year = currentYear + i;
      const nextYear = year + 1;
      years.push(`${year}-${nextYear}`);
    }
    
    return years;
  };
  
  const academicYears = getCurrentAcademicYears();
  
  return (
    <Box>
      <Text fontSize="xl" fontWeight="600" mb={6}>
        Academic Information
      </Text>

      {/* Current Academic Information */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <FormControl id="admissionNumber" isRequired>
          <FormLabel>Admission Number</FormLabel>
          <InputGroup>
            <InputLeftAddon>ADM-</InputLeftAddon>
            <Input
              value={academicInfo.admissionNumber || ''}
              onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
              placeholder="2024-0001"
            />
          </InputGroup>
        </FormControl>
        
        <FormControl id="rollNumber" isRequired>
          <FormLabel>Roll Number</FormLabel>
          <InputGroup>
            <InputLeftAddon>STD-</InputLeftAddon>
            <Input
              value={academicInfo.rollNumber || ''}
              onChange={(e) => handleInputChange('rollNumber', e.target.value)}
              placeholder="2024-0001"
            />
          </InputGroup>
        </FormControl>
        
        <FormControl id="academicYear" isRequired>
          <FormLabel>Academic Year</FormLabel>
          <Select
            value={academicInfo.academicYear || ''}
            onChange={(e) => handleInputChange('academicYear', e.target.value)}
            placeholder="Select academic year"
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <FormControl id="class" isRequired>
          <FormLabel>Class</FormLabel>
          <Select
            value={academicInfo.class || ''}
            onChange={(e) => handleInputChange('class', e.target.value)}
            placeholder="Select class"
          >
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="4">Class 4</option>
            <option value="5">Class 5</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </Select>
        </FormControl>
        
        <FormControl id="section" isRequired>
          <FormLabel>Section</FormLabel>
          <Select
            value={academicInfo.section || ''}
            onChange={(e) => handleInputChange('section', e.target.value)}
            placeholder="Select section"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </Select>
        </FormControl>
        
        <FormControl id="stream">
          <FormLabel>Stream/Group</FormLabel>
          <Select
            value={academicInfo.stream || ''}
            onChange={(e) => handleInputChange('stream', e.target.value)}
            placeholder="Select stream"
          >
            <option value="Science">Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts">Arts</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Biology">Biology</option>
            <option value="N/A">N/A</option>
          </Select>
          <FormHelperText>
            Applicable for higher classes only
          </FormHelperText>
        </FormControl>
      </SimpleGrid>

      <FormControl id="rfidTag" mb={6}>
        <FormLabel>RFID Tag Number</FormLabel>
        <InputGroup>
          <InputLeftAddon>RFID-</InputLeftAddon>
          <Input
            value={academicInfo.rfidTag || ''}
            onChange={(e) => handleInputChange('rfidTag', e.target.value)}
            placeholder="001"
          />
        </InputGroup>
        <FormHelperText>
          For attendance tracking and campus access
        </FormHelperText>
      </FormControl>

      <FormControl id="admissionDate" mb={6}>
        <FormLabel>Admission Date</FormLabel>
        <Input
          type="date"
          value={academicInfo.admissionDate || new Date().toISOString().split('T')[0]}
          onChange={(e) => handleInputChange('admissionDate', e.target.value)}
        />
      </FormControl>

      <Divider mb={6} />

      {/* Previous Education */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Previous Education Details
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="previousSchool">
          <FormLabel>Previous School</FormLabel>
          <Input
            value={academicInfo.previousEducation?.schoolName || ''}
            onChange={(e) => handlePreviousEducationChange('schoolName', e.target.value)}
            placeholder="Enter previous school name"
          />
        </FormControl>
        
        <FormControl id="previousClass">
          <FormLabel>Previous Class/Grade</FormLabel>
          <Input
            value={academicInfo.previousEducation?.class || ''}
            onChange={(e) => handlePreviousEducationChange('class', e.target.value)}
            placeholder="Enter previous class/grade"
          />
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="lastAttended">
          <FormLabel>Last Attended Date</FormLabel>
          <Input
            type="date"
            value={academicInfo.previousEducation?.lastAttendedDate || ''}
            onChange={(e) => handlePreviousEducationChange('lastAttendedDate', e.target.value)}
          />
        </FormControl>
        
        <FormControl id="transferCertificate">
          <FormLabel>Transfer Certificate No.</FormLabel>
          <Input
            value={academicInfo.previousEducation?.transferCertificateNo || ''}
            onChange={(e) => handlePreviousEducationChange('transferCertificateNo', e.target.value)}
            placeholder="Enter TC number"
          />
        </FormControl>
      </SimpleGrid>

      <FormControl id="previousRemarks" mb={6}>
        <FormLabel>Previous School Remarks</FormLabel>
        <Textarea
          value={academicInfo.previousEducation?.remarks || ''}
          onChange={(e) => handlePreviousEducationChange('remarks', e.target.value)}
          placeholder="Enter any remarks from previous school"
        />
      </FormControl>

      <Divider mb={6} />

      {/* Special Needs */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Special Educational Needs
      </Text>

      <FormControl id="specialNeeds" mb={4}>
        <FormLabel>Special Needs/Requirements</FormLabel>
        <Textarea
          value={academicInfo.specialNeeds || ''}
          onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
          placeholder="Enter any special educational needs or requirements"
        />
      </FormControl>

      <HStack spacing={5} mb={6}>
        <Checkbox
          isChecked={academicInfo.needsExtraAttention || false}
          onChange={(e) => handleInputChange('needsExtraAttention', e.target.checked)}
        >
          Needs Extra Attention
        </Checkbox>
        <Checkbox
          isChecked={academicInfo.hasLearningDifficulties || false}
          onChange={(e) => handleInputChange('hasLearningDifficulties', e.target.checked)}
        >
          Has Learning Difficulties
        </Checkbox>
      </HStack>

      <FormControl id="accommodations" mb={6}>
        <FormLabel>Required Accommodations</FormLabel>
        <Textarea
          value={academicInfo.accommodations || ''}
          onChange={(e) => handleInputChange('accommodations', e.target.value)}
          placeholder="Enter any accommodations required"
        />
      </FormControl>
    </Box>
  );
}

export default AcademicInfoForm;
