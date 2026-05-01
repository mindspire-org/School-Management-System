import React, { useMemo } from 'react';
import {
  Badge,
  Box,
  GridItem,
  HStack,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdDashboard, MdDirectionsBus, MdMap, MdTimeline } from 'react-icons/md';
import DashboardShell from '../../components/DashboardShell';
import ChartCard from '../../components/ChartCard';
import BarChart from '../../components/charts/v2/BarChart';
import MixedChart from '../../components/charts/v2/MixedChart';
import Sparkline from '../../components/charts/v2/Sparkline';

type RouteRow = {
  id: number;
  name: string;
  expectedMin: number;
  avgMin: number;
  dailyTrips: number[];
};

export default function DriverDashboardPage() {
  const subtle = useColorModeValue('gray.600', 'gray.400');
  const mapBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const mapBorder = useColorModeValue('gray.100', 'whiteAlpha.200');

  const navItems = useMemo(
    () => [
      { label: 'Dashboard', icon: MdDashboard, href: '#/driver/dashboard' },
      { label: 'Fleet', icon: MdDirectionsBus, href: '#/driver/fleet' },
      { label: 'Routes', icon: MdMap, href: '#/driver/routes' },
      { label: 'Trips', icon: MdTimeline, href: '#/driver/trips' },
    ],
    []
  );

  const fleetCategories = ['Buses'];
  const fleetSeries = useMemo(
    () => [
      { name: 'Operational', data: [18] },
      { name: 'Maintenance', data: [3] },
    ],
    []
  );

  const tripsSpark = useMemo(() => [32, 28, 35, 30, 38, 41, 36], []);

  const routes: RouteRow[] = useMemo(
    () => [
      { id: 1, name: 'Route A (North Loop)', expectedMin: 35, avgMin: 39, dailyTrips: [5, 6, 6, 7, 7, 6, 5] },
      { id: 2, name: 'Route B (City Center)', expectedMin: 28, avgMin: 31, dailyTrips: [8, 7, 9, 8, 10, 9, 8] },
      { id: 3, name: 'Route C (South Hills)', expectedMin: 42, avgMin: 44, dailyTrips: [4, 4, 5, 5, 6, 5, 4] },
    ],
    []
  );

  const routeCats = useMemo(() => routes.map((r) => r.name.split(' (')[0]), [routes]);
  const mixedSeries = useMemo(
    () => [
      { name: 'Expected (min)', type: 'column', data: routes.map((r) => r.expectedMin) },
      { name: 'Average (min)', type: 'column', data: routes.map((r) => r.avgMin) },
      { name: 'Delta', type: 'line', data: routes.map((r) => r.avgMin - r.expectedMin) },
    ],
    [routes]
  );

  const mixedOptions = useMemo(
    () => ({
      chart: { stacked: true },
      stroke: { width: [0, 0, 3] },
      tooltip: { shared: true, intersect: false, y: { formatter: (v: number) => `${Math.round(v)} min` } },
      legend: { position: 'top' },
    }),
    []
  );

  return (
    <DashboardShell title="Transport Dashboard" navItems={navItems} user={{ name: 'Driver', email: 'driver@school.com' }}>
      <Text fontSize="sm" color={subtle} mb={4}>
        Fleet health, route efficiency, and quick route overview.
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5}>
        <GridItem colSpan={{ base: 1, lg: 1 }}>
          <ChartCard title="Fleet Status" subtitle="Operational vs maintenance" ariaLabel="Fleet status">
            <BarChart ariaLabel="Fleet status bar" categories={fleetCategories} series={fleetSeries as any} height={220} stacked options={{ legend: { position: 'bottom' } } as any} />
            <HStack mt={3} spacing={3}>
              <Badge colorScheme="green">Operational: {fleetSeries[0].data[0]}</Badge>
              <Badge colorScheme="orange">Maintenance: {fleetSeries[1].data[0]}</Badge>
            </HStack>
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <ChartCard title="Daily Trips" subtitle="Last 7 days (sparkline)" ariaLabel="Daily trips">
            <Sparkline ariaLabel="Daily trips sparkline" data={tripsSpark} height={80} valueFormatter={(v) => `${Math.round(v)} trips`} />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 3 }}>
          <ChartCard title="Route Efficiency" subtitle="Expected vs average time per route" ariaLabel="Route efficiency">
            <MixedChart ariaLabel="Route efficiency mixed" categories={routeCats} series={mixedSeries as any} height={320} options={mixedOptions as any} />
          </ChartCard>
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 3 }}>
          <ChartCard title="Routes" subtitle="Map placeholder per route (map integration later)" ariaLabel="Routes table">
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Route</Th>
                    <Th isNumeric>Expected</Th>
                    <Th isNumeric>Average</Th>
                    <Th>Status</Th>
                    <Th>Map</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {routes.map((r) => {
                    const delta = r.avgMin - r.expectedMin;
                    return (
                      <Tr key={r.id}>
                        <Td>
                          <Text fontWeight={800}>{r.name}</Text>
                        </Td>
                        <Td isNumeric>{r.expectedMin} min</Td>
                        <Td isNumeric>{r.avgMin} min</Td>
                        <Td>
                          <Badge colorScheme={delta <= 0 ? 'green' : delta <= 5 ? 'orange' : 'red'} variant="subtle">
                            {delta <= 0 ? 'On time' : delta <= 5 ? 'Slight delay' : 'Delayed'}
                          </Badge>
                        </Td>
                        <Td>
                          <Box
                            borderWidth="1px"
                            borderColor={mapBorder}
                            bg={mapBg}
                            borderRadius="md"
                            w="140px"
                            h="52px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="xs" color={subtle}>
                              Map placeholder
                            </Text>
                          </Box>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </ChartCard>
        </GridItem>
      </SimpleGrid>
    </DashboardShell>
  );
}
