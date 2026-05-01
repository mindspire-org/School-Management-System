import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, Badge, Text, Heading, useColorModeValue,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
    FormControl, FormLabel, Input, Select, Textarea, useDisclosure
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { hrEmployeesApi, leaveApi } from '../../../../../services/moduleApis';
import { campusesApi } from '../../../../../services/api';
import { useAuth } from '../../../../../contexts/AuthContext';
import { IconButton, Tooltip, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';

export default function LeaveRequests() {
    const { campusId, user } = useAuth();
    const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'owner' || user?.role === 'branch_admin';
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [mode, setMode] = useState('add'); // 'add', 'edit', 'view'
    const [selectedId, setSelectedId] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const cancelRef = React.useRef();

    const initialForm = {
        employeeName: '',
        employeeId: '',
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
    };
    const [formData, setFormData] = useState(initialForm);
    const [campuses, setCampuses] = useState([]);

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

    useEffect(() => {
        campusesApi
            .list({ pageSize: 100 })
            .then((res) => setCampuses(res?.rows || []))
            .catch(() => setCampuses([]));
    }, []);

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
            const payload = { ...formData, campusId, employeeId: Number(formData.employeeId) };
            if (mode === 'add') {
                await leaveApi.create(payload);
                toast({ title: 'Leave Requested', status: 'success' });
            } else {
                await leaveApi.update(selectedId, payload);
                toast({ title: 'Leave Updated', status: 'success' });
            }
            onClose();
            fetchLeaves();
        } catch (e) { toast({ title: 'Error', status: 'error' }); }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') await leaveApi.approve(id);
            else if (action === 'reject') await leaveApi.reject(id, 'Admin Action');
            else if (action === 'delete') {
                await leaveApi.delete(id);
                toast({ title: 'Leave Request deleted', status: 'success' });
                setIsDeleteOpen(false);
            }
            fetchLeaves();
            if (action !== 'delete') toast({ title: `Leave ${action}d`, status: 'success' });
        } catch (e) { toast({ title: 'Error', status: 'error' }); }
    };

    const openModal = (m, item = null) => {
        setMode(m);
        if (item) {
            setSelectedId(item.id);
            setFormData({
                employeeName: item.employeeName,
                employeeId: item.employeeId,
                leaveType: item.leaveType,
                startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
                endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
                reason: item.reason || ''
            });
        } else {
            setSelectedId(null);
            setFormData(initialForm);
        }
        onOpen();
    };

    const confirmDelete = (id) => {
        setDeleteTarget(id);
        setIsDeleteOpen(true);
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex justify='space-between' align='center' mb='20px'>
                <Heading color={textColor} fontSize='2xl'>Leave Management</Heading>
                {((campusId && isSuperAdmin) || !campusId) && (
                    <Button leftIcon={<MdAdd />} variant='brand' onClick={() => openModal('add')}>Apply Leave</Button>
                )}
            </Flex>
            <Card p='20px'>
                <Table variant='simple'>
                    <Thead><Tr><Th>Employee</Th><Th>Type</Th><Th>From</Th><Th>To</Th><Th>Campus</Th><Th>Status</Th>{((campusId && isSuperAdmin) || !campusId) && <Th>Actions</Th>}</Tr></Thead>
                    <Tbody>
                        {loading ? <Tr><Td colSpan={7}>Loading...</Td></Tr> : leaves.map(l => (
                            <Tr key={l.id}>
                                <Td>{l.employeeName}</Td>
                                <Td>{l.leaveType}</Td>
                                <Td>{new Date(l.startDate).toLocaleDateString()}</Td>
                                <Td>{new Date(l.endDate).toLocaleDateString()}</Td>
                                <Td>{l.campusName || (campuses.find(c => String(c.id) === String(l.campusId)) || {}).name || '—'}</Td>
                                <Td><Badge colorScheme={l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'yellow'}>{l.status}</Badge></Td>
                                {((campusId && isSuperAdmin) || !campusId) && (
                                    <Td>
                                        <Flex gap={2}>
                                            <Tooltip label="View Details"><IconButton icon={<MdVisibility />} size="sm" onClick={() => openModal('view', l)} aria-label="View" /></Tooltip>
                                            <Tooltip label="Edit"><IconButton icon={<MdEdit />} size="sm" colorScheme="blue" onClick={() => openModal('edit', l)} aria-label="Edit" /></Tooltip>
                                            <Tooltip label="Delete"><IconButton icon={<MdDelete />} size="sm" colorScheme="red" onClick={() => confirmDelete(l.id)} aria-label="Delete" /></Tooltip>
                                            {l.status === 'Pending' && (
                                                <>
                                                    <Button size='sm' colorScheme='green' variant="ghost" onClick={() => handleAction(l.id, 'approve')}>Approve</Button>
                                                    <Button size='sm' colorScheme='red' variant="ghost" onClick={() => handleAction(l.id, 'reject')}>Reject</Button>
                                                </>
                                            )}
                                        </Flex>
                                    </Td>
                                )}
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{mode === 'view' ? 'Leave Details' : mode === 'edit' ? 'Edit Leave Request' : 'Apply for Leave'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>Employee Name</FormLabel>
                            <Select
                                isDisabled={mode !== 'add'}
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
                            <Select isDisabled={mode === 'view'} value={formData.leaveType} onChange={e => setFormData({ ...formData, leaveType: e.target.value })}>
                                <option value='Sick Leave'>Sick Leave</option>
                                <option value='Marriage Leave'>Marriage Leave</option>
                                <option value='Urgent Leave'>Urgent Leave</option>
                                <option value='Short Leave'>Short Leave</option>
                                <option value='Emergency Leave'>Emergency Leave</option>
                                <option value='Casual Leave'>Casual Leave</option>
                                <option value='Annual Leave'>Annual Leave</option>
                                <option value='Unpaid Leave'>Unpaid Leave</option>
                            </Select>
                        </FormControl>
                        <Flex gap={2} mb={3}>
                            <FormControl>
                                <FormLabel>Start Date</FormLabel>
                                <Input isDisabled={mode === 'view'} type='date' value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>End Date</FormLabel>
                                <Input isDisabled={mode === 'view'} type='date' value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                            </FormControl>
                        </Flex>
                        <FormControl mb={3}>
                            <FormLabel>Reason</FormLabel>
                            <Textarea readOnly={mode === 'view'} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        {mode !== 'view' && <Button colorScheme='blue' onClick={handleSubmit}>{mode === 'edit' ? 'Update Request' : 'Submit Request'}</Button>}
                        <Button variant="ghost" ml={3} onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsDeleteOpen(false)}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>Delete Leave Request</AlertDialogHeader>
                        <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                            <Button colorScheme='red' onClick={() => handleAction(deleteTarget, 'delete')} ml={3}>Delete</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}
