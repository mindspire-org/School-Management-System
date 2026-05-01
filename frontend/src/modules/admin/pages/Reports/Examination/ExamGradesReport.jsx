import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Select
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function ExamGradesReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ classId: '', examId: '' });
    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.examination.grades({ ...filters, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Grade Analysis Report</Heading>

                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Class</Text>
                            <Select placeholder='Select Class' onChange={(e) => setFilters({ ...filters, classId: e.target.value })}>
                                <option value='1'>Class 1</option>
                                <option value='2'>Class 2</option>
                            </Select>
                        </Box>
                        <Box>
                            <Text mb='5px'>Exam</Text>
                            <Select placeholder='Select Exam' onChange={(e) => setFilters({ ...filters, examId: e.target.value })}>
                                <option value='mid'>Mid Term</option>
                                <option value='final'>Final Term</option>
                            </Select>
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>Analyze</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>Grade</Th><Th>Min Marks</Th><Th>Max Marks</Th><Th>Student Count</Th><Th>Percentage of Class</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={5}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={5}>No analysis data found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td fontWeight='bold' fontSize='lg'>{item.grade}</Td>
                                            <Td>{item.minMarks}%</Td>
                                            <Td>{item.maxMarks}%</Td>
                                            <Td>{item.count}</Td>
                                            <Td>{item.percentage}%</Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
