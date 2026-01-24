import React from 'react';
import { Box, Text, Flex, Button, SimpleGrid, Badge } from '@chakra-ui/react';
import Card from '../../../../components/card/Card';

export default function StudentPerformance() {
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Page Header */}
      <Flex justify='space-between' align='center' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold'>
            Student Performance
          </Text>
          <Text fontSize='md' color='gray.500'>
            View and analyze student academic performance
          </Text>
        </Box>
        <Button colorScheme='blue'>
          Generate Reports
        </Button>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='20px'>
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='20px'>
            Performance Overview
          </Text>
          <Text>
            This page will display student performance metrics, grades, and analytics.
          </Text>
        </Card>
        
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='20px'>
            Implementation Status
          </Text>
          <Badge colorScheme='blue' fontSize='md' p='2'>
            Coming Soon
          </Badge>
          <Text mt='10px'>
            Full implementation of this page is in progress and will be available in the next update.
          </Text>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
