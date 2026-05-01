import React, { useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  IconButton,
  useDisclosure,
  Box,
  Text,
  Link,
} from '@chakra-ui/react';
import { FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'yellow',
  paid: 'green',
  overdue: 'red',
};

const InvoiceTable = ({ invoices, loading, onEdit, onDelete, onRefresh }) => {
  const navigate = useNavigate();

  if (loading) {
    return <Box p={4}><Text>Loading invoices...</Text></Box>;
  }

  if (!invoices?.length) {
    return <Box p={4}><Text>No invoices found.</Text></Box>;
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Invoice #</Th>
            <Th>Class</Th>
            <Th>Student Name</Th>
            <Th>Amount</Th>
            <Th>Balance</Th>
            <Th>Status</Th>
            <Th>Due Date</Th>
            <Th>Age</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {invoices.map((invoice) => (
            <Tr key={invoice.id}>
              <Td>
                <Link onClick={() => navigate(`/admin/finance/invoices/${invoice.id}`)} color="blue.500">
                  {invoice.invoiceNumber || `INV-${String(invoice.id).padStart(6, '0')}`}
                </Link>
              </Td>
              <Td>{invoice.className || '-'}</Td>
              <Td>{invoice.studentName || '-'}</Td>
              <Td>${(Number(invoice.amount) || 0).toFixed(2)}</Td>
              <Td>${(Number(invoice.balance) || 0).toFixed(2)}</Td>
              <Td>
                <Badge colorScheme={statusColors[invoice.status] || 'gray'}>
                  {invoice.status}
                </Badge>
              </Td>
              <Td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</Td>
              <Td>{invoice.age || '-'}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<FaEye />}
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/finance/invoices/${invoice.id}`)}
                    aria-label="View invoice"
                  />
                  <IconButton
                    icon={<FaEdit />}
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit?.(invoice)}
                    aria-label="Edit invoice"
                  />
                  <IconButton
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDelete?.(invoice)}
                    aria-label="Delete invoice"
                  />
                  <IconButton
                    icon={<FaDownload />}
                    size="sm"
                    variant="ghost"
                    aria-label="Download PDF"
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default InvoiceTable;
