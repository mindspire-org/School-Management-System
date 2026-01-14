import React from 'react';
import { Badge, Box, Flex, HStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import Sparkline from './charts/v2/Sparkline';

export type StatsCardProps = {
  title: string;
  subtitle?: string;
  value: string | number;
  delta?: string;
  icon?: React.ElementType;
  sparkline?: number[];
  ariaLabel?: string;
};

export default function StatsCard({ title, subtitle, value, delta, icon, sparkline, ariaLabel }: StatsCardProps) {
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');
  const deltaBg = useColorModeValue('green.50', 'green.900');
  const deltaColor = useColorModeValue('green.700', 'green.200');

  return (
    <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="md" boxShadow="sm" px={5} py={4}>
      <Flex align="start" justify="space-between" gap={3}>
        <Box minW={0}>
          <HStack spacing={2} mb={1}>
            {icon ? (
              <Flex
                w="32px"
                h="32px"
                align="center"
                justify="center"
                borderRadius="md"
                bg={useColorModeValue('brand.50', 'whiteAlpha.100')}
              >
                <Icon as={icon} color={useColorModeValue('brand.600', 'brand.200')} />
              </Flex>
            ) : null}
            <Text fontSize="sm" fontWeight={800} isTruncated>
              {title}
            </Text>
          </HStack>
          {subtitle ? (
            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          <Text fontSize="2xl" fontWeight={900} mt={2}>
            {value}
          </Text>
          {delta ? (
            <Badge mt={2} bg={deltaBg} color={deltaColor} borderRadius="full" px={2} py={1} fontSize="xs">
              {delta}
            </Badge>
          ) : null}
        </Box>

        <Box w="96px" h="44px" aria-label={ariaLabel || `${title} trend`}>
          <Sparkline ariaLabel={ariaLabel || `${title} trend`} data={sparkline || [2, 3, 3, 4, 4, 5]} height={44} />
          <noscript>
            <Text fontSize="xs">Trend chart unavailable without JavaScript.</Text>
          </noscript>
        </Box>
      </Flex>
    </Box>
  );
}
