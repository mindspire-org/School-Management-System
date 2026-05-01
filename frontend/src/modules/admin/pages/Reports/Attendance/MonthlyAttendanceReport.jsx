import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Select
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function MonthlyAttendanceReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState('');
    const [type, setType] = useState('student');

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        if (!month) return;
        setLoading(true);
        try {
            const result = await reportsApi.attendance.monthly({ month, type, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Monthly Attendance Report</Heading>

                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Type</Text>
                            <Select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value='student'>Student</option>
                                <option value='staff'>Staff</option>
                            </Select>
                        </Box>
                        <Box>
                            <Text mb='5px'>Select Month</Text>
                            <Input type='month' onChange={(e) => setMonth(e.target.value)} />
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>View Report</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>ID</Th><Th>Name</Th><Th>Total Days</Th><Th>Present</Th><Th>Absent</Th><Th>Late</Th><Th>Percentage</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={7}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={7}>No records found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.id}</Td>
                                            <Td>{item.name}</Td>
                                            <Td>{item.totalDays}</Td>
                                            <Td color='green.500'>{item.present}</Td>
                                            <Td color='red.500'>{item.absent}</Td>
                                            <Td color='orange.500'>{item.late}</Td>
                                            <Td fontWeight='bold'>{item.percentage}%</Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
