import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, SimpleGrid, Select, Checkbox, Table, Thead, Tbody, Tr, Th, Td,
    useToast, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Badge
} from '@chakra-ui/react';
import { MdAdd, MdPrint, MdDownload, MdVisibility } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { employeeApi, certificateTemplateApi, employeeCertificateApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function EmployeeCertificate() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [certificates, setCertificates] = useState([]);
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
            const [employeesData, templatesData, certsData] = await Promise.all([
                employeeApi.list({ campusId }),
                certificateTemplateApi.list({ campusId, type: 'Employee' }),
                employeeCertificateApi.list({ campusId })
            ]);
            setEmployees(employeesData || []);
            setTemplates(templatesData || []);
            setCertificates(certsData || []);
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
                employeeCertificateApi.create({
                    campusId,
                    employeeId,
                    templateId: selectedTemplate,
                    status: 'Issued',
                    issueDate: new Date().toISOString().slice(0, 10),
                })
            );
            await Promise.all(promises);
            toast({ title: 'Certificates generated successfully', status: 'success' });
            fetchData();
            onClose();
            setSelectedEmployees([]);
            setSelectedTemplate('');
        } catch (error) {
            toast({ title: 'Error generating certificates', status: 'error' });
        }
    };

    const toggleEmployee = (id) => {
        setSelectedEmployees(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
    };

    const stats = {
        total: certificates.length,
        thisMonth: certificates.filter(c => new Date(c.issueDate).getMonth() === new Date().getMonth()).length,
        pending: 0,
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Employee Certificates</Heading>
                    <Text color={textColorSecondary}>Generate certificates for employees</Text>
                </Box>
                <Flex gap={2}>
                    <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={onOpen}>Generate Certificate</Button>
                    <Button leftIcon={<MdPrint />} variant="outline">Print</Button>
                </Flex>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mb={5}>
                <StatCard title="Total Issued" value={stats.total} icon={MdAdd} colorScheme="purple" />
                <StatCard title="This Month" value={stats.thisMonth} icon={MdAdd} colorScheme="green" />
                <StatCard title="Pending" value={stats.pending} icon={MdAdd} colorScheme="orange" />
            </SimpleGrid>

            <Card>
                <Heading size="md" mb={4} p={4}>Issued Certificates</Heading>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Certificate ID</Th>
                                <Th>Employee Name</Th>
                                <Th>Certificate Type</Th>
                                <Th>Issue Date</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={6} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : certificates.length === 0 ? (
                                <Tr><Td colSpan={6} textAlign="center">No certificates issued yet</Td></Tr>
                            ) : certificates.map((cert) => {
                                const employee = employees.find(e => e.id === cert.employeeId);
                                const template = templates.find(t => t.id === cert.templateId);
                                return (
                                    <Tr key={cert.id}>
                                        <Td>{cert.id}</Td>
                                        <Td>{employee ? employee.name : 'Unknown Employee'}</Td>
                                        <Td>{template ? template.name : 'Unknown Template'}</Td>
                                        <Td>{cert.issueDate}</Td>
                                        <Td><Badge colorScheme="green">{cert.status}</Badge></Td>
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
                    <ModalHeader>Generate Employee Certificates</ModalHeader>
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
