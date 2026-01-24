import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Textarea, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdPhone } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { callLogApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function CallLog() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [calls, setCalls] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', time: '', callerName: '', contact: '', purpose: '', notes: '', followUp: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchCalls();
    }, [campusId]);

    const fetchCalls = async () => {
        setLoading(true);
        try {
            const data = await callLogApi.list({ campusId });
            setCalls(data || []);
        } catch (error) {
            toast({ title: 'Error fetching call logs', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await callLogApi.update(form.id, { ...form, campusId });
                toast({ title: 'Call log updated', status: 'success' });
            } else {
                await callLogApi.create({ ...form, campusId });
                toast({ title: 'Call log added', status: 'success' });
            }
            fetchCalls();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving call log', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this call log?')) {
            try {
                await callLogApi.delete(id);
                toast({ title: 'Call log deleted', status: 'success' });
                fetchCalls();
            } catch (error) {
                toast({ title: 'Error deleting call log', status: 'error' });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Call Log</Heading>
                    <Text color={textColorSecondary}>Track all incoming and outgoing calls</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), time: '', callerName: '', contact: '', purpose: '', notes: '', followUp: '' }); onOpen(); }}>
                    Add Call Log
                </Button>
            </Flex>

            <Box mb={5}>
                <StatCard title="Total Calls" value={calls.length} icon={MdPhone} colorScheme="purple" />
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search calls..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Time</Th>
                                <Th>Caller Name</Th>
                                <Th>Contact</Th>
                                <Th>Purpose</Th>
                                <Th>Notes</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : calls.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center">No call logs found</Td></Tr>
                            ) : calls.filter(c => c.callerName?.toLowerCase().includes(search.toLowerCase())).map((call) => (
                                <Tr key={call.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{call.date}</Td>
                                    <Td>{call.time}</Td>
                                    <Td><Text fontWeight="600">{call.callerName}</Text></Td>
                                    <Td>{call.contact}</Td>
                                    <Td>{call.purpose}</Td>
                                    <Td maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{call.notes}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(call); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(call.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Call Log' : 'Add Call Log'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Time</FormLabel>
                            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Caller Name</FormLabel>
                            <Input value={form.callerName} onChange={(e) => setForm({ ...form, callerName: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Contact Number</FormLabel>
                            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Purpose</FormLabel>
                            <Input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Notes</FormLabel>
                            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Follow-up Required</FormLabel>
                            <Input value={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.value })} placeholder="e.g., Call back on..." />
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
