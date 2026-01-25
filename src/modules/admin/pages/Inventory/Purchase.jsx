import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, NumberInput, NumberInputField, Badge, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdShoppingCart } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { purchaseApi, supplierApi, productApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Purchase() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', supplierId: '', productId: '', quantity: 0, unitPrice: 0, total: 0, status: 'Pending' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchData();
    }, [campusId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [purchasesData, suppliersData, productsData] = await Promise.all([
                purchaseApi.list({ campusId }),
                supplierApi.list({ campusId }),
                productApi.list({ campusId })
            ]);
            setPurchases(purchasesData || []);
            setSuppliers(suppliersData || []);
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
                await purchaseApi.update(form.id, updatedForm);
                toast({ title: 'Purchase updated', status: 'success' });
            } else {
                await purchaseApi.create(updatedForm);
                toast({ title: 'Purchase added', status: 'success' });
            }
            fetchData();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving purchase', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this purchase?')) {
            try {
                await purchaseApi.delete(id);
                toast({ title: 'Purchase deleted', status: 'success' });
                fetchData();
            } catch (error) {
                toast({ title: 'Error deleting purchase', status: 'error' });
            }
        }
    };

    const stats = {
        total: purchases.length,
        pending: purchases.filter(p => p.status === 'Pending').length,
        completed: purchases.filter(p => p.status === 'Completed').length,
        totalAmount: purchases.reduce((sum, p) => sum + Number(p.total || 0), 0),
    };

    const getSupplierName = (id) => suppliers.find(s => String(s.id) === String(id))?.name || 'Unknown';
    const getProductName = (id) => products.find(p => String(p.id) === String(id))?.name || 'Unknown';

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Purchase Management</Heading>
                    <Text color={textColorSecondary}>Track and manage inventory purchases</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), supplierId: '', productId: '', quantity: 0, unitPrice: 0, total: 0, status: 'Pending' }); onOpen(); }}>
                    Add Purchase
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Purchases" value={stats.total} icon={MdShoppingCart} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Pending" value={stats.pending} icon={MdShoppingCart} colorScheme="orange" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Completed" value={stats.completed} icon={MdShoppingCart} colorScheme="green" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Amount" value={`Rs. ${stats.totalAmount.toLocaleString()}`} icon={MdShoppingCart} colorScheme="purple" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search purchases..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Supplier</Th>
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
                            ) : purchases.length === 0 ? (
                                <Tr><Td colSpan={8} textAlign="center">No purchases found</Td></Tr>
                            ) : purchases.filter(p => getProductName(p.productId).toLowerCase().includes(search.toLowerCase()) || getSupplierName(p.supplierId).toLowerCase().includes(search.toLowerCase())).map((purchase) => (
                                <Tr key={purchase.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{new Date(purchase.date).toLocaleDateString()}</Td>
                                    <Td>{getSupplierName(purchase.supplierId)}</Td>
                                    <Td><Text fontWeight="600">{getProductName(purchase.productId)}</Text></Td>
                                    <Td isNumeric>{purchase.quantity}</Td>
                                    <Td isNumeric>Rs. {Number(purchase.unitPrice).toLocaleString()}</Td>
                                    <Td isNumeric>Rs. {Number(purchase.total).toLocaleString()}</Td>
                                    <Td><Badge colorScheme={purchase.status === 'Completed' ? 'green' : 'orange'}>{purchase.status}</Badge></Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(purchase); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(purchase.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Purchase' : 'Add Purchase'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date ? new Date(form.date).toISOString().slice(0, 10) : ''} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Supplier</FormLabel>
                            <Select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
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
                                <option value="Completed">Completed</option>
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
