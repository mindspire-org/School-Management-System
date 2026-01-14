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
  Divider,
  InputGroup,
  InputLeftAddon,
  InputRightElement,
  Checkbox,
  Button,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Icon
} from '@chakra-ui/react';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import {
  updateFormData,
  selectStudentFormData,
} from '../../../../redux/features/students/studentSlice';
import { MdContentCopy } from 'react-icons/md';

function ParentInfoForm() {
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectStudentFormData);
  const parentInfo = formData.parent || {};
  const father = parentInfo.father || {};
  const mother = parentInfo.mother || {};
  const guardian = parentInfo.guardian || {};
  const emergency = parentInfo.emergency || {};
  const [showParentPwd, setShowParentPwd] = React.useState(false);
  const [showParentPwd2, setShowParentPwd2] = React.useState(false);
  const [showGuardianPwd, setShowGuardianPwd] = React.useState(false);
  const [showGuardianPwd2, setShowGuardianPwd2] = React.useState(false);
  
  // Handle father information changes
  const handleFatherChange = (field, value) => {
    const updatedFather = {
      ...father,
      [field]: value
    };
    
    dispatch(updateFormData({
      step: 'parent',
      data: { 
        father: updatedFather 
      }
    }));
  };
  
  // Handle mother information changes
  const handleMotherChange = (field, value) => {
    const updatedMother = {
      ...mother,
      [field]: value
    };
    
    dispatch(updateFormData({
      step: 'parent',
      data: { 
        mother: updatedMother 
      }
    }));
  };
  
  // Handle guardian information changes
  const handleGuardianChange = (field, value) => {
    const updatedGuardian = {
      ...guardian,
      [field]: value
    };
    
    dispatch(updateFormData({
      step: 'parent',
      data: { 
        guardian: updatedGuardian 
      }
    }));
  };
  
  // Handle emergency contact changes
  const handleEmergencyChange = (field, value) => {
    const updatedEmergency = {
      ...emergency,
      [field]: value
    };
    
    dispatch(updateFormData({
      step: 'parent',
      data: { 
        emergency: updatedEmergency 
      }
    }));
  };
  
  // Handle parent info changes (general)
  const handleParentInfoChange = (field, value) => {
    dispatch(updateFormData({
      step: 'parent',
      data: { 
        [field]: value 
      }
    }));
  };
  
  // Copy father details to emergency contact
  const copyFatherToEmergency = () => {
    dispatch(updateFormData({
      step: 'parent',
      data: { 
        emergency: {
          name: father.name,
          phone: father.phone,
          relationship: 'Father'
        }
      }
    }));
  };
  
  // Copy mother details to emergency contact
  const copyMotherToEmergency = () => {
    dispatch(updateFormData({
      step: 'parent',
      data: { 
        emergency: {
          name: mother.name,
          phone: mother.phone,
          relationship: 'Mother'
        }
      }
    }));
  };
  
  return (
    <Box>
      <Text fontSize="xl" fontWeight="600" mb={6}>
        Parent/Guardian Information
      </Text>

      <Tabs colorScheme="brand" mb={6}>
        <TabList>
          <Tab>Father's Details</Tab>
          <Tab>Mother's Details</Tab>
          <Tab>Guardian (Optional)</Tab>
          <Tab>Emergency Contact</Tab>
        </TabList>

        <TabPanels>
          {/* Father's Details */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="fatherName" isRequired>
                <FormLabel>Father's Name</FormLabel>
                <Input
                  value={father.name || ''}
                  onChange={(e) => handleFatherChange('name', e.target.value)}
                  placeholder="Enter father's full name"
                />
              </FormControl>
              
              <FormControl id="fatherCNIC">
                <FormLabel>Father's CNIC</FormLabel>
                <Input
                  value={father.cnic || ''}
                  onChange={(e) => handleFatherChange('cnic', e.target.value)}
                  placeholder="00000-0000000-0"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="fatherPhone" isRequired>
                <FormLabel>Father's Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon>+92</InputLeftAddon>
                  <Input
                    value={father.phone || ''}
                    onChange={(e) => handleFatherChange('phone', e.target.value)}
                    placeholder="300 1234567"
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl id="fatherEmail">
                <FormLabel>Father's Email</FormLabel>
                <Input
                  type="email"
                  value={father.email || ''}
                  onChange={(e) => handleFatherChange('email', e.target.value)}
                  placeholder="father@example.com"
                />
              </FormControl>
            </SimpleGrid>

            {/* Parent Portal Password fields (for Parent login with phone + password) */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="parentPortalPassword">
                <FormLabel>Parent Portal Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showParentPwd ? 'text' : 'password'}
                    value={parentInfo.portalPassword || ''}
                    onChange={(e) => handleParentInfoChange('portalPassword', e.target.value)}
                    placeholder="Set a password for Parent login"
                  />
                  <InputRightElement width='3rem'>
                    <Button size='sm' variant='ghost' onClick={() => setShowParentPwd((v) => !v)}>
                      {showParentPwd ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>
                  Parents will login using WhatsApp phone + this password.
                </FormHelperText>
              </FormControl>
              <FormControl id="parentPortalPasswordConfirm">
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showParentPwd2 ? 'text' : 'password'}
                    value={parentInfo.portalPasswordConfirm || ''}
                    onChange={(e) => handleParentInfoChange('portalPasswordConfirm', e.target.value)}
                    placeholder="Re-enter password"
                  />
                  <InputRightElement width='3rem'>
                    <Button size='sm' variant='ghost' onClick={() => setShowParentPwd2((v) => !v)}>
                      {showParentPwd2 ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="fatherOccupation">
                <FormLabel>Father's Occupation</FormLabel>
                <Input
                  value={father.occupation || ''}
                  onChange={(e) => handleFatherChange('occupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </FormControl>
              
              <FormControl id="fatherIncome">
                <FormLabel>Monthly Income (PKR)</FormLabel>
                <InputGroup>
                  <InputLeftAddon>Rs.</InputLeftAddon>
                  <Input
                    type="number"
                    value={father.income || ''}
                    onChange={(e) => handleFatherChange('income', e.target.value)}
                    placeholder="0"
                  />
                </InputGroup>
              </FormControl>
            </SimpleGrid>
            
            <Button 
              leftIcon={<Icon as={MdContentCopy} />} 
              colorScheme="brand" 
              variant="outline"
              onClick={copyFatherToEmergency}
            >
              Use as Emergency Contact
            </Button>
          </TabPanel>

          {/* Mother's Details */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="motherName">
                <FormLabel>Mother's Name</FormLabel>
                <Input
                  value={mother.name || ''}
                  onChange={(e) => handleMotherChange('name', e.target.value)}
                  placeholder="Enter mother's full name"
                />
              </FormControl>
              
              <FormControl id="motherCNIC">
                <FormLabel>Mother's CNIC</FormLabel>
                <Input
                  value={mother.cnic || ''}
                  onChange={(e) => handleMotherChange('cnic', e.target.value)}
                  placeholder="00000-0000000-0"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="motherPhone">
                <FormLabel>Mother's Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon>+92</InputLeftAddon>
                  <Input
                    value={mother.phone || ''}
                    onChange={(e) => handleMotherChange('phone', e.target.value)}
                    placeholder="300 1234567"
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl id="motherEmail">
                <FormLabel>Mother's Email</FormLabel>
                <Input
                  type="email"
                  value={mother.email || ''}
                  onChange={(e) => handleMotherChange('email', e.target.value)}
                  placeholder="mother@example.com"
                />
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="motherOccupation">
                <FormLabel>Mother's Occupation</FormLabel>
                <Input
                  value={mother.occupation || ''}
                  onChange={(e) => handleMotherChange('occupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </FormControl>
              
              <FormControl id="motherIncome">
                <FormLabel>Monthly Income (PKR)</FormLabel>
                <InputGroup>
                  <InputLeftAddon>Rs.</InputLeftAddon>
                  <Input
                    type="number"
                    value={mother.income || ''}
                    onChange={(e) => handleMotherChange('income', e.target.value)}
                    placeholder="0"
                  />
                </InputGroup>
              </FormControl>
            </SimpleGrid>
            
            <Button 
              leftIcon={<Icon as={MdContentCopy} />} 
              colorScheme="brand" 
              variant="outline"
              onClick={copyMotherToEmergency}
            >
              Use as Emergency Contact
            </Button>
          </TabPanel>

          {/* Guardian Details */}
          <TabPanel>
            <FormControl id="hasGuardian" mb={4}>
              <Checkbox
                isChecked={parentInfo.hasGuardian || false}
                onChange={(e) => handleParentInfoChange('hasGuardian', e.target.checked)}
              >
                Student has a guardian other than parents
              </Checkbox>
              <FormHelperText>
                Check this if student's primary guardian is not a parent
              </FormHelperText>
            </FormControl>

            {parentInfo.hasGuardian && (
              <>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <FormControl id="guardianName" isRequired={parentInfo.hasGuardian}>
                    <FormLabel>Guardian's Name</FormLabel>
                    <Input
                      value={guardian.name || ''}
                      onChange={(e) => handleGuardianChange('name', e.target.value)}
                      placeholder="Enter guardian's full name"
                    />
                  </FormControl>
                  
                  <FormControl id="guardianRelationship" isRequired={parentInfo.hasGuardian}>
                    <FormLabel>Relationship with Student</FormLabel>
                    <Input
                      value={guardian.relationship || ''}
                      onChange={(e) => handleGuardianChange('relationship', e.target.value)}
                      placeholder="e.g. Grandfather, Uncle, etc."
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <FormControl id="guardianPhone" isRequired={parentInfo.hasGuardian}>
                    <FormLabel>Guardian's Phone</FormLabel>
                    <InputGroup>
                      <InputLeftAddon>+92</InputLeftAddon>
                      <Input
                        value={guardian.phone || ''}
                        onChange={(e) => handleGuardianChange('phone', e.target.value)}
                        placeholder="300 1234567"
                      />
                    </InputGroup>
                  </FormControl>
                  
                  <FormControl id="guardianCNIC">
                    <FormLabel>Guardian's CNIC</FormLabel>
                    <Input
                      value={guardian.cnic || ''}
                      onChange={(e) => handleGuardianChange('cnic', e.target.value)}
                      placeholder="00000-0000000-0"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl id="guardianAddress" mb={6}>
                  <FormLabel>Guardian's Address</FormLabel>
                  <Textarea
                    value={guardian.address || ''}
                    onChange={(e) => handleGuardianChange('address', e.target.value)}
                    placeholder="Enter guardian's address if different from student's"
                  />
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                  <FormControl id="guardianPortalPassword" isRequired={false}>
                    <FormLabel>Parent Portal Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showGuardianPwd ? 'text' : 'password'}
                        value={guardian.portalPassword || ''}
                        onChange={(e) => handleGuardianChange('portalPassword', e.target.value)}
                        placeholder="Set a password for Parent login"
                      />
                      <InputRightElement width='3rem'>
                        <Button size='sm' variant='ghost' onClick={() => setShowGuardianPwd((v) => !v)}>
                          {showGuardianPwd ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormHelperText>Preferred: guardian's WhatsApp phone + this password for portal login.</FormHelperText>
                  </FormControl>
                  <FormControl id="guardianPortalPasswordConfirm" isRequired={false}>
                    <FormLabel>Confirm Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showGuardianPwd2 ? 'text' : 'password'}
                        value={guardian.portalPasswordConfirm || ''}
                        onChange={(e) => handleGuardianChange('portalPasswordConfirm', e.target.value)}
                        placeholder="Re-enter password"
                      />
                      <InputRightElement width='3rem'>
                        <Button size='sm' variant='ghost' onClick={() => setShowGuardianPwd2((v) => !v)}>
                          {showGuardianPwd2 ? 'Hide' : 'Show'}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                <Button 
                  leftIcon={<Icon as={MdContentCopy} />} 
                  colorScheme="brand" 
                  variant="outline"
                  onClick={() => {
                    dispatch(updateFormData({
                      step: 'parent',
                      data: { 
                        emergency: {
                          name: guardian.name,
                          phone: guardian.phone,
                          relationship: guardian.relationship
                        }
                      }
                    }));
                  }}
                >
                  Use as Emergency Contact
                </Button>
              </>
            )}
          </TabPanel>

          {/* Emergency Contact */}
          <TabPanel>
            <Text color="gray.600" mb={4}>
              Provide an emergency contact who can be reached during school hours.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="emergencyName" isRequired>
                <FormLabel>Emergency Contact Name</FormLabel>
                <Input
                  value={emergency.name || ''}
                  onChange={(e) => handleEmergencyChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </FormControl>
              
              <FormControl id="emergencyRelationship" isRequired>
                <FormLabel>Relationship with Student</FormLabel>
                <Select
                  value={emergency.relationship || ''}
                  onChange={(e) => handleEmergencyChange('relationship', e.target.value)}
                  placeholder="Select relationship"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
              <FormControl id="emergencyPhone" isRequired>
                <FormLabel>Emergency Contact Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon>+92</InputLeftAddon>
                  <Input
                    value={emergency.phone || ''}
                    onChange={(e) => handleEmergencyChange('phone', e.target.value)}
                    placeholder="300 1234567"
                  />
                </InputGroup>
              </FormControl>
              
              <FormControl id="emergencyAlternatePhone">
                <FormLabel>Alternate Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon>+92</InputLeftAddon>
                  <Input
                    value={emergency.alternatePhone || ''}
                    onChange={(e) => handleEmergencyChange('alternatePhone', e.target.value)}
                    placeholder="300 1234567"
                  />
                </InputGroup>
              </FormControl>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Divider mb={6} />

      {/* Family Information */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Additional Family Information
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <FormControl id="familyNumber">
          <FormLabel>Family Number (optional)</FormLabel>
          <Input
            value={parentInfo.familyNumber || ''}
            onChange={(e) => handleParentInfoChange('familyNumber', e.target.value)}
            placeholder="Enter to link siblings; leave empty to auto-generate"
          />
          <FormHelperText>
            This value groups siblings. If left empty, the system will generate a unique number.
          </FormHelperText>
        </FormControl>
        <FormControl id="siblings">
          <FormLabel>Number of Siblings</FormLabel>
          <Input
            type="number"
            value={parentInfo.siblings || ''}
            onChange={(e) => handleParentInfoChange('siblings', e.target.value)}
            placeholder="0"
            min="0"
          />
        </FormControl>
        
        <FormControl id="siblingsInSchool">
          <FormLabel>Siblings in this School</FormLabel>
          <Input
            type="number"
            value={parentInfo.siblingsInSchool || ''}
            onChange={(e) => handleParentInfoChange('siblingsInSchool', e.target.value)}
            placeholder="0"
            min="0"
          />
        </FormControl>
        
        <FormControl id="familySize">
          <FormLabel>Total Family Members</FormLabel>
          <Input
            type="number"
            value={parentInfo.familySize || ''}
            onChange={(e) => handleParentInfoChange('familySize', e.target.value)}
            placeholder="0"
            min="0"
          />
        </FormControl>
      </SimpleGrid>

      <FormControl id="familyNotes" mb={6}>
        <FormLabel>Additional Family Information</FormLabel>
        <Textarea
          value={parentInfo.familyNotes || ''}
          onChange={(e) => handleParentInfoChange('familyNotes', e.target.value)}
          placeholder="Enter any additional information about the student's family situation"
        />
        <FormHelperText>
          Any special family circumstances, living arrangements, etc.
        </FormHelperText>
      </FormControl>
    </Box>
  );
}

export default ParentInfoForm;
