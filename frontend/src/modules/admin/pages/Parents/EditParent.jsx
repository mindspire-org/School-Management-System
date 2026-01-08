import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    HStack,
    Heading,
    Text,
    useToast,
    Card,
    CardHeader,
    CardBody,
    SimpleGrid,
    InputGroup,
    InputLeftElement,
    Icon,
    Divider,
    Spinner,
    Center,
} from '@chakra-ui/react';
import { MdPerson, MdEmail, MdPhone, MdHome, MdSave, MdArrowBack, MdSchool } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import { parentsApi } from '../../../../services/api';
import StudentSearchInput from './StudentSearchInput';

export default function EditParent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        primaryName: '',
        email: '',
        whatsappPhone: '',
        address: '',
        fatherName: '',
        motherName: '',
        studentRollNumbers: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await parentsApi.getById(id);
                if (data) {
                    setFormData({
                        primaryName: data.primaryName || '',
                        email: data.email || '',
                        whatsappPhone: data.whatsappPhone || '',
                        address: data.address || '',
                        fatherName: data.fatherName || '',
                        motherName: data.motherName || '',
                        studentRollNumbers: (data.children || []).map(c => c.rollNumber).filter(Boolean).join(', '),
                    });
                }
            } catch (e) {
                toast({ title: 'Failed to load parent details', status: 'error' });
                navigate('/admin/parents/list');
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [id, navigate, toast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await parentsApi.update(id, formData);
            setLoading(false);
            toast({
                title: "Parent Updated",
                description: "Changes have been saved successfully.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate('/admin/parents/list');
        } catch (error) {
            setLoading(false);
            toast({
                title: "Error updating parent",
                description: error.response?.data?.message || "Something went wrong.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (fetching) {
        return (
            <Center h="50vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
            <VStack spacing={8} align="stretch">
                <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                        <Heading size="lg" color="navy.700" _dark={{ color: "white" }}>Edit Parent</Heading>
                        <Text color="gray.500">Update parent profile information.</Text>
                    </VStack>
                    <Button
                        leftIcon={<MdArrowBack />}
                        variant="ghost"
                        onClick={() => navigate('/admin/parents/list')}
                    >
                        Back to List
                    </Button>
                </HStack>

                <Card p={4} variant="outline" boxShadow="sm" borderRadius="20px">
                    <CardBody>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={6}>
                                <Box width="100%">
                                    <Heading size="md" mb={4} color="gray.700" _dark={{ color: "white" }}>General Information</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                        <FormControl isRequired>
                                            <FormLabel>Primary Name</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdPerson} color="gray.400" />} />
                                                <Input
                                                    name="primaryName"
                                                    placeholder="John Doe"
                                                    value={formData.primaryName}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Email Address</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdEmail} color="gray.400" />} />
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    placeholder="john.doe@example.com"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>WhatsApp Phone</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdPhone} color="gray.400" />} />
                                                <Input
                                                    type="tel"
                                                    name="whatsappPhone"
                                                    placeholder="+923001234567"
                                                    value={formData.whatsappPhone}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Father Name (Optional)</FormLabel>
                                            <Input name="fatherName" value={formData.fatherName} onChange={handleChange} />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Mother Name (Optional)</FormLabel>
                                            <Input name="motherName" value={formData.motherName} onChange={handleChange} />
                                        </FormControl>

                                        <FormControl isRequired gridColumn={{ md: "span 2" }}>
                                            <FormLabel>Address</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdHome} color="gray.400" />} />
                                                <Input
                                                    name="address"
                                                    placeholder="123 Main St"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                <Box width="100%">
                                    <Heading size="md" mb={4} color="gray.700" _dark={{ color: "white" }}>Student Linking</Heading>
                                    <Text fontSize="sm" color="gray.500" mb={4}>
                                        Manage students associated with this parent by their Roll Numbers (comma separated).
                                    </Text>
                                    <FormControl>
                                        <FormLabel>Student Roll Numbers</FormLabel>
                                        <StudentSearchInput
                                            selectedRollNumbers={formData.studentRollNumbers}
                                            onChange={(val, student) => {
                                                setFormData(prev => {
                                                    const next = { ...prev, studentRollNumbers: val };
                                                    if (student) {
                                                        const p = student.parent || {};
                                                        const father = p.father || {};
                                                        const mother = p.mother || {};

                                                        if (student.parentName && !prev.primaryName) next.primaryName = student.parentName;
                                                        if (student.parentPhone && !prev.whatsappPhone) next.whatsappPhone = student.parentPhone;
                                                        if (student.parentEmail && !prev.email) next.email = student.parentEmail;
                                                        if (student.address && !prev.address) next.address = student.address;
                                                        if (father.name && !prev.fatherName) next.fatherName = father.name;
                                                        if (mother.name && !prev.motherName) next.motherName = mother.name;
                                                    }
                                                    return next;
                                                });
                                            }}
                                        />
                                        <Text fontSize="xs" mt={1} color="gray.400">Add or remove students linked to this parent account. Details will autofill if available.</Text>
                                    </FormControl>
                                </Box>

                                <Divider />

                                <HStack width="100%" justify="flex-end" pt={4}>
                                    <Button variant="ghost" onClick={() => navigate('/admin/parents/list')}>Cancel</Button>
                                    <Button
                                        type="submit"
                                        colorScheme="blue"
                                        leftIcon={<MdSave />}
                                        isLoading={loading}
                                        loadingText="Saving..."
                                    >
                                        Save Changes
                                    </Button>
                                </HStack>
                            </VStack>
                        </form>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
}
