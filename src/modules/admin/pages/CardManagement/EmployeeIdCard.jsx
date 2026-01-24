import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, SimpleGrid, Select, Checkbox, Table, Thead, Tbody, Tr, Th, Td,
    useToast, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Badge
} from '@chakra-ui/react';
import { MdAdd, MdPrint, MdDownload, MdVisibility } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { employeeApi, idCardTemplateApi, generatedIdCardApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function EmployeeIdCard() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [generatedCards, setGeneratedCards] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchData();
    }, [campusId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [employeesData, templatesData, cardsData] = await Promise.all([
                employeeApi.list({ campusId }),
                idCardTemplateApi.list({ campusId, type: 'Employee' }),
                generatedIdCardApi.list({ campusId, type: 'Employee' })
            ]);
            setEmployees(employeesData || []);
            setTemplates(templatesData || []);
            setGeneratedCards(cardsData || []);
        } catch (error) {
            toast({ title: 'Error fetching data', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate || selectedEmployees.length === 0) {
            toast({ title: 'Please select a template and at least one employee', status: 'warning' });
            return;
        }

        try {
            const promises = selectedEmployees.map(employeeId =>
                generatedIdCardApi.create({
                    campusId,
                    employeeId,
                    templateId: selectedTemplate,
                    status: 'Generated',
                    generatedDate: new Date().toISOString().slice(0, 10),
                    type: 'Employee'
                })
            );
            await Promise.all(promises);
            toast({ title: 'ID Cards generated successfully', status: 'success' });
            fetchData();
            onClose();
            setSelectedEmployees([]);
            setSelectedTemplate('');
        } catch (error) {
            toast({ title: 'Error generating ID cards', status: 'error' });
        }
    };

    const toggleEmployee = (id) => {
        setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const stats = {
        total: generatedCards.length,
        printed: generatedCards.filter(c => c.status === 'Printed').length,
        pending: generatedCards.filter(c => c.status === 'Generated').length,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Employee ID Cards</Heading>
                    <Text color={textColorSecondary}>Generate and print employee ID cards</Text>
                </Box>
                <Flex gap={2}>
                    <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={onOpen}>Generate Cards</Button>
                    <Button leftIcon={<MdPrint />} variant="outline">Print All</Button>
                </Flex>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mb={5}>
                <StatCard title="Total Cards" value={stats.total} icon={MdAdd} colorScheme="purple" />
                <StatCard title="Printed" value={stats.printed} icon={MdPrint} colorScheme="green" />
                <StatCard title="Pending" value={stats.pending} icon={MdAdd} colorScheme="orange" />
            </SimpleGrid>

            <Card>
                <Heading size="md" mb={4} p={4}>Generated ID Cards</Heading>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>ID Card #</Th>
                                <Th>Employee Name</Th>
                                <Th>Generated Date</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={5} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : generatedCards.length === 0 ? (
                                <Tr><Td colSpan={5} textAlign="center">No ID cards generated yet</Td></Tr>
                            ) : generatedCards.map((card) => {
                                const employee = employees.find(e => e.id === card.employeeId);
                                return (
                                    <Tr key={card.id}>
                                        <Td>{card.id}</Td>
                                        <Td>{employee ? employee.name : 'Unknown Employee'}</Td>
                                        <Td>{card.generatedDate}</Td>
                                        <Td><Badge colorScheme={card.status === 'Printed' ? 'green' : 'orange'}>{card.status}</Badge></Td>
                                        <Td>
                                            <Button size="sm" leftIcon={<MdVisibility />}>View</Button>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Generate Employee ID Cards</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Select placeholder="Select Template" mb={4} value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </Select>
                        <Box maxHeight="300px" overflowY="auto">
                            <Table size="sm">
                                <Thead>
                                    <Tr>
                                        <Th><Checkbox isChecked={selectedEmployees.length === employees.length && employees.length > 0} onChange={(e) => setSelectedEmployees(e.target.checked ? employees.map(emp => emp.id) : [])} /></Th>
                                        <Th>Name</Th>
                                        <Th>Designation</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {employees.map(employee => (
                                        <Tr key={employee.id}>
                                            <Td><Checkbox isChecked={selectedEmployees.includes(employee.id)} onChange={() => toggleEmployee(employee.id)} /></Td>
                                            <Td>{employee.name}</Td>
                                            <Td>{employee.designation}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleGenerate} isDisabled={!selectedTemplate || selectedEmployees.length === 0}>Generate</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
