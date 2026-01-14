import React from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Button,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';

const SimpleTeacherList = () => {
  const teachers = [
    {
      id: 1,
      name: "Robert Smith",
      email: "robert@school.edu",
      subject: "Mathematics",
      status: "Active"
    },
    {
      id: 2,
      name: "Sarah Johnson", 
      email: "sarah@school.edu",
      subject: "Biology",
      status: "Active"
    }
  ];

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Teachers List
      </Heading>
      
      <Card>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Subject</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {teachers.map((teacher) => (
              <Tr key={teacher.id}>
                <Td>{teacher.name}</Td>
                <Td>{teacher.email}</Td>
                <Td>
                  <Badge colorScheme="blue">{teacher.subject}</Badge>
                </Td>
                <Td>
                  <Badge colorScheme="green">{teacher.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </Box>
  );
};

export default SimpleTeacherList;
