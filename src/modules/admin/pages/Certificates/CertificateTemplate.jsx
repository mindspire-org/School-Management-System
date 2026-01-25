import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td,
    Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, useToast, Select, Textarea, Spinner, Image
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdDescription } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { certificateTemplateApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function CertificateTemplate() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [templates, setTemplates] = useState([]);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const emptyForm = {
        id: '',
        name: '',
        type: 'Student',
        layout: 'Landscape',
        bgColor: '#ffffff',
        logoUrl: '',
        title: 'Certificate of Appreciation',
        bodyText: '',
        footerText: '',

        showBorder: true,
        borderColor: '#111111',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 14,

        backgroundImageUrl: '',
        backgroundImageOpacity: 0.2,

        watermarkText: '',
        watermarkImageUrl: '',
        watermarkOpacity: 0.08,
        watermarkRotate: -25,

        fontFamily: 'Georgia, serif',
        titleFontFamily: 'Georgia, serif',
        titleFontSize: 34,
        bodyFontSize: 18,
        footerFontSize: 14,

        signature1Name: '',
        signature1Title: '',
        signature1ImageUrl: '',
        signature2Name: '',
        signature2Title: '',
        signature2ImageUrl: '',

        showSerial: true,
        serialPrefix: 'CERT-',
        serialPadding: 6,
    };
    const [form, setForm] = useState(emptyForm);
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchTemplates();
    }, [campusId]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await certificateTemplateApi.list({ campusId });
            setTemplates(data || []);
        } catch (error) {
            toast({ title: 'Error fetching templates', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = { ...form, campusId };
            delete payload.id;
            if (form.id) {
                await certificateTemplateApi.update(form.id, payload);
                toast({ title: 'Template updated', status: 'success' });
            } else {
                await certificateTemplateApi.create(payload);
                toast({ title: 'Template created', status: 'success' });
            }
            fetchTemplates();
            onClose();
        } catch (error) {
            toast({ title: 'Error saving template', status: 'error' });
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

    const handleAssetFile = async (file, key) => {
        if (!file) return;
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const result = String(reader.result || '');
                setForm((prev) => ({ ...prev, [key]: result }));
            };
            reader.readAsDataURL(file);
        } catch (_) {
            toast({ title: 'Failed to read file', status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await certificateTemplateApi.delete(id);
                toast({ title: 'Template deleted', status: 'success' });
                fetchTemplates();
            } catch (error) {
                toast({ title: 'Error deleting template', status: 'error' });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Certificate Templates</Heading>
                    <Text color={textColorSecondary}>Design and manage certificate templates</Text>
                </Box>
                <Button leftIcon={<MdAdd />} colorScheme="blue" onClick={() => { setForm({ ...emptyForm }); onOpen(); }}>
                    Create Template
                </Button>
            </Flex>

            <Box mb={5}>
                <StatCard title="Total Templates" value={templates.length} icon={MdDescription} colorScheme="teal" />
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
                                <Th>Title</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={5} textAlign="center"><Spinner size="lg" my={5} /></Td></Tr>
                            ) : templates.length === 0 ? (
                                <Tr><Td colSpan={5} textAlign="center">No templates found</Td></Tr>
                            ) : templates.filter(t => t.name?.toLowerCase().includes(search.toLowerCase())).map((template) => (
                                <Tr key={template.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                                    <Td><Text fontWeight="600">{template.name}</Text></Td>
                                    <Td>{template.type}</Td>
                                    <Td>{template.layout}</Td>
                                    <Td>{template.title}</Td>
                                    <Td>
                                        <IconButton aria-label="Edit" icon={<MdEdit />} size="sm" variant="ghost" onClick={() => { setForm({ ...emptyForm, ...template }); onOpen(); }} />
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
                                <option value="Landscape">Landscape</option>
                                <option value="Portrait">Portrait</option>
                            </Select>
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Certificate Title</FormLabel>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Body Text (Use {`{name}`}, {`{class}`} placeholders)</FormLabel>
                            <Textarea value={form.bodyText} onChange={(e) => setForm({ ...form, bodyText: e.target.value })} rows={4} />
                        </FormControl>
                        <FormControl mb={3}>
                            <FormLabel>Footer Text</FormLabel>
                            <Input value={form.footerText} onChange={(e) => setForm({ ...form, footerText: e.target.value })} />
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

                        <Box mt={4} borderTopWidth="1px" pt={4}>
                            <Heading as="h4" size="sm" mb={3}>Design & Styling</Heading>

                            <FormControl mb={3}>
                                <FormLabel>Font Family</FormLabel>
                                <Select value={form.fontFamily || ''} onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}>
                                    <option value="Georgia, serif">Georgia (Serif)</option>
                                    <option value="Times New Roman, Times, serif">Times New Roman</option>
                                    <option value="Arial, Helvetica, sans-serif">Arial</option>
                                    <option value="Verdana, Geneva, sans-serif">Verdana</option>
                                    <option value="'Trebuchet MS', Arial, sans-serif">Trebuchet MS</option>
                                </Select>
                            </FormControl>

                            <FormControl mb={3}>
                                <FormLabel>Title Font Family</FormLabel>
                                <Select value={form.titleFontFamily || ''} onChange={(e) => setForm({ ...form, titleFontFamily: e.target.value })}>
                                    <option value="Georgia, serif">Georgia (Serif)</option>
                                    <option value="Times New Roman, Times, serif">Times New Roman</option>
                                    <option value="Arial Black, Arial, sans-serif">Arial Black</option>
                                    <option value="'Trebuchet MS', Arial, sans-serif">Trebuchet MS</option>
                                </Select>
                            </FormControl>

                            <Flex gap={3} wrap="wrap">
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Title Size (px)</FormLabel>
                                    <Input type="number" value={form.titleFontSize ?? 34} onChange={(e) => setForm({ ...form, titleFontSize: Number(e.target.value) })} />
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Body Size (px)</FormLabel>
                                    <Input type="number" value={form.bodyFontSize ?? 18} onChange={(e) => setForm({ ...form, bodyFontSize: Number(e.target.value) })} />
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Footer Size (px)</FormLabel>
                                    <Input type="number" value={form.footerFontSize ?? 14} onChange={(e) => setForm({ ...form, footerFontSize: Number(e.target.value) })} />
                                </FormControl>
                            </Flex>

                            <Flex gap={3} wrap="wrap">
                                <FormControl mb={3} flex="1" minW="220px">
                                    <FormLabel>Show Border</FormLabel>
                                    <Select value={String(form.showBorder ?? true)} onChange={(e) => setForm({ ...form, showBorder: e.target.value === 'true' })}>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </Select>
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Border Color</FormLabel>
                                    <Input type="color" value={form.borderColor || '#111111'} onChange={(e) => setForm({ ...form, borderColor: e.target.value })} />
                                </FormControl>
                            </Flex>

                            <Flex gap={3} wrap="wrap">
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Border Width</FormLabel>
                                    <Input type="number" value={form.borderWidth ?? 2} onChange={(e) => setForm({ ...form, borderWidth: Number(e.target.value) })} />
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Border Style</FormLabel>
                                    <Select value={form.borderStyle || 'solid'} onChange={(e) => setForm({ ...form, borderStyle: e.target.value })}>
                                        <option value="solid">Solid</option>
                                        <option value="double">Double</option>
                                        <option value="dashed">Dashed</option>
                                        <option value="dotted">Dotted</option>
                                    </Select>
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Border Radius</FormLabel>
                                    <Input type="number" value={form.borderRadius ?? 14} onChange={(e) => setForm({ ...form, borderRadius: Number(e.target.value) })} />
                                </FormControl>
                            </Flex>

                            <Heading as="h5" size="sm" mt={2} mb={3}>Background</Heading>
                            <FormControl mb={3}>
                                <FormLabel>Background Image URL</FormLabel>
                                <Input value={form.backgroundImageUrl || ''} onChange={(e) => setForm({ ...form, backgroundImageUrl: e.target.value })} placeholder="https://..." />
                            </FormControl>
                            <FormControl mb={3}>
                                <FormLabel>Upload Background Image</FormLabel>
                                <Input type="file" accept="image/*" p={1} onChange={(e) => handleAssetFile(e.target.files?.[0], 'backgroundImageUrl')} />
                                {form.backgroundImageUrl ? (
                                    <Box mt={2} borderWidth="1px" borderRadius="md" p={2}>
                                        <Image src={form.backgroundImageUrl} alt="Background preview" maxH="120px" objectFit="contain" />
                                    </Box>
                                ) : null}
                            </FormControl>
                            <FormControl mb={3}>
                                <FormLabel>Background Opacity (0 - 1)</FormLabel>
                                <Input type="number" step="0.01" min={0} max={1} value={form.backgroundImageOpacity ?? 0.2} onChange={(e) => setForm({ ...form, backgroundImageOpacity: Number(e.target.value) })} />
                            </FormControl>

                            <Heading as="h5" size="sm" mt={2} mb={3}>Watermark</Heading>
                            <FormControl mb={3}>
                                <FormLabel>Watermark Text</FormLabel>
                                <Input value={form.watermarkText || ''} onChange={(e) => setForm({ ...form, watermarkText: e.target.value })} placeholder="e.g. School Name" />
                            </FormControl>
                            <FormControl mb={3}>
                                <FormLabel>Watermark Image URL</FormLabel>
                                <Input value={form.watermarkImageUrl || ''} onChange={(e) => setForm({ ...form, watermarkImageUrl: e.target.value })} placeholder="https://..." />
                            </FormControl>
                            <FormControl mb={3}>
                                <FormLabel>Upload Watermark Image</FormLabel>
                                <Input type="file" accept="image/*" p={1} onChange={(e) => handleAssetFile(e.target.files?.[0], 'watermarkImageUrl')} />
                                {form.watermarkImageUrl ? (
                                    <Box mt={2} borderWidth="1px" borderRadius="md" p={2}>
                                        <Image src={form.watermarkImageUrl} alt="Watermark preview" maxH="120px" objectFit="contain" />
                                    </Box>
                                ) : null}
                            </FormControl>
                            <Flex gap={3} wrap="wrap">
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Opacity (0 - 1)</FormLabel>
                                    <Input type="number" step="0.01" min={0} max={1} value={form.watermarkOpacity ?? 0.08} onChange={(e) => setForm({ ...form, watermarkOpacity: Number(e.target.value) })} />
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Rotate (deg)</FormLabel>
                                    <Input type="number" value={form.watermarkRotate ?? -25} onChange={(e) => setForm({ ...form, watermarkRotate: Number(e.target.value) })} />
                                </FormControl>
                            </Flex>

                            <Heading as="h5" size="sm" mt={2} mb={3}>Serial Number</Heading>
                            <Flex gap={3} wrap="wrap">
                                <FormControl mb={3} flex="1" minW="220px">
                                    <FormLabel>Show Serial</FormLabel>
                                    <Select value={String(form.showSerial ?? true)} onChange={(e) => setForm({ ...form, showSerial: e.target.value === 'true' })}>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </Select>
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="200px">
                                    <FormLabel>Prefix</FormLabel>
                                    <Input value={form.serialPrefix || ''} onChange={(e) => setForm({ ...form, serialPrefix: e.target.value })} />
                                </FormControl>
                                <FormControl mb={3} flex="1" minW="160px">
                                    <FormLabel>Padding</FormLabel>
                                    <Input type="number" value={form.serialPadding ?? 6} onChange={(e) => setForm({ ...form, serialPadding: Number(e.target.value) })} />
                                </FormControl>
                            </Flex>

                            <Heading as="h5" size="sm" mt={2} mb={3}>Signatories</Heading>
                            <Box borderWidth="1px" borderRadius="md" p={3} mb={3}>
                                <Text fontWeight="600" mb={2}>Signature 1</Text>
                                <FormControl mb={2}>
                                    <FormLabel>Name</FormLabel>
                                    <Input value={form.signature1Name || ''} onChange={(e) => setForm({ ...form, signature1Name: e.target.value })} />
                                </FormControl>
                                <FormControl mb={2}>
                                    <FormLabel>Title</FormLabel>
                                    <Input value={form.signature1Title || ''} onChange={(e) => setForm({ ...form, signature1Title: e.target.value })} />
                                </FormControl>
                                <FormControl mb={2}>
                                    <FormLabel>Signature Image URL</FormLabel>
                                    <Input value={form.signature1ImageUrl || ''} onChange={(e) => setForm({ ...form, signature1ImageUrl: e.target.value })} placeholder="https://..." />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Upload Signature Image</FormLabel>
                                    <Input type="file" accept="image/*" p={1} onChange={(e) => handleAssetFile(e.target.files?.[0], 'signature1ImageUrl')} />
                                    {form.signature1ImageUrl ? (
                                        <Box mt={2} borderWidth="1px" borderRadius="md" p={2}>
                                            <Image src={form.signature1ImageUrl} alt="Signature 1 preview" maxH="80px" objectFit="contain" />
                                        </Box>
                                    ) : null}
                                </FormControl>
                            </Box>

                            <Box borderWidth="1px" borderRadius="md" p={3} mb={2}>
                                <Text fontWeight="600" mb={2}>Signature 2</Text>
                                <FormControl mb={2}>
                                    <FormLabel>Name</FormLabel>
                                    <Input value={form.signature2Name || ''} onChange={(e) => setForm({ ...form, signature2Name: e.target.value })} />
                                </FormControl>
                                <FormControl mb={2}>
                                    <FormLabel>Title</FormLabel>
                                    <Input value={form.signature2Title || ''} onChange={(e) => setForm({ ...form, signature2Title: e.target.value })} />
                                </FormControl>
                                <FormControl mb={2}>
                                    <FormLabel>Signature Image URL</FormLabel>
                                    <Input value={form.signature2ImageUrl || ''} onChange={(e) => setForm({ ...form, signature2ImageUrl: e.target.value })} placeholder="https://..." />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Upload Signature Image</FormLabel>
                                    <Input type="file" accept="image/*" p={1} onChange={(e) => handleAssetFile(e.target.files?.[0], 'signature2ImageUrl')} />
                                    {form.signature2ImageUrl ? (
                                        <Box mt={2} borderWidth="1px" borderRadius="md" p={2}>
                                            <Image src={form.signature2ImageUrl} alt="Signature 2 preview" maxH="80px" objectFit="contain" />
                                        </Box>
                                    ) : null}
                                </FormControl>
                            </Box>
                        </Box>
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
