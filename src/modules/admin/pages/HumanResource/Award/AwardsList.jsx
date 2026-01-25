import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, Text, Heading, useColorModeValue,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
    FormControl, FormLabel, Input, Select, useDisclosure, Textarea
} from '@chakra-ui/react';
import { MdAdd, MdEmojiEvents } from 'react-icons/md';
import Card from '../../../../../components/card/Card';
import { awardApi, hrEmployeesApi } from '../../../../../services/moduleApis';
import { useAuth } from '../../../../../contexts/AuthContext';

export default function AwardsList() {
    const { campusId } = useAuth();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        awardName: '',
        giftItem: '',
        cashPrice: '',
        employeeName: '',
        employeeId: '',
        reason: ''
    });

    const textColor = useColorModeValue('secondaryGray.900', 'white');

    useEffect(() => { fetchAwards(); }, [campusId]);

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

    const fetchAwards = async () => {
        setLoading(true);
        try {
            const data = await awardApi.list({ campusId });
            setAwards(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async () => {
        try {
            if (!formData.employeeId) {
                toast({ title: 'Please select an employee', status: 'warning' });
                return;
            }
            await awardApi.create({ ...formData, campusId, employeeId: Number(formData.employeeId) });
            toast({ title: 'Award Given', status: 'success' });
            onClose();
            fetchAwards();
        } catch (e) { toast({ title: 'Error', status: 'error' }); }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex justify='space-between' align='center' mb='20px'>
                <Heading color={textColor} fontSize='2xl'>Awards & Recognition</Heading>
                <Button leftIcon={<MdAdd />} variant='brand' onClick={onOpen}>Give Award</Button>
            </Flex>

            <Card p='20px'>
                <Table variant='simple'>
                    <Thead><Tr><Th>Award Name</Th><Th>Employee</Th><Th>Gift/Cash</Th><Th>Date</Th><Th>Reason</Th></Tr></Thead>
                    <Tbody>
                        {loading ? <Tr><Td colSpan={5}>Loading...</Td></Tr> : awards.map(a => (
                            <Tr key={a.id}>
                                <Td fontWeight='bold'><Flex align='center' gap={2}><MdEmojiEvents color='gold' /> {a.awardName}</Flex></Td>
                                <Td>{a.employeeName}</Td>
                                <Td>{a.giftItem} {a.cashPrice ? `($${a.cashPrice})` : ''}</Td>
                                <Td>{new Date(a.givenDate).toLocaleDateString()}</Td>
                                <Td>{a.reason}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Give New Award</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb={3}>
                            <FormLabel>Award Title</FormLabel>
                            <Input value={formData.awardName} onChange={e => setFormData({ ...formData, awardName: e.target.value })} placeholder='e.g. Employee of the Month' />
                        </FormControl>
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
                            <FormLabel>Gift Item</FormLabel>
                            <Input value={formData.giftItem} onChange={e => setFormData({ ...formData, giftItem: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Cash Prize</FormLabel>
                            <Input type='number' value={formData.cashPrice} onChange={e => setFormData({ ...formData, cashPrice: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Reason</FormLabel>
                            <Textarea value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleSubmit}>Save Award</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
