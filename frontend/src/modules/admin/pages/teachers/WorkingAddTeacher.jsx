import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  SimpleGrid,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';

const WorkingAddTeacher = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    qualification: ''
  });

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.subject) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: 'Success',
      description: `Teacher ${formData.name} added successfully!`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      qualification: ''
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={{ base: 4, md: 6 }}>
      {/* Header */}
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={2} color="gray.800">
          Add New Teacher
        </Heading>
        <Text color="gray.600">
          Create a new teacher record in the system
        </Text>
      </Box>
      
      {/* Form */}
      <Card>
        <Box p={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel color="gray.700">Full Name</FormLabel>
                  <Input
                    id="add-teacher-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    size="lg"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="gray.700">Email Address</FormLabel>
                  <Input
                    id="add-teacher-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    size="lg"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="gray.700">Phone Number</FormLabel>
                  <Input
                    id="add-teacher-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    size="lg"
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color="gray.700">Subject</FormLabel>
                  <Select
                    id="add-teacher-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Select subject"
                    size="lg"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physical Education">Physical Education</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700">Qualification</FormLabel>
                  <Input
                    id="add-teacher-qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="E.g., MSc Physics, PhD Mathematics"
                    size="lg"
                  />
                </FormControl>
              </SimpleGrid>
              
              <Box pt={4}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width={{ base: '100%', md: 'auto' }}
                  px={8}
                >
                  Add Teacher
                </Button>
              </Box>
            </VStack>
          </form>
        </Box>
      </Card>
    </Box>
  );
};

export default WorkingAddTeacher;
