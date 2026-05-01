import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, Badge, Textarea, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdEvent } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { eventsApi } from '../../../../services/moduleApis';
import { campusesApi } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Events() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [events, setEvents] = useState([]);
    const [campuses, setCampuses] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', title: '', date: '', category: 'Academic', campusId: null, participants: '', description: '', status: 'Planned' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
    const rowHoverBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        fetchEvents();
    }, [campusId]);

    useEffect(() => {
        campusesApi
            .list({ pageSize: 100 })
            .then((res) => setCampuses(res?.rows || []))
            .catch(() => setCampuses([]));
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // Super admin (no campusId) sees ALL events; branch users see their campus + all-campus events
            const data = await eventsApi.list({ campusId: campusId || undefined });
            setEvents(data || []);
        } catch (error) {
            toast({ title: 'Error fetching events', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Require campus selection when in All Campuses mode
            if (!campusId && !form.campusId) {
                toast({
                    title: 'Campus Required',
                    description: 'Please select a campus for this event',
                    status: 'warning',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }
            
            const selectedCampusId = form.campusId === 'all' ? 0 : (form.campusId || campusId);
            const payload = { ...form, campusId: selectedCampusId };
            delete payload.id;
            if (payload.date && /^\d{4}-\d{2}-\d{2}$/.test(String(payload.date))) {
                payload.date = new Date(`${payload.date}T00:00:00.000Z`).toISOString();
            }

            if (form.id) {
                await eventsApi.update(form.id, payload);
                toast({ title: 'Event updated', status: 'success' });
            } else {
                await eventsApi.create(payload);
                toast({ title: 'Event created', status: 'success' });
            }
            fetchEvents();
            onClose();
        } catch (error) {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Error saving event';
            toast({ title: 'Error saving event', description: msg, status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventsApi.delete(id);
                toast({ title: 'Event deleted', status: 'success' });
                fetchEvents();
            } catch (error) {
                toast({ title: 'Error deleting event', status: 'error' });
            }
        }
    };

    const stats = {
        total: events.length,
        upcoming: events.filter(e => e.status === 'Upcoming').length,
        planned: events.filter(e => e.status === 'Planned').length,
        completed: events.filter(e => e.status === 'Completed').length,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Event Management</Heading>
                    <Text color={textColorSecondary}>Create and manage school events</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', title: '', date: '', category: 'Academic', campusId: campusId || '', participants: '', description: '', status: 'Planned' }); onOpen(); }}>
                    Create Event
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Events" value={stats.total} icon={MdEvent} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Upcoming" value={stats.upcoming} icon={MdEvent} colorScheme="orange" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Planned" value={stats.planned} icon={MdEvent} colorScheme="purple" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Completed" value={stats.completed} icon={MdEvent} colorScheme="green" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Event Title</Th>
                                <Th>Date</Th>
                                <Th>Category</Th>
                                <Th>Campus</Th>
                                <Th>Participants</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : events.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center">No events found</Td></Tr>
                            ) : events.filter(e => e.title?.toLowerCase().includes(search.toLowerCase())).map((event) => (
                                <Tr key={event.id} _hover={{ bg: rowHoverBg }}>
                                    <Td><Text fontWeight="600">{event.title}</Text></Td>
                                    <Td>{event.date}</Td>
                                    <Td>{event.category}</Td>
                                    <Td>{event.campusId === 0 ? 'All Campuses' : (event.campusName || (campuses.find(c => String(c.id) === String(event.campusId)) || {}).name || '—')}</Td>
                                    <Td>{event.participants}</Td>
                                    <Td><Badge colorScheme={event.status === 'Completed' ? 'green' : event.status === 'Upcoming' ? 'orange' : 'blue'}>{event.status}</Badge></Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm({ ...event, campusId: event.campusId || campusId || null }); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(event.id)} />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{form.id ? 'Edit Event' : 'Create Event'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Event Title</FormLabel>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Category</FormLabel>
                            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                <option value="Academic">Academic</option>
                                <option value="Sports">Sports</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Social">Social</option>
                                <option value="Other">Other</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3} isRequired={!campusId}>
                            <FormLabel>Campus</FormLabel>
                            <Select
                                placeholder="Select campus"
                                value={form.campusId || ''}
                                onChange={(e) => setForm({ ...form, campusId: e.target.value === 'all' ? 'all' : e.target.value ? Number(e.target.value) : null })}
                            >
                                <option value="all">All Campuses</option>
                                {campuses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Select>
                            {!campusId && <FormHelperText color="orange.500">Please select a campus (required in All Campuses mode)</FormHelperText>}
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Expected Participants</FormLabel>
                            <Input value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Description</FormLabel>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Status</FormLabel>
                            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="Planned">Planned</option>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Ongoing">Ongoing</option>
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
