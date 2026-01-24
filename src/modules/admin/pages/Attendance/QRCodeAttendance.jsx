import React from 'react';
import { Box, Flex, Heading, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { MdQrCodeScanner } from 'react-icons/md';
import Card from '../../../../components/card/Card';

export default function AdminQRAttendance() {
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>QR Code Attendance</Heading>
                    <Text color={textColorSecondary}>Scan QR codes to mark attendance for Students or Staff</Text>
                </Box>
                <Button leftIcon={<MdQrCodeScanner />} colorScheme="blue">Start Scanner</Button>
            </Flex>
            <Card p={6}>
                <Text mb={4}>Use this scanner to mark attendance by scanning ID cards or QR codes.</Text>
                <Box bg="gray.100" h="300px" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">QR Code Scanner will appear here</Text>
                </Box>
            </Card>
        </Box>
    );
}
