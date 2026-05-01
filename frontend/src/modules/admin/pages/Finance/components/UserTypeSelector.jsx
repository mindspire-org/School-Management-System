import React from 'react';
import { Box, Flex, Button, ButtonGroup, Badge, Text, useColorModeValue } from '@chakra-ui/react';
import { FaUserGraduate, FaChalkboardTeacher, FaTruck } from 'react-icons/fa';

/**
 * UserTypeSelector - Reusable component for selecting user type
 * @param {Object} props
 * @param {string} props.value - Current selected type ('student' | 'teacher' | 'driver')
 * @param {function} props.onChange - Callback when type changes
 * @param {Object} props.counts - User counts { students: number, teachers: number, drivers: number }
 * @param {boolean} props.disabled - Disable the selector
 * @param {boolean} props.showCounts - Show user counts in badges
 */
export default function UserTypeSelector({
    value,
    onChange,
    counts = { students: 0, teachers: 0, drivers: 0 },
    disabled = false,
    showCounts = true
}) {
    const bgActive = useColorModeValue('blue.500', 'blue.400');
    const bgInactive = useColorModeValue('gray.100', 'gray.700');
    const textActive = 'white';
    const textInactive = useColorModeValue('gray.600', 'gray.300');

    const types = [
        { key: 'student', label: 'Student', icon: FaUserGraduate, count: counts.students },
        { key: 'teacher', label: 'Teacher', icon: FaChalkboardTeacher, count: counts.teachers },
        { key: 'driver', label: 'Driver', icon: FaTruck, count: counts.drivers },
    ];

    return (
        <ButtonGroup isAttached variant="outline" size="sm">
            {types.map((t) => {
                const isActive = value === t.key;
                const isDisabled = disabled || t.count === 0;
                const Icon = t.icon;

                return (
                    <Button
                        key={t.key}
                        onClick={() => !isDisabled && onChange(t.key)}
                        bg={isActive ? bgActive : bgInactive}
                        color={isActive ? textActive : textInactive}
                        borderColor={isActive ? bgActive : 'gray.300'}
                        isDisabled={isDisabled}
                        _hover={!isDisabled ? { bg: isActive ? 'blue.600' : 'gray.200' } : {}}
                        leftIcon={<Icon />}
                        position="relative"
                        pr={showCounts && t.count > 0 ? 8 : 4}
                    >
                        {t.label}
                        {showCounts && t.count > 0 && (
                            <Badge
                                position="absolute"
                                top="-2px"
                                right="-2px"
                                colorScheme={isActive ? 'whiteAlpha' : 'blue'}
                                fontSize="xs"
                                borderRadius="full"
                            >
                                {t.count}
                            </Badge>
                        )}
                    </Button>
                );
            })}
        </ButtonGroup>
    );
}

/**
 * UserTypeFilter - Tab-style filter for viewing data by user type
 */
export function UserTypeFilter({
    value,
    onChange,
    showAll = true,
    counts = { students: 0, teachers: 0, drivers: 0 }
}) {
    const activeColor = useColorModeValue('blue.600', 'blue.300');
    const inactiveColor = useColorModeValue('gray.500', 'gray.400');
    const borderColor = useColorModeValue('blue.500', 'blue.400');

    const tabs = [
        ...(showAll ? [{ key: 'all', label: 'All', count: counts.students + counts.teachers + counts.drivers }] : []),
        { key: 'student', label: 'Students', count: counts.students },
        { key: 'teacher', label: 'Teachers', count: counts.teachers },
        { key: 'driver', label: 'Drivers', count: counts.drivers },
    ].filter(t => showAll || t.count > 0);

    return (
        <Flex gap={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            {tabs.map((t) => (
                <Box
                    key={t.key}
                    cursor="pointer"
                    py={2}
                    px={1}
                    borderBottomWidth={2}
                    borderColor={value === t.key ? borderColor : 'transparent'}
                    color={value === t.key ? activeColor : inactiveColor}
                    fontWeight={value === t.key ? '600' : '400'}
                    onClick={() => onChange(t.key)}
                    transition="all 0.2s"
                    _hover={{ color: activeColor }}
                >
                    <Flex align="center" gap={2}>
                        <Text fontSize="sm">{t.label}</Text>
                        {t.count > 0 && (
                            <Badge size="sm" colorScheme={value === t.key ? 'blue' : 'gray'}>
                                {t.count}
                            </Badge>
                        )}
                    </Flex>
                </Box>
            ))}
        </Flex>
    );
}
