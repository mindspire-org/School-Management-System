import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Button,
  SimpleGrid,
  Badge,
  Avatar,
  HStack,
  VStack,
  Icon,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
  IconButton,
  Divider,
  useToast,
} from '@chakra-ui/react';
// Custom components
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
// Icons
import {
  MdAttachMoney,
  MdCheckCircle,
  MdAccessTime,
  MdWarning,
  MdCalendarMonth,
  MdPayment,
  MdAssignment,
  MdReceipt,
  MdLocalOffer,
  MdMoreVert,
  MdFileDownload,
  MdPrint,
  MdEmail,
  MdVisibility,
} from 'react-icons/md';
// Mock data
import { mockStudents } from '../../../../utils/mockData';
import {
  mockFeeStructure,
  mockInstallments,
  mockPaymentHistory,
  mockDiscounts
} from '../../../../utils/mockFeeData';

export default function StudentFees() {
  const toast = useToast();
  // Get student data (would come from params in a real app)
  const student = mockStudents[0];

  // Calculate totals
  const calculateTotals = () => {
    const structure = mockFeeStructure;
    const totalFee =
      structure.tuitionFee.amount +
      structure.transportFee.amount +
      structure.admissionCharges.amount +
      structure.examinationFee.amount +
      structure.libraryFee.amount +
      structure.sportsFee.amount +
      structure.miscCharges.amount;

    const paidAmount =
      (structure.tuitionFee.status === 'paid' ? structure.tuitionFee.amount : 0) +
      (structure.transportFee.status === 'paid' ? structure.transportFee.amount : 0) +
      (structure.admissionCharges.status === 'paid' ? structure.admissionCharges.amount : 0) +
      (structure.examinationFee.status === 'paid' ? structure.examinationFee.amount : 0) +
      (structure.libraryFee.status === 'paid' ? structure.libraryFee.amount : 0) +
      (structure.sportsFee.status === 'paid' ? structure.sportsFee.amount : 0) +
      (structure.miscCharges.status === 'paid' ? structure.miscCharges.amount : 0);

    const pendingAmount = totalFee - paidAmount;

    // Calculate amount that's overdue
    const overdueAmount = mockInstallments
      .filter(i => i.status === 'pending' && new Date(i.dueDate) < new Date())
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      totalFee,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paymentPercentage: (paidAmount / totalFee) * 100
    };
  };

  const totals = calculateTotals();

  // Handle make payment
  const handleMakePayment = () => {
    toast({
      title: 'Payment feature',
      description: 'Payment modal would open here',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header with Student Info */}
      <Flex justify='space-between' align='center' mb='20px'>
        <HStack spacing='20px'>
          <Avatar
            size='xl'
            name={student.name}
            src={student.avatar}
          />
          <Box>
            <Text fontSize='2xl' fontWeight='bold'>{student.name}</Text>
            <Flex align='center' mt='5px'>
              <Text fontSize='md' color='gray.600' mr='10px'>
                {student.rollNumber}
              </Text>
              <Badge colorScheme='purple' mr='10px'>
                Class {student.class}-{student.section}
              </Badge>
              <Badge colorScheme='green'>Active</Badge>
            </Flex>
            <Text fontSize='sm' color='gray.500' mt='5px'>
              {student.email}
            </Text>
          </Box>
        </HStack>

        <HStack spacing='10px'>
          <Button leftIcon={<MdPayment />} colorScheme='blue' onClick={handleMakePayment}>
            Make Payment
          </Button>
          <Button leftIcon={<MdReceipt />} variant='outline'>
            Download Fee Card
          </Button>
        </HStack>
      </Flex>

      {/* Fee Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap='20px' mb='20px'>
        <StatCard title='Total Fee (Annual)' value={`PKR ${totals.totalFee.toLocaleString()}`} icon={MdAttachMoney} colorScheme='blue' />
        <StatCard title='Paid Amount' value={`PKR ${totals.paidAmount.toLocaleString()}`} icon={MdCheckCircle} colorScheme='green' subValue={`${totals.paymentPercentage.toFixed(1)}%`} />
        <StatCard title='Pending Amount' value={`PKR ${totals.pendingAmount.toLocaleString()}`} icon={MdAccessTime} colorScheme='orange' note='Due by Nov 30' />
        <StatCard title='Overdue Amount' value={`PKR ${totals.overdueAmount.toLocaleString()}`} icon={MdWarning} colorScheme='red' note='Immediate attention required' />
      </SimpleGrid>

      {/* Payment Timeline */}
      <Card p='20px' mb='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='20px'>
          Payment Schedule Timeline
        </Text>

        <Flex align='center' justify='center' position='relative' mb='20px'>
          {/* Timeline line */}
          <Box w='100%' h='3px' bg='gray.200' position='absolute' zIndex='1' />

          {/* Timeline nodes */}
          <Flex w='100%' justify='space-between' position='relative' zIndex='2'>
            {mockInstallments.map((installment, index) => (
              <Box key={index} display='flex' flexDirection='column' alignItems='center'>
                {/* Node */}
                <Box
                  w='40px'
                  h='40px'
                  borderRadius='50%'
                  bg={
                    installment.status === 'paid'
                      ? 'green.500'
                      : installment.status === 'overdue'
                        ? 'red.500'
                        : 'orange.300'
                  }
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  mb='10px'
                  cursor='pointer'
                  _hover={{ transform: 'scale(1.1)' }}
                >
                  <Icon
                    as={
                      installment.status === 'paid'
                        ? MdCheckCircle
                        : installment.status === 'overdue'
                          ? MdWarning
                          : MdAccessTime
                    }
                    color='white'
                  />
                </Box>

                {/* Month */}
                <Text fontWeight='bold' fontSize='sm'>
                  {installment.month}
                </Text>

                {/* Due Date */}
                <Text fontSize='xs' color='gray.500'>
                  {new Date(installment.dueDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>

                {/* Amount */}
                <Text fontSize='sm' fontWeight='500' mt='2px'>
                  PKR {installment.amount.toLocaleString()}
                </Text>

                {/* Status */}
                <Badge
                  colorScheme={
                    installment.status === 'paid'
                      ? 'green'
                      : installment.status === 'overdue'
                        ? 'red'
                        : 'orange'
                  }
                  mt='5px'
                  fontSize='xs'
                >
                  {installment.status.toUpperCase()}
                </Badge>

                {/* Payment Method (if paid) */}
                {installment.status === 'paid' && (
                  <Text fontSize='xs' color='gray.600' mt='2px'>
                    {installment.paymentMethod}
                  </Text>
                )}

                {/* Payment Button (if pending) */}
                {installment.status === 'pending' && (
                  <Button
                    size='xs'
                    colorScheme='blue'
                    mt='5px'
                    onClick={handleMakePayment}
                  >
                    Pay Now
                  </Button>
                )}
              </Box>
            ))}
          </Flex>
        </Flex>
      </Card>

      {/* Fee Structure Breakdown */}
      <Card p='20px' mb='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='20px'>
          Fee Structure Breakdown
        </Text>

        <Accordion allowMultiple defaultIndex={[0]}>
          {/* Tuition Fee */}
          <AccordionItem border='1px' borderColor='gray.200' borderRadius='md' mb='10px'>
            <h2>
              <AccordionButton p='15px'>
                <Box flex='1' textAlign='left' fontWeight='500'>
                  Tuition Fee
                </Box>
                <HStack spacing='15px'>
                  <Text fontWeight='bold'>
                    PKR {mockFeeStructure.tuitionFee.amount.toLocaleString()}
                  </Text>
                  <Badge colorScheme={mockFeeStructure.tuitionFee.status === 'paid' ? 'green' : 'orange'}>
                    {mockFeeStructure.tuitionFee.status.toUpperCase()}
                  </Badge>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg='gray.50'>
              <Text mb='10px'>{mockFeeStructure.tuitionFee.description}</Text>

              {mockFeeStructure.tuitionFee.paymentHistory.length > 0 ? (
                <Box>
                  <Text fontWeight='500' mb='5px'>Payment History:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Receipt</Th>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.tuitionFee.paymentHistory.map((payment, idx) => (
                          <Tr key={idx}>
                            <Td>{payment.receipt}</Td>
                            <Td>{payment.date}</Td>
                            <Td>PKR {payment.amount.toLocaleString()}</Td>
                            <Td>{payment.method}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Button colorScheme='blue' size='sm' onClick={handleMakePayment}>
                  Make Payment
                </Button>
              )}
            </AccordionPanel>
          </AccordionItem>

          {/* Transport Fee */}
          <AccordionItem border='1px' borderColor='gray.200' borderRadius='md' mb='10px'>
            <h2>
              <AccordionButton p='15px'>
                <Box flex='1' textAlign='left' fontWeight='500'>
                  Transport Fee
                </Box>
                <HStack spacing='15px'>
                  <Text fontWeight='bold'>
                    PKR {mockFeeStructure.transportFee.amount.toLocaleString()}
                  </Text>
                  <Badge colorScheme={mockFeeStructure.transportFee.status === 'paid' ? 'green' : 'orange'}>
                    {mockFeeStructure.transportFee.status.toUpperCase()}
                  </Badge>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg='gray.50'>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb='10px'>
                <Box>
                  <Text fontSize='sm' color='gray.500'>Bus Number:</Text>
                  <Text fontWeight='500'>{mockFeeStructure.transportFee.busNumber}</Text>
                </Box>
                <Box>
                  <Text fontSize='sm' color='gray.500'>Route:</Text>
                  <Text fontWeight='500'>{mockFeeStructure.transportFee.route}</Text>
                </Box>
              </SimpleGrid>

              <Text mb='10px'>{mockFeeStructure.transportFee.description}</Text>

              {mockFeeStructure.transportFee.paymentHistory.length > 0 ? (
                <Box>
                  <Text fontWeight='500' mb='5px'>Payment History:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Receipt</Th>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.transportFee.paymentHistory.map((payment, idx) => (
                          <Tr key={idx}>
                            <Td>{payment.receipt}</Td>
                            <Td>{payment.date}</Td>
                            <Td>PKR {payment.amount.toLocaleString()}</Td>
                            <Td>{payment.method}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Button colorScheme='blue' size='sm' onClick={handleMakePayment}>
                  Make Payment
                </Button>
              )}
            </AccordionPanel>
          </AccordionItem>

          {/* Admission/Annual Charges */}
          <AccordionItem border='1px' borderColor='gray.200' borderRadius='md' mb='10px'>
            <h2>
              <AccordionButton p='15px'>
                <Box flex='1' textAlign='left' fontWeight='500'>
                  Admission/Annual Charges
                </Box>
                <HStack spacing='15px'>
                  <Text fontWeight='bold'>
                    PKR {mockFeeStructure.admissionCharges.amount.toLocaleString()}
                  </Text>
                  <Badge colorScheme={mockFeeStructure.admissionCharges.status === 'paid' ? 'green' : 'orange'}>
                    {mockFeeStructure.admissionCharges.status.toUpperCase()}
                  </Badge>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg='gray.50'>
              <Text mb='10px'>{mockFeeStructure.admissionCharges.description}</Text>

              {mockFeeStructure.admissionCharges.paymentHistory.length > 0 ? (
                <Box>
                  <Text fontWeight='500' mb='5px'>Payment History:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Receipt</Th>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.admissionCharges.paymentHistory.map((payment, idx) => (
                          <Tr key={idx}>
                            <Td>{payment.receipt}</Td>
                            <Td>{payment.date}</Td>
                            <Td>PKR {payment.amount.toLocaleString()}</Td>
                            <Td>{payment.method}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Button colorScheme='blue' size='sm' onClick={handleMakePayment}>
                  Make Payment
                </Button>
              )}
            </AccordionPanel>
          </AccordionItem>

          {/* Examination Fee */}
          <AccordionItem border='1px' borderColor='gray.200' borderRadius='md' mb='10px'>
            <h2>
              <AccordionButton p='15px'>
                <Box flex='1' textAlign='left' fontWeight='500'>
                  Examination Fee
                </Box>
                <HStack spacing='15px'>
                  <Text fontWeight='bold'>
                    PKR {mockFeeStructure.examinationFee.amount.toLocaleString()}
                  </Text>
                  <Badge colorScheme={mockFeeStructure.examinationFee.status === 'paid' ? 'green' : 'orange'}>
                    {mockFeeStructure.examinationFee.status.toUpperCase()}
                  </Badge>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg='gray.50'>
              <Text mb='10px'>{mockFeeStructure.examinationFee.description}</Text>

              {mockFeeStructure.examinationFee.paymentHistory.length > 0 ? (
                <Box>
                  <Text fontWeight='500' mb='5px'>Payment History:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Receipt</Th>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.examinationFee.paymentHistory.map((payment, idx) => (
                          <Tr key={idx}>
                            <Td>{payment.receipt}</Td>
                            <Td>{payment.date}</Td>
                            <Td>PKR {payment.amount.toLocaleString()}</Td>
                            <Td>{payment.method}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Button colorScheme='blue' size='sm' onClick={handleMakePayment}>
                  Make Payment
                </Button>
              )}
            </AccordionPanel>
          </AccordionItem>

          {/* Library/Lab Fee */}
          <AccordionItem border='1px' borderColor='gray.200' borderRadius='md' mb='10px'>
            <h2>
              <AccordionButton p='15px'>
                <Box flex='1' textAlign='left' fontWeight='500'>
                  Library/Lab Fee
                </Box>
                <HStack spacing='15px'>
                  <Text fontWeight='bold'>
                    PKR {mockFeeStructure.libraryFee.amount.toLocaleString()}
                  </Text>
                  <Badge colorScheme={mockFeeStructure.libraryFee.status === 'paid' ? 'green' : 'orange'}>
                    {mockFeeStructure.libraryFee.status.toUpperCase()}
                  </Badge>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg='gray.50'>
              <Text mb='10px'>{mockFeeStructure.libraryFee.description}</Text>

              {mockFeeStructure.libraryFee.paymentHistory.length > 0 ? (
                <Box>
                  <Text fontWeight='500' mb='5px'>Payment History:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Receipt</Th>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.libraryFee.paymentHistory.map((payment, idx) => (
                          <Tr key={idx}>
                            <Td>{payment.receipt}</Td>
                            <Td>{payment.date}</Td>
                            <Td>PKR {payment.amount.toLocaleString()}</Td>
                            <Td>{payment.method}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Button colorScheme='blue' size='sm' onClick={handleMakePayment}>
                  Make Payment
                </Button>
              )}
            </AccordionPanel>
          </AccordionItem>

          {/* Sports/Activity Fee */}
          <AccordionItem border='1px' borderColor='gray.200' borderRadius='md' mb='10px'>
            <h2>
              <AccordionButton p='15px'>
                <Box flex='1' textAlign='left' fontWeight='500'>
                  Sports/Activity Fee
                </Box>
                <HStack spacing='15px'>
                  <Text fontWeight='bold'>
                    PKR {mockFeeStructure.sportsFee.amount.toLocaleString()}
                  </Text>
                  <Badge colorScheme={mockFeeStructure.sportsFee.status === 'paid' ? 'green' : 'orange'}>
                    {mockFeeStructure.sportsFee.status.toUpperCase()}
                  </Badge>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg='gray.50'>
              <Text mb='10px'>{mockFeeStructure.sportsFee.description}</Text>

              {mockFeeStructure.sportsFee.paymentHistory.length > 0 ? (
                <Box>
                  <Text fontWeight='500' mb='5px'>Payment History:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Receipt</Th>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.sportsFee.paymentHistory.map((payment, idx) => (
                          <Tr key={idx}>
                            <Td>{payment.receipt}</Td>
                            <Td>{payment.date}</Td>
                            <Td>PKR {payment.amount.toLocaleString()}</Td>
                            <Td>{payment.method}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Button colorScheme='blue' size='sm' onClick={handleMakePayment}>
                  Make Payment
                </Button>
              )}
            </AccordionPanel>
          </AccordionItem>

          {/* Miscellaneous Charges */}
          <AccordionItem border='1px' borderColor='gray.200' borderRadius='md'>
            <h2>
              <AccordionButton p='15px'>
                <Box flex='1' textAlign='left' fontWeight='500'>
                  Miscellaneous Charges
                </Box>
                <HStack spacing='15px'>
                  <Text fontWeight='bold'>
                    PKR {mockFeeStructure.miscCharges.amount.toLocaleString()}
                  </Text>
                  <Badge colorScheme={mockFeeStructure.miscCharges.status === 'paid' ? 'green' : 'orange'}>
                    {mockFeeStructure.miscCharges.status.toUpperCase()}
                  </Badge>
                  <AccordionIcon />
                </HStack>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} bg='gray.50'>
              <Text mb='10px'>{mockFeeStructure.miscCharges.description}</Text>

              {/* Details list */}
              {mockFeeStructure.miscCharges.details && (
                <Box mb='15px'>
                  <Text fontWeight='500' mb='5px'>Details:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Description</Th>
                          <Th>Amount</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.miscCharges.details.map((item, idx) => (
                          <Tr key={idx}>
                            <Td>{item.description}</Td>
                            <Td>PKR {item.amount.toLocaleString()}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {mockFeeStructure.miscCharges.paymentHistory.length > 0 ? (
                <Box>
                  <Text fontWeight='500' mb='5px'>Payment History:</Text>
                  <TableContainer>
                    <Table size='sm' variant='simple'>
                      <Thead>
                        <Tr>
                          <Th>Receipt</Th>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Method</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {mockFeeStructure.miscCharges.paymentHistory.map((payment, idx) => (
                          <Tr key={idx}>
                            <Td>{payment.receipt}</Td>
                            <Td>{payment.date}</Td>
                            <Td>PKR {payment.amount.toLocaleString()}</Td>
                            <Td>{payment.method}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Button colorScheme='blue' size='sm' onClick={handleMakePayment}>
                  Make Payment
                </Button>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Payment History Table */}
      <Card p='20px' mb='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='20px'>
          Payment History
        </Text>

        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>RECEIPT NO.</Th>
                <Th>DATE</Th>
                <Th>DESCRIPTION</Th>
                <Th>AMOUNT</Th>
                <Th>METHOD</Th>
                <Th>TRANSACTION NO.</Th>
                <Th>RECEIVED BY</Th>
                <Th>STATUS</Th>
                <Th>ACTIONS</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockPaymentHistory.map((payment, idx) => (
                <Tr key={idx}>
                  <Td fontWeight='500'>
                    <Text
                      color='blue.500'
                      fontWeight='500'
                      cursor='pointer'
                      _hover={{ textDecoration: 'underline' }}
                    >
                      {payment.receiptNo}
                    </Text>
                  </Td>
                  <Td>{payment.paymentDate}</Td>
                  <Td>{payment.description}</Td>
                  <Td fontWeight='600' color='green.500'>
                    PKR {payment.amountPaid.toLocaleString()}
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        payment.paymentMethod === 'Cash'
                          ? 'purple'
                          : payment.paymentMethod === 'Online'
                            ? 'blue'
                            : payment.paymentMethod === 'Cheque'
                              ? 'cyan'
                              : 'teal'
                      }
                    >
                      {payment.paymentMethod}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize='sm' fontFamily='mono'>
                      {payment.transactionNo}
                    </Text>
                  </Td>
                  <Td>{payment.receivedBy}</Td>
                  <Td>
                    <Badge
                      colorScheme={payment.status === 'verified' ? 'green' : 'orange'}
                    >
                      {payment.status.toUpperCase()}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing='2'>
                      <IconButton
                        aria-label='Download receipt'
                        icon={<MdFileDownload />}
                        size='sm'
                        variant='ghost'
                        colorScheme='blue'
                        onClick={() => {
                          toast({
                            title: 'Download started',
                            description: `Receipt ${payment.receiptNo} is being downloaded`,
                            status: 'info',
                            duration: 3000,
                            isClosable: true,
                          });
                        }}
                      />
                      <IconButton
                        aria-label='Print receipt'
                        icon={<MdPrint />}
                        size='sm'
                        variant='ghost'
                        colorScheme='gray'
                        onClick={() => {
                          toast({
                            title: 'Print dialog',
                            description: 'Print dialog would open here',
                            status: 'info',
                            duration: 3000,
                            isClosable: true,
                          });
                        }}
                      />
                      <IconButton
                        aria-label='Email receipt'
                        icon={<MdEmail />}
                        size='sm'
                        variant='ghost'
                        colorScheme='green'
                        onClick={() => {
                          toast({
                            title: 'Email receipt',
                            description: 'Receipt would be emailed to parent',
                            status: 'info',
                            duration: 3000,
                            isClosable: true,
                          });
                        }}
                      />
                      <IconButton
                        aria-label='View details'
                        icon={<MdVisibility />}
                        size='sm'
                        variant='ghost'
                        colorScheme='purple'
                        onClick={() => {
                          toast({
                            title: 'View receipt details',
                            description: 'Receipt details modal would open here',
                            status: 'info',
                            duration: 3000,
                            isClosable: true,
                          });
                        }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex justify='space-between' align='center' mt='20px'>
          <Text color='gray.600'>
            Showing {mockPaymentHistory.length} of {mockPaymentHistory.length} payments
          </Text>
          <HStack spacing='2'>
            <Button size='sm' leftIcon={<MdFileDownload />} colorScheme='green'>
              Export to Excel
            </Button>
            <Text fontWeight='bold' color='green.500'>
              Total Paid: PKR {mockPaymentHistory.reduce((sum, item) => sum + item.amountPaid, 0).toLocaleString()}
            </Text>
          </HStack>
        </Flex>
      </Card>

      {/* Discount & Concessions */}
      <Card p='20px' mb='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='20px'>
          Applied Discounts
        </Text>

        {mockDiscounts.length > 0 ? (
          <Box>
            <Flex
              p='15px'
              bg='blue.50'
              borderRadius='md'
              borderLeft='4px'
              borderLeftColor='blue.500'
              mb='15px'
              align='flex-start'
            >
              <Icon as={MdLocalOffer} color='blue.500' boxSize='24px' mr='10px' mt='1px' />
              <Box>
                <Text fontWeight='500'>Active Discount Applied</Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt='10px'>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Type:</Text>
                    <Text fontWeight='500'>{mockDiscounts[0].type}</Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Amount:</Text>
                    <Text fontWeight='500'>
                      {mockDiscounts[0].percentage ? (
                        `${mockDiscounts[0].percentage}% (PKR ${mockDiscounts[0].amount.toLocaleString()})`
                      ) : (
                        `PKR ${mockDiscounts[0].amount.toLocaleString()}`
                      )}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Status:</Text>
                    <Badge colorScheme={mockDiscounts[0].status === 'active' ? 'green' : 'gray'}>
                      {mockDiscounts[0].status.toUpperCase()}
                    </Badge>
                  </Box>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt='10px'>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Reason:</Text>
                    <Text>{mockDiscounts[0].reason}</Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Approved By:</Text>
                    <Text>{mockDiscounts[0].approvedBy}</Text>
                  </Box>
                  <Box>
                    <Text fontSize='sm' color='gray.500'>Approval Date:</Text>
                    <Text>{mockDiscounts[0].approvalDate}</Text>
                  </Box>
                </SimpleGrid>
              </Box>
            </Flex>

            <TableContainer>
              <Table size='sm'>
                <Thead>
                  <Tr>
                    <Th>DISCOUNT TYPE</Th>
                    <Th>AMOUNT</Th>
                    <Th>DATE APPLIED</Th>
                    <Th>REASON</Th>
                    <Th>STATUS</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockDiscounts.map((discount, idx) => (
                    <Tr key={idx}>
                      <Td>{discount.type}</Td>
                      <Td>
                        {discount.percentage ? (
                          `${discount.percentage}% (PKR ${discount.amount.toLocaleString()})`
                        ) : (
                          `PKR ${discount.amount.toLocaleString()}`
                        )}
                      </Td>
                      <Td>{discount.approvalDate}</Td>
                      <Td>{discount.reason}</Td>
                      <Td>
                        <Badge colorScheme={discount.status === 'active' ? 'green' : 'gray'}>
                          {discount.status.toUpperCase()}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Flex
            direction='column'
            align='center'
            justify='center'
            p='30px'
            bg='gray.50'
            borderRadius='md'
          >
            <Icon as={MdLocalOffer} color='gray.400' boxSize='40px' mb='10px' />
            <Text color='gray.500' mb='10px'>No discounts or concessions applied</Text>
            <Button size='sm' colorScheme='blue' variant='outline'>
              Request Fee Concession
            </Button>
          </Flex>
        )}
      </Card>

      {/* Fee Payment Actions */}
      <Card p='20px' mb='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='20px'>
          Fee Payment Actions
        </Text>

        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} gap='20px'>
          <Button colorScheme='blue' size='lg' leftIcon={<MdPayment />} height='80px' flexDirection='column'>
            <Text>Make Payment</Text>
            <Text fontSize='xs' mt='5px'>Pay pending fees</Text>
          </Button>

          <Button colorScheme='gray' size='lg' leftIcon={<MdFileDownload />} height='80px' flexDirection='column'>
            <Text>Download Fee Voucher</Text>
            <Text fontSize='xs' mt='5px'>For bank payment</Text>
          </Button>

          <Button colorScheme='gray' size='lg' leftIcon={<MdPrint />} height='80px' flexDirection='column'>
            <Text>Print Fee Card</Text>
            <Text fontSize='xs' mt='5px'>Complete history</Text>
          </Button>

          <Button colorScheme='gray' size='lg' leftIcon={<MdEmail />} height='80px' flexDirection='column'>
            <Text>Email Fee Details</Text>
            <Text fontSize='xs' mt='5px'>To parent</Text>
          </Button>

          <Button colorScheme='gray' size='lg' leftIcon={<MdLocalOffer />} height='80px' flexDirection='column'>
            <Text>Request Concession</Text>
            <Text fontSize='xs' mt='5px'>Apply for discount</Text>
          </Button>

          <Button colorScheme='gray' size='lg' leftIcon={<MdCalendarMonth />} height='80px' flexDirection='column'>
            <Text>View Payment Plan</Text>
            <Text fontSize='xs' mt='5px'>Installment details</Text>
          </Button>
        </SimpleGrid>
      </Card>
    </Box>
  );
}
