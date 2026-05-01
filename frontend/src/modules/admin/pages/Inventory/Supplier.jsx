import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdPerson } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { supplierApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Supplier() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [suppliers, setSuppliers] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', name: '', contact: '', email: '', address: '', paymentTerms: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchSuppliers();
    }, [campusId]);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const data = await supplierApi.list({ campusId });
            setSuppliers(data || []);
        } catch (error) {
            toast({ title: 'Error fetching suppliers', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await supplierApi.update(form.id, { ...form, campusId });
                toast({ title: 'Supplier updated', status: 'success' });
            } else {
                await supplierApi.create({ ...form, campusId });
                toast({ title: 'Supplier added', status: 'success' });
            }
            fetchSuppliers();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving supplier', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            try {
                await supplierApi.delete(id);
                toast({ title: 'Supplier deleted', status: 'success' });
                fetchSuppliers();
            } catch (error) {
                toast({ title: 'Error deleting supplier', status: 'error' });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Supplier Management</Heading>
                    <Text color={textColorSecondary}>Manage supplier contacts and relationships</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', name: '', contact: '', email: '', address: '', paymentTerms: '' }); onOpen(); }}>
                    Add Supplier
                </Button>
            </Flex>

            <Box mb={5}>
                <StatCard title="Total Suppliers" value={suppliers.length} icon={MdPerson} colorScheme="cyan" />
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Contact</Th>
                                <Th>Email</Th>
                                <Th>Address</Th>
                                <Th>Payment Terms</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={6} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : suppliers.length === 0 ? (
                                <Tr><Td colSpan={6} textAlign="center">No suppliers found</Td></Tr>
                            ) : suppliers.filter(s => s.name?.toLowerCase().includes(search.toLowerCase())).map((supplier) => (
                                <Tr key={supplier.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td><Text fontWeight="600">{supplier.name}</Text></Td>
                                    <Td>{supplier.contact}</Td>
                                    <Td>{supplier.email}</Td>
                                    <Td>{supplier.address}</Td>
                                    <Td>{supplier.paymentTerms}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(supplier); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(supplier.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Supplier' : 'Add Supplier'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Supplier Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Contact Number</FormLabel>
                            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Email</FormLabel>
                            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Address</FormLabel>
                            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Payment Terms</FormLabel>
                            <Input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="e.g., Net 30" />
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
