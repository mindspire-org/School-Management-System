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
  Divider,
  InputGroup,
  InputLeftAddon,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue
} from '@chakra-ui/react';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import {
  updateFormData,
  selectStudentFormData,
} from '../../../../redux/features/students/studentSlice';

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

function FeeInfoForm() {
  const dispatch = useAppDispatch();
  const formData = useAppSelector(selectStudentFormData);
  const feeInfo = formData.fee || {};
  const transportInfo = formData.transport || {};
  
  // UI colors
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    dispatch(updateFormData({ 
      step: 'fee',
      data: { [field]: value }
    }));
  };
  
  // Handle discount object changes
  const handleDiscountChange = (field, value) => {
    const updatedDiscount = {
      ...feeInfo.discount,
      [field]: value
    };
    
    dispatch(updateFormData({
      step: 'fee',
      data: { discount: updatedDiscount }
    }));
  };
  
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
        Fee Structure Information
      </Text>

      {/* Basic Fee Information */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="feePlan" isRequired>
          <FormLabel>Fee Plan</FormLabel>
          <Select
            value={feeInfo.feePlan || ''}
            onChange={(e) => handleInputChange('feePlan', e.target.value)}
            placeholder="Select fee plan"
          >
            <option value="Standard">Standard</option>
            <option value="Scholarship">Scholarship</option>
            <option value="Staff">Staff Child</option>
            <option value="Sibling">Sibling Discount</option>
            <option value="Custom">Custom</option>
          </Select>
        </FormControl>
        
        <FormControl id="academicYear" isRequired>
          <FormLabel>Academic Year</FormLabel>
          <Select
            value={feeInfo.academicYear || ''}
            onChange={(e) => handleInputChange('academicYear', e.target.value)}
            placeholder="Select academic year"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </Select>
        </FormControl>
      </SimpleGrid>

      <FormControl id="isNewAdmission" mb={6}>
        <Checkbox
          isChecked={feeInfo.isNewAdmission || false}
          onChange={(e) => handleInputChange('isNewAdmission', e.target.checked)}
        >
          New Admission (One-time admission fee applicable)
        </Checkbox>
      </FormControl>

      {/* Fee Components */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Fee Components
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="tuitionFee" isRequired>
          <FormLabel>Monthly Tuition Fee (PKR)</FormLabel>
          <InputGroup>
            <InputLeftAddon>Rs.</InputLeftAddon>
            <Input
              type="number"
              value={feeInfo.tuitionFee || ''}
              onChange={(e) => handleInputChange('tuitionFee', e.target.value)}
              placeholder="0"
            />
          </InputGroup>
        </FormControl>
        
        {feeInfo.isNewAdmission && (
          <FormControl id="admissionFee">
            <FormLabel>Admission Fee (One-time)</FormLabel>
            <InputGroup>
              <InputLeftAddon>Rs.</InputLeftAddon>
              <Input
                type="number"
                value={feeInfo.admissionFee || ''}
                onChange={(e) => handleInputChange('admissionFee', e.target.value)}
                placeholder="0"
              />
            </InputGroup>
          </FormControl>
        )}
        
        {transportInfo.usesTransport && (
          <FormControl id="transportFee">
            <FormLabel>Monthly Transport Fee</FormLabel>
            <InputGroup>
              <InputLeftAddon>Rs.</InputLeftAddon>
              <Input
                type="number"
                value={feeInfo.transportFee || ''}
                onChange={(e) => handleInputChange('transportFee', e.target.value)}
                placeholder="0"
              />
            </InputGroup>
          </FormControl>
        )}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <FormControl id="libraryFee">
          <FormLabel>Annual Library Fee</FormLabel>
          <InputGroup>
            <InputLeftAddon>Rs.</InputLeftAddon>
            <Input
              type="number"
              value={feeInfo.libraryFee || ''}
              onChange={(e) => handleInputChange('libraryFee', e.target.value)}
              placeholder="0"
            />
          </InputGroup>
        </FormControl>
        
        <FormControl id="labFee">
          <FormLabel>Annual Lab Fee</FormLabel>
          <InputGroup>
            <InputLeftAddon>Rs.</InputLeftAddon>
            <Input
              type="number"
              value={feeInfo.labFee || ''}
              onChange={(e) => handleInputChange('labFee', e.target.value)}
              placeholder="0"
            />
          </InputGroup>
        </FormControl>
        
        <FormControl id="examFee">
          <FormLabel>Exam Fee</FormLabel>
          <InputGroup>
            <InputLeftAddon>Rs.</InputLeftAddon>
            <Input
              type="number"
              value={feeInfo.examFee || ''}
              onChange={(e) => handleInputChange('examFee', e.target.value)}
              placeholder="0"
            />
          </InputGroup>
        </FormControl>
      </SimpleGrid>

      <FormControl id="activityFee" mb={6}>
        <FormLabel>Activity & Sports Fee</FormLabel>
        <InputGroup>
          <InputLeftAddon>Rs.</InputLeftAddon>
          <Input
            type="number"
            value={feeInfo.activityFee || ''}
            onChange={(e) => handleInputChange('activityFee', e.target.value)}
            placeholder="0"
          />
        </InputGroup>
      </FormControl>

      <Divider mb={6} />

      {/* Discount Information */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Discount Information
      </Text>

      <FormControl id="discountApplicable" mb={4}>
        <Checkbox
          isChecked={feeInfo.discount?.applicable || false}
          onChange={(e) => handleDiscountChange('applicable', e.target.checked)}
        >
          Apply Fee Discount
        </Checkbox>
      </FormControl>

      {feeInfo.discount?.applicable && (
        <>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <FormControl id="discountType" isRequired={feeInfo.discount?.applicable}>
              <FormLabel>Discount Type</FormLabel>
              <Select
                value={feeInfo.discount?.type || ''}
                onChange={(e) => handleDiscountChange('type', e.target.value)}
                placeholder="Select discount type"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="scholarship">Scholarship</option>
              </Select>
            </FormControl>
            
            <FormControl id="discountValue" isRequired={feeInfo.discount?.applicable}>
              <FormLabel>
                {feeInfo.discount?.type === 'percentage'
                  ? 'Discount Percentage'
                  : 'Discount Amount (PKR)'}
              </FormLabel>
              <InputGroup>
                {feeInfo.discount?.type === 'percentage' ? (
                  <InputLeftAddon>%</InputLeftAddon>
                ) : (
                  <InputLeftAddon>Rs.</InputLeftAddon>
                )}
                <Input
                  type="number"
                  value={feeInfo.discount?.value || ''}
                  onChange={(e) => handleDiscountChange('value', e.target.value)}
                  placeholder="0"
                />
              </InputGroup>
            </FormControl>
            
            <FormControl id="discountReason">
              <FormLabel>Discount Reason</FormLabel>
              <Select
                value={feeInfo.discount?.reason || ''}
                onChange={(e) => handleDiscountChange('reason', e.target.value)}
                placeholder="Select reason"
              >
                <option value="Sibling Discount">Sibling Discount</option>
                <option value="Staff Child">Staff Child</option>
                <option value="Merit Scholarship">Merit Scholarship</option>
                <option value="Financial Aid">Financial Aid</option>
                <option value="Special Case">Special Case</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          
          <FormControl id="discountApprovedBy" mb={6}>
            <FormLabel>Discount Approved By</FormLabel>
            <Select
              value={feeInfo.discount?.approvedBy || ''}
              onChange={(e) => handleDiscountChange('approvedBy', e.target.value)}
              placeholder="Select authority"
            >
              <option value="Principal">Principal</option>
              <option value="Finance Manager">Finance Manager</option>
              <option value="Director">Director</option>
              <option value="Board">Board</option>
            </Select>
          </FormControl>
        </>
      )}

      <Divider mb={6} />

      {/* Payment Schedule */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Payment Schedule
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <FormControl id="paymentSchedule" isRequired>
          <FormLabel>Payment Frequency</FormLabel>
          <RadioGroup
            value={feeInfo.paymentSchedule || ''}
            onChange={(value) => handleInputChange('paymentSchedule', value)}
          >
            <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 2, md: 6 }}>
              <Radio value="monthly">Monthly</Radio>
              <Radio value="quarterly">Quarterly</Radio>
              <Radio value="half-yearly">Half-Yearly</Radio>
              <Radio value="annually">Annually</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        
        <FormControl id="firstPaymentDue">
          <FormLabel>First Payment Due Date</FormLabel>
          <Input
            type="date"
            value={toDateInputValue(feeInfo.firstPaymentDue)}
            onChange={(e) => handleInputChange('firstPaymentDue', e.target.value)}
          />
        </FormControl>
      </SimpleGrid>
      
      <FormControl id="paymentMethods" mb={6}>
        <FormLabel>Accepted Payment Methods</FormLabel>
        <HStack spacing={5} wrap="wrap">
          <Checkbox
            isChecked={(feeInfo.paymentMethods || []).includes('cash')}
            onChange={(e) => {
              const methods = [...(feeInfo.paymentMethods || [])];
              if (e.target.checked) {
                methods.push('cash');
              } else {
                const index = methods.indexOf('cash');
                if (index !== -1) methods.splice(index, 1);
              }
              handleInputChange('paymentMethods', methods);
            }}
          >
            Cash
          </Checkbox>
          
          <Checkbox
            isChecked={(feeInfo.paymentMethods || []).includes('bank-transfer')}
            onChange={(e) => {
              const methods = [...(feeInfo.paymentMethods || [])];
              if (e.target.checked) {
                methods.push('bank-transfer');
              } else {
                const index = methods.indexOf('bank-transfer');
                if (index !== -1) methods.splice(index, 1);
              }
              handleInputChange('paymentMethods', methods);
            }}
          >
            Bank Transfer
          </Checkbox>
          
          <Checkbox
            isChecked={(feeInfo.paymentMethods || []).includes('cheque')}
            onChange={(e) => {
              const methods = [...(feeInfo.paymentMethods || [])];
              if (e.target.checked) {
                methods.push('cheque');
              } else {
                const index = methods.indexOf('cheque');
                if (index !== -1) methods.splice(index, 1);
              }
              handleInputChange('paymentMethods', methods);
            }}
          >
            Cheque
          </Checkbox>
          
          <Checkbox
            isChecked={(feeInfo.paymentMethods || []).includes('online-payment')}
            onChange={(e) => {
              const methods = [...(feeInfo.paymentMethods || [])];
              if (e.target.checked) {
                methods.push('online-payment');
              } else {
                const index = methods.indexOf('online-payment');
                if (index !== -1) methods.splice(index, 1);
              }
              handleInputChange('paymentMethods', methods);
            }}
          >
            Online Payment
          </Checkbox>
        </HStack>
      </FormControl>

      <Divider mb={6} />

      {/* Fee Summary */}
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Fee Summary
      </Text>

      <Box
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        bg={bgColor}
        mb={6}
      >
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Fee Component</Th>
              <Th isNumeric>Amount (PKR)</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Monthly Tuition Fee</Td>
              <Td isNumeric>{parseInt(feeInfo.tuitionFee) || 0}</Td>
            </Tr>
            
            {feeInfo.isNewAdmission && (
              <Tr>
                <Td>One-time Admission Fee</Td>
                <Td isNumeric>{parseInt(feeInfo.admissionFee) || 0}</Td>
              </Tr>
            )}
            
            {transportInfo.usesTransport && (
              <Tr>
                <Td>Monthly Transport Fee</Td>
                <Td isNumeric>{parseInt(feeInfo.transportFee) || 0}</Td>
              </Tr>
            )}
            
            <Tr>
              <Td>Annual Library Fee</Td>
              <Td isNumeric>{parseInt(feeInfo.libraryFee) || 0}</Td>
            </Tr>
            
            <Tr>
              <Td>Annual Lab Fee</Td>
              <Td isNumeric>{parseInt(feeInfo.labFee) || 0}</Td>
            </Tr>
            
            <Tr>
              <Td>Exam Fee</Td>
              <Td isNumeric>{parseInt(feeInfo.examFee) || 0}</Td>
            </Tr>
            
            <Tr>
              <Td>Activity & Sports Fee</Td>
              <Td isNumeric>{parseInt(feeInfo.activityFee) || 0}</Td>
            </Tr>
            
            <Tr fontWeight="bold">
              <Td>Total Before Discount</Td>
              <Td isNumeric>{feeCalculation.totalBeforeDiscount}</Td>
            </Tr>
            
            {feeInfo.discount?.applicable && (
              <Tr color="green.500">
                <Td>
                  Discount ({feeInfo.discount.type === 'percentage'
                    ? `${feeInfo.discount.value}%`
                    : 'Fixed Amount'})
                </Td>
                <Td isNumeric>- {feeCalculation.discountAmount}</Td>
              </Tr>
            )}
            
            <Tr fontWeight="bold" fontSize="md">
              <Td>Total Amount</Td>
              <Td isNumeric>{feeCalculation.totalAfterDiscount}</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
      
      <Alert status="info" mb={2}>
        <AlertIcon />
        <Box>
          <AlertTitle mb={1}>Payment Schedule</AlertTitle>
          <AlertDescription>
            {feeInfo.paymentSchedule === 'monthly' && 'Monthly payment: Rs. ' + Math.round(feeCalculation.totalAfterDiscount / 12)}
            {feeInfo.paymentSchedule === 'quarterly' && 'Quarterly payment: Rs. ' + Math.round(feeCalculation.totalAfterDiscount / 4)}
            {feeInfo.paymentSchedule === 'half-yearly' && 'Half-yearly payment: Rs. ' + Math.round(feeCalculation.totalAfterDiscount / 2)}
            {feeInfo.paymentSchedule === 'annually' && 'Annual payment: Rs. ' + feeCalculation.totalAfterDiscount}
            {!feeInfo.paymentSchedule && 'Please select a payment schedule to see installment amounts.'}
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
}

export default FeeInfoForm;
