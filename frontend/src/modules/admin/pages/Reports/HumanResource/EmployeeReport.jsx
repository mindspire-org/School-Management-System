import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Select, Badge
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function EmployeeReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ department: '', role: '' });
    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.hr.employee({ ...filters, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Employee Report</Heading>

                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Department</Text>
                            <Select placeholder='Select Department' onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                                <option value='Teaching'>Teaching</option>
                                <option value='Admin'>Administration</option>
                                <option value='Support'>Support Staff</option>
                            </Select>
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>Show Employees</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>ID</Th><Th>Name</Th><Th>Role</Th><Th>Department</Th><Th>Join Date</Th><Th>Status</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={6}>No data found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.id}</Td>
                                            <Td>{item.name}</Td>
                                            <Td>{item.role}</Td>
                                            <Td>{item.department}</Td>
                                            <Td>{new Date(item.joinDate).toLocaleDateString()}</Td>
                                            <Td><Badge colorScheme='green'>Active</Badge></Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
