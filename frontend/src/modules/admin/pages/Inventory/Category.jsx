import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Textarea, useToast, Spinner, Badge,
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdCategory } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { categoryApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Category() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', name: '', description: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchCategories();
    }, [campusId]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryApi.list({ campusId });
            setCategories(data || []);
        } catch (error) {
            toast({ title: 'Error fetching categories', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await categoryApi.update(form.id, { ...form, campusId });
                toast({ title: 'Category updated', status: 'success' });
            } else {
                await categoryApi.create({ ...form, campusId });
                toast({ title: 'Category added', status: 'success' });
            }
            fetchCategories();
            onClose();
        } catch (error) {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Error saving category';
            toast({ title: 'Error saving category', description: msg, status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will affect all products in this category.')) {
            try {
                await categoryApi.delete(id);
                toast({ title: 'Category deleted', status: 'success' });
                fetchCategories();
            } catch (error) {
                toast({ title: 'Error deleting category', status: 'error' });
            }
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Category Management</Heading>
                    <Text color={textColorSecondary}>Organize products into categories</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', name: '', description: '' }); onOpen(); }}>
                    Add Category
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Categories" value={categories.length} icon={MdCategory} colorScheme="purple" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Products" value={categories.reduce((sum, c) => sum + (c.productCount || 0), 0)} icon={MdCategory} colorScheme="blue" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Description</Th>
                                <Th isNumeric>Products</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={4} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : filteredCategories.length === 0 ? (
                                <Tr><Td colSpan={4} textAlign="center">No categories found</Td></Tr>
                            ) : filteredCategories.map((category) => (
                                <Tr key={category.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td><Text fontWeight="600">{category.name}</Text></Td>
                                    <Td>{category.description}</Td>
                                    <Td isNumeric><Badge colorScheme="blue">{category.productCount || 0}</Badge></Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(category); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(category.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Category' : 'Add Category'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Category Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Description</FormLabel>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
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
