import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Flex,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorModeValue,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Icon,
    Input,
    Select,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    FormControl,
    FormLabel,
    Badge,
    Switch,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdSchool, MdWork, MdAttachMoney, MdApartment } from 'react-icons/md';
import Card from '../../../components/card/Card'; // Check correct path
import { masterDataApi } from '../../../services/api';

export default function MasterDataManagement() {
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const bg = useColorModeValue('white', 'navy.800');
    const toast = useToast();

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex direction='column'>
                <Box mb='20px'>
                    <Text fontSize='2xl' fontWeight='700' color={textColor}>
                        Master Data Management
                    </Text>
                    <Text fontSize='md' color='gray.500'>
                        Manage school-wide settings: Subjects, Designations, and Fee Structures.
                    </Text>
                </Box>

                <Card p='20px'>
                    <Tabs variant='soft-rounded' colorScheme='brand'>
                        <TabList mb='1em'>
                            <Tab _selected={{ color: 'white', bg: 'brand.500' }}>
                                <Icon as={MdSchool} mr='2' /> Subjects
                            </Tab>
                            <Tab _selected={{ color: 'white', bg: 'brand.500' }}>
                                <Icon as={MdWork} mr='2' /> Designations
                            </Tab>
                            <Tab _selected={{ color: 'white', bg: 'brand.500' }}>
                                <Icon as={MdAttachMoney} mr='2' /> Fee Rules
                            </Tab>
                            <Tab _selected={{ color: 'white', bg: 'brand.500' }}>
                                <Icon as={MdApartment} mr='2' /> Departments
                            </Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <SubjectsManager />
                            </TabPanel>
                            <TabPanel>
                                <DesignationsManager />
                            </TabPanel>
                            <TabPanel>
                                <FeeRulesManager />
                            </TabPanel>
                            <TabPanel>
                                <DepartmentsManager />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Card>
            </Flex>
        </Box>
    );
}

// --- Sub-Components ---

