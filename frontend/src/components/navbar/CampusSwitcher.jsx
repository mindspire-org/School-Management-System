import React, { useEffect, useState } from 'react';
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
    Text,
    Icon,
    useColorModeValue,
    Box,
    Badge,
    Image,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdExpandMore, MdSchool, MdLocationCity } from 'react-icons/md';
import { campusesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CampusSwitcher() {
    const { user, campusId, setCampusId } = useAuth();
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [readonlyCampusName, setReadonlyCampusName] = useState('');
    const navigate = useNavigate();

    // Function to get campus image based on campus name or ID
    const getCampusImage = (campus) => {
        if (campus?.image) return campus.image;
        
        // Use the academiapro-Picsart image as default for all campuses
        return '/academiapro-Picsart-AiImageEnhancer.png';
    };

    // Colors
    const menuBg = useColorModeValue('white', 'navy.800');
    const textColor = useColorModeValue('gray.700', 'white');
    const shadow = useColorModeValue(
        '0px 18px 40px rgba(112, 144, 176, 0.12)',
        '0px 18px 40px rgba(112, 144, 176, 0.12)'
    );
    const buttonBg = useColorModeValue('gray.100', 'whiteAlpha.100');
    const buttonHover = useColorModeValue('gray.200', 'whiteAlpha.200');
    const menuItemHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
    const menuItemActiveBg = useColorModeValue('brand.50', 'whiteAlpha.200');

    useEffect(() => {
        if (!['owner','superadmin'].includes(user?.role)) return;
        let mounted = true;
        campusesApi.list({ pageSize: 100 })
            .then((res) => {
                if (!mounted) return;
                const list = res?.rows || [];
                setCampuses(list);
            })
            .catch((err) => console.error('Failed to load campuses', err));
        return () => { mounted = false; };
    }, [user?.role]);

    useEffect(() => {
        if (!['owner','superadmin'].includes(user?.role)) return;

        if (!campusId || String(campusId).toLowerCase() === 'all') {
            setSelectedCampus({ id: 'all', name: 'All' });
            return;
        }
        const current = campuses.find((c) => String(c.id) === String(campusId));
        setSelectedCampus(current || { id: 'all', name: 'All' });
    }, [campusId, campuses, user?.role]);

    useEffect(() => {
        if (['owner', 'superadmin'].includes(user?.role)) return;

        // Try to get the actual campus name for the logged-in user
        const idCandidate = Number(user?.campusId || user?.campus_id || campusId);

        if (!idCandidate || !Number.isFinite(idCandidate) || idCandidate <= 0) {
            setReadonlyCampusName('Main Campus');
            return;
        }

        let mounted = true;
        const resolveName = async () => {
            try {
                // Fetch specifically for this ID
                const res = await campusesApi.getById(idCandidate);
                if (!mounted) return;
                
                const campus = res?.data || res;
                if (campus?.name) {
                    setReadonlyCampusName(campus.name);
                    return;
                }
            } catch (err) {
                console.error('CampusSwitcher: Failed to resolve campus name by ID', err);
            }

            try {
                // Fallback: list all and find
                const list = await campusesApi.list({ pageSize: 100 });
                if (!mounted) return;
                const arr = list?.rows || list?.data || [];
                const found = arr.find(c => String(c.id) === String(idCandidate));
                if (found?.name) {
                    setReadonlyCampusName(found.name);
                } else {
                    setReadonlyCampusName('Main Campus');
                }
            } catch (err) {
                console.error('CampusSwitcher: Complete failure resolving campus name', err);
                if (mounted) setReadonlyCampusName('Main Campus');
            }
        };

        resolveName();
        return () => { mounted = false; };
    }, [user?.campusId, user?.campus_id, user?.role, campusId]);

    const handleSelect = (campus) => {
        if (String(campus?.id).toLowerCase() === 'all') {
            if (!campusId || String(campusId).toLowerCase() === 'all') return;
            setSelectedCampus({ id: 'all', name: 'All' });
            setCampusId('all');
            navigate('/admin/dashboard', { replace: true });
            return;
        }

        if (String(campusId) === String(campus.id)) return;
        setSelectedCampus(campus);
        setCampusId(campus.id);
        navigate('/admin/dashboard', { replace: true });
    };

    const [isAddOpen, setAddOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', capacity: '', status: 'active' });

    const canAddCampus = ['owner','superadmin'].includes(user?.role);

    const handleCreate = async () => {
        if (!form.name.trim()) return;
        try {
            setCreating(true);
            const payload = {
                name: form.name,
                email: form.email || null,
                phone: form.phone || null,
                address: form.address || null,
                capacity: form.capacity ? Number(form.capacity) : null,
                status: form.status || 'active',
            };
            await campusesApi.create(payload);
            const res = await campusesApi.list({ pageSize: 100 });
            setCampuses(res?.rows || []);
            setAddOpen(false);
            setForm({ name: '', email: '', phone: '', address: '', capacity: '', status: 'active' });
        } finally {
            setCreating(false);
        }
    };

    if (!['owner','superadmin'].includes(user?.role)) {
        return (
            <Button
                variant='ghost'
                bg={buttonBg}
                _hover={{ bg: buttonHover }}
                _active={{ bg: buttonHover }}
                borderRadius='30px'
                px='16px'
                h='40px'
                mr='10px'
                cursor='default'
            >
                <Flex alignItems='center'>
                    <Image 
                        src='/academiapro-Picsart-AiImageEnhancer.png' 
                        alt='Campus Logo' 
                        w='24px' 
                        h='24px' 
                        mr='8px' 
                        borderRadius='4px'
                        objectFit='cover'
                        fallback={<Icon as={MdSchool} color='brand.500' w='18px' h='18px' />}
                    />
                    <Text fontSize='sm' fontWeight='700' color={textColor}>
                        {readonlyCampusName || 'Campus'}
                    </Text>
                </Flex>
            </Button>
        );
    }

    return (
        <>
        <Menu closeOnSelect={true}>
            <MenuButton
                as={Button}
                rightIcon={<Icon as={MdExpandMore} color='gray.500' />}
                variant='ghost'
                bg={buttonBg}
                _hover={{ bg: buttonHover }}
                _active={{ bg: buttonHover }}
                borderRadius='30px'
                px='16px'
                h='40px'
                mr='10px'
            >
                <Flex alignItems='center'>
                    <Image 
                        src='/academiapro-Picsart-AiImageEnhancer.png' 
                        alt='Campus Logo' 
                        w='24px' 
                        h='24px' 
                        mr='8px' 
                        borderRadius='4px'
                        objectFit='cover'
                        fallback={<Icon as={MdSchool} color='brand.500' w='18px' h='18px' />}
                    />
                    <Text fontSize='sm' fontWeight='700' color={textColor}>
                        {selectedCampus ? selectedCampus.name : 'Select Campus'}
                    </Text>
                </Flex>
            </MenuButton>
            <MenuList
                boxShadow={shadow}
                p='10px'
                borderRadius='20px'
                bg={menuBg}
                border='none'
                mt='10px'
                zIndex='1000'
                minW='250px'
            >
                <Text
                    px='12px'
                    py='8px'
                    fontSize='xs'
                    fontWeight='bold'
                    color='gray.400'
                    textTransform='uppercase'
                >
                    Switch Campus
                </Text>
                <MenuItem
                    key={'__all__'}
                    onClick={() => handleSelect({ id: 'all', name: 'All' })}
                    borderRadius='12px'
                    _hover={{ bg: menuItemHoverBg }}
                    bg={(!campusId || String(campusId).toLowerCase() === 'all') ? menuItemActiveBg : 'transparent'}
                    mb='4px'
                >
                    <Flex alignItems='center' flex='1'>
                        <Image 
                            src='/academiapro-Picsart-AiImageEnhancer.png' 
                            alt='All Campuses' 
                            w='32px' 
                            h='32px' 
                            mr='12px' 
                            borderRadius='6px'
                            objectFit='cover'
                            fallback={<Icon as={MdSchool} color='brand.500' w='20px' h='20px' mr='12px' />}
                        />
                        <Box>
                            <Text fontWeight='700' fontSize='sm' color={textColor}>
                                All
                            </Text>
                            <Text fontSize='xs' color='gray.500'>
                                All Campuses
                            </Text>
                        </Box>
                    </Flex>
                    {(!campusId || String(campusId).toLowerCase() === 'all') && (
                        <Badge ml='auto' colorScheme='brand' borderRadius='8px'>Active</Badge>
                    )}
                </MenuItem>
                {campuses.map((campus) => (
                    <MenuItem
                        key={campus.id}
                        onClick={() => handleSelect(campus)}
                        borderRadius='12px'
                        _hover={{ bg: menuItemHoverBg }}
                        bg={String(campusId) === String(campus.id) ? menuItemActiveBg : 'transparent'}
                        mb='4px'
                    >
                        <Flex alignItems='center' flex='1'>
                            <Image 
                                src={getCampusImage(campus)} 
                                alt={campus.name} 
                                w='32px' 
                                h='32px' 
                                mr='12px' 
                                borderRadius='6px'
                                objectFit='cover'
                                fallback={
                                    <Box 
                                        w='32px' 
                                        h='32px' 
                                        mr='12px' 
                                        borderRadius='6px' 
                                        bg='brand.100' 
                                        display='flex' 
                                        alignItems='center' 
                                        justifyContent='center'
                                    >
                                        <Icon as={MdLocationCity} color='brand.500' w='20px' h='20px' />
                                    </Box>
                                }
                            />
                            <Box>
                                <Text fontWeight='700' fontSize='sm' color={textColor}>
                                    {campus.name}
                                </Text>
                                <Text fontSize='xs' color='gray.500'>
                                    {campus.city || 'Main Campus'}
                                </Text>
                            </Box>
                        </Flex>
                        {String(campusId) === String(campus.id) && (
                            <Badge ml='auto' colorScheme='brand' borderRadius='8px'>Active</Badge>
                        )}
                    </MenuItem>
                ))}
                {canAddCampus && (
                    <Box pt='8px' mt='6px' borderTop='1px solid' borderColor={useColorModeValue('gray.100', 'whiteAlpha.200')}>
                        <MenuItem
                            onClick={() => setAddOpen(true)}
                            borderRadius='12px'
                            _hover={{ bg: menuItemHoverBg }}
                            justifyContent='center'
                        >
                            <Text fontWeight='700' color='brand.600'>Add Campus</Text>
                        </MenuItem>
                    </Box>
                )}
            </MenuList>
        </Menu>
        <Modal isOpen={isAddOpen} onClose={()=>setAddOpen(false)} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Campus</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align='stretch' spacing={3}>
                        <FormControl isRequired>
                            <FormLabel>Name</FormLabel>
                            <Input value={form.name} onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input type='email' value={form.email} onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Phone</FormLabel>
                            <Input value={form.phone} onChange={(e)=>setForm(f=>({ ...f, phone: e.target.value }))} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Address</FormLabel>
                            <Input value={form.address} onChange={(e)=>setForm(f=>({ ...f, address: e.target.value }))} />
                        </FormControl>
                        <Flex gap={3}>
                            <FormControl>
                                <FormLabel>Capacity</FormLabel>
                                <Input type='number' value={form.capacity} onChange={(e)=>setForm(f=>({ ...f, capacity: e.target.value }))} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select value={form.status} onChange={(e)=>setForm(f=>({ ...f, status: e.target.value }))}>
                                    <option value='active'>active</option>
                                    <option value='inactive'>inactive</option>
                                </Select>
                            </FormControl>
                        </Flex>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button mr={3} onClick={()=>setAddOpen(false)}>Cancel</Button>
                    <Button colorScheme='blue' isLoading={creating} onClick={handleCreate}>Create</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        </>
    );
}
