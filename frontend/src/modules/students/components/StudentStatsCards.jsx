import React from 'react';
import {
  SimpleGrid,
  Flex,
  Icon,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import {
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdPeopleOutline,
  MdDirectionsBus,
  MdPayment,
} from 'react-icons/md';

const StudentStatsCards = ({ stats = {} }) => {
  // Default stats values if not provided
  const defaultStats = {
    totalStudents: 1250,
    activeStudents: 1180,
    inactiveStudents: 70,
    newThisMonth: 45,
    busUsers: 780,
    paidFeesCount: 950,
    pendingFeesCount: 180,
    overdueFeesCount: 120,
    averageAttendance: 92.4,
  };
  
  // Merge provided stats with defaults
  const mergedStats = { ...defaultStats, ...stats };
  
  // UI colors
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'white');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const greenColor = useColorModeValue('green.500', 'green.400');
  const redColor = useColorModeValue('red.500', 'red.400');
  const blueColor = useColorModeValue('blue.500', 'blue.400');
  const orangeColor = useColorModeValue('orange.500', 'orange.400');

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="20px" mb="20px">
      {/* Total Students Card */}
      <Card>
        <Flex direction="column">
          <Flex align="center" mb="20px">
            <Icon as={MdPerson} h="24px" w="24px" color={brandColor} me="12px" />
            <Text fontSize="lg" fontWeight="700" color={textColor}>
              Total Students
            </Text>
          </Flex>
          <Text fontSize="34px" fontWeight="700" color={textColor}>
            {mergedStats.totalStudents}
          </Text>
          <Flex align="center">
            <Stat size="sm" display="inline-flex" mr={1}>
              <StatHelpText mb={0}>
                <StatArrow type="increase" />
                {Math.round((mergedStats.newThisMonth / mergedStats.totalStudents) * 100)}%
              </StatHelpText>
            </Stat>
            <Text fontSize="sm" color={textColorSecondary}>
              {mergedStats.newThisMonth} new this month
            </Text>
          </Flex>
        </Flex>
      </Card>
      
      {/* Active Students Card */}
      <Card>
        <Flex direction="column">
          <Flex align="center" mb="20px">
            <Icon as={MdCheckCircle} h="24px" w="24px" color={greenColor} me="12px" />
            <Text fontSize="lg" fontWeight="700" color={textColor}>
              Active Students
            </Text>
          </Flex>
          <Text fontSize="34px" fontWeight="700" color={greenColor}>
            {mergedStats.activeStudents}
          </Text>
          <Text fontSize="sm" color={textColorSecondary} mt="8px">
            {Math.round((mergedStats.activeStudents / mergedStats.totalStudents) * 100)}% of total
          </Text>
        </Flex>
      </Card>
      
      {/* Inactive Students Card */}
      <Card>
        <Flex direction="column">
          <Flex align="center" mb="20px">
            <Icon as={MdCancel} h="24px" w="24px" color={redColor} me="12px" />
            <Text fontSize="lg" fontWeight="700" color={textColor}>
              Inactive Students
            </Text>
          </Flex>
          <Text fontSize="34px" fontWeight="700" color={redColor}>
            {mergedStats.inactiveStudents}
          </Text>
          <Text fontSize="sm" color={textColorSecondary} mt="8px">
            {Math.round((mergedStats.inactiveStudents / mergedStats.totalStudents) * 100)}% of total
          </Text>
        </Flex>
      </Card>
      
      {/* Bus Users Card */}
      <Card>
        <Flex direction="column">
          <Flex align="center" mb="20px">
            <Icon as={MdDirectionsBus} h="24px" w="24px" color={blueColor} me="12px" />
            <Text fontSize="lg" fontWeight="700" color={textColor}>
              Bus Transport
            </Text>
          </Flex>
          <Text fontSize="34px" fontWeight="700" color={blueColor}>
            {mergedStats.busUsers}
          </Text>
          <Text fontSize="sm" color={textColorSecondary} mt="8px">
            {Math.round((mergedStats.busUsers / mergedStats.totalStudents) * 100)}% of total
          </Text>
        </Flex>
      </Card>
    </SimpleGrid>
  );
};

export default StudentStatsCards;
