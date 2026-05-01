import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  Button,
  useColorModeValue,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { MdGpsFixed, MdDirectionsBus, MdSpeed, MdMap, MdRefresh, MdSearch, MdLocationOn } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';

const mockBuses = [
  { id: 'BUS-101', route: 'R1', driver: 'Imran Khan', lat: 31.5204, lng: 74.3587, speed: 42, status: 'On Route', lastUpdate: '2m ago' },
  { id: 'BUS-102', route: 'R2', driver: 'Ali Raza', lat: 31.4504, lng: 74.3000, speed: 0, status: 'At Depot', lastUpdate: '10m ago' },
  { id: 'BUS-103', route: 'R3', driver: 'Zeeshan', lat: 31.6000, lng: 74.4000, speed: 28, status: 'On Route', lastUpdate: '1m ago' },
];

export default function LiveTracking() {
  const [search, setSearch] = useState('');
  const [route, setRoute] = useState('all');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const filtered = useMemo(() => {
    return mockBuses.filter((b) => {
      const matchesSearch = !search || b.id.toLowerCase().includes(search.toLowerCase()) || b.driver.toLowerCase().includes(search.toLowerCase());
      const matchesRoute = route === 'all' || b.route.toLowerCase() === route;
      return matchesSearch && matchesRoute;
    });
  }, [search, route]);

  const stats = useMemo(() => {
    const total = mockBuses.length;
    const onRoute = mockBuses.filter((b) => b.status === 'On Route').length;
    const atDepot = mockBuses.filter((b) => b.status === 'At Depot').length;
    const avgSpeed = Math.round(mockBuses.reduce((s, b) => s + b.speed, 0) / total);
    return { total, onRoute, atDepot, avgSpeed };
  }, []);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Live Tracking</Heading>
          <Text color={textColorSecondary}>Track buses in real time with last known positions</Text>
        </Box>
        <Button leftIcon={<MdRefresh />} colorScheme="blue" variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard title="Total Buses" value={String(stats.total)} icon={MdDirectionsBus} colorScheme="blue" />
        <StatCard title="On Route" value={String(stats.onRoute)} icon={MdGpsFixed} colorScheme="green" />
        <StatCard title="At Depot" value={String(stats.atDepot)} icon={MdMap} colorScheme="red" />
        <StatCard title="Avg Speed" value={`${stats.avgSpeed} km/h`} icon={MdSpeed} colorScheme="orange" />
      </SimpleGrid>

      {/* Toolbar */}
      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search by Bus ID or Driver' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW="200px" value={route} onChange={(e) => setRoute(e.target.value)}>
            <option value='all'>All Routes</option>
            <option value='r1'>R1</option>
            <option value='r2'>R2</option>
            <option value='r3'>R3</option>
          </Select>
        </Flex>
      </Card>

      {/* Map + Bus List */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
        <Card p={0} overflow='hidden'>
          <Box h='380px' bg={useColorModeValue('gray.100', 'gray.700')} display='flex' alignItems='center' justifyContent='center'>
            <VStack spacing={2}>
              <Icon as={MdLocationOn} boxSize={10} color='blue.500' />
              <Text color={textColorSecondary}>Map preview placeholder (integrate Map later)</Text>
            </VStack>
          </Box>
        </Card>

        <Card>
          <VStack align='stretch' spacing={3}>
            {filtered.map((b) => (
              <Flex key={b.id} p={3} borderRadius='md' _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} justify='space-between' align='center'>
                <HStack>
                  <Icon as={MdDirectionsBus} boxSize={7} color='blue.500' />
                  <Box>
                    <Text fontWeight='600'>{b.id} • Route {b.route}</Text>
                    <Text fontSize='sm' color={textColorSecondary}>Driver: {b.driver}</Text>
                  </Box>
                </HStack>
                <HStack>
                  <Badge colorScheme={b.status === 'On Route' ? 'green' : 'gray'}>{b.status}</Badge>
                  <Badge colorScheme='purple'>{b.speed} km/h</Badge>
                  <Text fontSize='sm' color={textColorSecondary}>{b.lastUpdate}</Text>
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
