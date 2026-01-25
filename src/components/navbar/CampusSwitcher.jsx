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
} from '@chakra-ui/react';
import { MdExpandMore, MdSchool } from 'react-icons/md';
import { campusesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CampusSwitcher() {
    const { user, campusId, setCampusId } = useAuth();
    const [campuses, setCampuses] = useState([]);
    const [selectedCampus, setSelectedCampus] = useState(null);

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
        if (user?.role === 'admin' || user?.role === 'owner') {
            campusesApi.list({ pageSize: 100 })
                .then(res => {
                    const list = res.rows || [];
                    setCampuses(list);
                    const current = list.find(c => String(c.id) === String(campusId));
                    setSelectedCampus(current || list[0]);
                    if (!campusId && list.length > 0) {
                        setCampusId(list[0].id);
                    }
                })
                .catch(err => console.error('Failed to load campuses', err));
        }
    }, [user, campusId]);

    const handleSelect = (campus) => {
        setSelectedCampus(campus);
        setCampusId(campus.id);
        window.location.reload(); // Refresh to ensure all data reloads for new campus
    };

    if (user?.role !== 'admin' && user?.role !== 'owner') return null;

    return (
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
                <Box display='flex' alignItems='center'>
                    <Icon as={MdSchool} color='brand.500' mr='8px' w='18px' h='18px' />
                    <Text fontSize='sm' fontWeight='700' color={textColor}>
                        {selectedCampus ? selectedCampus.name : 'Select Campus'}
                    </Text>
                </Box>
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
                {campuses.map((campus) => (
                    <MenuItem
                        key={campus.id}
                        onClick={() => handleSelect(campus)}
                        borderRadius='12px'
                        _hover={{ bg: menuItemHoverBg }}
                        bg={String(campusId) === String(campus.id) ? menuItemActiveBg : 'transparent'}
                        mb='4px'
                    >
                        <Box>
                            <Text fontWeight='700' fontSize='sm' color={textColor}>
                                {campus.name}
                            </Text>
                            <Text fontSize='xs' color='gray.500'>
                                {campus.city || 'Main Campus'}
                            </Text>
                        </Box>
                        {String(campusId) === String(campus.id) && (
                            <Badge ml='auto' colorScheme='brand' borderRadius='8px'>Active</Badge>
                        )}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
}
