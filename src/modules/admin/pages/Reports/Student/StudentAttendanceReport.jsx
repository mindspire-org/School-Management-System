import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    useColorModeValue,
    Select,
    Input,
    Heading,
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function StudentAttendanceReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        class: '',
    });

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    useEffect(() => {
        // Initial load or load on filter change if desired
        // fetchData();
    }, [campusId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.student.attendance({ ...filters, campusId });
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Student Attendance Report</Heading>

                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Class</Text>
                            <Select placeholder='Select Class' onChange={(e) => setFilters({ ...filters, class: e.target.value })}>
                                <option value='1'>Class 1</option>
                                <option value='2'>Class 2</option>
                            </Select>
                        </Box>
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
                            <Tr>
                                <Th>Student Name</Th>
                                <Th>Class</Th>
                                <Th>Total Days</Th>
                                <Th>Present</Th>
                                <Th>Absent</Th>
                                <Th>Percentage</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={6}>No data found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.studentName}</Td>
                                            <Td>{item.className}</Td>
                                            <Td>{item.totalDays}</Td>
                                            <Td color='green.500'>{item.present}</Td>
                                            <Td color='red.500'>{item.absent}</Td>
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
