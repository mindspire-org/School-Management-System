import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function IncomeReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });
    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.financial.income({ ...filters, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const totalIncome = data.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Income Report</Heading>

                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Start Date</Text>
                            <Input type='date' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
                        </Box>
                        <Box>
                            <Text mb='5px'>End Date</Text>
                            <Input type='date' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>Generate Report</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap='20px' mb='20px'>
                    <Card p='20px'>
                        <Stat>
                            <StatLabel>Total Income</StatLabel>
                            <StatNumber>${totalIncome.toLocaleString()}</StatNumber>
                            <StatHelpText>Selected Period</StatHelpText>
                        </Stat>
                    </Card>
                </SimpleGrid>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>Date</Th><Th>Category</Th><Th>Description</Th><Th>Method</Th><Th>Amount</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={5}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={5}>No data found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{new Date(item.date).toLocaleDateString()}</Td>
                                            <Td>{item.category}</Td>
                                            <Td>{item.description}</Td>
                                            <Td>{item.paymentMethod}</Td>
                                            <Td fontWeight='bold' color='green.500'>${item.amount}</Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
