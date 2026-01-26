import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Switch, CheckboxGroup, Checkbox, Stack, useToast } from '@chakra-ui/react';
import { MdAdminPanelSettings, MdGroup, MdSecurity, MdFileDownload, MdAdd, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { rbacApi } from '../../../../services/api';
import { getSMSRoutes } from '../../../../smsRoutesConfig';
import getTeacherRoutes from '../../../../teacherRoutes';
import getStudentRoutes from '../../../../studentRoutes';
import getDriverRoutes from '../../../../driverRoutes';

const allPerms = ['students.view', 'students.edit', 'teachers.view', 'teachers.edit', 'finance.view', 'finance.edit', 'transport.view', 'transport.edit', 'attendance.view', 'attendance.edit', 'attendance.export', 'reports.view', 'reports.export', 'communication.send', 'settings.manage'];

export default function RoleManagement() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permAssignments, setPermAssignments] = useState({});
  const [moduleAssignments, setModuleAssignments] = useState({});
  const [moduleDefs, setModuleDefs] = useState([]);
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [allowModules, setAllowModules] = useState(new Set());
  const [allowSubroutes, setAllowSubroutes] = useState(new Set());
  const createDisc = useDisclosure();
  const editDisc = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const buildModuleDefs = (roleId) => {
    try {
      const r = String(roleId || '').toLowerCase();
      const includeOwnerOnly = r === 'owner';
      let routes = [];
      let layout = null;
      if (r === 'admin' || r === 'owner') {
        routes = getSMSRoutes();
        layout = '/admin';
      } else if (r === 'teacher') {
        routes = getTeacherRoutes();
        layout = '/teacher';
      } else if (r === 'student') {
        routes = getStudentRoutes();
        layout = '/student';
      } else if (r === 'driver') {
        routes = getDriverRoutes();
        layout = '/driver';
      } else {
        routes = [];
        layout = null;
      }
      if (!layout) return [];

      const collectPages = (node, prefix = []) => {
        const out = [];
        if (!node) return out;
        if (node.hidden) return out;
        if (node.ownerOnly && !includeOwnerOnly) return out;

        const labelParts = [...prefix, node.name].filter(Boolean);
        if (node.layout === layout && node.path) {
          out.push({ path: node.path, label: labelParts.length ? labelParts.join(' > ') : node.path });
        }
        if (Array.isArray(node.items)) {
          const nextPrefix = node.collapse ? labelParts : prefix;
          node.items.forEach((it) => {
            out.push(...collectPages(it, nextPrefix));
          });
        }
        return out;
      };

      const topLevel = routes
        .flatMap((rt) => (rt && rt.category && Array.isArray(rt.items)) ? rt.items : [rt])
        .filter(Boolean);

      const defs = topLevel
        .filter((rt) => rt.layout === layout && !rt.hidden && (!rt.ownerOnly || includeOwnerOnly))
        .map((rt) => {
          if (rt.collapse && Array.isArray(rt.items)) {
            const pages = (rt.items || []).flatMap((it) => collectPages(it, [rt.name]));
            const byPath = new Map();
            pages.forEach((p) => {
              if (p && p.path && !byPath.has(p.path)) byPath.set(p.path, p);
            });
            return { name: rt.name, subroutes: Array.from(byPath.values()) };
          }
          const pages = (rt.path && !rt.hidden && (!rt.ownerOnly || includeOwnerOnly))
            ? [{ path: rt.path, label: rt.name || rt.path }]
            : [];
          return { name: rt.name, subroutes: pages };
        });
      return defs;
    } catch (_) {
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await rbacApi.getRoles();
        setRoles(Array.isArray(res?.items) ? res.items : []);
      } catch (_) { }
      try {
        const perms = await rbacApi.getPermissions();
        setPermAssignments(perms?.assignments || {});
      } catch (_) { }
      try {
        const mods = await rbacApi.getModules();
        setModuleAssignments(mods?.assignments || {});
      } catch (_) { }
      try {
        setModuleDefs(buildModuleDefs(selectedRole));
      } catch (_) { }
    };
    load();
  }, []);

  useEffect(() => {
    setModuleDefs(buildModuleDefs(selectedRole));
  }, [selectedRole]);

  // Sync current role's assignments to local state
  useEffect(() => {
    if (String(selectedRole).toLowerCase() === 'owner') {
      setAllowModules(new Set(moduleDefs.map((d) => d.name).filter(Boolean)));
      setAllowSubroutes(
        new Set(
          moduleDefs
            .flatMap((d) => Array.isArray(d.subroutes) ? d.subroutes : [])
            .map((s) => s?.path)
            .filter(Boolean)
        )
      );
      return;
    }
    const a = moduleAssignments?.[selectedRole] || { allowModules: [], allowSubroutes: [] };
    setAllowModules(new Set(a.allowModules || []));
    setAllowSubroutes(new Set(a.allowSubroutes || []));
  }, [selectedRole, moduleAssignments, moduleDefs]);

  const toggleModule = (name, checked) => {
    setAllowModules((prev) => {
      const next = new Set(prev);
      if (checked) next.add(name); else next.delete(name);
      return next;
    });
    if (!checked) {
      const def = moduleDefs.find(d => d.name === name);
      if (def && def.subroutes?.length) {
        setAllowSubroutes((prev) => {
          const next = new Set(prev);
          def.subroutes.forEach((p) => next.delete(p?.path));
          return next;
        });
      }
    }
  };

  const toggleSubroute = (path, checked) => {
    setAllowSubroutes((prev) => {
      const next = new Set(prev);
      if (checked) next.add(path); else next.delete(path);
      return next;
    });
  };

  const saveModules = async () => {
    if (String(selectedRole).toLowerCase() === 'owner') {
      toast({
        title: 'Owner access is always full',
        description: 'Owner module access is not configurable from this screen.',
        status: 'info',
        duration: 3500,
        isClosable: true,
      });
      return;
    }
    const payload = {
      allowModules: Array.from(allowModules),
      allowSubroutes: Array.from(allowSubroutes),
    };
    try {
      await rbacApi.setModules(selectedRole, payload);
      const mods = await rbacApi.getModules();
      setModuleAssignments(mods?.assignments || {});
      toast({
        title: 'Changes saved',
        description: 'Module access has been updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (_) {
      toast({
        title: 'Save failed',
        description: 'Unable to save module access. Please try again.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const stats = useMemo(() => ({ roles: roles.length, users: roles.reduce((s, r) => s + (r.users || 0), 0), perms: Object.values(permAssignments || {}).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0) }), [roles, permAssignments]);

  const filtered = useMemo(() => roles.filter(r => {
    const name = r.name || r.id;
    const bySearch = !search || String(name).toLowerCase().includes(search.toLowerCase());
    const byStatus = status === 'all' || (status === 'active' ? r.active : !r.active);
    return bySearch && byStatus;
  }), [roles, search, status]);

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
        <StatCard title="Total Roles" value={String(stats.roles)} icon={MdAdminPanelSettings} colorScheme="blue" />
        <StatCard title="Total Users" value={String(stats.users)} icon={MdGroup} colorScheme="green" />
        <StatCard title="Permissions" value={String(stats.perms)} icon={MdSecurity} colorScheme="orange" />
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
                  <Td isNumeric>{(permAssignments?.[r.id] || []).length}</Td>
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

      {/* Module Access Control */}
      <Card p={5} mt={5}>
        <Flex justify="space-between" align="center" mb={4} direction={{ base: 'column', md: 'row' }} gap={3}>
          <Heading size='md'>Module Access</Heading>
          <Flex gap={3} align='center'>
            <Select maxW='220px' value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {roles.filter((r) => ['owner', 'admin', 'teacher', 'student', 'driver'].includes(r.id)).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
            <Button
              variant='outline'
              isDisabled={String(selectedRole).toLowerCase() === 'owner'}
              onClick={() => { setAllowModules(new Set()); setAllowSubroutes(new Set()); }}
            >
              Reset
            </Button>
            <Button colorScheme='blue' isDisabled={String(selectedRole).toLowerCase() === 'owner'} onClick={saveModules}>Save</Button>
          </Flex>
        </Flex>
        {String(selectedRole).toLowerCase() === 'owner' && (
          <Text mb={4} color={textColorSecondary}>
            Owner always has full access. Configure access for other roles (Admin/Teacher/Student/Driver) from the dropdown.
          </Text>
        )}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {moduleDefs.map((m) => (
            <Box key={m.name} borderWidth='1px' borderRadius='md' p={4}>
              <Checkbox
                isChecked={allowModules.has(m.name)}
                isDisabled={String(selectedRole).toLowerCase() === 'owner'}
                onChange={(e) => toggleModule(m.name, e.target.checked)}
              >
                <Text fontWeight='600'>{m.name}</Text>
              </Checkbox>
              {allowModules.has(m.name) && m.subroutes?.length > 0 && (
                <Stack mt={3} pl={6} spacing={2}>
                  {m.subroutes.map((p) => (
                    <Checkbox
                      key={p.path}
                      isChecked={allowSubroutes.has(p.path)}
                      isDisabled={String(selectedRole).toLowerCase() === 'owner'}
                      onChange={(e) => toggleSubroute(p.path, e.target.checked)}
                    >
                      {p.label || p.path}
                    </Checkbox>
                  ))}
                </Stack>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </Card>

      {/* Create Role Modal (fixed roles only) */}
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
              <CheckboxGroup defaultValue={['students.view', 'reports.view']}>
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
            <Button colorScheme='blue' isDisabled>Create</Button>
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
                  <Input defaultValue={selected.name} isReadOnly />
                </FormControl>
                <FormControl display='flex' alignItems='center' mb={4}>
                  <FormLabel mb='0' flex='1'>Active</FormLabel>
                  <Switch defaultChecked={selected.active} onChange={(e) => setSelected(s => ({ ...s, active: e.target.checked }))} />
                </FormControl>
                <FormControl>
                  <FormLabel>Permissions</FormLabel>
                  <CheckboxGroup defaultValue={(permAssignments?.[selected.id] || [])}>
                    <Stack spacing={3} maxH='220px' overflowY='auto'>
                      {allPerms.map((p) => (
                        <Checkbox key={p} value={p} isDisabled>{p}</Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={editDisc.onClose}>Close</Button>
            <Button colorScheme='blue' onClick={async () => {
              try {
                await rbacApi.setRoleActive(selected.id, selected.active);
                const res = await rbacApi.getRoles();
                setRoles(Array.isArray(res?.items) ? res.items : []);
                editDisc.onClose();
              } catch (_) { }
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
