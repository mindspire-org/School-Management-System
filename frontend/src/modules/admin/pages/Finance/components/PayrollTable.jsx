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
} from '@chakra-ui/react';
import { FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  draft: 'gray',
  pending: 'yellow',
  paid: 'green',
  cancelled: 'red',
};

const PayrollTable = ({ payroll, loading, onEdit, onDelete, onRefresh }) => {
  const navigate = useNavigate();

  if (loading) {
    return <Box p={4}><Text>Loading payroll records...</Text></Box>;
  }

  if (!payroll?.length) {
    return <Box p={4}><Text>No payroll records found.</Text></Box>;
  }

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>User Type</Th>
            <Th>Name</Th>
            <Th>Base Salary</Th>
            <Th>Net Salary</Th>
            <Th>Pay Period</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {payroll.map((record) => (
            <Tr key={record.id}>
              <Td>
                <Badge colorScheme={record.userType === 'teacher' ? 'blue' : 'orange'}>
                  {record.userType}
                </Badge>
              </Td>
              <Td>{record.userName || '-'}</Td>
              <Td>${record.baseSalary?.toFixed(2) || '0.00'}</Td>
              <Td>${record.netSalary?.toFixed(2) || '0.00'}</Td>
              <Td>{record.payPeriod ? new Date(record.payPeriod).toLocaleDateString() : '-'}</Td>
              <Td>
                <Badge colorScheme={statusColors[record.status] || 'gray'}>
                  {record.status}
                </Badge>
              </Td>
              <Td>{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '-'}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    icon={<FaEye />}
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/admin/finance/payroll/${record.id}`)}
                    aria-label="View payroll"
                  />
                  <IconButton
                    icon={<FaEdit />}
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit?.(record)}
                    aria-label="Edit payroll"
                  />
                  <IconButton
                    icon={<FaTrash />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => onDelete?.(record)}
                    aria-label="Delete payroll"
                  />
                  <IconButton
                    icon={<FaDownload />}
                    size="sm"
                    variant="ghost"
                    aria-label="Download payslip"
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

export default PayrollTable;
