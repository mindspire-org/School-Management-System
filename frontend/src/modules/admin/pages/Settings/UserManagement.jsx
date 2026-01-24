import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Switch } from '@chakra-ui/react';
import { MdPeople, MdAdminPanelSettings, MdSecurity, MdFileDownload, MdAdd, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockUsers = [
  { id: 'U-001', name: 'Admin User', email: 'admin@school.com', role: 'Administrator', status: 'Active', lastLogin: '2025-11-12 09:22' },
  { id: 'U-002', name: 'Hina Shah', email: 'hina@school.com', role: 'Teacher', status: 'Active', lastLogin: '2025-11-12 10:02' },
  { id: 'U-003', name: 'Omar Ali', email: 'omar@school.com', role: 'Accountant', status: 'Inactive', lastLogin: '2025-11-09 15:40' },
];

export default function UserManagement() {
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const createDisc = useDisclosure();
  const detailDisc = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ users: mockUsers.length, active: mockUsers.filter(u=>u.status==='Active').length, roles: new Set(mockUsers.map(u=>u.role)).size }), []);

  const filtered = useMemo(() => mockUsers.filter(u => {
    const byRole = role==='all' || u.role===role;
    const byStatus = status==='all' || u.status===status;
    const bySearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    return byRole && byStatus && bySearch;
  }), [role, status, search]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>User Management</Heading>
          <Text color={textColorSecondary}>Create users, assign roles and manage access</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdAdd />} colorScheme='blue' onClick={createDisc.onOpen}>Add User</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Total Users" value={String(stats.users)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdPeople} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Active" value={String(stats.active)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdAdminPanelSettings} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Roles" value={String(stats.roles)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdSecurity} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search name, email or ID' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={role} onChange={(e) => setRole(e.target.value)}>
            <option value='all'>All Roles</option>
            <option value='Administrator'>Administrator</option>
            <option value='Teacher'>Teacher</option>
            <option value='Accountant'>Accountant</option>
          </Select>
          <Select maxW='220px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>User</Th>
                <Th>ID</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last Login</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((u) => (
                <Tr key={u.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{u.name}</Text></Td>
                  <Td>{u.id}</Td>
                  <Td>{u.email}</Td>
                  <Td><Badge colorScheme='blue'>{u.role}</Badge></Td>
                  <Td><Badge colorScheme={u.status==='Active'?'green':'gray'}>{u.status}</Badge></Td>
                  <Td><Text color={textColorSecondary}>{u.lastLogin}</Text></Td>
                  <Td>
                    <Button size='sm' variant='outline' mr={2} onClick={() => { setSelected(u); detailDisc.onOpen(); }}>Details</Button>
                    <Button size='sm' colorScheme={u.status==='Active'?'red':'green'}>{u.status==='Active'?'Deactivate':'Activate'}</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Add User Modal */}
      <Modal isOpen={createDisc.isOpen} onClose={createDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Full Name</FormLabel>
              <Input placeholder='e.g. Adeel Khan' />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input placeholder='email@school.com' type='email' />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Select defaultValue='Teacher'>
                <option>Administrator</option>
                <option>Teacher</option>
                <option>Accountant</option>
                <option>Viewer</option>
              </Select>
            </FormControl>
            <FormControl display='flex' alignItems='center'>
              <FormLabel mb='0' flex='1'>Active</FormLabel>
              <Switch defaultChecked />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={createDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue'>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={detailDisc.isOpen} onClose={detailDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Text><strong>Name:</strong> {selected.name}</Text>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Email:</strong> {selected.email}</Text>
                <Text><strong>Role:</strong> {selected.role}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
                <Text><strong>Last Login:</strong> {selected.lastLogin}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
