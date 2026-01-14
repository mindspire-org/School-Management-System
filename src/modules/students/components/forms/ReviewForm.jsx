import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Heading,
  Divider,
  Stack,
  Flex,
  Avatar,
  Badge,
  Icon,
  Table,
  Tbody,
  Tr,
  Td,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppSelector } from '../../../../redux/hooks';
import {
  selectStudentFormData,
} from '../../../../redux/features/students/studentSlice';
import { MdCheckCircle, MdPerson, MdSchool, MdHome, MdDirectionsBus, MdPayment } from 'react-icons/md';

function ReviewForm() {
  const formData = useAppSelector(selectStudentFormData);
  const personalInfo = formData.personal || {};
  const academicInfo = formData.academic || {};
  const parentInfo = formData.parent || {};
  const transportInfo = formData.transport || {};
  const feeInfo = formData.fee || {};
  
  // UI colors
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Helper function for section heading
  const SectionHeading = ({ icon, title }) => (
    <Flex align="center" mb={2}>
      <Icon as={icon} color="brand.500" boxSize={5} mr={2} />
      <Text fontSize="lg" fontWeight="600">
        {title}
      </Text>
    </Flex>
  );
  
  // Helper component for information row
  const InfoRow = ({ label, value, isImportant }) => (
    <Tr>
      <Td fontWeight="medium" width="40%">{label}</Td>
      <Td fontWeight={isImportant ? "semibold" : "normal"}>{value || '-'}</Td>
    </Tr>
  );
  
  // Calculate total fee
  const calculateTotalFee = () => {
    const baseTuitionFee = parseInt(feeInfo.tuitionFee) || 0;
    const admissionFee = feeInfo.isNewAdmission ? (parseInt(feeInfo.admissionFee) || 0) : 0;
    const transportFee = transportInfo.usesTransport ? (parseInt(feeInfo.transportFee) || 0) : 0;
    const libraryFee = parseInt(feeInfo.libraryFee) || 0;
    const labFee = parseInt(feeInfo.labFee) || 0;
    const examFee = parseInt(feeInfo.examFee) || 0;
    const activityFee = parseInt(feeInfo.activityFee) || 0;
    
    const totalBeforeDiscount = baseTuitionFee + admissionFee + transportFee + libraryFee + labFee + examFee + activityFee;
    
    // Apply discount if applicable
    let discountAmount = 0;
    if (feeInfo.discount && feeInfo.discount.applicable) {
      if (feeInfo.discount.type === 'percentage') {
        discountAmount = totalBeforeDiscount * (parseFloat(feeInfo.discount.value) / 100);
      } else if (feeInfo.discount.type === 'fixed') {
        discountAmount = parseFloat(feeInfo.discount.value) || 0;
      }
    }
    
    return {
      totalBeforeDiscount,
      discountAmount,
      totalAfterDiscount: totalBeforeDiscount - discountAmount
    };
  };
  
  const feeCalculation = calculateTotalFee();
  
  return (
    <Box>
      <Text fontSize="xl" fontWeight="600" mb={6}>
        Review Student Information
      </Text>
      
      <Text color="gray.600" mb={6}>
        Please review all the information before submitting. You can go back to any section to make changes.
      </Text>
      
      {/* Header with student info */}
      <Flex 
        bg={bgColor} 
        p={6} 
        borderRadius="md" 
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        align="center"
      >
        <Avatar 
          size="xl" 
          src={personalInfo.photo || ''} 
          name={personalInfo.name || 'New Student'} 
          mr={{ base: 0, md: 6 }}
          mb={{ base: 4, md: 0 }}
        />
        <Box>
          <Heading size="md">{personalInfo.name || 'New Student'}</Heading>
          <Text color="gray.500" mb={2}>
            {academicInfo.rollNumber ? `STD-${academicInfo.rollNumber}` : 'New Admission'}
          </Text>
          <Flex wrap="wrap" gap={2}>
            <Badge colorScheme="green">Active</Badge>
            <Badge colorScheme="blue">Class {academicInfo.class || '-'}-{academicInfo.section || '-'}</Badge>
            {transportInfo.usesTransport && <Badge colorScheme="purple">Bus Transport</Badge>}
          </Flex>
        </Box>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={6}>
        {/* Personal Information */}
        <Box 
          border="1px" 
          borderColor={borderColor} 
          borderRadius="md" 
          p={4}
        >
          <SectionHeading icon={MdPerson} title="Personal Information" />
          <Table variant="simple" size="sm">
            <Tbody>
              <InfoRow label="Full Name" value={personalInfo.name} isImportant />
              <InfoRow label="Gender" value={personalInfo.gender} />
              <InfoRow label="Date of Birth" value={formatDate(personalInfo.dateOfBirth)} />
              <InfoRow label="Blood Group" value={personalInfo.bloodGroup} />
              <InfoRow label="Religion" value={personalInfo.religion} />
              <InfoRow label="Nationality" value={personalInfo.nationality} />
              <InfoRow label="CNIC/B-Form" value={personalInfo.cnic} />
              <InfoRow label="Email" value={personalInfo.email} />
              <InfoRow label="Phone" value={personalInfo.phone ? `+92 ${personalInfo.phone}` : '-'} />
            </Tbody>
          </Table>
          
          <Divider my={4} />
          
          <Text fontWeight="semibold" mb={2}>Address</Text>
          <Text>
            {personalInfo.address?.street}, {personalInfo.address?.city}, {personalInfo.address?.province} {personalInfo.address?.postalCode}
          </Text>
        </Box>
        
        {/* Academic Information */}
        <Box 
          border="1px" 
          borderColor={borderColor} 
          borderRadius="md" 
          p={4}
        >
          <SectionHeading icon={MdSchool} title="Academic Information" />
          <Table variant="simple" size="sm">
            <Tbody>
              <InfoRow label="Admission Number" value={academicInfo.admissionNumber ? `ADM-${academicInfo.admissionNumber}` : '-'} isImportant />
              <InfoRow label="Roll Number" value={academicInfo.rollNumber ? `STD-${academicInfo.rollNumber}` : '-'} isImportant />
              <InfoRow label="Class" value={academicInfo.class ? `Class ${academicInfo.class}` : '-'} isImportant />
              <InfoRow label="Section" value={academicInfo.section} />
              <InfoRow label="Stream/Group" value={academicInfo.stream} />
              <InfoRow label="Academic Year" value={academicInfo.academicYear} />
              <InfoRow label="RFID Tag Number" value={academicInfo.rfidTag ? `RFID-${academicInfo.rfidTag}` : 'Not Assigned'} />
              <InfoRow label="Admission Date" value={formatDate(academicInfo.admissionDate)} />
            </Tbody>
          </Table>
          
          {academicInfo.previousEducation?.schoolName && (
            <>
              <Divider my={4} />
              <Text fontWeight="semibold" mb={2}>Previous Education</Text>
              <Text>
                {academicInfo.previousEducation.schoolName}, 
                Class {academicInfo.previousEducation.class || '-'}
              </Text>
            </>
          )}
        </Box>
        
        {/* Parent Information */}
        <Box 
          border="1px" 
          borderColor={borderColor} 
          borderRadius="md" 
          p={4}
        >
          <SectionHeading icon={MdHome} title="Parent/Guardian Information" />
          
          {parentInfo.father && (
            <>
              <Text fontWeight="semibold" mb={2}>Father's Details</Text>
              <Table variant="simple" size="sm" mb={4}>
                <Tbody>
                  <InfoRow label="Name" value={parentInfo.father.name} isImportant />
                  <InfoRow label="Phone" value={parentInfo.father.phone ? `+92 ${parentInfo.father.phone}` : '-'} />
                  <InfoRow label="Email" value={parentInfo.father.email} />
                  <InfoRow label="Occupation" value={parentInfo.father.occupation} />
                </Tbody>
              </Table>
            </>
          )}
          
          {parentInfo.mother && Object.keys(parentInfo.mother).length > 0 && (
            <>
              <Divider my={4} />
              <Text fontWeight="semibold" mb={2}>Mother's Details</Text>
              <Table variant="simple" size="sm" mb={4}>
                <Tbody>
                  <InfoRow label="Name" value={parentInfo.mother.name} />
                  <InfoRow label="Phone" value={parentInfo.mother.phone ? `+92 ${parentInfo.mother.phone}` : '-'} />
                  <InfoRow label="Email" value={parentInfo.mother.email} />
                  <InfoRow label="Occupation" value={parentInfo.mother.occupation} />
                </Tbody>
              </Table>
            </>
          )}
          
          {parentInfo.emergency && (
            <>
              <Divider my={4} />
              <Text fontWeight="semibold" mb={2}>Emergency Contact</Text>
              <Table variant="simple" size="sm">
                <Tbody>
                  <InfoRow label="Name" value={parentInfo.emergency.name} isImportant />
                  <InfoRow label="Phone" value={parentInfo.emergency.phone ? `+92 ${parentInfo.emergency.phone}` : '-'} isImportant />
                  <InfoRow label="Relationship" value={parentInfo.emergency.relationship} />
                </Tbody>
              </Table>
            </>
          )}
        </Box>
        
        {/* Transport Information */}
        <Box 
          border="1px" 
          borderColor={borderColor} 
          borderRadius="md" 
          p={4}
        >
          <SectionHeading icon={MdDirectionsBus} title="Transport Information" />
          
          <Badge 
            colorScheme={transportInfo.usesTransport ? "blue" : "gray"} 
            mb={4}
          >
            {transportInfo.usesTransport ? "Using School Transport" : "Not Using School Transport"}
          </Badge>
          
          {transportInfo.usesTransport ? (
            <Table variant="simple" size="sm">
              <Tbody>
                <InfoRow label="Bus Route" value={transportInfo.routeId && busRoutes?.find(r => r.id === transportInfo.routeId)?.name} />
                <InfoRow label="Bus Number" value={transportInfo.busNumber ? `Bus #${transportInfo.busNumber}` : '-'} />
                <InfoRow label="Pickup Point" value={transportInfo.pickupPoint} />
                <InfoRow label="Drop-off Point" value={transportInfo.dropPoint} />
                <InfoRow label="Pickup Time" value={transportInfo.pickupTime} />
                <InfoRow label="Drop-off Time" value={transportInfo.dropTime} />
              </Tbody>
            </Table>
          ) : (
            <Table variant="simple" size="sm">
              <Tbody>
                <InfoRow 
                  label="Alternative Mode" 
                  value={
                    transportInfo.alternativeMode === 'privateVehicle' ? 'Private Vehicle' :
                    transportInfo.alternativeMode === 'carpool' ? 'Carpool with other families' :
                    transportInfo.alternativeMode === 'vanService' ? 'Private Van Service' :
                    transportInfo.alternativeMode === 'publicTransport' ? 'Public Transport' :
                    transportInfo.alternativeMode === 'walking' ? 'Walking' :
                    transportInfo.alternativeMode || '-'
                  } 
                />
                {transportInfo.alternativeMode === 'vanService' && (
                  <>
                    <InfoRow label="Van Service Provider" value={transportInfo.vanServiceProvider} />
                    <InfoRow label="Van Driver Contact" value={transportInfo.vanDriverContact} />
                  </>
                )}
                <InfoRow label="Notes" value={transportInfo.alternativeNotes} />
              </Tbody>
            </Table>
          )}
        </Box>
        
        {/* Fee Information */}
        <Box 
          border="1px" 
          borderColor={borderColor} 
          borderRadius="md" 
          p={4}
          gridColumn={{ lg: "span 2" }}
        >
          <SectionHeading icon={MdPayment} title="Fee Structure" />
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <Box>
              <Text fontWeight="semibold" mb={2}>Fee Plan Details</Text>
              <Table variant="simple" size="sm">
                <Tbody>
                  <InfoRow label="Fee Plan" value={feeInfo.feePlan} isImportant />
                  <InfoRow label="Academic Year" value={feeInfo.academicYear} />
                  <InfoRow label="Payment Schedule" value={
                    feeInfo.paymentSchedule === 'monthly' ? 'Monthly' :
                    feeInfo.paymentSchedule === 'quarterly' ? 'Quarterly' :
                    feeInfo.paymentSchedule === 'half-yearly' ? 'Half-Yearly' :
                    feeInfo.paymentSchedule === 'annually' ? 'Annually' :
                    '-'
                  } />
                  <InfoRow label="First Payment Due" value={formatDate(feeInfo.firstPaymentDue)} />
                </Tbody>
              </Table>
              
              {feeInfo.discount?.applicable && (
                <>
                  <Text fontWeight="semibold" mt={4} mb={2}>Discount Details</Text>
                  <Table variant="simple" size="sm">
                    <Tbody>
                      <InfoRow 
                        label="Discount Type" 
                        value={
                          feeInfo.discount.type === 'percentage' ? 'Percentage' :
                          feeInfo.discount.type === 'fixed' ? 'Fixed Amount' :
                          feeInfo.discount.type === 'scholarship' ? 'Scholarship' :
                          '-'
                        } 
                      />
                      <InfoRow 
                        label="Discount Value" 
                        value={
                          feeInfo.discount.type === 'percentage' ? 
                          `${feeInfo.discount.value}%` : 
                          `Rs. ${feeInfo.discount.value}`
                        } 
                      />
                      <InfoRow label="Discount Reason" value={feeInfo.discount.reason} />
                      <InfoRow label="Approved By" value={feeInfo.discount.approvedBy} />
                    </Tbody>
                  </Table>
                </>
              )}
            </Box>
            
            <Box>
              <Text fontWeight="semibold" mb={2}>Fee Summary</Text>
              <Table variant="simple" size="sm">
                <Tbody>
                  <InfoRow label="Monthly Tuition Fee" value={`Rs. ${parseInt(feeInfo.tuitionFee) || 0}`} />
                  
                  {feeInfo.isNewAdmission && (
                    <InfoRow label="One-time Admission Fee" value={`Rs. ${parseInt(feeInfo.admissionFee) || 0}`} />
                  )}
                  
                  {transportInfo.usesTransport && (
                    <InfoRow label="Monthly Transport Fee" value={`Rs. ${parseInt(feeInfo.transportFee) || 0}`} />
                  )}
                  
                  <InfoRow label="Annual Library Fee" value={`Rs. ${parseInt(feeInfo.libraryFee) || 0}`} />
                  <InfoRow label="Annual Lab Fee" value={`Rs. ${parseInt(feeInfo.labFee) || 0}`} />
                  <InfoRow label="Exam Fee" value={`Rs. ${parseInt(feeInfo.examFee) || 0}`} />
                  <InfoRow label="Activity & Sports Fee" value={`Rs. ${parseInt(feeInfo.activityFee) || 0}`} />
                  <InfoRow label="Total Before Discount" value={`Rs. ${feeCalculation.totalBeforeDiscount}`} />
                  
                  {feeInfo.discount?.applicable && (
                    <InfoRow label="Discount" value={`- Rs. ${feeCalculation.discountAmount}`} />
                  )}
                  
                  <InfoRow label="Total Amount" value={`Rs. ${feeCalculation.totalAfterDiscount}`} isImportant />
                  
                  {feeInfo.paymentSchedule && (
                    <InfoRow 
                      label={
                        feeInfo.paymentSchedule === 'monthly' ? 'Monthly Payment' :
                        feeInfo.paymentSchedule === 'quarterly' ? 'Quarterly Payment' :
                        feeInfo.paymentSchedule === 'half-yearly' ? 'Half-Yearly Payment' :
                        'Annual Payment'
                      } 
                      value={`Rs. ${Math.round(
                        feeCalculation.totalAfterDiscount / 
                        (feeInfo.paymentSchedule === 'monthly' ? 12 : 
                         feeInfo.paymentSchedule === 'quarterly' ? 4 : 
                         feeInfo.paymentSchedule === 'half-yearly' ? 2 : 1)
                      )}`}
                      isImportant
                    />
                  )}
                </Tbody>
              </Table>
            </Box>
          </SimpleGrid>
        </Box>
      </SimpleGrid>
      
      <Flex 
        justify="center" 
        direction="column" 
        align="center" 
        bg={bgColor} 
        p={4} 
        borderRadius="md"
      >
        <Text fontWeight="bold" mb={2}>Ready to submit?</Text>
        <Text align="center">
          Please verify all the information is correct before submitting. You can go back to any section to make changes.
        </Text>
      </Flex>
    </Box>
  );
}

// This is normally defined in the TransportInfoForm but needed here for reference
const busRoutes = [
  { id: 'route1', name: 'Route A - Gulshan to School', stops: ['Stop 1 - Sohrab Goth', 'Stop 2 - Gulshan Chowrangi', 'Stop 3 - Main Boulevard', 'Stop 4 - Johar Chowrangi'] },
  { id: 'route2', name: 'Route B - DHA to School', stops: ['Stop 1 - Phase 1', 'Stop 2 - Phase 5', 'Stop 3 - Phase 6', 'Stop 4 - Phase 8'] },
  { id: 'route3', name: 'Route C - Clifton to School', stops: ['Stop 1 - Block 9', 'Stop 2 - Block 4', 'Stop 3 - Block 2', 'Stop 4 - Block 5'] },
  { id: 'route4', name: 'Route D - North Nazimabad to School', stops: ['Stop 1 - Block A', 'Stop 2 - Block D', 'Stop 3 - Block H', 'Stop 4 - Block K'] },
];

export default ReviewForm;
