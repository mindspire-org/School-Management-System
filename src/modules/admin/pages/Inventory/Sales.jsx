import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, NumberInput, NumberInputField, Badge, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdAttachMoney } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { saleApi, productApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Sales() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', customer: '', productId: '', quantity: 0, unitPrice: 0, total: 0, status: 'Pending' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchData();
    }, [campusId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [salesData, productsData] = await Promise.all([
                saleApi.list({ campusId }),
                productApi.list({ campusId })
            ]);
            setSales(salesData || []);
            setProducts(productsData || []);
        } catch (error) {
            toast({ title: 'Error fetching data', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const total = form.quantity * form.unitPrice;
        const updatedForm = { ...form, total, campusId };

        try {
            if (form.id) {
                await saleApi.update(form.id, updatedForm);
                toast({ title: 'Sale updated', status: 'success' });
            } else {
                await saleApi.create(updatedForm);
                toast({ title: 'Sale added', status: 'success' });
            }
            fetchData();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving sale', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            try {
                await saleApi.delete(id);
                toast({ title: 'Sale deleted', status: 'success' });
                fetchData();
            } catch (error) {
                toast({ title: 'Error deleting sale', status: 'error' });
            }
        }
    };

    const getProductName = (id) => products.find(p => String(p.id) === String(id))?.name || 'Unknown';

    const stats = {
        total: sales.length,
        pending: sales.filter(s => s.status === 'Pending').length,
        paid: sales.filter(s => s.status === 'Paid').length,
        totalRevenue: sales.reduce((sum, s) => sum + Number(s.total || 0), 0),
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Sales Management</Heading>
                    <Text color={textColorSecondary}>Track and manage inventory sales</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), customer: '', productId: '', quantity: 0, unitPrice: 0, total: 0, status: 'Pending' }); onOpen(); }}>
                    Add Sale
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Sales" value={stats.total} icon={MdAttachMoney} colorScheme="green" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Pending" value={stats.pending} icon={MdAttachMoney} colorScheme="orange" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Paid" value={stats.paid} icon={MdAttachMoney} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Revenue" value={`Rs. ${stats.totalRevenue.toLocaleString()}`} icon={MdAttachMoney} colorScheme="purple" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search sales..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Customer</Th>
                                <Th>Product</Th>
                                <Th isNumeric>Quantity</Th>
                                <Th isNumeric>Unit Price</Th>
                                <Th isNumeric>Total</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={8} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : sales.length === 0 ? (
                                <Tr><Td colSpan={8} textAlign="center">No sales found</Td></Tr>
                            ) : sales.filter(s => getProductName(s.productId).toLowerCase().includes(search.toLowerCase()) || s.customer?.toLowerCase().includes(search.toLowerCase())).map((sale) => (
                                <Tr key={sale.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{new Date(sale.date).toLocaleDateString()}</Td>
                                    <Td>{sale.customer}</Td>
                                    <Td><Text fontWeight="600">{getProductName(sale.productId)}</Text></Td>
                                    <Td isNumeric>{sale.quantity}</Td>
                                    <Td isNumeric>Rs. {Number(sale.unitPrice).toLocaleString()}</Td>
                                    <Td isNumeric>Rs. {Number(sale.total).toLocaleString()}</Td>
                                    <Td><Badge colorScheme={sale.status === 'Paid' ? 'green' : 'orange'}>{sale.status}</Badge></Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(sale); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(sale.id)} />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{form.id ? 'Edit Sale' : 'Add Sale'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date ? new Date(form.date).toISOString().slice(0, 10) : ''} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Customer</FormLabel>
                            <Input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Product</FormLabel>
                            <Select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Quantity</FormLabel>
                            <NumberInput value={form.quantity} min={0} onChange={(v) => setForm({ ...form, quantity: Number(v) || 0 })}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Unit Price</FormLabel>
                            <NumberInput value={form.unitPrice} min={0} onChange={(v) => setForm({ ...form, unitPrice: Number(v) || 0 })}>
                                <NumberInputField />
                            </NumberInput>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Status</FormLabel>
                            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Cancelled">Cancelled</option>
                            </Select>
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleSave}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
