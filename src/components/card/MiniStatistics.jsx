// Chakra imports
// Chakra imports
import {
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Text,
  Box,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import Sparkline from "components/charts/Sparkline.tsx";
// Custom icons
import React from "react";

export default function Default(props) {
  const {
    startContent,
    endContent,
    name,
    growth,
    value,
    // optional mini graph data for percentage cards
    trendData,
    trendColor,
    trendFormatter,
    compact,
  } = props;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "secondaryGray.600";
  const hoverShadow = useColorModeValue(
    "0 12px 30px rgba(15, 23, 42, 0.10)",
    "0 12px 30px rgba(15, 23, 42, 0.65)"
  );

  return (
    <Card
      py={compact ? { base: '12px', md: '14px' } : '18px'}
      cursor='pointer'
      transition='all 0.2s ease'
      _hover={{ boxShadow: hoverShadow, transform: "translateY(-2px)" }}
      _active={{ boxShadow: hoverShadow, transform: "translateY(0px)" }}
    >
      {/* Top row: icon + main value on the left, growth text on the right */}
      <Flex
        my='auto'
        w='100%'
        align='center'
        justify='space-between'
        gap={compact ? 3 : 4}
        flexWrap='wrap'
        rowGap={2}
      >
        <Flex align='center' gap={compact ? 3 : 4} minW='0'>
          {startContent}

          <Stat my='auto' ms={startContent ? "4px" : "0px"} minW='0'>
            <StatLabel
              lineHeight='100%'
              color={textColor}
              fontWeight='600'
              fontSize={{
                base: "sm",
                md: "md",
              }}
              noOfLines={1}
            >
              {name}
            </StatLabel>
            <StatNumber
              color={textColor}
              fontSize={{
                base: "2xl",
                md: "3xl",
              }}
            >
              {value}
            </StatNumber>
          </Stat>
        </Flex>

        {growth ? (
          <Flex
            align='flex-end'
            direction='column'
            ms='auto'
            minW='max-content'
          >
            <Text color='green.500' fontSize='sm' fontWeight='700'>
              {growth}
            </Text>
            <Text color='secondaryGray.600' fontSize='xs' fontWeight='400' display={{ base: 'none', md: 'block' }}>
              since last month
            </Text>
          </Flex>
        ) : (
          <Flex ms='auto' display={{ base: 'none', md: 'flex' }}>{endContent}</Flex>
        )}
      </Flex>

      {/* Bottom row: full-width sparkline graph */}
      {trendData && trendData.length > 0 && (
        <Box w='100%' h={compact ? '36px' : '48px'} mt={compact ? 3 : 4}>
          <Sparkline
            ariaLabel={`${name || 'Metric'} trend`}
            data={trendData}
            color={trendColor}
            height={compact ? 36 : 48}
            type="line"
            valueFormatter={trendFormatter}
          />
        </Box>
      )}
    </Card>
  );
}
