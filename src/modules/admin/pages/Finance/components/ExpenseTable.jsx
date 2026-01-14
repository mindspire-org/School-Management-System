import React from 'react';
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
  Box,
  Text,
  Link,
  Image,
} from '@chakra-ui/react';
import { FaEye, FaEdit, FaTrash, FaReceipt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

const ExpenseTable = ({ expenses, loading, onEdit, onDelete, onRefresh }) => {
  const navigate = useNavigate();

  if (loading) {
    return <Box p={4}><Text>Loading expenses...</Text></Box>;
  }

  if (!expenses?.length) {
    return <Box p={4}><Text>No expenses found.</Text></Box>;
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>User Type</Th>
            <Th>Name</Th>
            <Th>Category</Th>
            <Th>Description</Th>
            <Th>Amount</Th>
            <Th>Date</Th>
            <Th>Receipt</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {expenses.map((expense) => (
            <Tr key={expense.id}>
              <Td>
                <Badge colorScheme={expense.userType === 'teacher' ? 'blue' : 'orange'}>
                  {expense.userType}
                </Badge>
              </Td>
              <Td>{expense.userName || '-'}</Td>
              <Td>{expense.category}</Td>
              <Td maxW="200px" isTruncated title={expense.description}>
                {expense.description}
              </Td>
              <Td>${expense.amount?.toFixed(2) || '0.00'}</Td>
              <Td>{expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : '-'}</Td>
              <Td>
                {expense.receiptUrl ? (
                  <Link href={expense.receiptUrl} isExternal>
                    <IconButton
                      icon={<FaReceipt />}
                      size="sm"
                      variant="ghost"
                      aria-label="View receipt"
                    />
                  </Link>
                ) : (
                  <Text color="gray.400">-</Text>
                )}
              </Td>
              <Td>
                <Badge colorScheme={statusColors[expense.status] || 'gray'}>
                  {expense.status}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<FaEye />}
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/finance/expenses/${expense.id}`)}
                    aria-label="View expense"
                  />
                  <IconButton
                    icon={<FaEdit />}
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit?.(expense)}
                    aria-label="Edit expense"
                  />
                  <IconButton
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDelete?.(expense)}
                    aria-label="Delete expense"
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

export default ExpenseTable;