const SubjectsManager = () => {
    const [data, setData] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', category: 'General', isShared: true });
    const toast = useToast();

    const load = async () => {
        try {
            const res = await masterDataApi.getSubjects();
            setData(res.data || res); // Handle potential axios wrapper diffs
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        try {
            if (editing) {
                await masterDataApi.updateSubject(editing.id, form);
                toast({ title: 'Updated', status: 'success' });
            } else {
                await masterDataApi.createSubject(form);
                toast({ title: 'Created', status: 'success' });
            }
            onClose();
            setEditing(null);
            setForm({ name: '', code: '', category: 'General', isShared: true });
            load();
        } catch (e) {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    };

    const handleEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name,
            code: item.code,
            category: item.category,
            isShared: item.is_shared ?? item.isShared ?? true,
        });
        onOpen();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await masterDataApi.deleteSubject(id);
            toast({ title: 'Deleted', status: 'success' });
            load();
        } catch (e) {
            toast({ title: 'Error', status: 'error' });
        }
    };

    return (
        <Box>
            <Flex justify='flex-end' mb='4'>
                <Button leftIcon={<MdAdd />} colorScheme='brand' onClick={() => { setEditing(null); setForm({ name: '', code: '', category: 'General', isShared: true }); onOpen(); }}>
                    Add Subject
                </Button>
            </Flex>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Code</Th>
                        <Th>Category</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((item) => (
                        <Tr key={item.id}>
                            <Td fontWeight='bold'>{item.name}</Td>
                            <Td><Badge>{item.code}</Badge></Td>
                            <Td>{item.category}</Td>
                            <Td>
                                <IconButton icon={<MdEdit />} size='sm' mr='2' onClick={() => handleEdit(item)} />
                                <IconButton icon={<MdDelete />} size='sm' colorScheme='red' onClick={() => handleDelete(item.id)} />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editing ? 'Edit Subject' : 'Add Subject'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb='3'>
                            <FormLabel>Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb='3'>
                            <FormLabel>Code</FormLabel>
                            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                        </FormControl>
                        <FormControl mb='3'>
                            <FormLabel>Category</FormLabel>
                            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                <option value='General'>General</option>
                                <option value='Science'>Science</option>
                                <option value='Arts'>Arts</option>
                                <option value='Language'>Language</option>
                            </Select>
                        </FormControl>
                        <FormControl mb='3' display='flex' alignItems='center'>
                            <FormLabel htmlFor='isSharedSub' mb='0'>
                                Share across all campuses?
                            </FormLabel>
                            <Switch
                                id='isSharedSub'
                                isChecked={form.isShared ?? true}
                                onChange={(e) => setForm({ ...form, isShared: e.target.checked })}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='brand' onClick={handleSave}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const DesignationsManager = () => {
    const [data, setData] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', department: '', isShared: true });
    const toast = useToast();

    const load = async () => {
        try {
            const res = await masterDataApi.getDesignations();
            setData(res.data || res);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        try {
            if (editing) {
                await masterDataApi.updateDesignation(editing.id, form);
                toast({ title: 'Updated', status: 'success' });
            } else {
                await masterDataApi.createDesignation(form);
                toast({ title: 'Created', status: 'success' });
            }
            onClose();
            setEditing(null);
            setForm({ title: '', department: '', isShared: true });
            load();
        } catch (e) {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await masterDataApi.deleteDesignation(id);
            toast({ title: 'Deleted', status: 'success' });
            load();
        } catch (e) {
            toast({ title: 'Error', status: 'error' });
        }
    };

    return (
        <Box>
            <Flex justify='flex-end' mb='4'>
                <Button leftIcon={<MdAdd />} colorScheme='brand' onClick={() => { setEditing(null); setForm({ title: '', department: '', isShared: true }); onOpen(); }}>
                    Add Designation
                </Button>
            </Flex>
            <Table variant='simple'>
                <Thead><Tr><Th>Title</Th><Th>Department</Th><Th>Actions</Th></Tr></Thead>
                <Tbody>
                    {data.map((item) => (
                        <Tr key={item.id}>
                            <Td fontWeight='bold'>{item.title}</Td>
                            <Td>{item.department}</Td>
                            <Td>
                                <IconButton icon={<MdEdit />} size='sm' mr='2' onClick={() => { setEditing(item); setForm({ title: item.title, department: item.department, isShared: item.is_shared ?? item.isShared ?? true }); onOpen(); }} />
                                <IconButton icon={<MdDelete />} size='sm' colorScheme='red' onClick={() => handleDelete(item.id)} />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editing ? 'Edit' : 'Add'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb='3'>
                            <FormLabel>Title</FormLabel>
                            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </FormControl>
                        <FormControl mb='3'>
                            <FormLabel>Department</FormLabel>
                            <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                        </FormControl>
                        <FormControl mb='3' display='flex' alignItems='center'>
                            <FormLabel htmlFor='isSharedDes' mb='0'>
                                Share across all campuses?
                            </FormLabel>
                            <Switch
                                id='isSharedDes'
                                isChecked={form.isShared ?? true}
                                onChange={(e) => setForm({ ...form, isShared: e.target.checked })}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter><Button colorScheme='brand' onClick={handleSave}>Save</Button></ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const FeeRulesManager = () => {
    const [data, setData] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ fee_type: 'Tuition', amount: 0, frequency: 'Monthly', class_id: null, isShared: true });
    const toast = useToast();

    const load = async () => {
        try {
            const res = await masterDataApi.getFeeRules();
            setData(res.data || res);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        try {
            if (editing) {
                await masterDataApi.updateFeeRule(editing.id, form);
                toast({ title: 'Updated', status: 'success' });
            } else {
                await masterDataApi.createFeeRule(form);
                toast({ title: 'Created', status: 'success' });
            }
            onClose();
            setEditing(null);
            setForm({ fee_type: 'Tuition', amount: 0, frequency: 'Monthly', class_id: null, isShared: true });
            load();
        } catch (e) {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await masterDataApi.deleteFeeRule(id);
            toast({ title: 'Deleted', status: 'success' });
            load();
        } catch (e) {
            toast({ title: 'Error', status: 'error' });
        }
    };

    return (
        <Box>
            <Flex justify='flex-end' mb='4'>
                <Button leftIcon={<MdAdd />} colorScheme='brand' onClick={() => { setEditing(null); setForm({ fee_type: 'Tuition', amount: 0, frequency: 'Monthly', class_id: null, isShared: true }); onOpen(); }}>
                    Add Rule
                </Button>
            </Flex>
            <Table variant='simple'>
                <Thead><Tr><Th>Type</Th><Th>Amount</Th><Th>Frequency</Th><Th>Actions</Th></Tr></Thead>
                <Tbody>
                    {data.map((item) => (
                        <Tr key={item.id}>
                            <Td fontWeight='bold'>{item.fee_type}</Td>
                            <Td>{item.amount}</Td>
                            <Td><Badge colorScheme='purple'>{item.frequency}</Badge></Td>
                            <Td>
                                <IconButton icon={<MdEdit />} size='sm' mr='2' onClick={() => { setEditing(item); setForm({ ...item, isShared: item.is_shared ?? item.isShared ?? true }); onOpen(); }} />
                                <IconButton icon={<MdDelete />} size='sm' colorScheme='red' onClick={() => handleDelete(item.id)} />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editing ? 'Edit Rule' : 'Add Rule'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb='3'>
                            <FormLabel>Type</FormLabel>
                            <Select value={form.fee_type} onChange={e => setForm({ ...form, fee_type: e.target.value })}>
                                <option value='Tuition'>Tuition</option>
                                <option value='Admission'>Admission</option>
                                <option value='Transport'>Transport</option>
                                <option value='Exam'>Exam</option>
                                <option value='Lab'>Lab</option>
                            </Select>
                        </FormControl>
                        <FormControl mb='3'>
                            <FormLabel>Amount</FormLabel>
                            <Input type='number' value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                        </FormControl>
                        <FormControl mb='3'>
                            <FormLabel>Frequency</FormLabel>
                            <Select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                                <option value='Monthly'>Monthly</option>
                                <option value='One-Time'>One-Time</option>
                                <option value='Annual'>Annual</option>
                            </Select>
                        </FormControl>
                        <FormControl mb='3' display='flex' alignItems='center'>
                            <FormLabel htmlFor='isSharedFee' mb='0'>
                                Share across all campuses?
                            </FormLabel>
                            <Switch
                                id='isSharedFee'
                                isChecked={form.isShared ?? true}
                                onChange={(e) => setForm({ ...form, isShared: e.target.checked })}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter><Button colorScheme='brand' onClick={handleSave}>Save</Button></ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

const DepartmentsManager = () => {
    const [data, setData] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', isShared: true });
    const toast = useToast();

    const load = async () => {
        try {
            const res = await masterDataApi.getDepartments();
            setData(res.data || res);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        try {
            if (editing) {
                await masterDataApi.updateDepartment(editing.id, form);
                toast({ title: 'Updated', status: 'success' });
            } else {
                await masterDataApi.createDepartment(form);
                toast({ title: 'Created', status: 'success' });
            }
            onClose();
            setEditing(null);
            setForm({ name: '', code: '', isShared: true });
            load();
        } catch (e) {
            toast({ title: 'Error', description: e.message, status: 'error' });
        }
    };

    const handleEdit = (item) => {
        setEditing(item);
        setForm({ name: item.name, code: item.code || '', isShared: item.is_shared ?? item.isShared ?? true });
        onOpen();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await masterDataApi.deleteDepartment(id);
            toast({ title: 'Deleted', status: 'success' });
            load();
        } catch (e) {
            toast({ title: 'Error', status: 'error' });
        }
    };

    return (
        <Box>
            <Flex justify='flex-end' mb='4'>
                <Button leftIcon={<MdAdd />} colorScheme='brand' onClick={() => { setEditing(null); setForm({ name: '', code: '', isShared: true }); onOpen(); }}>
                    Add Department
                </Button>
            </Flex>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Code</Th>
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.map((item) => (
                        <Tr key={item.id}>
                            <Td fontWeight='bold'>{item.name}</Td>
                            <Td><Badge>{item.code || '-'}</Badge></Td>
                            <Td>
                                <IconButton icon={<MdEdit />} size='sm' mr='2' onClick={() => handleEdit(item)} />
                                <IconButton icon={<MdDelete />} size='sm' colorScheme='red' onClick={() => handleDelete(item.id)} />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editing ? 'Edit Department' : 'Add Department'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl mb='3'>
                            <FormLabel>Name</FormLabel>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </FormControl>
                        <FormControl mb='3'>
                            <FormLabel>Code</FormLabel>
                            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                        </FormControl>
                        <FormControl mb='3' display='flex' alignItems='center'>
                            <FormLabel htmlFor='isSharedDept' mb='0'>
                                Share across all campuses?
                            </FormLabel>
                            <Switch
                                id='isSharedDept'
                                isChecked={form.isShared ?? true}
                                onChange={(e) => setForm({ ...form, isShared: e.target.checked })}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='brand' onClick={handleSave}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};
