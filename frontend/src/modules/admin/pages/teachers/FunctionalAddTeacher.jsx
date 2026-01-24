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
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';

const FunctionalAddTeacher = () => {
  console.log('FunctionalAddTeacher component is rendering');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    department: '',
    qualification: '',
    experience: '',
    salary: ''
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
    console.log('Form submitted with data:', formData);
    
    // Show success message
    toast({
      title: 'Teacher Added Successfully!',
      description: `${formData.name} has been added to the system.`,
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
      department: '',
      qualification: '',
      experience: '',
      salary: ''
    });
  };

  return (
    <Box 
      pt={{ base: '130px', md: '80px', xl: '80px' }} 
      px={4}
      bg="gray.50"
      minH="100vh"
    >
      {/* Success Indicator */}
      <Alert status="success" mb={4} borderRadius="lg">
        <AlertIcon />
        ✅ Add Teacher component is working properly!
      </Alert>

      {/* Page Header */}
      <Box mb={6}>
        <Heading as="h1" size="lg" color="gray.800" mb={2}>
          Add New Teacher
        </Heading>
        <Text color="gray.600" fontSize="md">
          Fill in the information below to add a new teacher to the system
        </Text>
      </Box>

      {/* Add Teacher Form */}
      <Card>
        <CardHeader>
          <Heading size="md" color="gray.800">
            Teacher Information
          </Heading>
        </CardHeader>
        
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              
              {/* Basic Information */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={4}>
                  Basic Information
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700">Full Name</FormLabel>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter teacher's full name"
                      size="lg"
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Email Address</FormLabel>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="teacher@school.edu"
                      size="lg"
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Phone Number</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      size="lg"
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Department</FormLabel>
                    <Select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Select department"
                      size="lg"
                      bg="white"
                    >
                      <option value="science">Science</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="english">English</option>
                      <option value="history">History</option>
                      <option value="arts">Arts</option>
                      <option value="physical-education">Physical Education</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Academic Information */}
              <Box>
                <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={4}>
                  Academic Information
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700">Primary Subject</FormLabel>
                    <Select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Select primary subject"
                      size="lg"
                      bg="white"
                    >
                      <option value="mathematics">Mathematics</option>
                      <option value="physics">Physics</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="biology">Biology</option>
                      <option value="english">English Literature</option>
                      <option value="history">History</option>
                      <option value="geography">Geography</option>
                      <option value="computer-science">Computer Science</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Qualification</FormLabel>
                    <Input
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g., MSc Physics, PhD Mathematics"
                      size="lg"
                      bg="white"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700">Years of Experience</FormLabel>
                    <Input
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g., 5 years"
                      size="lg"
                      bg="white"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="gray.700">Monthly Salary</FormLabel>
                    <Input
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="e.g., $4,500"
                      size="lg"
                      bg="white"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Action Buttons */}
              <Box pt={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  >
                    Add Teacher
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      subject: '',
                      department: '',
                      qualification: '',
                      experience: '',
                      salary: ''
                    })}
                  >
                    Clear Form
                  </Button>
                </SimpleGrid>
              </Box>

            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Debug Information */}
      <Card mt={6}>
        <CardBody>
          <Text fontSize="sm" color="gray.600" mb={2}>
            <strong>Debug Info:</strong> Component rendered successfully at {new Date().toLocaleTimeString()}
          </Text>
          <Text fontSize="sm" color="gray.600">
            <strong>Current form data:</strong> {Object.keys(formData).length} fields tracked
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
};

export default FunctionalAddTeacher;
