import React, { useEffect, useState } from 'react';
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
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
  Spinner,
} from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import {
  setFormStep,
  setAllFormData,
  clearFormData,
  selectCurrentFormStep,
  selectStudentFormData,
  selectFormErrors,
} from '../../../../redux/features/students/studentSlice';
import { MdPersonAdd, MdArrowBack, MdWarning } from 'react-icons/md';
import PersonalInfoForm from '../../../students/components/forms/PersonalInfoForm';
import AcademicInfoForm from '../../../students/components/forms/AcademicInfoForm';
import ParentInfoForm from '../../../students/components/forms/ParentInfoForm';
import TransportInfoForm from '../../../students/components/forms/TransportInfoForm';
import FeeInfoForm from '../../../students/components/forms/FeeInfoForm';
import ReviewForm from '../../../students/components/forms/ReviewForm';
import * as studentsApi from '../../../../services/api/students';

export default function EditStudent({ id: idProp, embedded = false, onClose, onSaved }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = idProp ?? routeId;
  const toast = useToast();
  const cancelRef = React.useRef();
  const [isLeaveAlertOpen, setIsLeaveAlertOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const currentStep = useAppSelector(selectCurrentFormStep);
  const formData = useAppSelector(selectStudentFormData);
  const formErrors = useAppSelector(selectFormErrors);

  const steps = [
    { title: 'Personal Information', description: 'Student details' },
    { title: 'Academic Information', description: 'Academic details' },
    { title: 'Parent Information', description: 'Contact details' },
    { title: 'Transport', description: 'Transport details' },
    { title: 'Fee Structure', description: 'Fee details' },
    { title: 'Review', description: 'Verify details' },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const s = await studentsApi.getById(id);
        if (!mounted) return;
        const prefill = {
          personal: {
            ...(s.personal || {}),
            name: s.personal?.name || s.name || '',
            email: s.personal?.email || s.email || '',
            phone: s.personal?.phone || s.parentPhone || '',
            photo: s.avatar || s.personal?.photo || '',
          },
          academic: {
            ...(s.academic || {}),
            rollNumber: s.rollNumber || s.academic?.rollNumber || '',
            class: s.class || s.academic?.class || '',
            section: s.section || s.academic?.section || '',
            rfidTag: s.rfidTag || s.academic?.rfidTag || '',
            admissionDate: s.admissionDate || s.academic?.admissionDate || '',
          },
          parent: s.parent || {
            father: { name: s.parentName || '', phone: s.parentPhone || '' },
          },
          transport: {
            ...(s.transport || {}),
            busNumber: s.transport?.busNumber || s.busNumber || '',
            usesTransport: (s.transport?.usesTransport ?? !!s.busNumber) || false,
          },
          fee: s.fee || {},
        };
        dispatch(setAllFormData(prefill));
        dispatch(setFormStep(1));
      } catch (e) {
        setLoadError('Failed to load student');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, dispatch]);

  const handleCancel = () => {
    const hasFormData = Object.values(formData).some(section => Object.keys(section).length > 0);
    if (hasFormData) setIsLeaveAlertOpen(true);
    else {
      if (embedded && onClose) onClose(); else navigate('/admin/students/list');
    }
  };

  const confirmLeave = () => {
    dispatch(clearFormData());
    setIsLeaveAlertOpen(false);
    if (embedded && onClose) onClose(); else navigate('/admin/students/list');
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.personal.name && formData.personal.gender && formData.personal.dateOfBirth;
      case 2:
        return formData.academic.class && formData.academic.section && formData.academic.admissionNumber;
      case 3:
        return formData.parent.father && formData.parent.father.name && formData.parent.father.phone;
      case 4:
        return true;
      case 5:
        return formData.fee.feePlan;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) dispatch(setFormStep(currentStep + 1));
    else {
      toast({ title: 'Validation Error', description: 'Please fill all required fields correctly.', status: 'error', duration: 5000, isClosable: true, position: 'top' });
    }
  };
  const handlePrevStep = () => dispatch(setFormStep(currentStep - 1));

  const handleSubmit = () => {
    const combinedData = {
      ...formData.personal,
      ...formData.academic,
      parentInfo: formData.parent,
      transportInfo: formData.transport,
      feeInfo: formData.fee
    };

    const payload = {
      name: combinedData.name,
      email: combinedData.email,
      rollNumber: combinedData.rollNumber,
      class: combinedData.class,
      section: combinedData.section,
      rfidTag: combinedData.rfidTag,
      attendance: undefined,
      feeStatus: undefined,
      busNumber: combinedData.transportInfo?.busNumber || null,
      busAssigned: !!combinedData.transportInfo?.busNumber || false,
      parentName: combinedData.parentInfo?.father?.name || combinedData.parentInfo?.name || null,
      parentPhone: combinedData.parentInfo?.father?.phone || combinedData.parentInfo?.phone || null,
      status: undefined,
      admissionDate: combinedData.admissionDate,
      avatar: combinedData.photo || null,
      personal: formData.personal,
      academic: formData.academic,
      parent: formData.parent,
      transport: formData.transport,
      fee: formData.fee,
    };

    const sanitized = Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== '' && v !== null && v !== undefined));
    if (sanitized.email) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(sanitized.email));
      if (!ok) delete sanitized.email;
    }
    if (sanitized.admissionDate) {
      const ts = Date.parse(sanitized.admissionDate);
      if (Number.isNaN(ts)) delete sanitized.admissionDate;
    }
    sanitized.busAssigned = Boolean(sanitized.busAssigned);

    studentsApi.update(id, sanitized)
      .then((updated) => {
        dispatch(clearFormData());
        toast({ title: 'Updated', description: 'Student updated successfully!', status: 'success', duration: 5000, isClosable: true, position: 'top' });
        if (embedded) {
          if (onSaved) onSaved(updated);
          if (onClose) onClose();
        } else {
          navigate(`/admin/students/profile/${id}`);
        }
      })
      .catch((err) => {
        const baseMessage = (err && (err.data?.message || err.message)) || 'Failed to update student. Please try again.';
        const details = Array.isArray(err?.data?.errors) ? err.data.errors.map((e) => `${e.param}: ${e.msg}`).join('; ') : null;
        const message = details ? `${baseMessage} — ${details}` : baseMessage;
        toast({ title: 'Error', description: message, status: 'error', duration: 5000, isClosable: true, position: 'top' });
      });
  };

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

  if (loading) {
    return (
      <Center pt={{ base: '130px', md: '80px', xl: '80px' }} minH='40vh'>
        <Spinner size='lg' />
      </Center>
    );
  }
  if (loadError) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Card p='20px'>
          <Text color='red.500' mb='20px'>{loadError}</Text>
          <Button onClick={() => navigate('/admin/students/list')}>Back to Students</Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb='20px' justifyContent='space-between' direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }}>
        <Box>
          <Heading as='h3' fontSize={{ base: 'xl', md: '2xl' }} mb='4'>Edit Student</Heading>
          <Text color='gray.500' fontSize={{ base: 'sm', md: 'md' }}>Update student information</Text>
        </Box>
        <Button leftIcon={<MdArrowBack />} mt={{ base: 2, md: 0 }} variant='outline' onClick={handleCancel}>Back to Students</Button>
      </Flex>

      <Card mb='20px' p={{ base: 3, md: 4, lg: 5 }}>
        <Box overflowX='auto' w='100%'>
          <Stepper size={{ base: 'sm', md: 'md', lg: 'lg' }} index={currentStep - 1} colorScheme='brand'>
            {steps.map((step, index) => (
              <Step key={index} flex='0 0 auto' minW={{ base: '180px', md: '220px' }}>
                <StepIndicator boxSize={{ base: '28px', md: '32px' }}>
                  <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                </StepIndicator>
                <Box flexShrink='0'>
                  <StepTitle fontSize={{ base: 'xs', md: 'sm', lg: 'md' }} noOfLines={1} whiteSpace='nowrap'>{step.title}</StepTitle>
                  <StepDescription display={{ base: 'none', md: 'block' }} fontSize={{ base: 'xs', md: 'xs' }}>{step.description}</StepDescription>
                </Box>
                <StepSeparator display={{ base: 'none', md: 'block' }} />
              </Step>
            ))}
          </Stepper>
        </Box>
      </Card>

      <Card mb='20px' p={{ base: 4, md: 6 }}>
        {renderStepContent()}
      </Card>

      <Card mb='20px' p={{ base: 4, md: 6 }}>
        <Flex justify='space-between'>
          <Button variant='outline' onClick={currentStep === 1 ? handleCancel : handlePrevStep}> {currentStep === 1 ? 'Cancel' : 'Previous'} </Button>
          <Button colorScheme='brand' onClick={currentStep === steps.length ? handleSubmit : handleNextStep} leftIcon={currentStep === steps.length ? <MdPersonAdd /> : undefined}>
            {currentStep === steps.length ? 'Save Changes' : 'Next'}
          </Button>
        </Flex>
      </Card>

      <AlertDialog isOpen={isLeaveAlertOpen} leastDestructiveRef={cancelRef} onClose={() => setIsLeaveAlertOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>Discard Changes</AlertDialogHeader>
            <AlertDialogBody>
              <Flex align='center' mb={4}>
                <Icon as={MdWarning} color='orange.500' w={6} h={6} mr={2} />
                <Text>You have unsaved changes. Are you sure you want to leave? All changes will be lost.</Text>
              </Flex>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsLeaveAlertOpen(false)}>Stay</Button>
              <Button colorScheme='red' onClick={confirmLeave} ml={3}>Discard Changes</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
