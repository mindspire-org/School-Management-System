import React, { useMemo } from 'react';
import { Box, Flex, Text, VStack, useColorModeValue } from '@chakra-ui/react';

export type GeoValue = {
  countryCode: string;
  countryName?: string;
  value: number;
};

export type GeoMapPlaceholderProps = {
  data: GeoValue[];
  ariaLabel: string;
  onInitMap?: (container: HTMLDivElement, data: GeoValue[]) => void;
};

export default function GeoMapPlaceholder({ data, ariaLabel, onInitMap }: GeoMapPlaceholderProps) {
  const bg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  const top = useMemo(() => {
    const sorted = [...(data || [])].sort((a, b) => (b.value || 0) - (a.value || 0));
    return sorted.slice(0, 6);
  }, [data]);

  return (
    <Box aria-label={ariaLabel} role="img">
      <Box
        bg={bg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        minH="220px"
        p={4}
        ref={(el) => {
          if (el && typeof onInitMap === 'function') onInitMap(el, data);
        }}
      >
        <Flex direction="column" h="full" justify="center" align="center" textAlign="center" gap={2}>
          <Text fontWeight={800}>Map integration placeholder</Text>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            Hook available via <Box as="span" fontFamily="mono">onInitMap</Box>
          </Text>
        </Flex>
      </Box>

      <VStack align="stretch" spacing={2} mt={3}>
        {top.map((c) => (
          <Flex key={c.countryCode} justify="space-between" fontSize="sm">
            <Text fontWeight={700}>{c.countryName || c.countryCode}</Text>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>{c.value.toLocaleString()}</Text>
          </Flex>
        ))}
        {top.length === 0 ? <Text fontSize="sm">No geo data available.</Text> : null}
      </VStack>

      <noscript>Map and geo widgets require JavaScript.</noscript>
    </Box>
  );
}
