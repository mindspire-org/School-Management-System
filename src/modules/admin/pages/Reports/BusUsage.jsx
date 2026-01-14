import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { MdDirectionsBus, MdMap, MdSpeed, MdPeople, MdFileDownload, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRows = [
  { bus: 'BUS-101', route: 'R1', trips: 4, occupancy: 78, distance: 62, status: 'On Route' },
  { bus: 'BUS-102', route: 'R2', trips: 0, occupancy: 0, distance: 0, status: 'At Depot' },
  { bus: 'BUS-103', route: 'R3', trips: 3, occupancy: 69, distance: 48, status: 'On Route' },
];

export default function BusUsage() {
  const [route, setRoute] = useState('all');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => {
    const buses = mockRows.length;
    const onRoute = mockRows.filter(r => r.status === 'On Route').length;
    const avgOcc = Math.round(mockRows.reduce((s, r) => s + r.occupancy, 0) / buses);
    const trips = mockRows.reduce((s, r) => s + r.trips, 0);
    return { buses, onRoute, avgOcc, trips };
  }, []);

  const filtered = useMemo(() =>
    mockRows.filter(r => {
      const byRoute = route === 'all' || r.route === route;
      const bySearch = !search || r.bus.toLowerCase().includes(search.toLowerCase());
      return byRoute && bySearch;
    })
  , [route, search]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Bus Usage</Heading>
          <Text color={textColorSecondary}>Trips, distance and occupancy by bus</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Total Buses" value={String(stats.buses)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdDirectionsBus} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="On Route" value={String(stats.onRoute)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdMap} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Avg Occupancy" value={`${stats.avgOcc}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdPeople} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Trips Today" value={String(stats.trips)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdSpeed} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search bus id' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='200px' value={route} onChange={(e) => setRoute(e.target.value)}>
            <option value='all'>All Routes</option>
            <option value='R1'>R1</option>
            <option value='R2'>R2</option>
            <option value='R3'>R3</option>
          </Select>
          <Input type='date' maxW='200px' value={date} onChange={(e) => setDate(e.target.value)} />
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Bus</Th>
                <Th>Route</Th>
                <Th isNumeric>Trips</Th>
                <Th isNumeric>Occupancy</Th>
                <Th isNumeric>Distance (km)</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r.bus} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.bus}</Text></Td>
                  <Td><Badge colorScheme='blue'>{r.route}</Badge></Td>
                  <Td isNumeric>{r.trips}</Td>
                  <Td isNumeric>{r.occupancy}%</Td>
                  <Td isNumeric>{r.distance}</Td>
                  <Td><Badge colorScheme={r.status==='On Route'?'green':'gray'}>{r.status}</Badge></Td>
                  <Td>
                    <Button size='sm' variant='outline' onClick={() => { setSelected(r); onOpen(); }}>Details</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bus Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Bus:</strong> {selected.bus}</Text>
                <Text><strong>Route:</strong> {selected.route}</Text>
                <Text><strong>Trips:</strong> {selected.trips}</Text>
                <Text><strong>Occupancy:</strong> {selected.occupancy}%</Text>
                <Text><strong>Distance:</strong> {selected.distance} km</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
