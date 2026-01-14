import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  VStack,
  Badge,
  Button,
  Divider,
  useToast,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInvoiceById, markInvoiceAsPaid } from '../../../../redux/features/finance/financeSlice';
import { FaArrowLeft, FaDownload, FaCheck } from 'react-icons/fa';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { currentInvoice, loading, error } = useSelector((state) => state.finance);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchInvoiceById(id));
    }
  }, [dispatch, id]);

  const handleMarkAsPaid = async () => {
    if (!currentInvoice) return;
    setIsMarkingPaid(true);
    try {
      await dispatch(markInvoiceAsPaid(currentInvoice.id)).unwrap();
      toast({ title: 'Invoice marked as paid', status: 'success' });
    } catch (err) {
      toast({ title: 'Failed to mark as paid', status: 'error' });
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleDownload = () => {
    if (!currentInvoice) return;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${currentInvoice.id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; }
    .section { margin-bottom: 20px; }
    .two-column { display: flex; gap: 40px; margin-bottom: 20px; }
    .column { flex: 1; }
    .item-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .item-table th, .item-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .item-table th { background-color: #f5f5f5; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
    .status { text-align: center; padding: 10px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE</h1>
    <h2>${currentInvoice.id}</h2>
  </div>

  <div class="section two-column">
    <div class="column">
      <h3>Billed To:</h3>
      <p><strong>${currentInvoice.student?.name || 'N/A'}</strong></p>
      <p>Class: ${currentInvoice.student?.class || 'N/A'}</p>
      <p>Roll No: ${currentInvoice.student?.rollNumber || 'N/A'}</p>
    </div>
    <div class="column">
      <h3>Invoice Details:</h3>
      <p>Invoice Date: ${currentInvoice.invoiceDate}</p>
      <p>Due Date: ${currentInvoice.dueDate}</p>
      <p>Status: <strong>${currentInvoice.status}</strong></p>
    </div>
  </div>

  <div class="section">
    <table class="item-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${currentInvoice.description || 'Tuition Fee'}</td>
          <td>$${currentInvoice.amount?.toFixed(2) || '0.00'}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="total">
    Total Amount: $${currentInvoice.amount?.toFixed(2) || '0.00'}
  </div>

  <div class="status">
    <strong>Status: ${currentInvoice.status}</strong>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${currentInvoice.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error || !currentInvoice) {
    return (
      <Box p={6}>
        <Button leftIcon={<FaArrowLeft />} mb={4} onClick={() => navigate('/finance/invoices')}>
          Back to Invoices
        </Button>
        <Heading size="lg" mb={4}>Invoice Not Found</Heading>
        <Text>The invoice you're looking for doesn't exist or an error occurred.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Button leftIcon={<FaArrowLeft />} mb={6} onClick={() => navigate('/finance/invoices')}>
        Back to Invoices
      </Button>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
        <Card>
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Invoice ID</Text>
              <Heading size="md">{currentInvoice.id}</Heading>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Status</Text>
              <Badge 
                colorScheme={currentInvoice.status === 'paid' ? 'green' : currentInvoice.status === 'overdue' ? 'red' : 'yellow'}
                fontSize="md"
                px={3}
                py={1}
              >
                {currentInvoice.status?.toUpperCase()}
              </Badge>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={2}>
              <Text fontSize="sm" color="gray.500">Amount</Text>
              <Heading size="md">${currentInvoice.amount?.toFixed(2) || '0.00'}</Heading>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={6}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Student Information</Heading>
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Name:</Text>
                <Text>{currentInvoice.student?.name || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Class:</Text>
                <Text>{currentInvoice.student?.class || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Roll Number:</Text>
                <Text>{currentInvoice.student?.rollNumber || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Father Name:</Text>
                <Text>{currentInvoice.student?.fatherName || 'N/A'}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Invoice Details</Heading>
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Invoice Date:</Text>
                <Text>{currentInvoice.invoiceDate || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Due Date:</Text>
                <Text>{currentInvoice.dueDate || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Payment Method:</Text>
                <Text>{currentInvoice.paymentMethod || 'N/A'}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text fontWeight="600">Created At:</Text>
                <Text>{new Date(currentInvoice.createdAt).toLocaleDateString()}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mb={6}>
        <CardBody>
          <Heading size="md" mb={4}>Fee Details</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Description</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{currentInvoice.description || 'Tuition Fee'}</Td>
                <Td isNumeric>${currentInvoice.amount?.toFixed(2) || '0.00'}</Td>
              </Tr>
            </Tbody>
          </Table>
          <Divider my={4} />
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">Total Amount:</Text>
            <Text fontSize="lg" fontWeight="bold">${currentInvoice.amount?.toFixed(2) || '0.00'}</Text>
          </HStack>
        </CardBody>
      </Card>

      {currentInvoice.payments && currentInvoice.payments.length > 0 && (
        <Card mb={6}>
          <CardBody>
            <Heading size="md" mb={4}>Payment History</Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Method</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentInvoice.payments.map((payment, index) => (
                  <Tr key={index}>
                    <Td>{new Date(payment.date).toLocaleDateString()}</Td>
                    <Td>{payment.method}</Td>
                    <Td>${payment.amount?.toFixed(2) || '0.00'}</Td>
                    <Td>
                      <Badge colorScheme={payment.status === 'completed' ? 'green' : 'yellow'}>
                        {payment.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      <HStack spacing={4}>
        <Button 
          leftIcon={<FaDownload />} 
          colorScheme="blue" 
          onClick={handleDownload}
        >
          Download Invoice
        </Button>
        
        {currentInvoice.status !== 'paid' && (
          <Button 
            leftIcon={<FaCheck />} 
            colorScheme="green" 
            onClick={handleMarkAsPaid}
            isLoading={isMarkingPaid}
            loadingText="Marking as Paid..."
          >
            Mark as Paid
          </Button>
        )}
      </HStack>
    </Box>
  );
}
