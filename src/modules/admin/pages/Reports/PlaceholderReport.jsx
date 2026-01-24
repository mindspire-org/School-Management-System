import React from 'react';
import { Box, Flex, Heading, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { MdBarChart } from 'react-icons/md';
import Card from '../../../../../components/card/Card';

export default function PlaceholderReport({ title, description }) {
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>{title || 'Report'}</Heading>
                    <Text color={textColorSecondary}>{description || 'Generate and view reports'}</Text>
                </Box>
                <Button leftIcon={<MdBarChart />} colorScheme="blue">Generate Report</Button>
            </Flex>
            <Card p={6}>
                <Text>This report page is under development. Select filters and date range to generate reports.</Text>
            </Card>
        </Box>
    );
}
