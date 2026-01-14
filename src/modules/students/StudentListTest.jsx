import React, { useEffect } from 'react';
import { Box, Heading, Text, Button, Code, Alert, AlertIcon, VStack, Card, CardHeader, CardBody } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';

// A test component that doesn't use Redux
function SimpleContent() {
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Card mb={5}>
        <CardHeader>
          <Heading size="lg">Student List Test Page</Heading>
        </CardHeader>
        <CardBody>
          <Text>This is a test component to verify routes are working correctly.</Text>
          <Alert status="success" mt={4}>
            <AlertIcon />
            If you see this message, the basic routing is working!
          </Alert>
        </CardBody>
      </Card>
    </Box>
  );
}

// A simple test component to check if routes are working
function StudentListTest() {
  // Force component to render without Redux dependencies
  return <SimpleContent />;
}

export default StudentListTest;
