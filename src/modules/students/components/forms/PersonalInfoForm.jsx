import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  Radio,
  RadioGroup,
  Stack,
  Avatar,
  AvatarBadge,
  IconButton,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdPersonAdd, MdFileUpload } from 'react-icons/md';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import {
  updateFormData,
  selectStudentFormData,
} from '../../../../redux/features/students/studentSlice';

function PersonalInfoForm() {
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectStudentFormData);
  const personalInfo = formData.personal;
  
  // Local state for photo
  const [photoUrl, setPhotoUrl] = useState(personalInfo.photo || '');
  
  // UI colors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    dispatch(updateFormData({ 
      step: 'personal',
      data: { [field]: value }
    }));
  };
  
  // Handle address fields
  const handleAddressChange = (field, value) => {
    const updatedAddress = {
      ...personalInfo.address,
      [field]: value
    };
    
    dispatch(updateFormData({
      step: 'personal',
      data: { address: updatedAddress }
    }));
  };
  
  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a server and get back a URL
      // For this demo, we'll just use a local object URL
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result);
        handleInputChange('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove photo
  const removePhoto = () => {
    setPhotoUrl('');
    handleInputChange('photo', '');
  };
  
  return (
    <Box>
      <Text fontSize="xl" fontWeight="600" mb={6}>
        Student Personal Information
      </Text>

      {/* Photo Upload Section */}
      <Flex direction="column" align="center" mb={8}>
        <Avatar 
          size="2xl"
          src={photoUrl}
          name={personalInfo.name || "Student"}
          mb={4}
        >
          {photoUrl ? (
            <AvatarBadge
              as={IconButton}
              size="sm"
              rounded="full"
              top="-10px"
              colorScheme="red"
              aria-label="Remove photo"
              icon={<MdDelete />}
              onClick={removePhoto}
            />
          ) : null}
        </Avatar>
        
        <FormControl id="photo">
          <FormLabel>Student Photo</FormLabel>
          <input
            type="file"
            accept="image/*"
            id="photo-upload"
            style={{ display: 'none' }}
            onChange={handlePhotoChange}
          />
          <Button
            as="label"
            htmlFor="photo-upload"
            leftIcon={<MdFileUpload />}
            colorScheme="brand"
            variant="outline"
            cursor="pointer"
            mb={2}
          >
            Upload Photo
          </Button>
          <FormHelperText textAlign="center">
            Optional. Recommended size: 300x300px
          </FormHelperText>
        </FormControl>
      </Flex>

      <Divider mb={6} />

      {/* Basic Information */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="name" isRequired>
          <FormLabel>Full Name</FormLabel>
          <Input
            value={personalInfo.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter student full name"
          />
        </FormControl>
        
        <FormControl id="gender" isRequired>
          <FormLabel>Gender</FormLabel>
          <RadioGroup
            value={personalInfo.gender || ''}
            onChange={(value) => handleInputChange('gender', value)}
          >
            <Stack direction="row" spacing={6}>
              <Radio value="Male">Male</Radio>
              <Radio value="Female">Female</Radio>
              <Radio value="Other">Other</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <FormControl id="dateOfBirth" isRequired>
          <FormLabel>Date of Birth</FormLabel>
          <Input
            type="date"
            value={personalInfo.dateOfBirth || ''}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          />
        </FormControl>
        
        <FormControl id="bloodGroup">
          <FormLabel>Blood Group</FormLabel>
          <Select
            value={personalInfo.bloodGroup || ''}
            onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
            placeholder="Select blood group"
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
        </FormControl>
        
        <FormControl id="religion">
          <FormLabel>Religion</FormLabel>
          <Input
            value={personalInfo.religion || ''}
            onChange={(e) => handleInputChange('religion', e.target.value)}
            placeholder="Enter religion"
          />
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="nationality">
          <FormLabel>Nationality</FormLabel>
          <Input
            value={personalInfo.nationality || ''}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder="Enter nationality"
            defaultValue="Pakistani"
          />
        </FormControl>
        
        <FormControl id="cnic">
          <FormLabel>CNIC/B-Form</FormLabel>
          <Input
            value={personalInfo.cnic || ''}
            onChange={(e) => handleInputChange('cnic', e.target.value)}
            placeholder="00000-0000000-0"
          />
          <FormHelperText>
            Format: 12345-1234567-1
          </FormHelperText>
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="email">
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={personalInfo.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="student@example.com"
          />
        </FormControl>
        
        <FormControl id="phone">
          <FormLabel>Phone</FormLabel>
          <InputGroup>
            <InputLeftAddon>+92</InputLeftAddon>
            <Input
              type="tel"
              value={personalInfo.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="300 1234567"
            />
          </InputGroup>
        </FormControl>
      </SimpleGrid>

      <Divider mb={6} />

      {/* Address Information */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Address Details
      </Text>

      <FormControl id="address" mb={4}>
        <FormLabel>Address</FormLabel>
        <Textarea
          value={personalInfo.address?.street || ''}
          onChange={(e) => handleAddressChange('street', e.target.value)}
          placeholder="Enter complete address"
        />
      </FormControl>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <FormControl id="city">
          <FormLabel>City</FormLabel>
          <Input
            value={personalInfo.address?.city || ''}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            placeholder="Enter city"
          />
        </FormControl>
        
        <FormControl id="province">
          <FormLabel>Province</FormLabel>
          <Select
            value={personalInfo.address?.province || ''}
            onChange={(e) => handleAddressChange('province', e.target.value)}
            placeholder="Select province"
          >
            <option value="Sindh">Sindh</option>
            <option value="Punjab">Punjab</option>
            <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
            <option value="Balochistan">Balochistan</option>
            <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
            <option value="Azad Kashmir">Azad Kashmir</option>
            <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
          </Select>
        </FormControl>
        
        <FormControl id="postalCode">
          <FormLabel>Postal Code</FormLabel>
          <Input
            value={personalInfo.address?.postalCode || ''}
            onChange={(e) => handleAddressChange('postalCode', e.target.value)}
            placeholder="Enter postal code"
          />
        </FormControl>
      </SimpleGrid>

      {/* Medical Information */}
      <Divider mb={6} />
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Medical Information (Optional)
      </Text>

      <FormControl id="medicalConditions" mb={4}>
        <FormLabel>Medical Conditions</FormLabel>
        <Textarea
          value={personalInfo.medicalConditions || ''}
          onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
          placeholder="Enter any medical conditions, allergies, or medications"
        />
        <FormHelperText>
          Add any medical conditions, allergies or special needs that school should be aware of
        </FormHelperText>
      </FormControl>
    </Box>
  );
}

export default PersonalInfoForm;
