import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, Badge, Textarea, Spinner
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdSchool } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { admissionEnquiryApi, studentApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AdmissionEnquiry() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [enquiries, setEnquiries] = useState([]);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', date: '', studentId: '', studentName: '', parentName: '', contact: '', email: '', class: '', status: 'Pending', notes: '', followUpDate: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    const pickFirst = (...values) => values.find((v) => v !== undefined && v !== null && String(v).trim() !== '');

    const studentToAutoFields = (s) => {
        if (!s) return {};

        const parentName = pickFirst(
            s.parentName,
            s.fatherName,
            s.guardianName,
            s.parent_name,
            s.father_name,
            s.guardian_name
        );
        const contact = pickFirst(
            s.contact,
            s.phone,
            s.mobile,
            s.parentPhone,
            s.fatherPhone,
            s.guardianPhone,
            s.parent_phone,
            s.father_phone,
            s.guardian_phone
        );
        const email = pickFirst(s.email, s.studentEmail, s.parentEmail, s.parent_email);

        const cls = pickFirst(
            s.class,
            s.className,
            s.class_name,
            s.grade,
            s.classGrade,
            s.class_grade
        );
        const section = pickFirst(s.section, s.classSection, s.class_section);
        const classLabel = pickFirst(section ? `${cls} ${section}` : cls);

        return {
            parentName,
            contact,
            email,
            class: classLabel,
        };
    };

    useEffect(() => {
        fetchEnquiries();
    }, [campusId]);

    useEffect(() => {
        if (!isOpen) return;
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, campusId]);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const data = await admissionEnquiryApi.list({ campusId });
            setEnquiries(data || []);
        } catch (error) {
            toast({ title: 'Error fetching enquiries', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const data = await studentApi.list({ campusId });
            const list = data?.items || data?.rows || data || [];
            setStudents(Array.isArray(list) ? list : []);
        } catch (_) {
            setStudents([]);
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (form.id) {
                await admissionEnquiryApi.update(form.id, { ...form, campusId });
                toast({ title: 'Enquiry updated', status: 'success' });
            } else {
                await admissionEnquiryApi.create({ ...form, campusId });
                toast({ title: 'Enquiry added', status: 'success' });
            }
            fetchEnquiries();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving enquiry', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this enquiry?')) {
            try {
                await admissionEnquiryApi.delete(id);
                toast({ title: 'Enquiry deleted', status: 'success' });
                fetchEnquiries();
            } catch (error) {
                toast({ title: 'Error deleting enquiry', status: 'error' });
            }
        }
    };

    const stats = {
        total: enquiries.length,
        pending: enquiries.filter(e => e.status === 'Pending').length,
        contacted: enquiries.filter(e => e.status === 'Contacted').length,
        admitted: enquiries.filter(e => e.status === 'Admitted').length,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Admission Enquiry</Heading>
                    <Text color={textColorSecondary}>Manage prospective student enquiries</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', date: new Date().toISOString().slice(0, 10), studentId: '', studentName: '', parentName: '', contact: '', email: '', class: '', status: 'Pending', notes: '', followUpDate: '' }); onOpen(); }}>
                    Add Enquiry
                </Button>
            </Flex>

            <Box overflowX="auto" mb={5}>
                <Flex gap={5} wrap="nowrap">
                    <Box minW="240px" flex={1}>
                        <StatCard title="Total Enquiries" value={stats.total} icon={MdSchool} colorScheme="blue" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Pending" value={stats.pending} icon={MdSchool} colorScheme="orange" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Contacted" value={stats.contacted} icon={MdSchool} colorScheme="purple" />
                    </Box>
                    <Box minW="240px" flex={1}>
                        <StatCard title="Admitted" value={stats.admitted} icon={MdSchool} colorScheme="green" />
                    </Box>
                </Flex>
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search enquiries..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Date</Th>
                                <Th>Student Name</Th>
                                <Th>Parent Name</Th>
                                <Th>Contact</Th>
                                <Th>Class</Th>
                                <Th>Status</Th>
                                <Th>Follow-up</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={8} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : enquiries.length === 0 ? (
                                <Tr><Td colSpan={8} textAlign="center">No enquiries found</Td></Tr>
                            ) : enquiries.filter(e => e.studentName?.toLowerCase().includes(search.toLowerCase()) || e.parentName?.toLowerCase().includes(search.toLowerCase())).map((enquiry) => (
                                <Tr key={enquiry.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td>{enquiry.date}</Td>
                                    <Td><Text fontWeight="600">{enquiry.studentName}</Text></Td>
                                    <Td>{enquiry.parentName}</Td>
                                    <Td>{enquiry.contact}</Td>
                                    <Td>{enquiry.class}</Td>
                                    <Td><Badge colorScheme={enquiry.status === 'Admitted' ? 'green' : enquiry.status === 'Contacted' ? 'purple' : enquiry.status === 'Rejected' ? 'red' : 'orange'}>{enquiry.status}</Badge></Td>
                                    <Td>{enquiry.followUpDate}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(enquiry); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(enquiry.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Enquiry' : 'Add Enquiry'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Date</FormLabel>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Student Name</FormLabel>
                            <Select
                                placeholder={studentsLoading ? 'Loading students...' : 'Select student'}
                                value={form.studentId || ''}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const selected = (students || []).find((s) => String(s?.id) === String(id));
                                    const auto = studentToAutoFields(selected);
                                    setForm({
                                        ...form,
                                        studentId: id,
                                        studentName: selected?.name || selected?.studentName || selected?.fullName || form.studentName,
                                        parentName: auto.parentName ?? form.parentName,
                                        contact: auto.contact ?? form.contact,
                                        email: auto.email ?? form.email,
                                        class: auto.class ?? form.class,
                                    });
                                }}
                                isDisabled={studentsLoading}
                                mb={2}
                            >
                                {(students || []).map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name || s.studentName || s.fullName || s.id}
                                    </option>
                                ))}
                            </Select>
                            <Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Student name" />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Parent Name</FormLabel>
                            <Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
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
                            <FormLabel>Class</FormLabel>
                            <Input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Status</FormLabel>
                            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <option value="Pending">Pending</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Admitted">Admitted</option>
                                <option value="Rejected">Rejected</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Follow-up Date</FormLabel>
                            <Input type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Notes</FormLabel>
                            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
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
