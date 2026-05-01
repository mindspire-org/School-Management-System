import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, SimpleGrid, Text, Badge, Icon, HStack, VStack, useColorModeValue, Select, Input, Button, useToast, Table, Thead, Tbody, Tr, Th, Td, Tooltip, IconButton } from '@chakra-ui/react';
import { MdAltRoute, MdDirectionsBus, MdMap, MdCheckCircle, MdNorthEast, MdSouthWest } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';
import * as transportApi from '../../services/api/transport';

export default function MyRoutes() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const subtle = useColorModeValue('gray.50', 'gray.700');
  const border = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  const [routes, setRoutes] = useState([]);
  const [routeId, setRouteId] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await transportApi.listRoutes();
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped = items.map((r) => ({
          id: String(r.id),
          name: r.name,
          direction: '',
          distance: '',
          duration: '',
          vehicleId: r.busesCount ? `Buses: ${r.busesCount}` : '',
          stops: [],
        }));
        setRoutes(mapped);
        setRouteId(mapped[0]?.id || '');
      } catch (e) {
        setRoutes([]);
        setRouteId('');
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        if (!routeId) return;
        const data = await transportApi.listRouteStops(routeId);
        const items = Array.isArray(data?.items) ? data.items : [];
        setRoutes((prev) => prev.map((r) => {
          if (String(r.id) !== String(routeId)) return r;
          return {
            ...r,
            stops: items.map((s, idx) => ({
              id: String(s.id),
              name: s.name,
              time: '',
              eta: '',
              status: 'pending',
              order: idx + 1,
            })),
          };
        }));
      } catch (e) {
        // keep page usable even if stops fail
      }
    };
    fetchStops();
  }, [routeId]);

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
    toast({ status: 'info', title: 'Stop updates will be available once route progress tracking is integrated.' });
  };

  const delayFive = (sid) => {
    toast({ status: 'info', title: 'ETA updates will be available once live tracking is integrated.' });
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
                    <Td>{s.order || s.id}</Td>
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
                          <IconButton size='sm' aria-label='complete' icon={<MdCheckCircle />} onClick={() => markCompleted(s.id)} isDisabled />
                        </Tooltip>
                        <Tooltip label='Delay +5 min'>
                          <Button size='xs' onClick={() => delayFive(s.id)} isDisabled>+5m</Button>
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
