import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Badge, FormControl, FormLabel } from '@chakra-ui/react';
import { MdHistory, MdSecurity, MdFileDownload, MdRefresh, MdSearch, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';

const mockLogs = [
  { id: 'LOG-0001', ts: '2025-11-12 09:21', user: 'Admin User', action: 'Login', module: 'Auth', status: 'Success', ip: '10.0.0.5' },
  { id: 'LOG-0002', ts: '2025-11-12 09:30', user: 'Hina Shah', action: 'Edit Invoice INV-1023', module: 'Finance', status: 'Success', ip: '10.0.0.7' },
  { id: 'LOG-0003', ts: '2025-11-12 09:40', user: 'Omar Ali', action: 'Export CSV', module: 'Reports', status: 'Denied', ip: '10.0.0.8' },
  { id: 'LOG-0004', ts: '2025-11-12 09:55', user: 'System', action: 'Backup Complete', module: 'System', status: 'Success', ip: '-' },
];

export default function ActivityLogs() {
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('all');
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState(mockLogs);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ id: '', ts: '', user: '', action: '', module: '', status: 'Success', ip: '' });
  const disc = useDisclosure();
  const editDisc = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ total: rows.length, success: rows.filter(l => l.status === 'Success').length, denied: rows.filter(l => l.status === 'Denied').length }), [rows]);

  const filtered = useMemo(() => rows.filter(l => {
    const bySearch = !search || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase());
    const byModule = module === 'all' || l.module === module;
    const byStatus = status === 'all' || l.status === status;
    return bySearch && byModule && byStatus;
  }), [rows, search, module, status]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Activity Logs</Heading>
          <Text color={textColorSecondary}>Audit trail for user actions and security events</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard title="Total" value={String(stats.total)} icon={MdHistory} colorScheme="blue" />
        <StatCard title="Success" value={String(stats.success)} icon={MdSecurity} colorScheme="green" />
        <StatCard title="Denied" value={String(stats.denied)} icon={MdSecurity} colorScheme="red" />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search id, user or action' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={module} onChange={(e) => setModule(e.target.value)}>
            <option value='all'>All Modules</option>
            <option>Auth</option>
            <option>Finance</option>
            <option>Reports</option>
            <option>System</option>
          </Select>
          <Select maxW='220px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option>Success</option>
            <option>Denied</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>ID</Th>
                <Th>Timestamp</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Module</Th>
                <Th>Status</Th>
                <Th>IP</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((l) => (
                <Tr key={l.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{l.id}</Text></Td>
                  <Td><Text color={textColorSecondary}>{l.ts}</Text></Td>
                  <Td>{l.user}</Td>
                  <Td>{l.action}</Td>
                  <Td><Badge colorScheme='blue'>{l.module}</Badge></Td>
                  <Td><Badge colorScheme={l.status === 'Success' ? 'green' : 'red'}>{l.status}</Badge></Td>
                  <Td>{l.ip}</Td>
                  <Td>
                    <Button size='sm' variant='outline' mr={2} onClick={() => { setSelected(l); disc.onOpen(); }}>Details</Button>
                    <Button size='sm' leftIcon={<MdEdit />} onClick={() => { setForm({ ...l }); editDisc.onOpen(); }}>Edit</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={disc.isOpen} onClose={disc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Timestamp:</strong> {selected.ts}</Text>
                <Text><strong>User:</strong> {selected.user}</Text>
                <Text><strong>Action:</strong> {selected.action}</Text>
                <Text><strong>Module:</strong> {selected.module}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
                <Text><strong>IP:</strong> {selected.ip}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Log</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>User</FormLabel>
              <Input value={form.user} onChange={(e) => setForm(f => ({ ...f, user: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Action</FormLabel>
              <Input value={form.action} onChange={(e) => setForm(f => ({ ...f, action: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Module</FormLabel>
              <Select value={form.module} onChange={(e) => setForm(f => ({ ...f, module: e.target.value }))}>
                <option>Auth</option>
                <option>Finance</option>
                <option>Reports</option>
                <option>System</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Status</FormLabel>
              <Select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                <option>Success</option>
                <option>Denied</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>IP</FormLabel>
              <Input value={form.ip} onChange={(e) => setForm(f => ({ ...f, ip: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Timestamp</FormLabel>
              <Input value={form.ts} onChange={(e) => setForm(f => ({ ...f, ts: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={() => { setRows(prev => prev.map(x => x.id === form.id ? { ...form } : x)); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
