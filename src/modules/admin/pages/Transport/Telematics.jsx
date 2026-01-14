import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Button, ButtonGroup, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, NumberInput, NumberInputField } from '@chakra-ui/react';
import { MdSpeed, MdBatteryFull, MdWarning, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';

const telemetry = [
  { bus: 'BUS-101', avgSpeed: 38, fuel: 9.2, temp: 78, events: 1 },
  { bus: 'BUS-102', avgSpeed: 0, fuel: 0, temp: 0, events: 0 },
  { bus: 'BUS-103', avgSpeed: 32, fuel: 8.7, temp: 82, events: 2 },
];

export default function Telematics() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [rows, setRows] = useState(telemetry);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ bus: '', avgSpeed: 0, fuel: 0, temp: 0, events: 0 });

  const stats = useMemo(() => {
    const active = rows.filter((t) => t.avgSpeed > 0).length;
    const avgSpeed = Math.round(rows.reduce((s, t) => s + t.avgSpeed, 0) / (rows.length || 1));
    const fuel = (rows.filter(t => t.fuel > 0).reduce((s, t) => s + t.fuel, 0) / Math.max(1, rows.filter(t => t.fuel > 0).length)).toFixed(1);
    const alerts = rows.reduce((s, t) => s + t.events, 0);
    return { active, avgSpeed, fuel, alerts };
  }, [rows]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Telematics</Heading>
          <Text color={textColorSecondary}>Vehicle analytics: speed, fuel and events</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard title="Active Buses" value={String(stats.active)} icon={MdSpeed} colorScheme="blue" />
        <StatCard title="Avg Speed" value={`${stats.avgSpeed} km/h`} icon={MdSpeed} colorScheme="green" />
        <StatCard title="Fuel Economy" value={`${stats.fuel} km/l`} icon={MdBatteryFull} colorScheme="orange" />
        <StatCard title="Alert Events" value={String(stats.alerts)} icon={MdWarning} colorScheme="red" />
      </SimpleGrid>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Bus</Th>
                <Th isNumeric>Avg Speed</Th>
                <Th isNumeric>Fuel (km/l)</Th>
                <Th isNumeric>Engine Temp</Th>
                <Th isNumeric>Events</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((t) => (
                <Tr key={t.bus} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Badge colorScheme='blue'>{t.bus}</Badge></Td>
                  <Td isNumeric>{t.avgSpeed}</Td>
                  <Td isNumeric>{t.fuel}</Td>
                  <Td isNumeric>{t.temp}°C</Td>
                  <Td isNumeric>{t.events}</Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(t); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={() => { setSelected(t); setForm({ ...t }); editDisc.onOpen(); }} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Telemetry Detail</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Bus</Text><Text>{selected.bus}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Avg Speed</Text><Text>{selected.avgSpeed} km/h</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Fuel</Text><Text>{selected.fuel} km/l</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Engine Temp</Text><Text>{selected.temp}°C</Text></Flex>
                <Flex justify='space-between'><Text fontWeight='600'>Events</Text><Text>{selected.events}</Text></Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Telemetry</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Avg Speed</FormLabel>
              <NumberInput value={form.avgSpeed} min={0} onChange={(v) => setForm(f => ({ ...f, avgSpeed: Number(v) || 0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Fuel (km/l)</FormLabel>
              <NumberInput value={form.fuel} min={0} precision={1} step={0.1} onChange={(v) => setForm(f => ({ ...f, fuel: Number(v) || 0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Engine Temp (°C)</FormLabel>
              <NumberInput value={form.temp} min={0} onChange={(v) => setForm(f => ({ ...f, temp: Number(v) || 0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Events</FormLabel>
              <NumberInput value={form.events} min={0} onChange={(v) => setForm(f => ({ ...f, events: Number(v) || 0 }))}><NumberInputField /></NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={() => { setRows(prev => prev.map(r => r.bus === form.bus ? { ...form } : r)); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
