import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Select
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function SalaryReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState('');

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.hr.salary({ month, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Salary Report</Heading>

                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Month</Text>
                            <Input type='month' onChange={(e) => setMonth(e.target.value)} />
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>Generate Report</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>Employee</Th><Th>Designation</Th><Th>Basic Salary</Th><Th>Deductions</Th><Th>Net Salary</Th><Th>Status</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={6}>No records found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.employeeName}</Td>
                                            <Td>{item.designation}</Td>
                                            <Td>${item.basicSalary}</Td>
                                            <Td color='red.500'>${item.deductions}</Td>
                                            <Td fontWeight='bold'>${item.netSalary}</Td>
                                            <Td>{item.status}</Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
