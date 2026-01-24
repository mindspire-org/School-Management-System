import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, Badge, Textarea, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdWarning } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { complaintApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function Complaint() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [complaints, setComplaints] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', complainant: '', contact: '', category: 'Facilities', priority: 'Medium', subject: '', description: '', status: 'Pending', assignedTo: '', resolution: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchComplaints();
    }, [campusId]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const data = await complaintApi.list({ campusId });
            setComplaints(data || []);
        } catch (error) {
            toast({ title: 'Error fetching complaints', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await complaintApi.update(form.id, { ...form, campusId });
                toast({ title: 'Complaint updated', status: 'success' });
            } else {
                await complaintApi.create({ ...form, campusId });
                toast({ title: 'Complaint added', status: 'success' });
            }
            fetchComplaints();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving complaint', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this complaint?')) {
            try {
                await complaintApi.delete(id);
                toast({ title: 'Complaint deleted', status: 'success' });
                fetchComplaints();
            } catch (error) {
                toast({ title: 'Error deleting complaint', status: 'error' });
            }
        }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Complaint Management</Heading>
                    <Text color={textColorSecondary}>Track and resolve complaints</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), complainant: '', contact: '', category: 'Facilities', priority: 'Medium', subject: '', description: '', status: 'Pending', assignedTo: '', resolution: '' }); onOpen(); }}>
                    Add Complaint
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Complaints" value={stats.total} icon={MdWarning} colorScheme="red" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Pending" value={stats.pending} icon={MdWarning} colorScheme="orange" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="In Progress" value={stats.inProgress} icon={MdWarning} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Resolved" value={stats.resolved} icon={MdWarning} colorScheme="green" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Complainant</Th>
                                <Th>Category</Th>
                                <Th>Priority</Th>
                                <Th>Subject</Th>
                                <Th>Status</Th>
                                <Th>Assigned To</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={8} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : complaints.length === 0 ? (
                                <Tr><Td colSpan={8} textAlign="center">No complaints found</Td></Tr>
                            ) : complaints.filter(c => c.subject?.toLowerCase().includes(search.toLowerCase()) || c.complainant?.toLowerCase().includes(search.toLowerCase())).map((complaint) => (
                                <Tr key={complaint.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{complaint.date}</Td>
                                    <Td>{complaint.complainant}</Td>
                                    <Td>{complaint.category}</Td>
                                    <Td><Badge colorScheme={complaint.priority === 'High' ? 'red' : complaint.priority === 'Medium' ? 'orange' : 'blue'}>{complaint.priority}</Badge></Td>
                                    <Td><Text fontWeight="600">{complaint.subject}</Text></Td>
                                    <Td><Badge colorScheme={complaint.status === 'Resolved' ? 'green' : complaint.status === 'In Progress' ? 'blue' : 'orange'}>{complaint.status}</Badge></Td>
                                    <Td>{complaint.assignedTo}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(complaint); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(complaint.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Complaint' : 'Add Complaint'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Complainant</FormLabel>
                            <Input value={form.complainant} onChange={(e) => setForm({ ...form, complainant: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Contact</FormLabel>
                            <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Category</FormLabel>
                            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                <option value="Facilities">Facilities</option>
                                <option value="Administration">Administration</option>
                                <option value="Academic">Academic</option>
                                <option value="Transport">Transport</option>
                                <option value="Other">Other</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Priority</FormLabel>
                            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Subject</FormLabel>
                            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Description</FormLabel>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Status</FormLabel>
                            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Assigned To</FormLabel>
                            <Input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
                        </FormControl>
                        {form.status === 'Resolved' && (
                            <FormControl mb={3}>
                                <FormLabel>Resolution</FormLabel>
                                <Textarea value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} rows={2} />
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
