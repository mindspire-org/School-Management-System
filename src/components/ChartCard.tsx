import React, { type ReactNode } from 'react';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';

export type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
  ariaLabel?: string;
};

export default function ChartCard({ title, subtitle, children, right, ariaLabel }: ChartCardProps) {
  const bg = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200');

  return (
    <Box bg={bg} borderWidth="1px" borderColor={borderColor} borderRadius="md" boxShadow="sm" overflow="hidden">
      <Flex align="start" justify="space-between" px={5} pt={5}>
        <Box minW={0}>
          <Text fontSize="md" fontWeight={800} isTruncated>
            {title}
          </Text>
          {subtitle ? (
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} noOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {right ? <Box flexShrink={0}>{right}</Box> : null}
      </Flex>
      <Box px={5} pb={5} pt={4} aria-label={ariaLabel}>
        {children}
      </Box>
    </Box>
  );
}
