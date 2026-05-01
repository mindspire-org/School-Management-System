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
    Heading,
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function StudentPerformanceReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        examType: '',
        class: '',
    });

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.student.performance({ ...filters, campusId });
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
                <Heading color={textColor} fontSize='2xl' mb='20px'>Student Performance Report</Heading>

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
                            <Text mb='5px'>Exam Type</Text>
                            <Select placeholder='Select Exam' onChange={(e) => setFilters({ ...filters, examType: e.target.value })}>
                                <option value='mid-term'>Mid Term</option>
                                <option value='final'>Final</option>
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
                            <Tr>
                                <Th>Student Name</Th>
                                <Th>Class</Th>
                                <Th>Total Marks</Th>
                                <Th>Obtained Marks</Th>
                                <Th>Grade</Th>
                                <Th>Position</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={6}>No data found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.studentName}</Td>
                                            <Td>{item.className}</Td>
                                            <Td>{item.totalMarks}</Td>
                                            <Td fontWeight='bold'>{item.obtainedMarks}</Td>
                                            <Td>{item.grade}</Td>
                                            <Td>{item.position}</Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
