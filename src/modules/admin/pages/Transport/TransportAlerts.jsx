import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Badge, Icon, Select, Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, ButtonGroup, Button, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { MdNotificationsActive, MdReport, MdWarning, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';

const mockAlerts = [
  { id: 'TA-001', type: 'Overspeed', severity: 'High', bus: 'BUS-103', message: 'Speed exceeded 80 km/h near Canal View', status: 'Active', time: '10:22 AM' },
  { id: 'TA-002', type: 'Maintenance Due', severity: 'Medium', bus: 'BUS-102', message: 'Service overdue by 30 days', status: 'Active', time: 'Yesterday' },
  { id: 'TA-003', type: 'Route Deviation', severity: 'Low', bus: 'BUS-101', message: 'Short detour detected', status: 'Resolved', time: '2 days ago' },
];

export default function TransportAlerts() {
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState(mockAlerts);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', type: '', severity: 'High', status: 'Active', bus: '', message: '' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => {
    const active = rows.filter((a) => a.status === 'Active').length;
    const resolved = rows.filter((a) => a.status === 'Resolved').length;
    const critical = rows.filter((a) => a.severity === 'High').length;
    return { active, resolved, critical };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((a) =>
      (severity === 'all' || a.severity.toLowerCase() === severity) &&
      (status === 'all' || a.status.toLowerCase() === status)
    );
  }, [rows, severity, status]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Transport Alerts</Heading>
          <Text color={textColorSecondary}>Fleet alerts: overspeed, maintenance and route deviations</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard title="Active Alerts" value={String(stats.active)} icon={MdNotificationsActive} colorScheme="orange" />
        <StatCard title="Critical (High)" value={String(stats.critical)} icon={MdWarning} colorScheme="red" />
        <StatCard title="Resolved" value={String(stats.resolved)} icon={MdReport} colorScheme="green" />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <Select maxW='220px' value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value='all'>All Severities</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </Select>
          <Select maxW='220px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='resolved'>Resolved</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>ID</Th>
                <Th>Type</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Bus</Th>
                <Th>Time</Th>
                <Th>Message</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((a) => (
                <Tr key={a.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Badge>{a.id}</Badge></Td>
                  <Td>{a.type}</Td>
                  <Td><Badge colorScheme={a.severity === 'High' ? 'red' : a.severity === 'Medium' ? 'yellow' : 'blue'}>{a.severity}</Badge></Td>
                  <Td><Badge colorScheme={a.status === 'Active' ? 'yellow' : 'green'}>{a.status}</Badge></Td>
                  <Td><Badge colorScheme='blue'>{a.bus}</Badge></Td>
                  <Td><Text color={textColorSecondary}>{a.time}</Text></Td>
                  <Td><Text>{a.message}</Text></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(a); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={() => { setSelected(a); setForm({ ...a }); editDisc.onOpen(); }} />
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
          <ModalHeader>Alert Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>ID</Text><Text>{selected.id}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Type</Text><Text>{selected.type}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Severity</Text><Badge colorScheme={selected.severity === 'High' ? 'red' : selected.severity === 'Medium' ? 'yellow' : 'blue'}>{selected.severity}</Badge></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Status</Text><Badge colorScheme={selected.status === 'Active' ? 'yellow' : 'green'}>{selected.status}</Badge></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Bus</Text><Text>{selected.bus}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Time</Text><Text>{selected.time}</Text></Flex>
                <Text><strong>Message:</strong> {selected.message}</Text>
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
          <ModalHeader>Edit Alert</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Type</FormLabel>
              <Input value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Severity</FormLabel>
              <Select value={form.severity.toLowerCase()} onChange={(e) => setForm(f => ({ ...f, severity: e.target.value === 'high' ? 'High' : e.target.value === 'medium' ? 'Medium' : 'Low' }))}>
                <option value='high'>High</option>
                <option value='medium'>Medium</option>
                <option value='low'>Low</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Status</FormLabel>
              <Select value={form.status.toLowerCase()} onChange={(e) => setForm(f => ({ ...f, status: e.target.value === 'active' ? 'Active' : 'Resolved' }))}>
                <option value='active'>Active</option>
                <option value='resolved'>Resolved</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Bus</FormLabel>
              <Input value={form.bus} onChange={(e) => setForm(f => ({ ...f, bus: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Message</FormLabel>
              <Input value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={() => { setRows(prev => prev.map(r => r.id === form.id ? { ...form } : r)); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
