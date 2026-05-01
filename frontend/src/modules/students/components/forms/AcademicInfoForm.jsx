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
import useClassOptions from '../../../../hooks/useClassOptions';
import { campusesApi } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

const toDateInputValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

function AcademicInfoForm() {
  const { campusId: activeCampusId } = useAuth();
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectStudentFormData);
  const academicInfo = formData.academic;
  const { classOptions, sectionsByClass, sectionOptions, loading: classLoading } = useClassOptions({
    selectedClass: academicInfo.class || null,
    campusId: academicInfo.campusId || null,
  });
  const [campuses, setCampuses] = React.useState([]);
  const [campusLoading, setCampusLoading] = React.useState(false);

  React.useEffect(() => {
    setCampusLoading(true);
    campusesApi.list({ pageSize: 100 })
      .then(res => setCampuses(res.rows || []))
      .catch(err => console.error('Failed to fetch campuses', err))
      .finally(() => setCampusLoading(false));
  }, []);

  // Default campusId from auth context if not set
  React.useEffect(() => {
    if (!academicInfo.campusId && activeCampusId) {
      dispatch(updateFormData({
        step: 'academic',
        data: { campusId: activeCampusId }
      }));
    }
  }, [academicInfo.campusId, activeCampusId, dispatch]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    dispatch(
      updateFormData({
        step: 'academic',
        data: { [field]: value },
      })
    );
  };

  React.useEffect(() => {
    if (!academicInfo.campusId) return;

    if (academicInfo.class && !classOptions.includes(academicInfo.class)) {
      handleInputChange('class', '');
      handleInputChange('section', '');
      return;
    }

    if (academicInfo.class && academicInfo.section) {
      const allowed = sectionsByClass[academicInfo.class] || [];
      if (!allowed.includes(academicInfo.section)) {
        handleInputChange('section', '');
      }
    }
  }, [academicInfo.campusId, academicInfo.class, academicInfo.section, classOptions, sectionsByClass]);

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

  // Generate academic years including past years (from 2024) and future years
  const getCurrentAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2024; // Start from 2024
    const years = [];

    // Generate years from 2024 to current year + 4
    for (let year = startYear; year <= currentYear + 4; year++) {
      const nextYear = year + 1;
      // Use short year format (e.g., "24-25")
      const shortYear = String(year).slice(-2);
      const shortNextYear = String(nextYear).slice(-2);
      years.push(`${shortYear}-${shortNextYear}`);
    }

    return years;
  };

  const academicYears = getCurrentAcademicYears();

  return (
    <Box>
      <Text fontSize="xl" fontWeight="600" mb={6}>
        Academic Information
      </Text>

      {/* Campus Selection */}
      <FormControl id="campusId" isRequired mb={6}>
        <FormLabel>Campus</FormLabel>
        <Select
          value={academicInfo.campusId || ''}
          onChange={(e) => handleInputChange('campusId', e.target.value)}
          placeholder="Select campus"
          isDisabled={campusLoading}
        >
          {campusLoading && <option disabled>Loading campuses...</option>}
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <FormHelperText>Associate student with a specific school campus</FormHelperText>
      </FormControl>

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
            onChange={(e) => {
              const nextClass = e.target.value;
              handleInputChange('class', nextClass);
              const allowed = sectionsByClass[nextClass] || [];
              if (academicInfo.section && !allowed.includes(academicInfo.section)) {
                handleInputChange('section', '');
              }
            }}
            placeholder="Select class"
            isDisabled={classLoading}
          >
            {classLoading && classOptions.length === 0 && (
              <option value="" disabled>Loading classes...</option>
            )}
            {classOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormControl>

        <FormControl id="section" isRequired>
          <FormLabel>Section</FormLabel>
          <Select
            value={academicInfo.section || ''}
            onChange={(e) => handleInputChange('section', e.target.value)}
            placeholder="Select section"
            isDisabled={classLoading || !academicInfo.class}
          >
            {sectionOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
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
          value={toDateInputValue(academicInfo.admissionDate) || new Date().toISOString().split('T')[0]}
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
            value={toDateInputValue(academicInfo.previousEducation?.lastAttendedDate)}
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
