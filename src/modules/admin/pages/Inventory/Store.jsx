import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Textarea, useToast, Badge, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdStore } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { storeApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Store() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [stores, setStores] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', name: '', location: '', capacity: '', inCharge: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchStores();
    }, [campusId]);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const data = await storeApi.list({ campusId });
            setStores(data || []);
        } catch (error) {
            toast({ title: 'Error fetching stores', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await storeApi.update(form.id, { ...form, campusId });
                toast({ title: 'Store updated', status: 'success' });
            } else {
                await storeApi.create({ ...form, campusId });
                toast({ title: 'Store added', status: 'success' });
            }
            fetchStores();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving store', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this store?')) {
            try {
                await storeApi.delete(id);
                toast({ title: 'Store deleted', status: 'success' });
                fetchStores();
            } catch (error) {
                toast({ title: 'Error deleting store', status: 'error' });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Store Management</Heading>
                    <Text color={textColorSecondary}>Manage warehouse and storage locations</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', name: '', location: '', capacity: '', inCharge: '' }); onOpen(); }}>
                    Add Store
                </Button>
            </Flex>

            <Box mb={5}>
                <StatCard title="Total Stores" value={stores.length} icon={MdStore} colorScheme="teal" />
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search stores..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Store Name</Th>
                                <Th>Location</Th>
                                <Th>Capacity</Th>
                                <Th>In-Charge</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={5} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : stores.length === 0 ? (
                                <Tr><Td colSpan={5} textAlign="center">No stores found</Td></Tr>
                            ) : stores.filter(s => s.name?.toLowerCase().includes(search.toLowerCase())).map((store) => (
                                <Tr key={store.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td><Text fontWeight="600">{store.name}</Text></Td>
                                    <Td>{store.location}</Td>
                                    <Td>{store.capacity}</Td>
                                    <Td>{store.inCharge}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(store); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(store.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Store' : 'Add Store'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Store Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Location</FormLabel>
                            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Capacity</FormLabel>
                            <Input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>In-Charge</FormLabel>
                            <Input value={form.inCharge} onChange={(e) => setForm({ ...form, inCharge: e.target.value })} />
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
