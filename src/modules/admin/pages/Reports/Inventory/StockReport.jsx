import React, { useState } from 'react';
import {
    Box, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Text, useColorModeValue, Input, Heading, Select, Badge
} from '@chakra-ui/react';
import { MdPrint, MdDownload } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { reportsApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function StockReport() {
    const { campusId } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('');
    const textColor = useColorModeValue('secondaryGray.900', 'white');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportsApi.inventory.stock({ category, campusId });
            setData(result);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Heading color={textColor} fontSize='2xl' mb='20px'>Inventory Stock Report</Heading>

                <Card p='20px' mb='20px'>
                    <Flex gap='20px' align='end' wrap='wrap'>
                        <Box>
                            <Text mb='5px'>Category</Text>
                            <Select placeholder='All Categories' onChange={(e) => setCategory(e.target.value)}>
                                <option value='Stationery'>Stationery</option>
                                <option value='IT'>IT Assets</option>
                                <option value='Furniture'>Furniture</option>
                            </Select>
                        </Box>
                        <Button colorScheme='brand' onClick={fetchData} isLoading={loading}>Show Stock</Button>
                        <Button leftIcon={<MdPrint />} variant='outline'>Print</Button>
                        <Button leftIcon={<MdDownload />} variant='outline'>Export</Button>
                    </Flex>
                </Card>

                <Card p='20px'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr><Th>Item Name</Th><Th>Category</Th><Th>Quantity</Th><Th>Unit Price</Th><Th>Total Value</Th><Th>Status</Th></Tr>
                        </Thead>
                        <Tbody>
                            {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> :
                                data.length === 0 ? <Tr><Td colSpan={6}>No stock items found</Td></Tr> :
                                    data.map((item, index) => (
                                        <Tr key={index}>
                                            <Td>{item.itemName}</Td>
                                            <Td>{item.category}</Td>
                                            <Td>{item.quantity}</Td>
                                            <Td>${item.unitPrice}</Td>
                                            <Td fontWeight='bold'>${item.totalValue}</Td>
                                            <Td><Badge colorScheme={item.quantity < 10 ? 'red' : 'green'}>{item.quantity < 10 ? 'Low Stock' : 'In Stock'}</Badge></Td>
                                        </Tr>
                                    ))}
                        </Tbody>
                    </Table>
                </Card>
            </Flex>
        </Box>
    );
}
