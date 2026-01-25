import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, Badge, Text, Heading, useColorModeValue,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
    FormControl, FormLabel, Input, Select, Textarea, useDisclosure
} from '@chakra-ui/react';
import { MdAdd } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { hrEmployeesApi, leaveApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function LeaveRequests() {
    const { campusId } = useAuth();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employeeName: '',
        employeeId: '',
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    useEffect(() => { fetchLeaves(); }, [campusId]);

    useEffect(() => {
        const run = async () => {
            try {
                const rows = await hrEmployeesApi.list({ campusId });
                setEmployees(Array.isArray(rows) ? rows : []);
            } catch (e) {
                setEmployees([]);
            }
        };
        run();
    }, [campusId]);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const data = await leaveApi.list({ campusId });
            setLeaves(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        try {
            if (!formData.employeeId) {
                toast({ title: 'Please select an employee', status: 'warning' });
                return;
            }
            await leaveApi.create({ ...formData, campusId, employeeId: Number(formData.employeeId) });
            toast({ title: 'Leave Requested', status: 'success' });
            onClose();
            fetchLeaves();
        } catch (e) { toast({ title: 'Error', status: 'error' }); }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') await leaveApi.approve(id);
            else await leaveApi.reject(id, 'Admin Action');
            fetchLeaves();
            toast({ title: `Leave ${action}d`, status: 'success' });
        } catch (e) { toast({ title: 'Error', status: 'error' }); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex justify='space-between' align='center' mb='20px'>
                <Heading color={textColor} fontSize='2xl'>Leave Management</Heading>
                <Button leftIcon={<MdAdd />} variant='brand' onClick={onOpen}>Apply Leave</Button>
            </Flex>
            <Card p='20px'>
                <Table variant='simple'>
                    <Thead><Tr><Th>Employee</Th><Th>Type</Th><Th>From</Th><Th>To</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
                    <Tbody>
                        {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> : leaves.map(l => (
                            <Tr key={l.id}>
                                <Td>{l.employeeName}</Td>
                                <Td>{l.leaveType}</Td>
                                <Td>{new Date(l.startDate).toLocaleDateString()}</Td>
                                <Td>{new Date(l.endDate).toLocaleDateString()}</Td>
                                <Td><Badge colorScheme={l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'yellow'}>{l.status}</Badge></Td>
                                <Td>
                                    {l.status === 'Pending' && (
                                        <Flex gap={2}>
                                            <Button size='xs' colorScheme='green' onClick={() => handleAction(l.id, 'approve')}>Approve</Button>
                                            <Button size='xs' colorScheme='red' onClick={() => handleAction(l.id, 'reject')}>Reject</Button>
                                        </Flex>
                                    )}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Apply for Leave</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>Employee Name</FormLabel>
                            <Select
                                placeholder="Select Employee"
                                value={formData.employeeId || ''}
                                onChange={(e) => {
                                    const id = e.target.value;
                                    const emp = employees.find((x) => String(x.id) === String(id));
                                    setFormData((p) => ({
                                        ...p,
                                        employeeId: id,
                                        employeeName: emp?.name || '',
                                    }));
                                }}
                            >
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}{emp.designation ? ` (${emp.designation})` : ''}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Type</FormLabel>
                            <Select value={formData.leaveType} onChange={e => setFormData({ ...formData, leaveType: e.target.value })}>
                                <option value='Casual'>Casual</option>
                                <option value='Sick'>Sick</option>
                                <option value='Annual'>Annual</option>
                            </Select>
                        </FormControl>
                        <Flex gap={2} mb={3}>
                            <FormControl>
                                <FormLabel>Start Date</FormLabel>
                                <Input type='date' value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>End Date</FormLabel>
                                <Input type='date' value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                            </FormControl>
                        </Flex>
                        <FormControl mb={3}>
                            <FormLabel>Reason</FormLabel>
                            <Textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>Submit Request</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
