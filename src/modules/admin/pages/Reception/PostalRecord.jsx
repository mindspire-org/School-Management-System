import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, Badge, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdMail } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { postalRecordApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function PostalRecord() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [records, setRecords] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', type: 'Incoming', sender: '', recipient: '', subject: '', trackingNumber: '', status: 'Pending' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchRecords();
    }, [campusId]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const data = await postalRecordApi.list({ campusId });
            setRecords(data || []);
        } catch (error) {
            toast({ title: 'Error fetching records', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await postalRecordApi.update(form.id, { ...form, campusId });
                toast({ title: 'Record updated', status: 'success' });
            } else {
                await postalRecordApi.create({ ...form, campusId });
                toast({ title: 'Record added', status: 'success' });
            }
            fetchRecords();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving record', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await postalRecordApi.delete(id);
                toast({ title: 'Record deleted', status: 'success' });
                fetchRecords();
            } catch (error) {
                toast({ title: 'Error deleting record', status: 'error' });
            }
        }
    };

    const stats = {
        total: records.length,
        incoming: records.filter(r => r.type === 'Incoming').length,
        outgoing: records.filter(r => r.type === 'Outgoing').length,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Postal Record</Heading>
                    <Text color={textColorSecondary}>Track incoming and outgoing mail</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), type: 'Incoming', sender: '', recipient: '', subject: '', trackingNumber: '', status: 'Pending' }); onOpen(); }}>
                    Add Record
                </Button>
            </Flex>

            <Box mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Records" value={stats.total} icon={MdMail} colorScheme="teal" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Incoming" value={stats.incoming} icon={MdMail} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Outgoing" value={stats.outgoing} icon={MdMail} colorScheme="purple" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Type</Th>
                                <Th>Sender</Th>
                                <Th>Recipient</Th>
                                <Th>Subject</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : records.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center">No postal records found</Td></Tr>
                            ) : records.filter(r => r.subject?.toLowerCase().includes(search.toLowerCase())).map((record) => (
                                <Tr key={record.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{record.date}</Td>
                                    <Td><Badge colorScheme={record.type === 'Incoming' ? 'blue' : 'purple'}>{record.type}</Badge></Td>
                                    <Td>{record.sender}</Td>
                                    <Td>{record.recipient}</Td>
                                    <Td><Text fontWeight="600">{record.subject}</Text></Td>
                                    <Td><Badge colorScheme={record.status === 'Delivered' || record.status === 'Sent' ? 'green' : 'orange'}>{record.status}</Badge></Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(record); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(record.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Record' : 'Add Record'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Type</FormLabel>
                            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <option value="Incoming">Incoming</option>
                                <option value="Outgoing">Outgoing</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Sender</FormLabel>
                            <Input value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Recipient</FormLabel>
                            <Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Subject</FormLabel>
                            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Tracking Number</FormLabel>
                            <Input value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Status</FormLabel>
                            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="Pending">Pending</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Sent">Sent</option>
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
