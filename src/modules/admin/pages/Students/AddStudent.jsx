import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/card/Card';

export default function AddStudent() {
  const navigate = useNavigate();
  
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card p='20px'>
        <Text fontSize='2xl' fontWeight='bold' mb='20px'>
          Add New Student
        </Text>
        <Text color='gray.500' mb='20px'>
          This page will contain the form to add a new student.
        </Text>
        <Button colorScheme='gray' onClick={() => navigate('/admin/students')}>
          Back to Students List
        </Button>
      </Card>
    </Box>
  );
}
