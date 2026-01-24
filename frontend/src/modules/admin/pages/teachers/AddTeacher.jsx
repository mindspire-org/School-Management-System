import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  SimpleGrid,
  Heading,
  Text,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  IconButton,
  Flex,
  useColorModeValue,
  Avatar,
  Circle,
  RadioGroup,
  Radio,
  Textarea,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, CheckIcon } from '@chakra-ui/icons';
import Card from 'components/card/Card.js';
import useApi from '../../../../hooks/useApi';
import { teachersApi } from '../../../../services/api';

const createInitialFormState = () => ({
  name: '',
  email: '',
  phone: '',
  qualification: '',
  employmentType: 'fullTime',
  joiningDate: '',
  salary: '',
  baseSalary: '',
  allowances: '',
  deductions: '',
  currency: 'PKR',
  payFrequency: 'monthly',
  paymentMethod: 'bank',
  bankName: '',
  accountNumber: '',
  iban: '',
  gender: '',
  dob: '',
  bloodGroup: '',
  religion: '',
  nationalId: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  employeeId: '',
  department: '',
  designation: '',
  experienceYears: '',
  specialization: '',
  employmentStatus: 'active',
  probationEndDate: '',
  contractEndDate: '',
  workHoursPerWeek: '',
});

/**
 * AddTeacher component for creating new teacher records
 */
