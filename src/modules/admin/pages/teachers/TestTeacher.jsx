import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const TestTeacher = () => {
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }} p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Test Teacher Component
      </Heading>
      <Text>
        If you can see this, the routing is working correctly.
      </Text>
    </Box>
  );
};

export default TestTeacher;
