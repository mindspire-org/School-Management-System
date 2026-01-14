import React from 'react';
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Icon,
    Badge,
    useColorModeValue,
} from '@chakra-ui/react';

const StatCard = ({ title, value, subValue, note, icon, trend, trendValue, colorScheme = 'blue' }) => {
    // Professional Pastel Palette with polished accents
    const colors = {
        blue: { bg: '#E3F2FD', text: '#1565C0', iconBg: '#FFFFFF', border: '#BBDEFB' },
        green: { bg: '#E8F5E9', text: '#2E7D32', iconBg: '#FFFFFF', border: '#C8E6C9' },
        red: { bg: '#FFEBEE', text: '#C62828', iconBg: '#FFFFFF', border: '#FFCDD2' },
        orange: { bg: '#FFF3E0', text: '#EF6C00', iconBg: '#FFFFFF', border: '#FFE0B2' },
        purple: { bg: '#F3E5F5', text: '#6A1B9A', iconBg: '#FFFFFF', border: '#E1BEE7' },
        cyan: { bg: '#E0F7FA', text: '#00838F', iconBg: '#FFFFFF', border: '#B2EBF2' },
        yellow: { bg: '#FFFDE7', text: '#F9A825', iconBg: '#FFFFFF', border: '#FFF9C4' },
    };

    const theme = colors[colorScheme] || colors.blue;
    const bg = useColorModeValue(theme.bg, 'gray.800');
    const color = useColorModeValue(theme.text, 'white');
    const iconBg = useColorModeValue(theme.iconBg, 'whiteAlpha.200');
    const borderColor = useColorModeValue(theme.border, 'whiteAlpha.100');

    return (
        <Box
            bg={bg}
            p='24px'
            borderRadius='20px'
            border='1px solid'
            borderColor={borderColor}
            position='relative'
            overflow='hidden'
            transition='all 0.3s ease-out'
            _hover={{
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)'
            }}
        >
            <Flex justify='space-between' align='start' mb='10px'>
                <Flex
                    align='center'
                    justify='center'
                    w='48px'
                    h='48px'
                    borderRadius='14px'
                    bg={iconBg}
                    boxShadow="sm"
                    transition='transform 0.3s ease'
                    _groupHover={{ transform: 'scale(1.1)' }}
                >
                    <Icon as={icon} w='22px' h='22px' color={color} />
                </Flex>
                {trend && (
                    <Badge
                        bg={trend === 'up' ? 'green.100' : 'red.100'}
                        color={trend === 'up' ? 'green.700' : 'red.700'}
                        borderRadius='full'
                        px='3'
                        py='1'
                        fontSize='xs'
                        fontWeight='700'
                    >
                        {trend === 'up' ? '↑' : '↓'} {trendValue}%
                    </Badge>
                )}
            </Flex>

            <VStack align='start' spacing='4px' mt='5px'>
                <Text color={color} fontSize='xs' fontWeight='700' textTransform="uppercase" letterSpacing="0.8px" opacity={0.8}>
                    {title}
                </Text>
                <Text color={color} fontSize='2xl' fontWeight='800' letterSpacing="-0.5px">
                    {value}
                </Text>
                {subValue && (
                    <Text color={color} fontSize='xs' fontWeight='600' opacity={0.7}>
                        {subValue}
                    </Text>
                )}
                {note && (
                    <Text color={color} fontSize='10px' fontWeight='500' opacity={0.6} mt='2px'>
                        {note}
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default StatCard;