const AddTeacher = () => {
  // Form state
  const [formData, setFormData] = useState(createInitialFormState);
  
  // Additional state for subjects and classes (arrays)
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newClass, setNewClass] = useState('');
  const subjectSuggestions = useMemo(() => ['Mathematics','Physics','Chemistry','Biology','English','Computer Science','Urdu','Islamiat'], []);
  const classSuggestions = useMemo(() => ['9A','9B','10A','10B','11A','11B','12A','12B'], []);
  
  // Form validation state
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [reviewReady, setReviewReady] = useState(true);
  
  // Color mode values
  const textColor = useColorModeValue('gray.800', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const brand = useColorModeValue('blue.500', 'blue.300');
  const toast = useToast();

  const resetForm = useCallback(() => {
    setFormData(createInitialFormState());
    setSubjects([]);
    setClasses([]);
    setNewSubject('');
    setNewClass('');
    setPhoto(null);
    setPhotoPreview('');
    setErrors({});
    setCurrentStep(0);
  }, []);

  const handleSuccess = useCallback((res) => {
    toast({
      title: 'Teacher added',
      description: res?.name ? `${res.name} has been added successfully.` : 'Teacher created successfully.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    resetForm();
  }, [resetForm, toast]);

  const handleError = useCallback((error) => {
    toast({
      title: 'Failed to add teacher',
      description: error?.data?.message || error?.message || 'Something went wrong. Please try again.',
      status: 'error',
      duration: 6000,
      isClosable: true,
    });
  }, [toast]);

  const { execute: createTeacher, loading: isSubmitting } = useApi(teachersApi.create, {
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const fileToBase64 = useCallback((file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsDataURL(file);
  }), []);

  const steps = useMemo(() => ([
    { key: 'personal', title: 'Personal Information', sub: 'Teacher details' },
    { key: 'professional', title: 'Professional Details', sub: 'Employment & qualification' },
    { key: 'subjects', title: 'Subjects & Classes', sub: 'Assignments' },
    { key: 'salary', title: 'Salary', sub: 'Compensation' },
    { key: 'review', title: 'Review', sub: 'Verify details' },
  ]), []);

  useEffect(() => {
    const stepKey = steps[currentStep]?.key;
    if (stepKey !== 'review') {
      setReviewReady(true);
      return;
    }

    setReviewReady(false);
    const id = setTimeout(() => setReviewReady(true), 500);
    return () => clearTimeout(id);
  }, [currentStep, steps]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Salary calculations
  const base = parseFloat(formData.baseSalary || '0') || 0;
  const alw = parseFloat(formData.allowances || '0') || 0;
  const ded = parseFloat(formData.deductions || '0') || 0;
  const net = useMemo(() => Math.max(0, base + alw - ded), [base, alw, ded]);

  useEffect(() => {
    const formatted = net ? String(net) : '';
    if (formData.salary !== formatted) {
      setFormData(prev => ({ ...prev, salary: formatted }));
    }
  }, [net]);

  const handlePhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setPhoto(f);
    const url = URL.createObjectURL(f);
    setPhotoPreview(url);
  };
  
  // Add a subject to the list
  const handleAddSubject = () => {
    if (newSubject && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject]);
      setNewSubject('');
    }
  };
  
  // Remove a subject from the list
  const handleRemoveSubject = (subject) => {
    setSubjects(subjects.filter(s => s !== subject));
  };
  
  // Add a class to the list
  const handleAddClass = () => {
    if (newClass && !classes.includes(newClass)) {
      setClasses([...classes, newClass]);
      setNewClass('');
    }
  };
  
  // Remove a class from the list
  const handleRemoveClass = (cls) => {
    setClasses(classes.filter(c => c !== cls));
  };
  
  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.baseSalary) newErrors.baseSalary = 'Basic salary is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    
    if (subjects.length === 0) newErrors.subjects = 'At least one subject is required';
    if (classes.length === 0) newErrors.classes = 'At least one class is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (stepIdx) => {
    const k = steps[stepIdx]?.key;
    if (k === 'personal') {
      const e = {};
      if (!formData.name.trim()) e.name = 'Name is required';
      if (!formData.email.trim()) e.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'Invalid email';
      if (!formData.phone.trim()) e.phone = 'Phone is required';
      if (!formData.gender) e.gender = 'Select gender';
      if (!formData.dob) e.dob = 'Date of birth is required';
      setErrors((prev) => ({ ...prev, ...e }));
      return Object.keys(e).length === 0;
    }
    if (k === 'professional') {
      const e = {};
      if (!formData.qualification.trim()) e.qualification = 'Qualification is required';
      if (!formData.joiningDate) e.joiningDate = 'Joining date is required';
      if (!formData.employeeId.trim()) e.employeeId = 'Employee ID is required';
      if (!formData.department.trim()) e.department = 'Department is required';
      if (!formData.designation.trim()) e.designation = 'Designation is required';
      setErrors((prev) => ({ ...prev, ...e }));
      return Object.keys(e).length === 0;
    }
    if (k === 'subjects') {
      const e = {};
      if (subjects.length === 0) e.subjects = 'At least one subject is required';
      if (classes.length === 0) e.classes = 'At least one class is required';
      setErrors((prev) => ({ ...prev, ...e }));
      return Object.keys(e).length === 0;
    }
    if (k === 'salary') {
      const e = {};
      if (!formData.baseSalary) e.baseSalary = 'Basic salary is required';
      setErrors((prev) => ({ ...prev, ...e }));
      return Object.keys(e).length === 0;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const stepKey = steps[currentStep]?.key;
    if (stepKey !== 'review') {
      nextStep();
      return;
    }

    if (!reviewReady) return;

    if (isSubmitting) return;

    if (!validateForm()) return;

    let avatar = null;
    if (photo) {
      try {
        avatar = await fileToBase64(photo);
      } catch (err) {
        toast({
          title: 'Image processing failed',
          description: 'Could not read the selected photo. Please try again with a different file.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    const toNumber = (val) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = Number(val);
      return Number.isFinite(num) ? num : null;
    };

    const payload = {
      ...formData,
      baseSalary: toNumber(formData.baseSalary),
      allowances: toNumber(formData.allowances),
      deductions: toNumber(formData.deductions),
      experienceYears: toNumber(formData.experienceYears),
      workHoursPerWeek: toNumber(formData.workHoursPerWeek),
      salary: net,
      subjects,
      classes,
    };

    if (avatar) payload.avatar = avatar;

    await createTeacher(payload);
  };
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Add New Teacher</Heading>
          <Text color={textColorSecondary}>Create a new teacher record in the system</Text>
        </Box>
      </Flex>

      {/* Stepper */}
      <Card mb={4} p={{ base: 3, md: 4 }}>
        <HStack spacing={4} align="stretch" wrap="wrap">
          {steps.map((s, idx) => {
            const complete = idx < currentStep;
            const active = idx === currentStep;
            return (
              <HStack
                key={s.key}
                spacing={3}
                cursor="pointer"
                onClick={() => {
                  if (idx <= currentStep) {
                    setCurrentStep(idx);
                    return;
                  }

                  let nextIdx = currentStep;
                  while (nextIdx < idx) {
                    if (!validateStep(nextIdx)) break;
                    nextIdx += 1;
                  }
                  setCurrentStep(nextIdx);
                }}
              >
                <Circle size="32px" bg={complete ? 'green.500' : active ? brand : 'gray.200'} color={complete || active ? 'white' : 'gray.600'}>
                  {complete ? <CheckIcon boxSize={3} /> : idx + 1}
                </Circle>
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontWeight="bold" color={active ? textColor : textColorSecondary} fontSize="sm">{s.title}</Text>
                  <Text fontSize="xs" color={textColorSecondary}>{s.sub}</Text>
                </Box>
              </HStack>
            );
          })}
        </HStack>
      </Card>

      {/* Form Card */}
      <Card>
        <Box>
          <VStack spacing={6} align="stretch" p={4}>
            {currentStep === 0 && (
              <Box>
                <Heading size="md" mb={4}>Personal Information</Heading>
                <Flex align="center" direction="column" mb={6}>
                  <Avatar name={formData.name || 'T'} size="xl" src={photoPreview} mb={3} />
                  <Button variant="outline" onClick={() => document.getElementById('teacher-photo-input')?.click()}>Upload Photo</Button>
                  <Input id="teacher-photo-input" type="file" accept="image/*" display="none" onChange={handlePhoto} />
                  <Text mt={2} fontSize="xs" color={textColorSecondary}>Optional. Recommended size: 300x300px</Text>
                </Flex>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={errors.name}>
                    <FormLabel>Full Name</FormLabel>
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" />
                    {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={errors.email}>
                    <FormLabel>Email Address</FormLabel>
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" />
                    {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={errors.phone}>
                    <FormLabel>Phone Number</FormLabel>
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter phone number" />
                    {errors.phone && <FormErrorMessage>{errors.phone}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={errors.qualification}>
                    <FormLabel>Qualification</FormLabel>
                    <Input name="qualification" value={formData.qualification} onChange={handleChange} placeholder="E.g., PhD Mathematics, MSc Physics" />
                    {errors.qualification && <FormErrorMessage>{errors.qualification}</FormErrorMessage>}
                  </FormControl>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                  <FormControl isInvalid={errors.gender}>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup value={formData.gender} onChange={(val) => handleChange({ target: { name: 'gender', value: val } })}>
                      <HStack spacing={6}>
                        <Radio value='male'>Male</Radio>
                        <Radio value='female'>Female</Radio>
                        <Radio value='other'>Other</Radio>
                      </HStack>
                    </RadioGroup>
                    {errors.gender && <FormErrorMessage>{errors.gender}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={errors.dob}>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input name='dob' type='date' value={formData.dob} onChange={handleChange} />
                    {errors.dob && <FormErrorMessage>{errors.dob}</FormErrorMessage>}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Blood Group</FormLabel>
                    <Select name='bloodGroup' value={formData.bloodGroup} onChange={handleChange} placeholder='Select blood group'>
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Religion</FormLabel>
                    <Input name='religion' value={formData.religion} onChange={handleChange} placeholder='Enter religion' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>National ID</FormLabel>
                    <Input name='nationalId' value={formData.nationalId} onChange={handleChange} placeholder='CNIC / National ID' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address Line 1</FormLabel>
                    <Textarea name='address1' value={formData.address1} onChange={handleChange} placeholder='Street address, house no.' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address Line 2</FormLabel>
                    <Textarea name='address2' value={formData.address2} onChange={handleChange} placeholder='Apartment, suite, etc. (optional)' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input name='city' value={formData.city} onChange={handleChange} placeholder='Enter city' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>State/Province</FormLabel>
                    <Input name='state' value={formData.state} onChange={handleChange} placeholder='Enter state/province' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Postal Code</FormLabel>
                    <Input name='postalCode' value={formData.postalCode} onChange={handleChange} placeholder='Enter postal code' />
                  </FormControl>
                </SimpleGrid>
                <Heading size='sm' mt={8} mb={4}>Emergency Contact</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Contact Name</FormLabel>
                    <Input name='emergencyName' value={formData.emergencyName} onChange={handleChange} placeholder='Full name' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input name='emergencyPhone' value={formData.emergencyPhone} onChange={handleChange} placeholder='Phone number' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Relation</FormLabel>
                    <Input name='emergencyRelation' value={formData.emergencyRelation} onChange={handleChange} placeholder='Relation' />
                  </FormControl>
                </SimpleGrid>
              </Box>
            )}

            {currentStep === 1 && (
              <Box>
                <Heading size="md" mb={4}>Professional Details</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Employment Type</FormLabel>
                    <Select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                      <option value="fullTime">Full Time</option>
                      <option value="partTime">Part Time</option>
                    </Select>
                  </FormControl>
                  <FormControl isInvalid={errors.joiningDate}>
                    <FormLabel>Joining Date</FormLabel>
                    <Input name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} />
                    {errors.joiningDate && <FormErrorMessage>{errors.joiningDate}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={errors.employeeId}>
                    <FormLabel>Employee ID</FormLabel>
                    <Input name='employeeId' value={formData.employeeId} onChange={handleChange} placeholder='Unique employee ID' />
                    {errors.employeeId && <FormErrorMessage>{errors.employeeId}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={errors.department}>
                    <FormLabel>Department</FormLabel>
                    <Input name='department' value={formData.department} onChange={handleChange} placeholder='e.g., Science, Humanities' />
                    {errors.department && <FormErrorMessage>{errors.department}</FormErrorMessage>}
                  </FormControl>
                  <FormControl isInvalid={errors.designation}>
                    <FormLabel>Designation</FormLabel>
                    <Input name='designation' value={formData.designation} onChange={handleChange} placeholder='e.g., Senior Lecturer' />
                    {errors.designation && <FormErrorMessage>{errors.designation}</FormErrorMessage>}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Total Experience (Years)</FormLabel>
                    <Input name='experienceYears' type='number' value={formData.experienceYears} onChange={handleChange} placeholder='e.g., 5' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Specialization</FormLabel>
                    <Input name='specialization' value={formData.specialization} onChange={handleChange} placeholder='e.g., Calculus, Physics' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Employment Status</FormLabel>
                    <Select name='employmentStatus' value={formData.employmentStatus} onChange={handleChange}>
                      <option value='active'>Active</option>
                      <option value='on_leave'>On Leave</option>
                      <option value='resigned'>Resigned</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Probation End Date</FormLabel>
                    <Input name='probationEndDate' type='date' value={formData.probationEndDate} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Contract End Date</FormLabel>
                    <Input name='contractEndDate' type='date' value={formData.contractEndDate} onChange={handleChange} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Work Hours / Week</FormLabel>
                    <Input name='workHoursPerWeek' type='number' value={formData.workHoursPerWeek} onChange={handleChange} placeholder='e.g., 40' />
                  </FormControl>
                </SimpleGrid>
              </Box>
            )}

            {currentStep === 2 && (
              <Box>
                <Heading size="md" mb={4}>Subjects & Classes</Heading>
                <FormControl isInvalid={errors.subjects}>
                  <FormLabel>Add Subjects</FormLabel>
                  <HStack>
                    <InputGroup>
                      <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Enter subject name" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())} />
                    </InputGroup>
                    <IconButton colorScheme="blue" aria-label="Add subject" icon={<AddIcon />} onClick={handleAddSubject} />
                  </HStack>
                  <HStack spacing={2} mt={3} flexWrap="wrap">
                    {subjectSuggestions.filter(s => !subjects.includes(s)).slice(0, 10).map((s, i) => (
                      <Tag key={`sugg-sub-${i}`} variant='subtle' colorScheme='blue' cursor='pointer' onClick={() => setSubjects(prev => [...prev, s])}>
                        <TagLabel>+ {s}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                  {errors.subjects && <FormErrorMessage>{errors.subjects}</FormErrorMessage>}
                  <Box mt={4}>
                    <HStack spacing={2} flexWrap="wrap" align="center">
                      <Badge colorScheme='blue'>Selected: {subjects.length}</Badge>
                      {subjects.map((subject, index) => (
                        <Tag size="md" key={index} borderRadius="full" variant="solid" colorScheme="blue" m={1}>
                          <TagLabel>{subject}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveSubject(subject)} />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                </FormControl>
                <Divider my={6} />
                <FormControl isInvalid={errors.classes}>
                  <FormLabel>Add Classes</FormLabel>
                  <HStack>
                    <InputGroup>
                      <Input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="E.g., 10A, 11B" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddClass())} />
                    </InputGroup>
                    <IconButton colorScheme="green" aria-label="Add class" icon={<AddIcon />} onClick={handleAddClass} />
                  </HStack>
                  <HStack spacing={2} mt={3} flexWrap="wrap">
                    {classSuggestions.filter(c => !classes.includes(c)).slice(0, 10).map((c, i) => (
                      <Tag key={`sugg-cls-${i}`} variant='subtle' colorScheme='green' cursor='pointer' onClick={() => setClasses(prev => [...prev, c])}>
                        <TagLabel>+ {c}</TagLabel>
                      </Tag>
                    ))}
                  </HStack>
                  {errors.classes && <FormErrorMessage>{errors.classes}</FormErrorMessage>}
                  <Box mt={4}>
                    <HStack spacing={2} flexWrap="wrap" align="center">
                      <Badge colorScheme='green'>Selected: {classes.length}</Badge>
                      {classes.map((cls, index) => (
                        <Tag size="md" key={index} borderRadius="full" variant="solid" colorScheme="green" m={1}>
                          <TagLabel>{cls}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveClass(cls)} />
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                </FormControl>
              </Box>
            )}

            {currentStep === 3 && (
              <Box>
                <Heading size="md" mb={4}>Salary</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={errors.baseSalary}>
                    <FormLabel>Basic Salary</FormLabel>
                    <Input name='baseSalary' type='number' value={formData.baseSalary} onChange={handleChange} placeholder='e.g., 60000' />
                    {errors.baseSalary && <FormErrorMessage>{errors.baseSalary}</FormErrorMessage>}
                  </FormControl>
                  <FormControl>
                    <FormLabel>Allowances</FormLabel>
                    <Input name='allowances' type='number' value={formData.allowances} onChange={handleChange} placeholder='e.g., 5000' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Deductions</FormLabel>
                    <Input name='deductions' type='number' value={formData.deductions} onChange={handleChange} placeholder='e.g., 2000' />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Currency</FormLabel>
                    <Select name='currency' value={formData.currency} onChange={handleChange}>
                      <option value='PKR'>PKR</option>
                      <option value='USD'>USD</option>
                      <option value='EUR'>EUR</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Pay Frequency</FormLabel>
                    <Select name='payFrequency' value={formData.payFrequency} onChange={handleChange}>
                      <option value='monthly'>Monthly</option>
                      <option value='biweekly'>Bi-Weekly</option>
                      <option value='weekly'>Weekly</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Payment Method</FormLabel>
                    <Select name='paymentMethod' value={formData.paymentMethod} onChange={handleChange}>
                      <option value='bank'>Bank Transfer</option>
                      <option value='cash'>Cash</option>
                      <option value='cheque'>Cheque</option>
                    </Select>
                  </FormControl>
                  {formData.paymentMethod === 'bank' && (
                    <>
                      <FormControl>
                        <FormLabel>Bank Name</FormLabel>
                        <Input name='bankName' value={formData.bankName} onChange={handleChange} placeholder='e.g., HBL' />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Account Number</FormLabel>
                        <Input name='accountNumber' value={formData.accountNumber} onChange={handleChange} placeholder='Account number' />
                      </FormControl>
                      <FormControl>
                        <FormLabel>IBAN</FormLabel>
                        <Input name='iban' value={formData.iban} onChange={handleChange} placeholder='IBAN' />
                      </FormControl>
                    </>
                  )}
                </SimpleGrid>
                <Card mt={6} p={4}>
                  <HStack justify='space-between'>
                    <Text fontWeight='bold'>Net {formData.payFrequency === 'monthly' ? 'Monthly' : formData.payFrequency === 'biweekly' ? 'Bi-Weekly' : 'Weekly'} Salary</Text>
                    <Text fontWeight='bold' color='green.500'>{formData.currency} {net.toLocaleString()}</Text>
                  </HStack>
                  <Text fontSize='sm' color={textColorSecondary} mt={1}>Calculated as Basic + Allowances - Deductions</Text>
                </Card>
              </Box>
            )}

            {currentStep === 4 && (
              <Box>
                <Heading size="md" mb={4}>Review</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box><Text fontWeight="600">Name</Text><Text color={textColorSecondary}>{formData.name || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Email</Text><Text color={textColorSecondary}>{formData.email || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Phone</Text><Text color={textColorSecondary}>{formData.phone || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Qualification</Text><Text color={textColorSecondary}>{formData.qualification || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Gender</Text><Text color={textColorSecondary}>{formData.gender || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Date of Birth</Text><Text color={textColorSecondary}>{formData.dob || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Blood Group</Text><Text color={textColorSecondary}>{formData.bloodGroup || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Religion</Text><Text color={textColorSecondary}>{formData.religion || '-'}</Text></Box>
                  <Box><Text fontWeight="600">National ID</Text><Text color={textColorSecondary}>{formData.nationalId || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Address</Text><Text color={textColorSecondary}>{[formData.address1, formData.address2].filter(Boolean).join(', ') || '-'}</Text></Box>
                  <Box><Text fontWeight="600">City/State</Text><Text color={textColorSecondary}>{[formData.city, formData.state].filter(Boolean).join(', ') || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Postal Code</Text><Text color={textColorSecondary}>{formData.postalCode || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Employment</Text><Text color={textColorSecondary}>{formData.employmentType}</Text></Box>
                  <Box><Text fontWeight="600">Joining Date</Text><Text color={textColorSecondary}>{formData.joiningDate || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Employee ID</Text><Text color={textColorSecondary}>{formData.employeeId || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Department</Text><Text color={textColorSecondary}>{formData.department || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Designation</Text><Text color={textColorSecondary}>{formData.designation || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Experience (Years)</Text><Text color={textColorSecondary}>{formData.experienceYears || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Specialization</Text><Text color={textColorSecondary}>{formData.specialization || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Employment Status</Text><Text color={textColorSecondary}>{formData.employmentStatus || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Probation End</Text><Text color={textColorSecondary}>{formData.probationEndDate || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Contract End</Text><Text color={textColorSecondary}>{formData.contractEndDate || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Work Hours/Week</Text><Text color={textColorSecondary}>{formData.workHoursPerWeek || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Emergency Contact</Text><Text color={textColorSecondary}>{[formData.emergencyName, formData.emergencyPhone, formData.emergencyRelation].filter(Boolean).join(' · ') || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Basic Salary</Text><Text color={textColorSecondary}>{formData.baseSalary || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Allowances</Text><Text color={textColorSecondary}>{formData.allowances || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Deductions</Text><Text color={textColorSecondary}>{formData.deductions || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Net Salary</Text><Text color={textColorSecondary}>{`${formData.currency} ${net.toLocaleString()}`}</Text></Box>
                  <Box><Text fontWeight="600">Pay Frequency</Text><Text color={textColorSecondary}>{formData.payFrequency || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Payment Method</Text><Text color={textColorSecondary}>{formData.paymentMethod || '-'}</Text></Box>
                  {formData.paymentMethod === 'bank' && (
                    <>
                      <Box><Text fontWeight="600">Bank</Text><Text color={textColorSecondary}>{formData.bankName || '-'}</Text></Box>
                      <Box><Text fontWeight="600">Account #</Text><Text color={textColorSecondary}>{formData.accountNumber || '-'}</Text></Box>
                      <Box><Text fontWeight="600">IBAN</Text><Text color={textColorSecondary}>{formData.iban || '-'}</Text></Box>
                    </>
                  )}
                  <Box><Text fontWeight="600">Subjects</Text><Text color={textColorSecondary}>{subjects.join(', ') || '-'}</Text></Box>
                  <Box><Text fontWeight="600">Classes</Text><Text color={textColorSecondary}>{classes.join(', ') || '-'}</Text></Box>
                </SimpleGrid>
              </Box>
            )}

            <Divider />
            <Flex justify="space-between">
              <Button type="button" variant="outline" onClick={prevStep} isDisabled={currentStep === 0 || isSubmitting}>Back</Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  key="next"
                  type="button"
                  colorScheme="blue"
                  onClick={(evt) => {
                    evt?.preventDefault();
                    nextStep();
                  }}
                  isDisabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button
                  key="submit"
                  colorScheme="blue"
                  size="lg"
                  type="button"
                  onClick={handleSubmit}
                  isDisabled={!reviewReady || isSubmitting}
                  isLoading={isSubmitting}
                  loadingText="Submitting"
                >
                  Add Teacher
                </Button>
              )}
            </Flex>
          </VStack>
        </Box>
      </Card>
    </Box>
  );
}

export default AddTeacher;
