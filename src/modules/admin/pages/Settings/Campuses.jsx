import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Select,
    Textarea,
    SimpleGrid,
    Portal,
    useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import { SearchIcon, EditIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { MdMoreVert, MdLocationCity } from 'react-icons/md';
import { campusesApi } from '../../../../services/api';
import useApi from '../../../../hooks/useApi';

const Campuses = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editCampus, setEditCampus] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '', capacity: '', status: 'active' });
    const [errors, setErrors] = useState({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const menuHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');

    const { execute: fetchCampuses, data: campusesData, loading } = useApi(campusesApi.list);
    const { execute: createCampus, loading: creating } = useApi(campusesApi.create);
    const { execute: updateCampus, loading: updating } = useApi(campusesApi.update);
    const { execute: deleteCampus } = useApi(campusesApi.remove);

    useEffect(() => {
        fetchCampuses({ pageSize: 100 });
    }, [fetchCampuses]);

    const campuses = campusesData?.rows || [];

    const filteredCampuses = campuses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleOpen = (campus = null) => {
        if (campus) {
            setEditCampus(campus);
            setFormData({
                name: campus.name ?? '',
                address: campus.address ?? '',
                phone: campus.phone ?? '',
                email: campus.email ?? '',
                capacity: campus.capacity ?? '',
                status: campus.status ?? 'active'
            });
        } else {
            setEditCampus(null);
            setFormData({ name: '', address: '', phone: '', email: '', capacity: '', status: 'active' });
        }
        setErrors({});
        onOpen();
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Campus name is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const payload = { ...formData };
        if (payload.capacity === '') payload.capacity = null;
        if (payload.capacity !== null && payload.capacity !== undefined && payload.capacity !== '') payload.capacity = parseInt(payload.capacity);

        const { error } = editCampus
            ? await updateCampus(editCampus.id, payload)
            : await createCampus(payload);

        if (error) {
            toast({
                title: 'Error',
                description: error.message || 'Operation failed',
                status: 'error',
                duration: 3000,
            });
        } else {
            toast({
                title: 'Success',
                description: `Campus ${editCampus ? 'updated' : 'created'} successfully`,
                status: 'success',
                duration: 3000,
            });
            onClose();
            fetchCampuses({ pageSize: 100 });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this campus?')) {
            const { error } = await deleteCampus(id);
            if (error) {
                toast({ title: 'Error', description: error.message, status: 'error' });
            } else {
                toast({ title: 'Deleted', status: 'success' });
                fetchCampuses({ pageSize: 100 });
            }
        }
    };

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }} px={4}>
            <Flex mb={6} justify='space-between' align='center'>
                <Box>
                    <Heading size='lg'>Campus Management</Heading>
                    <Text color='gray.600'>Manage multiple school campuses and data isolation</Text>
                </Box>
                <Button leftIcon={<AddIcon />} colorScheme='blue' onClick={() => handleOpen()}>
                    Add Campus
                </Button>
            </Flex>

            <Card mb={6}>
                <Box p={4}>
                    <InputGroup maxW='400px'>
                        <InputLeftElement><SearchIcon color='gray.300' /></InputLeftElement>
                        <Input
                            placeholder='Search campuses...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Box>
            </Card>

            <Card>
                <Box overflowX='auto'>
                    <Table variant='simple'>
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Address</Th>
                                <Th>Contact</Th>
                                <Th>Capacity</Th>
                                <Th>Status</Th>
                                <Th>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredCampuses.map((c) => (
                                <Tr key={c.id}>
                                    <Td fontWeight='bold'>{c.name}</Td>
                                    <Td>{c.address || '—'}</Td>
                                    <Td>
                                        <Text fontSize='sm'>{c.email}</Text>
                                        <Text fontSize='xs' color='gray.500'>{c.phone}</Text>
                                    </Td>
                                    <Td>{c.capacity || '—'}</Td>
                                    <Td>
                                        <Badge colorScheme={c.status === 'active' ? 'green' : 'red'}>
                                            {c.status}
                                        </Badge>
                                    </Td>
                                    <Td isNumeric>
                                        <Menu isLazy>
                                            <MenuButton
                                                as={IconButton}
                                                icon={<MdMoreVert size={24} />}
                                                variant='ghost'
                                                size='sm'
                                                aria-label='Options'
                                                _hover={{ bg: menuHoverBg }}
                                            />
                                            <Portal>
                                                <MenuList>
                                                    <MenuItem icon={<EditIcon />} onClick={() => handleOpen(c)}>Edit</MenuItem>
                                                    <MenuItem icon={<DeleteIcon />} color='red.500' onClick={() => handleDelete(c.id)}>Delete</MenuItem>
                                                </MenuList>
                                            </Portal>
                                        </Menu>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <Modal isOpen={isOpen} onClose={onClose} size='xl'>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editCampus ? 'Edit Campus' : 'Add Campus'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <SimpleGrid columns={1} spacing={4}>
                            <FormControl isRequired isInvalid={!!errors.name}>
                                <FormLabel>Campus Name</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                            </FormControl>
                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Phone</FormLabel>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Capacity</FormLabel>
                                <Input
                                    type='number'
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value='active'>active</option>
                                    <option value='inactive'>inactive</option>
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Address</FormLabel>
                                <Textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </FormControl>
                        </SimpleGrid>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant='ghost' mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme='blue' onClick={handleSubmit} isLoading={creating || updating}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Campuses;
