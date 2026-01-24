import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Select
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function ExamResultsReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ classId: '', sectionId: '', examId: '' });
    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.examination.results({ ...filters, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Exam Results Report</Heading>

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
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>Show Results</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>Student</Th><Th>Roll No</Th><Th>Total Marks</Th><Th>Obtained</Th><Th>Percentage</Th><Th>Grade</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={6}>No records found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.studentName}</Td>
                                            <Td>{item.rollNo}</Td>
                                            <Td>{item.totalMarks}</Td>
                                            <Td fontWeight='bold'>{item.obtainedMarks}</Td>
                                            <Td>{item.percentage}%</Td>
                                            <Td>{item.grade}</Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
