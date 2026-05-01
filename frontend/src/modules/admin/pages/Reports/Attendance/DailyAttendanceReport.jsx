import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Select, Badge
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function DailyAttendanceReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState('');
    const [type, setType] = useState('student');

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        if (!date) return;
        setLoading(true);
        try {
            const result = await reportsApi.attendance.daily({ date, type, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Daily Attendance Report</Heading>

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
                            <Text mb='5px'>Date</Text>
                            <Input type='date' onChange={(e) => setDate(e.target.value)} />
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>View Attendance</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>ID</Th><Th>Name</Th><Th>Check In</Th><Th>Check Out</Th><Th>Status</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={5}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={5}>No records found for this date</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.id}</Td>
                                            <Td>{item.name}</Td>
                                            <Td>{item.checkIn || '-'}</Td>
                                            <Td>{item.checkOut || '-'}</Td>
                                            <Td>
                                                <Badge colorScheme={item.status === 'Present' ? 'green' : item.status === 'Absent' ? 'red' : 'orange'}>
                                                    {item.status}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
