import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Textarea, Select, Spinner, Image
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdCreditCard } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { idCardTemplateApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function IdCardTemplate() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [templates, setTemplates] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [form, setForm] = useState({ id: '', name: '', type: 'Student', layout: 'Vertical', bgColor: '#4299E1', logoUrl: '', fields: '', instructions: '' });
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchTemplates();
    }, [campusId]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await idCardTemplateApi.list({ campusId });
            setTemplates(data || []);
        } catch (error) {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Error fetching templates';
            toast({ title: 'Error fetching templates', description: msg, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = { ...form, campusId };
            delete payload.id;
            if (form.id) {
                await idCardTemplateApi.update(form.id, payload);
                toast({ title: 'Template updated', status: 'success' });
            } else {
                await idCardTemplateApi.create(payload);
                toast({ title: 'Template created', status: 'success' });
            }
            fetchTemplates();
            onClose();
        } catch (error) {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Error saving template';
            toast({ title: 'Error saving template', description: msg, status: 'error' });
        }
    };

    const handleLogoFile = async (file) => {
        if (!file) return;
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const result = String(reader.result || '');
                setForm((prev) => ({ ...prev, logoUrl: result }));
            };
            reader.readAsDataURL(file);
        } catch (_) {
            toast({ title: 'Failed to read logo file', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await idCardTemplateApi.delete(id);
                toast({ title: 'Template deleted', status: 'success' });
                fetchTemplates();
            } catch (error) {
                const msg =
                    error?.response?.data?.error ||
                    error?.response?.data?.message ||
                    error?.message ||
                    'Error deleting template';
                toast({ title: 'Error deleting template', description: msg, status: 'error' });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>ID Card Templates</Heading>
                    <Text color={textColorSecondary}>Design and manage ID card templates</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ id: '', name: '', type: 'Student', layout: 'Vertical', bgColor: '#4299E1', logoUrl: '', fields: '', instructions: '' }); onOpen(); }}>
                    Create Template
                </Button>
            </Flex>

            <Box mb={5}>
                <StatCard title="Total Templates" value={templates.length} icon={MdCreditCard} colorScheme="blue" />
            </Box>

            <Card p={4} mb={5}>
                <InputGroup maxW="280px">
                    <InputLeftElement pointerEvents="none"><MdSearch color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </InputGroup>
            </Card>

            <Card>
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Template Name</Th>
                                <Th>Type</Th>
                                <Th>Layout</Th>
                                <Th>Background Color</Th>
                                <Th>Fields</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={6} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : templates.length === 0 ? (
                                <Tr><Td colSpan={6} textAlign="center">No templates found</Td></Tr>
                            ) : templates.filter(t => t.name?.toLowerCase().includes(search.toLowerCase())).map((template) => (
                                <Tr key={template.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td><Text fontWeight="600">{template.name}</Text></Td>
                                    <Td>{template.type}</Td>
                                    <Td>{template.layout}</Td>
                                    <Td><Box w="60px" h="20px" bg={template.bgColor} borderRadius="md" /></Td>
                                    <Td>{template.fields}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm(template); onOpen(); }} />
                                        <IconButton aria-label="Delete" icon={<MdDelete />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(template.id)} />
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
                    <ModalHeader>{form.id ? 'Edit Template' : 'Create Template'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl mb={3}>
                            <FormLabel>Template Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Type</FormLabel>
                            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                <option value="Student">Student</option>
                                <option value="Employee">Employee</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Layout</FormLabel>
                            <Select value={form.layout} onChange={(e) => setForm({ ...form, layout: e.target.value })}>
                                <option value="Vertical">Vertical</option>
                                <option value="Horizontal">Horizontal</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Background Color</FormLabel>
                            <Input type="color" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Logo URL</FormLabel>
                            <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Upload Logo</FormLabel>
                            <Input
                                type="file"
                                accept="image/*"
                                p={1}
                                onChange={(e) => handleLogoFile(e.target.files?.[0])}
                            />
                            {form.logoUrl ? (
                                <Box mt={2} borderWidth="1px" borderRadius="md" p={2}>
                                    <Image src={form.logoUrl} alt="Logo preview" maxH="80px" objectFit="contain" />
                                </Box>
                            ) : null}
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Fields (comma-separated)</FormLabel>
                            <Input value={form.fields} onChange={(e) => setForm({ ...form, fields: e.target.value })} placeholder="Photo, Name, ID, Class" />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Instructions</FormLabel>
                            <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={3} />
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
