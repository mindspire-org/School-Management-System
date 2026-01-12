import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { MdPerson, MdEmail, MdPhone, MdHome, MdSave, MdArrowBack, MdSchool } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { parentsApi, campusesApi } from '../../../../services/api';
import StudentSearchInput from './StudentSearchInput';

export default function AddParent() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [campuses, setCampuses] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        relationship: 'Father',
        occupation: '',
        studentRollNumbers: '',
        campusId: '',
    });

    React.useEffect(() => {
        campusesApi.list({ pageSize: 100 })
            .then(res => setCampuses(res.rows || []))
            .catch(err => console.error('Failed to fetch campuses', err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            const payload = {
                primaryName: fullName,
                fatherName: formData.relationship === 'Father' ? fullName : null,
                motherName: formData.relationship === 'Mother' ? fullName : null,
                email: formData.email,
                whatsappPhone: formData.phone,
                address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim(),
                studentRollNumbers: formData.studentRollNumbers,
                campusId: formData.campusId,
            };

            await parentsApi.create(payload);

            setLoading(false);
            toast({
                title: "Parent Account Created.",
                description: `Created account for ${fullName}${formData.studentRollNumbers ? ' and linked students.' : '.'}`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate('/admin/parents/list');
        } catch (error) {
            setLoading(false);
            toast({
                title: "Error creating parent",
                description: error.response?.data?.message || "Something went wrong.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
            <VStack spacing={8} align="stretch">
                <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                        <Heading size="lg" color="navy.700" _dark={{ color: "white" }}>Add New Parent</Heading>
                        <Text color="gray.500">Create a new parent profile and link students.</Text>
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
                                    <Heading size="md" mb={4} color="gray.700" _dark={{ color: "white" }}>Personal Information</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                        <FormControl isRequired>
                                            <FormLabel>First Name</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdPerson} color="gray.400" />} />
                                                <Input
                                                    name="firstName"
                                                    placeholder="John"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Last Name</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdPerson} color="gray.400" />} />
                                                <Input
                                                    name="lastName"
                                                    placeholder="Doe"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Relationship</FormLabel>
                                            <Select name="relationship" value={formData.relationship} onChange={handleChange}>
                                                <option value="Father">Father</option>
                                                <option value="Mother">Mother</option>
                                                <option value="Guardian">Guardian</option>
                                                <option value="Other">Other</option>
                                            </Select>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>Campus</FormLabel>
                                            <Select name="campusId" value={formData.campusId} onChange={handleChange} placeholder="Select campus">
                                                {campuses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <Divider />

                                <Box width="100%">
                                    <Heading size="md" mb={4} color="gray.700" _dark={{ color: "white" }}>Student Linking</Heading>
                                    <Text fontSize="sm" color="gray.500" mb={4}>
                                        Enter the Roll Numbers of students associated with this parent, separated by commas (e.g., ROLL-001, ROLL-002).
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

                                                        // Determine which parent details to prioritize based on relationship
                                                        let targetParentName = '';
                                                        let targetOccupation = '';
                                                        let targetPhone = student.parentPhone || '';

                                                        if (prev.relationship === 'Father' && father.name) {
                                                            targetParentName = father.name;
                                                            targetOccupation = father.occupation || '';
                                                            if (father.phone) targetPhone = father.phone;
                                                        } else if (prev.relationship === 'Mother' && mother.name) {
                                                            targetParentName = mother.name;
                                                            targetOccupation = mother.occupation || '';
                                                            if (mother.phone) targetPhone = mother.phone;
                                                        } else {
                                                            targetParentName = student.parentName || '';
                                                            targetOccupation = father.occupation || mother.occupation || '';
                                                        }

                                                        if (targetParentName && !prev.firstName && !prev.lastName) {
                                                            const parts = targetParentName.trim().split(/\s+/);
                                                            next.firstName = parts[0] || '';
                                                            next.lastName = parts.slice(1).join(' ') || '';
                                                        }
                                                        if (targetOccupation && !prev.occupation) next.occupation = targetOccupation;
                                                        if (targetPhone && !prev.phone) next.phone = targetPhone;
                                                        if (student.parentEmail && !prev.email) next.email = student.parentEmail;
                                                        if (student.address && !prev.address) next.address = student.address;
                                                    }
                                                    return next;
                                                });
                                            }}
                                        />
                                        <Text fontSize="xs" mt={1} color="gray.400">Search and select students to link them to this parent account. Details will autofill if available.</Text>
                                    </FormControl>
                                </Box>

                                <Divider />

                                <Box width="100%">
                                    <Heading size="md" mb={4} color="gray.700" _dark={{ color: "white" }}>Contact Details</Heading>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                        <FormControl isRequired>
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
                                            <FormLabel>Phone Number</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdPhone} color="gray.400" />} />
                                                <Input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="+1 (555) 000-0000"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl isRequired gridColumn={{ md: "span 2" }}>
                                            <FormLabel>Address</FormLabel>
                                            <InputGroup>
                                                <InputLeftElement pointerEvents="none" children={<Icon as={MdHome} color="gray.400" />} />
                                                <Input
                                                    name="address"
                                                    placeholder="123 Main St, Apt 4B"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                />
                                            </InputGroup>
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>City</FormLabel>
                                            <Input name="city" placeholder="New York" value={formData.city} onChange={handleChange} />
                                        </FormControl>

                                        <FormControl isRequired>
                                            <FormLabel>State / Province</FormLabel>
                                            <Input name="state" placeholder="NY" value={formData.state} onChange={handleChange} />
                                        </FormControl>
                                    </SimpleGrid>
                                </Box>

                                <HStack width="100%" justify="flex-end" pt={4}>
                                    <Button variant="ghost" onClick={() => navigate('/admin/parents/list')}>Cancel</Button>
                                    <Button
                                        type="submit"
                                        colorScheme="blue"
                                        leftIcon={<MdSave />}
                                        isLoading={loading}
                                        loadingText="Creating..."
                                    >
                                        Create Account
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
