import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Switch, CheckboxGroup, Checkbox, Stack } from '@chakra-ui/react';
import { MdAdminPanelSettings, MdGroup, MdSecurity, MdFileDownload, MdAdd, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRoles = [
  { id: 'role-admin', name: 'Administrator', users: 3, perms: 28, active: true },
  { id: 'role-teacher', name: 'Teacher', users: 22, perms: 16, active: true },
  { id: 'role-account', name: 'Accountant', users: 4, perms: 14, active: true },
  { id: 'role-view', name: 'Viewer', users: 2, perms: 8, active: false },
];

const allPerms = ['students.view','students.edit','teachers.view','teachers.edit','finance.view','finance.edit','transport.view','transport.edit','reports.view','reports.export','communication.send','settings.manage'];

export default function RoleManagement() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const createDisc = useDisclosure();
  const editDisc = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ roles: mockRoles.length, users: mockRoles.reduce((s, r) => s + r.users, 0), perms: allPerms.length }), []);

  const filtered = useMemo(() => mockRoles.filter(r => {
    const bySearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const byStatus = status==='all' || (status==='active' ? r.active : !r.active);
    return bySearch && byStatus;
  }), [search, status]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Role Management</Heading>
          <Text color={textColorSecondary}>Create, edit and organize roles and permissions</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdAdd />} colorScheme='blue' onClick={createDisc.onOpen}>New Role</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Total Roles" value={String(stats.roles)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdAdminPanelSettings} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Total Users" value={String(stats.users)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdGroup} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Permissions" value={String(stats.perms)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdSecurity} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search role' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Statuses</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Role</Th>
                <Th isNumeric>Users</Th>
                <Th isNumeric>Permissions</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.name}</Text></Td>
                  <Td isNumeric>{r.users}</Td>
                  <Td isNumeric>{r.perms}</Td>
                  <Td>
                    <Badge colorScheme={r.active ? 'green' : 'gray'}>{r.active ? 'Active' : 'Inactive'}</Badge>
                  </Td>
                  <Td>
                    <Button size='sm' variant='outline' onClick={() => { setSelected(r); editDisc.onOpen(); }}>Edit</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      {/* Create Role Modal */}
      <Modal isOpen={createDisc.isOpen} onClose={createDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Role Name</FormLabel>
              <Input placeholder='e.g. Librarian' />
            </FormControl>
            <FormControl display='flex' alignItems='center' mb={4}>
              <FormLabel mb='0' flex='1'>Active</FormLabel>
              <Switch defaultChecked />
            </FormControl>
            <FormControl>
              <FormLabel>Permissions</FormLabel>
              <CheckboxGroup defaultValue={['students.view','reports.view']}>
                <Stack spacing={3} maxH='220px' overflowY='auto'>
                  {allPerms.map((p) => (
                    <Checkbox key={p} value={p}>{p}</Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={createDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue'>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <>
                <FormControl mb={4}>
                  <FormLabel>Role Name</FormLabel>
                  <Input defaultValue={selected.name} />
                </FormControl>
                <FormControl display='flex' alignItems='center' mb={4}>
                  <FormLabel mb='0' flex='1'>Active</FormLabel>
                  <Switch defaultChecked={selected.active} />
                </FormControl>
                <FormControl>
                  <FormLabel>Permissions</FormLabel>
                  <CheckboxGroup defaultValue={['students.view','reports.view']}>
                    <Stack spacing={3} maxH='220px' overflowY='auto'>
                      {allPerms.map((p) => (
                        <Checkbox key={p} value={p}>{p}</Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={editDisc.onClose}>Close</Button>
            <Button colorScheme='blue'>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
