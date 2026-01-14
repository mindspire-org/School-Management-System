import React from 'react';
import { Box, Text, Flex, SimpleGrid, Button, Icon, useColorModeValue, VStack } from '@chakra-ui/react';
import Card from '../../components/card/Card';

export default function StudentModulePlaceholder({ title, subtitle, actions = [] }) {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>{title}</Text>
      {subtitle && <Text fontSize='md' color={textSecondary} mb='18px'>{subtitle}</Text>}

      <Card p='20px' mb='20px'>
        <Flex justify='space-between' align='center' flexWrap='wrap' rowGap={3}>
          <Text fontWeight='600' color={textSecondary}>Quick Actions</Text>
          <Flex gap={2} flexWrap='wrap'>
            {actions.map((a) => (
              <Button key={a.label} size='sm' leftIcon={a.icon ? <Icon as={a.icon} /> : undefined} variant={a.variant || 'outline'} colorScheme={a.color || 'blue'}>
                {a.label}
              </Button>
            ))}
          </Flex>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='16px'>
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Overview</Text>
          <Text fontSize='sm' color={textSecondary}>This section will show summary cards and recent activity relevant to {title.toLowerCase()}.</Text>
        </Card>
        <Card p='20px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Next Steps</Text>
          <VStack align='start' spacing={2}>
            <Text fontSize='sm' color={textSecondary}>• Use quick actions above to start.</Text>
            <Text fontSize='sm' color={textSecondary}>• Data tables and detail pages will appear here.</Text>
            <Text fontSize='sm' color={textSecondary}>• Designed for a clean, responsive student workflow.</Text>
          </VStack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
