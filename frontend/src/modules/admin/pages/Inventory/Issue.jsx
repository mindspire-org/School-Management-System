import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, NumberInput, NumberInputField, Badge, Textarea, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdAssignment } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { issueApi, productApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Issue() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [issues, setIssues] = useState([]);
    const [products, setProducts] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', department: '', productId: '', quantity: 0, issuedTo: '', purpose: '', status: 'Issued', returnDate: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchData();
    }, [campusId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [issuesData, productsData] = await Promise.all([
                issueApi.list({ campusId }),
                productApi.list({ campusId })
            ]);
            setIssues(issuesData || []);
            setProducts(productsData || []);
        } catch (error) {
            toast({ title: 'Error fetching data', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const updatedForm = { ...form, campusId };
            if (form.id) {
                await issueApi.update(form.id, updatedForm);
                toast({ title: 'Issue updated', status: 'success' });
            } else {
                await issueApi.create(updatedForm);
                toast({ title: 'Issue added', status: 'success' });
            }
            fetchData();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving issue', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this issue record?')) {
            try {
                await issueApi.delete(id);
                toast({ title: 'Issue deleted', status: 'success' });
                fetchData();
            } catch (error) {
                toast({ title: 'Error deleting issue', status: 'error' });
            }
        }
    };

    const getProductName = (id) => products.find(p => String(p.id) === String(id))?.name || 'Unknown';

    const stats = {
        total: issues.length,
        issued: issues.filter(i => i.status === 'Issued').length,
        returned: issues.filter(i => i.status === 'Returned').length,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Issue Management</Heading>
                    <Text color={textColorSecondary}>Track item issuance and returns</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), department: '', productId: '', quantity: 0, issuedTo: '', purpose: '', status: 'Issued', returnDate: '' }); onOpen(); }}>
                    Issue Item
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Issues" value={stats.total} icon={MdAssignment} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Currently Issued" value={stats.issued} icon={MdAssignment} colorScheme="orange" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Returned" value={stats.returned} icon={MdAssignment} colorScheme="green" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search issues..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Department</Th>
                                <Th>Product</Th>
                                <Th isNumeric>Quantity</Th>
                                <Th>Issued To</Th>
                                <Th>Status</Th>
                                <Th>Return Date</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={8} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : issues.length === 0 ? (
                                <Tr><Td colSpan={8} textAlign="center">No issues found</Td></Tr>
                            ) : issues.filter(i => getProductName(i.productId).toLowerCase().includes(search.toLowerCase()) || i.issuedTo?.toLowerCase().includes(search.toLowerCase())).map((issue) => (
                                <Tr key={issue.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{new Date(issue.date).toLocaleDateString()}</Td>
                                    <Td>{issue.department}</Td>
                                    <Td><Text fontWeight="600">{getProductName(issue.productId)}</Text></Td>
                                    <Td isNumeric>{issue.quantity}</Td>
                                    <Td>{issue.issuedTo}</Td>
                                    <Td><Badge colorScheme={issue.status === 'Returned' ? 'green' : 'orange'}>{issue.status}</Badge></Td>
                                    <Td>{issue.returnDate || '-'}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(issue); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(issue.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Issue' : 'Issue Item'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date ? new Date(form.date).toISOString().slice(0, 10) : ''} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Department</FormLabel>
                            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
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
                            <FormLabel>Issued To</FormLabel>
                            <Input value={form.issuedTo} onChange={(e) => setForm({ ...form, issuedTo: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Purpose</FormLabel>
                            <Textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={2} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Status</FormLabel>
                            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="Issued">Issued</option>
                                <option value="Returned">Returned</option>
                            </Select>
                        </FormControl>
                        {form.status === 'Returned' && (
                            <FormControl mb={3}>
                                <FormLabel>Return Date</FormLabel>
                                <Input type="date" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} />
                            </FormControl>
                        )}
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
