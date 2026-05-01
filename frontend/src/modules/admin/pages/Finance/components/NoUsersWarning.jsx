import React from 'react';
import { Box, Flex, Heading, Text, Button, Icon, useColorModeValue, VStack } from '@chakra-ui/react';
import { MdWarning, MdPersonAdd } from 'react-icons/md';
import { FaUserGraduate, FaChalkboardTeacher, FaTruck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * NoUsersWarning - Displayed when no users exist in the system
 * @param {Object} props
 * @param {Object} props.counts - User counts { students: number, teachers: number, drivers: number }
 * @param {string} props.message - Custom message to display
 */
export default function NoUsersWarning({
    counts = { students: 0, teachers: 0, drivers: 0 },
    message = 'Please add a Student, Teacher, or Driver before creating financial records.'
}) {
    const navigate = useNavigate();
    const bg = useColorModeValue('orange.50', 'orange.900');
    const borderColor = useColorModeValue('orange.200', 'orange.700');
    const iconColor = useColorModeValue('orange.400', 'orange.300');

    const hasNoUsers = counts.students === 0 && counts.teachers === 0 && counts.drivers === 0;

    if (!hasNoUsers) return null;

    const links = [
        { label: 'Add Student', path: '/admin/students/add', icon: FaUserGraduate, count: counts.students },
        { label: 'Add Teacher', path: '/admin/teachers/add', icon: FaChalkboardTeacher, count: counts.teachers },
        { label: 'Add Driver', path: '/admin/transport/drivers', icon: FaTruck, count: counts.drivers },
    ];

    return (
        <Box
            bg={bg}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="lg"
            p={6}
            mb={6}
        >
            <Flex align="center" gap={4}>
                <Icon as={MdWarning} w={10} h={10} color={iconColor} />
                <Box flex={1}>
                    <Heading size="sm" mb={1}>No Users Found</Heading>
                    <Text color={useColorModeValue('gray.600', 'gray.300')}>
                        {message}
                    </Text>
                </Box>
            </Flex>

            <Flex mt={4} gap={3} wrap="wrap">
                {links.map((link) => (
                    <Button
                        key={link.path}
                        size="sm"
                        leftIcon={<link.icon />}
                        colorScheme="blue"
                        variant={link.count === 0 ? 'solid' : 'outline'}
                        onClick={() => navigate(link.path)}
                    >
                        {link.label}
                    </Button>
                ))}
            </Flex>
        </Box>
    );
}

/**
 * FinanceEmptyState - Generic empty state for finance sections
 */
export function FinanceEmptyState({
    title = 'No Records Found',
    message = 'Create your first record to get started.',
    actionLabel,
    onAction
}) {
    const bg = useColorModeValue('gray.50', 'gray.800');
    const textColor = useColorModeValue('gray.500', 'gray.400');

    return (
        <Box
            bg={bg}
            borderRadius="lg"
            p={10}
            textAlign="center"
        >
            <VStack spacing={3}>
                <Icon as={MdPersonAdd} w={12} h={12} color={textColor} />
                <Heading size="md" color={textColor}>{title}</Heading>
                <Text color={textColor}>{message}</Text>
                {actionLabel && onAction && (
                    <Button colorScheme="blue" onClick={onAction} mt={2}>
                        {actionLabel}
                    </Button>
                )}
            </VStack>
        </Box>
    );
}

/**
 * UserRequiredNotice - Inline notice reminding to select a user
 */
export function UserRequiredNotice() {
    const bg = useColorModeValue('blue.50', 'blue.900');
    const borderColor = useColorModeValue('blue.200', 'blue.700');

    return (
        <Box
            bg={bg}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="md"
            p={3}
            mb={4}
        >
            <Flex align="center" gap={2}>
                <Icon as={MdWarning} color="blue.500" />
                <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')}>
                    You must select a user type and user before creating a financial record.
                </Text>
            </Flex>
        </Box>
    );
}
