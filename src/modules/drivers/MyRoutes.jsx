import React, { useMemo, useState } from 'react';
import { Box, Flex, SimpleGrid, Text, Badge, Icon, HStack, VStack, useColorModeValue, Select, Input, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, Tooltip, IconButton } from '@chakra-ui/react';
import { MdAltRoute, MdDirectionsBus, MdMap, MdCheckCircle, MdNorthEast, MdSouthWest } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';

export default function MyRoutes() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const subtle = useColorModeValue('gray.50', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const demoRoutes = useMemo(() => ([
    {
      id: 'R-A',
      name: 'Route A - North Loop',
      direction: 'Morning',
      distance: '18.6 km',
      duration: '1h 25m',
      vehicleId: 'BUS-12',
      stops: [
        { id: 1, name: 'Maple Ave - Stop 1', time: '07:05 AM', eta: '07:05 AM', status: 'completed' },
        { id: 2, name: 'Oak Street - Stop 2', time: '07:12 AM', eta: '07:12 AM', status: 'completed' },
        { id: 3, name: 'Pine Crescent - Stop 3', time: '07:18 AM', eta: '07:19 AM', status: 'completed' },
        { id: 4, name: 'Birch Lane - Stop 4', time: '07:24 AM', eta: '07:25 AM', status: 'completed' },
        { id: 5, name: 'Cedar Ct - Stop 5', time: '07:31 AM', eta: '07:32 AM', status: 'completed' },
        { id: 6, name: 'Walnut Rd - Stop 6', time: '07:37 AM', eta: '07:38 AM', status: 'completed' },
        { id: 7, name: 'Poplar St - Stop 7', time: '07:42 AM', eta: '07:43 AM', status: 'pending' },
        { id: 8, name: 'Sycamore Ave - Stop 8', time: '07:47 AM', eta: '07:48 AM', status: 'pending' },
        { id: 9, name: 'Ash Grove - Stop 9', time: '07:52 AM', eta: '07:53 AM', status: 'pending' },
        { id: 10, name: 'Willow Park - Stop 10', time: '07:56 AM', eta: '07:57 AM', status: 'pending' },
        { id: 11, name: 'Elm Heights - Stop 11', time: '07:59 AM', eta: '08:00 AM', status: 'pending' },
        { id: 12, name: 'School Main Gate', time: '08:05 AM', eta: '08:06 AM', status: 'pending' },
      ],
    },
    {
      id: 'R-B',
      name: 'Route B - South Loop',
      direction: 'Afternoon',
      distance: '22.1 km',
      duration: '1h 40m',
      vehicleId: 'BUS-08',
      stops: [
        { id: 1, name: 'School Main Gate', time: '02:35 PM', eta: '02:35 PM', status: 'pending' },
        { id: 2, name: 'Lakeview Rd - Stop 1', time: '02:48 PM', eta: '02:48 PM', status: 'pending' },
        { id: 3, name: 'Elm Street - Stop 2', time: '03:01 PM', eta: '03:01 PM', status: 'pending' },
        { id: 4, name: 'Hilltop Ave - Stop 3', time: '03:16 PM', eta: '03:17 PM', status: 'pending' },
        { id: 5, name: 'Ridge Blvd - Stop 4', time: '03:28 PM', eta: '03:28 PM', status: 'pending' },
        { id: 6, name: 'Valley View - Stop 5', time: '03:36 PM', eta: '03:37 PM', status: 'pending' },
        { id: 7, name: 'Canyon Dr - Stop 6', time: '03:45 PM', eta: '03:46 PM', status: 'pending' },
        { id: 8, name: 'Riverbank - Stop 7', time: '03:55 PM', eta: '03:55 PM', status: 'pending' },
        { id: 9, name: 'South Square - Stop 8', time: '04:05 PM', eta: '04:06 PM', status: 'pending' },
        { id: 10, name: 'Harbor Point - Stop 9', time: '04:18 PM', eta: '04:18 PM', status: 'pending' },
        { id: 11, name: 'Seaside Ave - Stop 10', time: '04:28 PM', eta: '04:29 PM', status: 'pending' },
        { id: 12, name: 'Cliffside Rd - Stop 11', time: '04:40 PM', eta: '04:41 PM', status: 'pending' },
      ],
    },
    {
      id: 'R-C',
      name: 'Route C - East Loop',
      direction: 'Morning',
      distance: '16.3 km',
      duration: '1h 15m',
      vehicleId: 'BUS-15',
      stops: [
        { id: 1, name: 'Park View - Stop 1', time: '06:55 AM', eta: '06:55 AM', status: 'completed' },
        { id: 2, name: 'Sunrise Blvd - Stop 2', time: '07:03 AM', eta: '07:03 AM', status: 'completed' },
        { id: 3, name: 'Civic Center - Stop 3', time: '07:11 AM', eta: '07:11 AM', status: 'completed' },
        { id: 4, name: 'East Market - Stop 4', time: '07:18 AM', eta: '07:19 AM', status: 'pending' },
        { id: 5, name: 'Library Rd - Stop 5', time: '07:25 AM', eta: '07:26 AM', status: 'pending' },
        { id: 6, name: 'Tech Park - Stop 6', time: '07:32 AM', eta: '07:33 AM', status: 'pending' },
        { id: 7, name: 'Canal View - Stop 7', time: '07:39 AM', eta: '07:40 AM', status: 'pending' },
        { id: 8, name: 'Old Town - Stop 8', time: '07:47 AM', eta: '07:48 AM', status: 'pending' },
        { id: 9, name: 'Green Fields - Stop 9', time: '07:53 AM', eta: '07:54 AM', status: 'pending' },
        { id: 10, name: 'East Gate - Stop 10', time: '08:00 AM', eta: '08:01 AM', status: 'pending' },
        { id: 11, name: 'School Main Gate', time: '08:07 AM', eta: '08:08 AM', status: 'pending' },
      ],
    },
  ]), []);

  const [routeId, setRouteId] = useState(demoRoutes[0].id);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [routes, setRoutes] = useState(demoRoutes);

  const selectedRoute = useMemo(() => routes.find(r => r.id === routeId), [routes, routeId]);
  const totalStops = selectedRoute?.stops.length || 0;
  const completed = selectedRoute?.stops.filter(s => s.status === 'completed').length || 0;
  const remaining = Math.max(0, totalStops - completed);
  const progress = totalStops ? Math.round((completed / totalStops) * 100) : 0;
  const currentIdx = selectedRoute?.stops.findIndex(s => s.status !== 'completed') ?? -1;
  const currentStop = currentIdx >= 0 ? selectedRoute.stops[currentIdx] : null;
  const nextStop = currentIdx >= 0 && currentIdx + 1 < totalStops ? selectedRoute.stops[currentIdx + 1] : null;

  const filteredStops = useMemo(() => {
    let list = selectedRoute?.stops || [];
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [selectedRoute, statusFilter, query]);

  const markCompleted = (sid) => {
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      return { ...r, stops: r.stops.map(s => s.id === sid ? { ...s, status: 'completed' } : s) };
    }));
    toast({ status: 'success', title: 'Stop marked completed' });
  };

  const delayFive = (sid) => {
    setRoutes(prev => prev.map(r => {
      if (r.id !== routeId) return r;
      return { ...r, stops: r.stops.map(s => s.id === sid ? { ...s, eta: addMinutes(s.eta, 5) } : s) };
    }));
    toast({ status: 'info', title: '+5 min delay applied' });
  };

  const addMinutes = (timeStr, mins) => {
    try {
      const [t, mer] = timeStr.split(' ');
      const [h, m] = t.split(':').map(Number);
      let hour = h % 12 + (mer?.toUpperCase().startsWith('P') ? 12 : 0);
      const date = new Date();
      date.setHours(hour, m, 0, 0);
      date.setMinutes(date.getMinutes() + mins);
      const oh = date.getHours();
      const mer2 = oh >= 12 ? 'PM' : 'AM';
      const hr12 = ((oh + 11) % 12) + 1;
      const mm = String(date.getMinutes()).padStart(2, '0');
      return `${hr12}:${mm} ${mer2}`;
    } catch {
      return timeStr;
    }
  };

  const exportCSV = () => {
    const header = ['#', 'Stop', 'Scheduled', 'ETA', 'Status'];
    const rows = selectedRoute.stops.map(s => [s.id, s.name, s.time, s.eta, s.status]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${selectedRoute.name.replace(/\s+/g,'_')}_stops.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>My Routes</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Assigned routes with stop-wise details</Text>

      <Card p='16px' mb='16px'>
        <SimpleGrid columns={{ base: 1, lg: 4 }} spacing='12px' alignItems='center'>
          <HStack>
            <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#00b09b 0%,#96c93d 100%)' icon={<Icon as={MdAltRoute} w='22px' h='22px' color='white' />} />
            <VStack align='start' spacing={0}>
              <Text fontWeight='600'>Select Route</Text>
              <Select size='sm' value={routeId} onChange={e => setRouteId(e.target.value)}>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </VStack>
          </HStack>
          <VStack align='start' spacing={0}>
            <Text fontWeight='600'>Search Stops</Text>
            <Input size='sm' placeholder='Type stop name...' value={query} onChange={e=>setQuery(e.target.value)} />
          </VStack>
          <VStack align='start' spacing={0}>
            <Text fontWeight='600'>Status</Text>
            <Select size='sm' value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value='all'>All</option>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
            </Select>
          </VStack>
          <HStack justify='flex-end'>
            <Button size='sm' onClick={exportCSV}>Export CSV</Button>
          </HStack>
        </SimpleGrid>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing='20px'>
        <Card p='16px'>
          <HStack justify='space-between' align='start' flexWrap='wrap' rowGap={2}>
            <VStack align='start' spacing={0}>
              <Text fontSize='lg' fontWeight='bold'>{selectedRoute.name}</Text>
              <HStack spacing={2}>
                <Badge>{selectedRoute.direction === 'Morning' ? <MdNorthEast /> : <MdSouthWest />}</Badge>
                <Badge colorScheme='blue'><Icon as={MdDirectionsBus} me='4px' />{selectedRoute.vehicleId}</Badge>
                <Badge variant='subtle'>{selectedRoute.distance}</Badge>
                <Badge variant='subtle'>{selectedRoute.duration}</Badge>
              </HStack>
            </VStack>
            <Badge colorScheme='green'>{progress}%</Badge>
          </HStack>
          <Box mt='10px' h='8px' bg={useColorModeValue('gray.200','gray.600')} borderRadius='full' position='relative'>
            <Box h='100%' w={`${progress}%`} bg='green.400' borderRadius='full' />
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing='12px' mt='12px'>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Total Stops</Text>
              <Text fontWeight='700'>{totalStops}</Text>
            </Card>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Completed</Text>
              <Text fontWeight='700'>{completed}</Text>
            </Card>
            <Card p='12px'>
              <Text fontSize='xs' color={textSecondary}>Remaining</Text>
              <Text fontWeight='700'>{remaining}</Text>
            </Card>
          </SimpleGrid>
          <HStack mt='12px' spacing={6} flexWrap='wrap'>
            <VStack align='start' spacing={0} minW='180px'>
              <Text fontSize='xs' color={textSecondary}>Current Stop</Text>
              <Text fontWeight='600' noOfLines={1}>{currentStop ? currentStop.name : '—'}</Text>
            </VStack>
            <VStack align='start' spacing={0} minW='180px'>
              <Text fontSize='xs' color={textSecondary}>Next Stop</Text>
              <Text fontWeight='600' noOfLines={1}>{nextStop ? nextStop.name : '—'}</Text>
            </VStack>
            <VStack align='start' spacing={0} minW='120px'>
              <Text fontSize='xs' color={textSecondary}>ETA</Text>
              <Text fontWeight='600'>{nextStop ? nextStop.eta : '—'}</Text>
            </VStack>
          </HStack>
        </Card>

        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Route Map</Text>
          <Box h={{ base: '260px', md: '320px' }} borderRadius='12px' bg={subtle} borderWidth='1px' borderColor={border} display='flex' alignItems='center' justifyContent='center'>
            <VStack spacing={1}>
              <Icon as={MdMap} w='32px' h='32px' color='gray.400' />
              <Text fontSize='sm' color={textSecondary}>Map placeholder — integrate map SDK here</Text>
            </VStack>
          </Box>
        </Card>
      </SimpleGrid>

      <Card p='16px' mt='20px'>
        <Text fontSize='lg' fontWeight='bold' mb='8px'>Stops</Text>
        <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
          <Box maxH='360px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                <Tr>
                  <Th>#</Th>
                  <Th>Stop</Th>
                  <Th>Scheduled</Th>
                  <Th>ETA</Th>
                  <Th>Status</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredStops.map((s) => (
                  <Tr key={s.id}>
                    <Td>{s.id}</Td>
                    <Td maxW='280px'>
                      <Text noOfLines={1}>{s.name}</Text>
                    </Td>
                    <Td>{s.time}</Td>
                    <Td>{s.eta}</Td>
                    <Td>
                      <Badge colorScheme={s.status === 'completed' ? 'green' : 'gray'}>{s.status}</Badge>
                    </Td>
                    <Td isNumeric>
                      <HStack spacing={2} justify='flex-end'>
                        <Tooltip label='Mark completed'>
                          <IconButton size='sm' aria-label='complete' icon={<MdCheckCircle />} onClick={() => markCompleted(s.id)} isDisabled={s.status === 'completed'} />
                        </Tooltip>
                        <Tooltip label='Delay +5 min'>
                          <Button size='xs' onClick={() => delayFive(s.id)}>+5m</Button>
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
