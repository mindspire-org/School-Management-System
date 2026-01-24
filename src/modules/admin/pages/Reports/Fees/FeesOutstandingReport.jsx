import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Select, Heading, Badge
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function FeesOutstandingReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ class: '' });
    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.fees.outstanding({ ...filters, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Outstanding Fees Report</Heading>
                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Class</Text>
                            <Select placeholder='Select Class' onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
                                <option value='1'>Class 1</option>
                                <option value='2'>Class 2</option>
                            </Select>
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>Generate Report</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>Student Name</Th><Th>Class</Th><Th>Fee Type</Th><Th>Due Date</Th><Th>Amount Due</Th><Th>Status</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={6}>No data found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.studentName}</Td>
                                            <Td>{item.className}</Td>
                                            <Td>{item.feeType}</Td>
                                            <Td>{new Date(item.dueDate).toLocaleDateString()}</Td>
                                            <Td fontWeight='bold' color='red.500'>${item.amount}</Td>
                                            <Td><Badge colorScheme='red'>Unpaid</Badge></Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
