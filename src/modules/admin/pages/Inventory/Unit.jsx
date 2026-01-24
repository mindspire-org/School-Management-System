import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, NumberInput, NumberInputField, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdStraighten } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { unitApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Unit() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [units, setUnits] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', name: '', symbol: '', conversionRate: 1 });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchUnits();
    }, [campusId]);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const data = await unitApi.list({ campusId });
            setUnits(data || []);
        } catch (error) {
            toast({ title: 'Error fetching units', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await unitApi.update(form.id, { ...form, campusId });
                toast({ title: 'Unit updated', status: 'success' });
            } else {
                await unitApi.create({ ...form, campusId });
                toast({ title: 'Unit added', status: 'success' });
            }
            fetchUnits();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving unit', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this unit?')) {
            try {
                await unitApi.delete(id);
                toast({ title: 'Unit deleted', status: 'success' });
                fetchUnits();
            } catch (error) {
                toast({ title: 'Error deleting unit', status: 'error' });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Unit Management</Heading>
                    <Text color={textColorSecondary}>Manage units of measurement</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', name: '', symbol: '', conversionRate: 1 }); onOpen(); }}>
                    Add Unit
                </Button>
            </Flex>

            <Box mb={5}>
                <StatCard title="Total Units" value={units.length} icon={MdStraighten} colorScheme="orange" />
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search units..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Unit Name</Th>
                                <Th>Symbol</Th>
                                <Th isNumeric>Conversion Rate</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={4} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : units.length === 0 ? (
                                <Tr><Td colSpan={4} textAlign="center">No units found</Td></Tr>
                            ) : units.filter(u => u.name?.toLowerCase().includes(search.toLowerCase())).map((unit) => (
                                <Tr key={unit.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td><Text fontWeight="600">{unit.name}</Text></Td>
                                    <Td>{unit.symbol}</Td>
                                    <Td isNumeric>{unit.conversionRate}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(unit); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(unit.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Unit' : 'Add Unit'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Unit Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Symbol</FormLabel>
                            <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Conversion Rate</FormLabel>
                            <NumberInput value={form.conversionRate} min={0} onChange={(v) => setForm({ ...form, conversionRate: Number(v) || 1 })}>
                                <NumberInputField />
                            </NumberInput>
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
