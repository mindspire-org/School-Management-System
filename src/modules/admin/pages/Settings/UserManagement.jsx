import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup,
  useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input,
  InputGroup, InputLeftElement, InputRightElement, useDisclosure, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  ModalFooter, FormControl, FormLabel, Switch, useToast, FormHelperText,
  Spinner, Center
} from '@chakra-ui/react';
import { MdPeople, MdAdminPanelSettings, MdSecurity, MdFileDownload, MdAdd, MdRefresh, MdSearch, MdEdit, MdDelete } from 'react-icons/md';

import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import { authApi, studentsApi, teachersApi, driversApi, parentsApi } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

const roleDisplayMap = {
  student: 'Student',
  teacher: 'Teacher',
  driver: 'Driver',
  parent: 'Parent',
  admin: 'Administrator',
  owner: 'Owner'
};

export default function UserManagement() {
  const { campusId, user } = useAuth();
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const createDisc = useDisclosure();
  const detailDisc = useDisclosure();
  const editDisc = useDisclosure();
  const deleteDisc = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  // Form state for creating new user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    active: true
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    id: null,
    name: '',
    email: '',
    role: 'student',
    password: '' // Optional for reset
  });

  // Entity lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Real users data from API
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [role, search]);

  // Handle entity lookup
  useEffect(() => {
    const searchEntities = async () => {
      if (!lookupQuery || lookupQuery.length < 2) {
        setLookupResults([]);
        return;
      }

      // Only search for allowed roles
      const allowedRoles = ['student', 'teacher', 'driver', 'parent'];
      if (!allowedRoles.includes(formData.role)) return;

      try {
        setLookupLoading(true);
        const params = { q: lookupQuery, pageSize: 5 };
        let res;

        switch (formData.role) {
          case 'student': res = await studentsApi.list(params); break;
          case 'teacher': res = await teachersApi.list(params); break;
          case 'driver': res = await driversApi.list(params); break;
          case 'parent': res = await parentsApi.list(params); break;
          default: res = { rows: [] };
        }

        // Handle different API response structures if any
        const results = res.rows || res.data || res.items || [];
        setLookupResults(results);
      } catch (err) {
        console.error('Lookup error:', err);
      } finally {
        setLookupLoading(false);
      }
    };

    const timeoutId = setTimeout(searchEntities, 500);
    return () => clearTimeout(timeoutId);
  }, [lookupQuery, formData.role]);

  const selectEntity = (entity) => {
    // Auto-fill form data
    setFormData(prev => ({
      ...prev,
      name: entity.name || prev.name,
      email: entity.email || prev.email,
    }));
    setLookupQuery('');
    setLookupResults([]);
    toast({
      title: 'Data Autofilled',
      description: `Loaded details for ${entity.name}`,
      status: 'info',
      duration: 2000,
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        role: role === 'all' ? undefined : role,
        search,
        page: 1, // Add pagination support later if needed UI
        pageSize: 100
      };

      const response = await authApi.getUsers(params);
      const data = response.rows ? response : (response.data || response);

      setUsers(data.rows || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditData({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      password: ''
    });
    editDisc.onOpen();
  };

  const handleDeleteClick = (user) => {
    setSelected(user);
    deleteDisc.onOpen();
  };

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      setIsDeleting(true);
      await authApi.deleteUser(selected.id);
      toast({ title: 'User Deleted', status: 'success', duration: 2000 });
      deleteDisc.onClose();
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const submitEdit = async () => {
    try {
      setIsUpdating(true);
      const payload = {
        name: editData.name,
        email: editData.email,
        role: editData.role
      };
      if (editData.password && editData.password.length >= 6) {
        payload.password = editData.password;
      } else if (editData.password && editData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await authApi.updateUser(editData.id, payload);
      toast({ title: 'User Updated', status: 'success', duration: 2000 });
      editDisc.onClose();
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
    } finally {
      setIsUpdating(false);
    }
  };

  const stats = useMemo(() => ({
    users: total,
    active: users.filter(u => u.role !== 'inactive').length,
    roles: new Set(users.map(u => u.role)).size
  }), [users, total]);

  const filtered = useMemo(() => users.filter(u => {
    const byRole = role === 'all' || u.role === role;
    const bySearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase());
    return byRole && bySearch;
  }), [users, role, search]);

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
        <StatCard title="Total Users" value={String(stats.users)} icon={MdPeople} colorScheme="blue" />
        <StatCard title="Active" value={String(stats.active)} icon={MdAdminPanelSettings} colorScheme="green" />
        <StatCard title="Roles" value={String(stats.roles)} icon={MdSecurity} colorScheme="orange" />
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
            <option value='student'>Student</option>
            <option value='teacher'>Teacher</option>
            <option value='driver'>Driver</option>
            <option value='parent'>Parent</option>
            <option value='admin'>Administrator</option>
            <option value='owner'>Owner</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          {loading ? (
            <Center p={10}><Spinner size='xl' /></Center>
          ) : (
            <Table variant='simple'>
              <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th>Name</Th>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((u) => (
                  <Tr key={u.id}>
                    <Td><Text fontWeight='600'>{u.name || 'N/A'}</Text></Td>
                    <Td><Text fontFamily='mono'>{u.username || 'N/A'}</Text></Td>
                    <Td>{u.email || 'N/A'}</Td>
                    <Td><Badge colorScheme='blue'>{roleDisplayMap[u.role] || u.role}</Badge></Td>
                    <Td><Text color={textColorSecondary}>{new Date(u.createdAt).toLocaleDateString()}</Text></Td>
                    <Td>
                      <ButtonGroup size='sm' variant='outline'>
                        <Button leftIcon={<MdEdit />} onClick={() => handleEdit(u)}>Edit</Button>
                        <Button leftIcon={<MdDelete />} colorScheme='red' onClick={() => handleDeleteClick(u)}>Delete</Button>
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </Card>

      {/* Add User Modal */}
      <Modal isOpen={createDisc.isOpen} onClose={() => {
        createDisc.onClose();
        setFormData({ name: '', email: '', password: '', role: 'student', active: true });
      }} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {['student', 'teacher', 'driver', 'parent'].includes(formData.role) && (
              <Box mb={5} position="relative" borderBottom="1px dashed" borderColor="gray.200" pb={4}>
                <FormControl>
                  <FormLabel>Link to Existing {roleDisplayMap[formData.role]}</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents='none'><MdSearch color='gray.300' /></InputLeftElement>
                    <Input
                      placeholder={`Search ${roleDisplayMap[formData.role]} by name...`}
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                    />
                    {lookupLoading && <InputRightElement><Spinner size="sm" color='blue.500' /></InputRightElement>}
                  </InputGroup>
                  <FormHelperText mt={1}>Search and select to autofill details</FormHelperText>
                </FormControl>

                {/* Results dropdown */}
                {lookupResults.length > 0 && (
                  <Box
                    position="absolute" top="75px" left={0} right={0} zIndex={100}
                    bg={useColorModeValue('white', 'navy.800')}
                    boxShadow="xl" borderRadius="md" maxHeight="200px" overflowY="auto"
                    border="1px solid" borderColor={useColorModeValue('gray.100', 'whiteAlpha.200')}
                  >
                    {lookupResults.map((item) => (
                      <Box
                        key={item.id} p={3} borderBottom="1px solid" borderColor={useColorModeValue('gray.100', 'whiteAlpha.100')} cursor="pointer"
                        _hover={{ bg: useColorModeValue('blue.50', 'whiteAlpha.200') }}
                        onClick={() => selectEntity(item)}
                      >
                        <Text fontWeight="bold" fontSize="sm">{item.name}</Text>
                        <Text fontSize="xs" color="gray.500">{item.email || 'No Email'} {item.roll_number ? `• Roll: ${item.roll_number}` : ''}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <FormControl mb={4} isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                placeholder='e.g. Adeel Khan'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder='email@school.com'
                type='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                placeholder='Enter password'
                type='password'
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <FormHelperText>Minimum 6 characters</FormHelperText>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Role</FormLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value='student'>Student</option>
                <option value='teacher'>Teacher</option>
                <option value='driver'>Driver</option>
                <option value='parent'>Parent</option>
                {(user?.role === 'owner' || user?.role === 'superadmin') && (
                  <option value='admin'>Administrator</option>
                )}
              </Select>
              <FormHelperText>
                {(user?.role === 'owner' || user?.role === 'superadmin')
                  ? 'Only Student, Teacher, Driver, Parent, and Administrator roles can be created'
                  : 'Only Student, Teacher, Driver, and Parent roles can be created'}
              </FormHelperText>
            </FormControl>
            <FormControl display='flex' alignItems='center'>
              <FormLabel mb='0' flex='1'>Active</FormLabel>
              <Switch
                isChecked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => {
              createDisc.onClose();
              setFormData({ name: '', email: '', password: '', role: 'student', active: true });
            }}>Cancel</Button>
            <Button colorScheme='blue' isLoading={isCreating} onClick={async () => {
              if (!formData.name || !formData.email || !formData.password) {
                toast({
                  title: 'Validation Error',
                  description: 'Please fill in all required fields',
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
                return;
              }

              if (!campusId) {
                toast({
                  title: 'Select a campus',
                  description: 'Campus/branch is required to create a user.',
                  status: 'warning',
                  duration: 3500,
                  isClosable: true,
                });
                return;
              }

              if (formData.password.length < 6) {
                toast({
                  title: 'Validation Error',
                  description: 'Password must be at least 6 characters',
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
                return;
              }

              try {
                setIsCreating(true);
                const numericCampusId = Number(campusId);
                const campusIdToSend = Number.isFinite(numericCampusId) && numericCampusId > 0
                  ? numericCampusId
                  : undefined;
                await authApi.register({
                  name: formData.name,
                  email: formData.email,
                  password: formData.password,
                  role: formData.role,
                  campusId: campusIdToSend
                });

                toast({
                  title: 'User Created',
                  description: `User ${formData.name} has been created successfully`,
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });

                createDisc.onClose();
                setFormData({ name: '', email: '', password: '', role: 'student', active: true });

                // Refresh the page to show new user
                setTimeout(() => window.location.reload(), 1000);
              } catch (error) {
                const validationErrors = error?.data?.errors;
                const firstErr = Array.isArray(validationErrors) && validationErrors.length
                  ? validationErrors[0]
                  : null;
                const validationText = firstErr
                  ? `${firstErr.path || firstErr.param || 'field'}: ${firstErr.msg || 'Invalid value'}`
                  : null;
                toast({
                  title: 'Error',
                  description: validationText || error?.data?.message || error?.message || 'Failed to create user',
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
              } finally {
                setIsCreating(false);
              }
            }}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Full Name</FormLabel>
              <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Role</FormLabel>
              <Select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                <option value='student'>Student</option>
                <option value='teacher'>Teacher</option>
                <option value='driver'>Driver</option>
                <option value='parent'>Parent</option>
                {(user?.role === 'owner' || user?.role === 'superadmin') && (
                  <option value='admin'>Administrator</option>
                )}
              </Select>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>New Password (Optional)</FormLabel>
              <Input type='password' placeholder='Leave blank to keep current' value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
              <FormHelperText>Enter only if you want to reset the password</FormHelperText>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' isLoading={isUpdating} onClick={submitEdit}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteDisc.isOpen} onClose={deleteDisc.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={deleteDisc.onClose}>Cancel</Button>
            <Button colorScheme='red' isLoading={isDeleting} onClick={confirmDelete}>Delete</Button>
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
