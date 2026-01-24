import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  useColorModeValue,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  setFormStep,
  updateFormData,
  clearFormData,
  selectCurrentFormStep,
  selectStudentFormData,
  selectFormErrors,
} from '../../redux/features/students/studentSlice';
import { MdPersonAdd, MdArrowBack, MdWarning } from 'react-icons/md';
import PersonalInfoForm from './components/forms/PersonalInfoForm';
import AcademicInfoForm from './components/forms/AcademicInfoForm';
import ParentInfoForm from './components/forms/ParentInfoForm';
import TransportInfoForm from './components/forms/TransportInfoForm';
import FeeInfoForm from './components/forms/FeeInfoForm';
import ReviewForm from './components/forms/ReviewForm';
import * as studentsApi from '../../services/api/students';

function AddStudent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = React.useRef();
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = React.useState(false);

  // Redux state
  const currentStep = useAppSelector(selectCurrentFormStep);
  const formData = useAppSelector(selectStudentFormData);
  const formErrors = useAppSelector(selectFormErrors);
  const loading = useAppSelector(state => state.students.loading);
  const error = useAppSelector(state => state.students.error);

  // UI colors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const bgButton = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
  const bgHover = useColorModeValue(
    { bg: 'secondaryGray.400' },
    { bg: 'whiteAlpha.50' }
  );
  const bgFocus = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.100' }
  );

  // Steps configuration
  const steps = [
    { title: 'Personal Information', description: 'Student details' },
    { title: 'Academic Information', description: 'Academic details' },
    { title: 'Parent Information', description: 'Contact details' },
    { title: 'Transport', description: 'Transport details' },
    { title: 'Fee Structure', description: 'Fee details' },
    { title: 'Review', description: 'Verify details' },
  ];

  // Clear form when component mounts
  useEffect(() => {
    // Reset form on load so a previous Edit session doesn't prefill Add
    dispatch(clearFormData());
    dispatch(setFormStep(1));
    return () => {
      // Don't clear form data on component unmount to prevent accidental data loss
      // if someone navigates away and comes back
    };
  }, [dispatch]);

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      dispatch(setFormStep(currentStep + 1));
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields correctly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    dispatch(setFormStep(currentStep - 1));
  };

  // Handle cancel/back
  const handleCancel = () => {
    // Check if form has data
    const hasFormData = Object.values(formData).some(
      section => Object.keys(section).length > 0
    );
    
    if (hasFormData) {
      setIsLeaveAlertOpen(true);
    } else {
      navigate('/admin/students/list');
    }
  };

  // Confirm leaving
  const confirmLeave = () => {
    dispatch(clearFormData());
    setIsLeaveAlertOpen(false);
    navigate('/admin/students/list');
  };

  // Handle form submission
  const handleSubmit = () => {
    const combinedData = {
      ...formData.personal,
      ...formData.academic,
      parentInfo: formData.parent,
      transportInfo: formData.transport,
      feeInfo: formData.fee
    };

    // Map to backend expected fields
    const payload = {
      name: combinedData.name,
      email: combinedData.email,
      rollNumber: combinedData.rollNumber,
      class: combinedData.class,
      section: combinedData.section,
      rfidTag: combinedData.rfidTag,
      attendance: 0,
      feeStatus: 'paid',
      busNumber: combinedData.transportInfo?.busNumber || null,
      busAssigned: !!combinedData.transportInfo?.busNumber || false,
      parentName: combinedData.parentInfo?.father?.name || combinedData.parentInfo?.name || null,
      parentPhone: combinedData.parentInfo?.father?.phone || combinedData.parentInfo?.phone || null,
      status: 'active',
      admissionDate: combinedData.admissionDate,
      avatar: combinedData.photo || null,
      // full nested objects for detailed persistence
      personal: formData.personal,
      academic: formData.academic,
      parent: formData.parent,
      transport: formData.transport,
      fee: formData.fee,
    };

    // Sanitize payload to satisfy backend validators
    const sanitized = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );

    // Validate email; if invalid, drop it so backend optional().isEmail() doesn't fail
    if (sanitized.email) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(sanitized.email));
      if (!emailOk) delete sanitized.email;
    }

    // Normalize admissionDate: if provided but invalid, drop it
    if (sanitized.admissionDate) {
      const ts = Date.parse(sanitized.admissionDate);
      if (Number.isNaN(ts)) delete sanitized.admissionDate;
    }

    // Attendance must be 0..100 number
    sanitized.attendance = Math.max(0, Math.min(100, Number(sanitized.attendance) || 0));

    // Fee status allowed values only
    const allowedFee = new Set(['paid', 'pending', 'overdue']);
    if (!allowedFee.has(sanitized.feeStatus)) sanitized.feeStatus = 'paid';

    // Ensure boolean
    sanitized.busAssigned = Boolean(sanitized.busAssigned);

    studentsApi.create(sanitized)
      .then(() => {
        toast({
          title: 'Success',
          description: 'Student added successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
        dispatch(clearFormData());
        navigate('/admin/students/list');
      })
      .catch((err) => {
        const baseMessage = (err && (err.data?.message || err.message)) || 'Failed to add student. Please try again.';
        const details = Array.isArray(err?.data?.errors)
          ? err.data.errors.map((e) => `${e.param}: ${e.msg}`).join('; ')
          : null;
        const message = details ? `${baseMessage} — ${details}` : baseMessage;
        toast({
          title: 'Error',
          description: message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      });
  };

  // Validate current step
  const validateCurrentStep = () => {
    // In a real app, you would have more detailed validation here
    // This is a simplified validation
    
    switch (currentStep) {
      case 1: // Personal Information
        return formData.personal.name && formData.personal.gender && formData.personal.dateOfBirth;
      
      case 2: // Academic Information
        return formData.academic.class && formData.academic.section && formData.academic.admissionNumber;
      
      case 3: // Parent Information
        return formData.parent.father && formData.parent.father.name && formData.parent.father.phone;
      
      case 4: // Transport Information
        // Transport is optional
        return true;
      
      case 5: // Fee Information
        // Basic fee info is required
        return formData.fee.feePlan;
      
      case 6: // Review
        // Review step doesn't need validation
        return true;
      
      default:
        return false;
    }
  };

  // Render current step form
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm />;
      case 2:
        return <AcademicInfoForm />;
      case 3:
        return <ParentInfoForm />;
      case 4:
        return <TransportInfoForm />;
      case 5:
        return <FeeInfoForm />;
      case 6:
        return <ReviewForm />;
      default:
        return <Box>Unknown Step</Box>;
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex
        mb="20px"
        justifyContent="space-between"
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'start', md: 'center' }}
      >
        <Box>
          <Heading as="h3" fontSize={{ base: 'xl', md: '2xl' }} mb="4">
            Add New Student
          </Heading>
          <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>Enter student information to register</Text>
        </Box>
        
        <Button
          leftIcon={<MdArrowBack />}
          mt={{ base: 2, md: 0 }}
          variant="outline"
          onClick={handleCancel}
        >
          Back to Students
        </Button>
      </Flex>

      {/* Stepper */}
      <Card mb="20px" p={{ base: 3, md: 4, lg: 5 }}>
        <Box overflowX="auto" w="100%">
          <Stepper size={{ base: 'sm', md: 'md', lg: 'lg' }} index={currentStep - 1} colorScheme="brand">
            {steps.map((step, index) => (
              <Step key={index} flex="0 0 auto" minW={{ base: '180px', md: '220px' }}>
                <StepIndicator boxSize={{ base: '28px', md: '32px' }}>
                  <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                </StepIndicator>
                <Box flexShrink="0">
                  <StepTitle fontSize={{ base: 'xs', md: 'sm', lg: 'md' }} noOfLines={1} whiteSpace="nowrap">{step.title}</StepTitle>
                  <StepDescription display={{ base: 'none', md: 'block' }} fontSize={{ base: 'xs', md: 'xs' }}>{step.description}</StepDescription>
                </Box>
                <StepSeparator display={{ base: 'none', md: 'block' }} />
              </Step>
            ))}
          </Stepper>
        </Box>
      </Card>

      {/* Form Content */}
      <Card mb="20px" p={{ base: 4, md: 6 }}>
        {renderStepContent()}
      </Card>

      {/* Form Controls */}
      <Card mb="20px" p={{ base: 4, md: 6 }}>
        <Flex justify="space-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleCancel : handlePrevStep}
            isDisabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <Button
            colorScheme="brand"
            onClick={currentStep === steps.length ? handleSubmit : handleNextStep}
            isLoading={loading && currentStep === steps.length}
            leftIcon={currentStep === steps.length ? <MdPersonAdd /> : undefined}
          >
            {currentStep === steps.length ? 'Add Student' : 'Next'}
          </Button>
        </Flex>
      </Card>

      {/* Leave Confirmation Dialog */}
      <AlertDialog
        isOpen={isLeaveAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsLeaveAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Discard Changes
            </AlertDialogHeader>

            <AlertDialogBody>
              <Flex align="center" mb={4}>
                <Icon as={MdWarning} color="orange.500" w={6} h={6} mr={2} />
                <Text>
                  You have unsaved changes. Are you sure you want to leave? All changes will be lost.
                </Text>
              </Flex>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsLeaveAlertOpen(false)}>
                Stay
              </Button>
              <Button colorScheme="red" onClick={confirmLeave} ml={3}>
                Discard Changes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default AddStudent;