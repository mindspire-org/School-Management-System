import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';

const SimpleAddTeacher = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Teacher ${formData.name} added successfully!`);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: ''
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Add New Teacher
      </Heading>
      
      <Card>
        <Box p={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter subject"
                    required
                  />
                </FormControl>
              </SimpleGrid>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                w={{ base: '100%', md: 'auto' }}
              >
                Add Teacher
              </Button>
            </VStack>
          </form>
        </Box>
      </Card>
    </Box>
  );
};

export default SimpleAddTeacher;
