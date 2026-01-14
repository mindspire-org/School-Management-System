import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    List,
    ListItem,
    Text,
    Flex,
    Badge,
    Spinner,
    useColorModeValue,
    FormErrorMessage,
} from '@chakra-ui/react';
import { MdSearch, MdPerson } from 'react-icons/md';
import { FaUserGraduate, FaChalkboardTeacher, FaTruck } from 'react-icons/fa';
import { financeApi } from '../../../../../services/financeApi';

/**
 * UserSelector - Searchable dropdown for selecting a specific user
 * @param {Object} props
 * @param {string} props.userType - Type of user to fetch ('student' | 'teacher' | 'driver')
 * @param {Object} props.value - Selected user object { id, name, ... }
 * @param {function} props.onChange - Callback when user is selected
 * @param {boolean} props.isRequired - Whether selection is required
 * @param {string} props.error - Error message to display
 * @param {boolean} props.disabled - Disable the selector
 */
export default function UserSelector({
    userType,
    value,
    onChange,
    isRequired = false,
    error = '',
    disabled = false,
    label = 'Select User',
}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const selectedBg = useColorModeValue('blue.50', 'blue.900');

    // Fetch users when userType changes
    useEffect(() => {
        if (!userType) {
            setUsers([]);
            return;
        }

        setLoading(true);
        financeApi.getUsersByType(userType)
            .then((data) => setUsers(data.items || []))
            .catch((e) => console.error('Failed to fetch users:', e))
            .finally(() => setLoading(false));
    }, [userType]);

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const s = search.toLowerCase();
        return users.filter((u) =>
            u.name?.toLowerCase().includes(s) ||
            u.email?.toLowerCase().includes(s) ||
            u.rollNumber?.toLowerCase().includes(s) ||
            u.employeeId?.toLowerCase().includes(s) ||
            u.licenseNumber?.toLowerCase().includes(s)
        );
    }, [users, search]);

    const handleSelect = (user) => {
        onChange(user);
        setSearch('');
        setIsOpen(false);
    };

    const getIcon = () => {
        switch (userType) {
            case 'student': return FaUserGraduate;
            case 'teacher': return FaChalkboardTeacher;
            case 'driver': return FaTruck;
            default: return MdPerson;
        }
    };

    const getSecondaryInfo = (user) => {
        switch (userType) {
            case 'student':
                return user.class && user.section ? `${user.class}-${user.section}` : user.rollNumber || user.email;
            case 'teacher':
                return user.department || user.designation || user.employeeId;
            case 'driver':
                return user.licenseNumber || user.phone;
            default:
                return user.email;
        }
    };

    const Icon = getIcon();

    return (
        <FormControl isInvalid={!!error} isRequired={isRequired}>
            <FormLabel fontSize="sm">{label}</FormLabel>
            <Box position="relative">
                {/* Selected user display or search input */}
                {value ? (
                    <Flex
                        p={2}
                        borderWidth={1}
                        borderColor={borderColor}
                        borderRadius="md"
                        align="center"
                        justify="space-between"
                        bg={selectedBg}
                        cursor={disabled ? 'not-allowed' : 'pointer'}
                        onClick={() => !disabled && setIsOpen(true)}
                    >
                        <Flex align="center" gap={2}>
                            <Icon />
                            <Box>
                                <Text fontWeight="500" fontSize="sm">{value.name}</Text>
                                <Text fontSize="xs" color="gray.500">{getSecondaryInfo(value)}</Text>
                            </Box>
                        </Flex>
                        {!disabled && (
                            <Badge
                                colorScheme="red"
                                cursor="pointer"
                                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                            >
                                Clear
                            </Badge>
                        )}
                    </Flex>
                ) : (
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            {loading ? <Spinner size="sm" /> : <MdSearch color="gray.400" />}
                        </InputLeftElement>
                        <Input
                            placeholder={userType ? `Search ${userType}...` : 'Select user type first'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setIsOpen(true)}
                            isDisabled={disabled || !userType}
                        />
                    </InputGroup>
                )}

                {/* Dropdown list */}
                {isOpen && !value && filteredUsers.length > 0 && (
                    <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        zIndex={10}
                        bg={bg}
                        borderWidth={1}
                        borderColor={borderColor}
                        borderRadius="md"
                        boxShadow="lg"
                        maxH="200px"
                        overflowY="auto"
                        mt={1}
                    >
                        <List spacing={0}>
                            {filteredUsers.map((user) => (
                                <ListItem
                                    key={user.id}
                                    p={2}
                                    cursor="pointer"
                                    _hover={{ bg: hoverBg }}
                                    onClick={() => handleSelect(user)}
                                >
                                    <Flex align="center" gap={2}>
                                        <Icon size={14} />
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500">{user.name}</Text>
                                            <Text fontSize="xs" color="gray.500">{getSecondaryInfo(user)}</Text>
                                        </Box>
                                    </Flex>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {/* No results message */}
                {isOpen && !value && search && filteredUsers.length === 0 && !loading && (
                    <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        zIndex={10}
                        bg={bg}
                        borderWidth={1}
                        borderColor={borderColor}
                        borderRadius="md"
                        p={3}
                        mt={1}
                    >
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                            No {userType}s found matching "{search}"
                        </Text>
                    </Box>
                )}
            </Box>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}

            {/* Click outside to close */}
            {isOpen && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    zIndex={5}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </FormControl>
    );
}
