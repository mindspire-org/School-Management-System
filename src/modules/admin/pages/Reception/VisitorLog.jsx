import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Textarea, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdPerson } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { visitorLogApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function VisitorLog() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [visitors, setVisitors] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', name: '', contact: '', idType: 'CNIC', idNumber: '', purpose: '', personToMeet: '', checkIn: '', checkOut: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchVisitors();
    }, [campusId]);

    const fetchVisitors = async () => {
        setLoading(true);
        try {
            const data = await visitorLogApi.list({ campusId });
            setVisitors(data || []);
        } catch (error) {
            toast({ title: 'Error fetching visitor logs', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await visitorLogApi.update(form.id, { ...form, campusId });
                toast({ title: 'Visitor log updated', status: 'success' });
            } else {
                await visitorLogApi.create({ ...form, campusId });
                toast({ title: 'Visitor log added', status: 'success' });
            }
            fetchVisitors();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving visitor log', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this visitor log?')) {
            try {
                await visitorLogApi.delete(id);
                toast({ title: 'Visitor log deleted', status: 'success' });
                fetchVisitors();
            } catch (error) {
                toast({ title: 'Error deleting visitor log', status: 'error' });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Visitor Log</Heading>
                    <Text color={textColorSecondary}>Track all campus visitors</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), name: '', contact: '', idType: 'CNIC', idNumber: '', purpose: '', personToMeet: '', checkIn: '', checkOut: '' }); onOpen(); }}>
                    Add Visitor
                </Button>
            </Flex>

            <Box mb={5}>
                <StatCard title="Total Visitors" value={visitors.length} icon={MdPerson} colorScheme="cyan" />
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search visitors..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Name</Th>
                                <Th>Contact</Th>
                                <Th>Purpose</Th>
                                <Th>Person to Meet</Th>
                                <Th>Check-in</Th>
                                <Th>Check-out</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={8} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : visitors.length === 0 ? (
                                <Tr><Td colSpan={8} textAlign="center">No visitor logs found</Td></Tr>
                            ) : visitors.filter(v => v.name?.toLowerCase().includes(search.toLowerCase())).map((visitor) => (
                                <Tr key={visitor.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{visitor.date}</Td>
                                    <Td><Text fontWeight="600">{visitor.name}</Text></Td>
                                    <Td>{visitor.contact}</Td>
                                    <Td>{visitor.purpose}</Td>
                                    <Td>{visitor.personToMeet}</Td>
                                    <Td>{visitor.checkIn}</Td>
                                    <Td>{visitor.checkOut || 'In Progress'}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(visitor); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(visitor.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Visitor Log' : 'Add Visitor'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Visitor Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Contact Number</FormLabel>
                            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>ID Number</FormLabel>
                            <Input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} placeholder="CNIC or other ID" />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Purpose of Visit</FormLabel>
                            <Textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={2} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Person to Meet</FormLabel>
                            <Input value={form.personToMeet} onChange={(e) => setForm({ ...form, personToMeet: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Check-in Time</FormLabel>
                            <Input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Check-out Time</FormLabel>
                            <Input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
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
