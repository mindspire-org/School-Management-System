import React, { useState, useEffect } from 'react';
import {
    Box,
    SimpleGrid,
    useColorModeValue,
    Button,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Text,
    Flex,
    Heading,
    Icon,
} from '@chakra-ui/react';
import { MdAdd, MdAttachMoney, MdDateRange, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { payrollApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function PayrollDashboard() {
    const { user, campusId } = useAuth();
    const toast = useToast();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);

    // Colors
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

    useEffect(() => {
        fetchPayrolls();
    }, [campusId]);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const data = await payrollApi.list({ campusId });
            setPayrolls(data);
        } catch (error) {
            toast({
                title: 'Error fetching payrolls',
                description: error.response?.data?.error || 'Something went wrong',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePayroll = async () => {
        try {
            const date = new Date();
            await payrollApi.generatePayroll(date.toLocaleString('default', { month: 'long' }), date.getFullYear(), campusId);
            toast({
                title: 'Payroll Generated',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchPayrolls();
        } catch (error) {
            toast({
                title: 'Error generating payroll',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleOpenSlip = async (id) => {
        try {
            const data = await payrollApi.getSalarySlip(id);
            const url = data?.slipUrl;
            if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
                return;
            }
            toast({
                title: 'Slip not available',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error fetching salary slip',
                description: error.response?.data?.error || 'Something went wrong',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Flex
                    mt='45px'
                    mb='20px'
                    justifyContent='space-between'
                    direction={{ base: 'column', md: 'row' }}
                    align={{ base: 'start', md: 'center' }}
                >
                    <Heading color={textColor} fontSize='2xl' mb={{ base: '10px', md: '0px' }}>
                        Payroll Management
                    </Heading>
                    <Button
                        leftIcon={<Icon as={MdAttachMoney} />}
                        variant='brand'
                        onClick={handleGeneratePayroll}
                    >
                        Generate Monthly Payroll
                    </Button>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px' mb='20px'>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Total Salary Paid</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                ${payrolls.reduce((sum, p) => sum + Number(p.netSalary), 0).toLocaleString()}
                            </Text>
                        </Flex>
                    </Card>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Paid Employees</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                {payrolls.filter(p => p.status === 'Paid').length}
                            </Text>
                        </Flex>
                    </Card>
                    <Card p='20px' align='center' direction='column' w='100%'>
                        <Flex direction='column' align='center'>
                            <Text fontSize='lg' color='gray.500' fontWeight='bold' mb='10px'>Pending Payments</Text>
                            <Text fontSize='3xl' color={textColor} fontWeight='700'>
                                {payrolls.filter(p => p.status === 'Pending').length}
                            </Text>
                        </Flex>
                    </Card>
                </SimpleGrid>

                <Card p='20px' mb='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th>ID</Th>
                                <Th>Employee</Th>
                                <Th>Month/Year</Th>
                                <Th>Basic</Th>
                                <Th>Net Salary</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading...</Td></Tr>
                            ) : payrolls.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center">No payroll records found</Td></Tr>
                            ) : (
                                payrolls.map((payroll) => (
                                    <Tr key={payroll.id}>
                                        <Td>{payroll.id}</Td>
                                        <Td>{payroll.employeeName}</Td>
                                        <Td>{payroll.month} {payroll.year}</Td>
                                        <Td>${Number(payroll.basicSalary).toLocaleString()}</Td>
                                        <Td fontWeight='bold'>${Number(payroll.netSalary).toLocaleString()}</Td>
                                        <Td>
                                            <Badge colorScheme={payroll.status === 'Paid' ? 'green' : 'orange'}>
                                                {payroll.status}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <Button size='sm' leftIcon={<MdDownload />} variant='ghost' onClick={() => handleOpenSlip(payroll.id)}>
                                                Slip
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
