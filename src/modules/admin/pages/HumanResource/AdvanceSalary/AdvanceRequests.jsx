import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Button,
    useToast,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Text,
    Heading,
    useColorModeValue,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    ModalFooter,
    useDisclosure,
} from '@chakra-ui/react';
import { MdAdd, MdCheck, MdClose } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { advanceSalaryApi, hrEmployeesApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function AdvanceRequests() {
    const { user, campusId } = useAuth();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    const [formData, setFormData] = useState({
        employeeName: '',
        employeeId: '',
        amount: '',
        reason: '',
    });

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    useEffect(() => {
        fetchRequests();
        fetchEmployees();
    }, [campusId]);

    const fetchEmployees = async () => {
        try {
            const rows = await hrEmployeesApi.list({ campusId });
            setEmployees(Array.isArray(rows) ? rows : []);
        } catch (e) {
            setEmployees([]);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await advanceSalaryApi.list({ campusId });
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!formData.employeeId) {
                toast({ title: 'Please select an employee', status: 'warning' });
                return;
            }
            await advanceSalaryApi.create({ ...formData, campusId, employeeId: Number(formData.employeeId) });
            toast({ title: 'Request Submitted', status: 'success' });
            onClose();
            fetchRequests();
        } catch (error) {
            toast({ title: 'Error', status: 'error' });
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            if (status === 'Approved') await advanceSalaryApi.approve(id);
            else await advanceSalaryApi.reject(id, 'Admin Rejected');
            toast({ title: `Request ${status}`, status: 'success' });
            fetchRequests();
        } catch (error) {
            toast({ title: 'Error updating status', status: 'error' });
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex justifyContent='space-between' align='center' mb='20px'>
                <Heading color={textColor} fontSize='2xl'>Advance Salary Requests</Heading>
                <Button leftIcon={<MdAdd />} variant='brand' onClick={onOpen}>New Request</Button>
            </Flex>

            <Card p='20px'>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Employee</Th>
                            <Th>Amount</Th>
                            <Th>Date</Th>
                            <Th>Reason</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {loading ? <Tr><Td colSpan={6}>Loading...</Td></Tr> : requests.map(req => (
                            <Tr key={req.id}>
                                <Td>{req.employeeName}</Td>
                                <Td>${req.amount}</Td>
                                <Td>{new Date(req.requestDate).toLocaleDateString()}</Td>
                                <Td>{req.reason}</Td>
                                <Td><Badge colorScheme={req.status === 'Approved' ? 'green' : req.status === 'Rejected' ? 'red' : 'yellow'}>{req.status}</Badge></Td>
                                <Td>
                                    {req.status === 'Pending' && (
                                        <Flex gap={2}>
                                            <Button size='sm' colorScheme='green' onClick={() => handleStatusUpdate(req.id, 'Approved')}><MdCheck /></Button>
                                            <Button size='sm' colorScheme='red' onClick={() => handleStatusUpdate(req.id, 'Rejected')}><MdClose /></Button>
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
                    <ModalHeader>Request Advance Salary</ModalHeader>
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
                            <FormLabel>Amount</FormLabel>
                            <Input type='number' value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Reason</FormLabel>
                            <Textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>Submit</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
