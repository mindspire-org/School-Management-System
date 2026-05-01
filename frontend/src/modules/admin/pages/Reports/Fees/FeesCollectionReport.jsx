import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Select, Input, Heading, Badge
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function FeesCollectionReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });
    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.fees.collection({ ...filters, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Fees Collection Report</Heading>
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

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>Receipt No</Th><Th>Student Name</Th><Th>Class</Th><Th>Payment Date</Th><Th>Amount</Th><Th>Mode</Th><Th>Status</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={7}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={7}>No data found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.receiptNo}</Td>
                                            <Td>{item.studentName}</Td>
                                            <Td>{item.className}</Td>
                                            <Td>{new Date(item.date).toLocaleDateString()}</Td>
                                            <Td fontWeight='bold'>${item.amount}</Td>
                                            <Td>{item.paymentMode}</Td>
                                            <Td><Badge colorScheme='green'>Paid</Badge></Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
