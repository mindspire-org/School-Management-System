import React, { useEffect, useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Checkbox, InputGroup, InputLeftElement, Input } from '@chakra-ui/react';
import { MdSecurity, MdAdminPanelSettings, MdPeople, MdFileDownload, MdRefresh } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import { rbacApi, authApi } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

const roleMap = { admin: 'Administrator', teacher: 'Teacher', student: 'Student', driver: 'Driver' };
const baseModules = ['students', 'teachers', 'parents', 'finance', 'transport', 'attendance', 'reports', 'communication', 'settings'];
const displayToKey = {
  Students: 'students',
  Teachers: 'teachers',
  Finance: 'finance',
  Transport: 'transport',
  Attendance: 'attendance',
  Reports: 'reports',
  Communication: 'communication',
  Settings: 'settings',
  Parents: 'parents',
  Dashboard: 'dashboard',
  Academics: 'academics',
};
const actions = ['view', 'edit', 'export', 'manage'];

export default function Permissions() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user, moduleAccess } = useAuth();
  const [roleFilter, setRoleFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState({});
  // Only allowed roles that can be created by admin
  const [roles, setRoles] = useState(['admin', 'student', 'teacher', 'driver', 'parent']);
  // When Owner is viewing, we should respect modules assigned to Admin (licensed by Owner)
  const [adminAllowed, setAdminAllowed] = useState(null);
  const [licAllowed, setLicAllowed] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await rbacApi.getPermissions();
        // Filter to only show allowed roles (exclude owner)
        const rs = Array.isArray(data?.roles) ? data.roles.filter(r => ['admin', 'student', 'teacher', 'driver', 'parent'].includes(r)) : ['admin', 'student', 'teacher', 'driver', 'parent'];
        setRoles(rs);
        setAssignments(data?.assignments || {});
      } catch (_) { }
    };
    load();
  }, []);

  // Owner context: fetch Admin licensing to filter visible modules accordingly
  useEffect(() => {
    const loadAdminModules = async () => {
      if (!user || user.role !== 'owner') { setAdminAllowed(null); return; }
      try {
        const mods = await rbacApi.getModules();
        const allowed = Array.isArray(mods?.assignments?.admin?.allowModules)
          ? mods.assignments.admin.allowModules
          : [];
        setAdminAllowed(allowed);
      } catch (_) {
        setAdminAllowed([]);
      }
    };
    loadAdminModules();
  }, [user]);

  // Licensing cap: Always fetch licensed modules (what the Owner purchased)
  useEffect(() => {
    let timer;
    const fetchLic = async () => {
      try {
        const st = await authApi.status();
        const arr = Array.isArray(st?.allowedModules) ? st.allowedModules : [];
        setLicAllowed(arr);
      } catch (_) { }
    };
    fetchLic();
    // Light polling for fast, dynamic updates when Owner changes licensing
    timer = setInterval(fetchLic, 3000);
    return () => { if (timer) clearInterval(timer); };
  }, []);

  // Determine which modules to show based on licensing. Owner sees all.
  const allowedModules = useMemo(() => {
    const licKeys = (Array.isArray(licAllowed) ? licAllowed : [])
      .map((n) => displayToKey[n] || (typeof n === 'string' ? n.toLowerCase() : null))
      .filter(Boolean);
    if (user?.role === 'owner') {
      const adminKeys = (Array.isArray(adminAllowed) ? adminAllowed : [])
        .map((n) => displayToKey[n] || (typeof n === 'string' ? n.toLowerCase() : null))
        .filter(Boolean);
      const keys = adminKeys.filter(k => licKeys.includes(k));
      return baseModules.filter((m) => keys.includes(m));
    }
    const allow = moduleAccess?.allowModules;
    let roleKeys = [];
    if (allow === 'ALL') roleKeys = baseModules; else if (Array.isArray(allow)) {
      roleKeys = allow.map((n) => displayToKey[n] || (typeof n === 'string' ? n.toLowerCase() : null)).filter(Boolean);
    }
    const keys = (roleKeys.length ? roleKeys : []).filter(k => licKeys.includes(k));
    return baseModules.filter((m) => keys.includes(m));
  }, [user, moduleAccess, adminAllowed, licAllowed]);

  const rows = useMemo(() => {
    const base = allowedModules.flatMap((m) => actions.map((a) => ({ key: `${m}.${a}`, module: m, action: a })));
    return base.filter(r => (moduleFilter === 'all' || r.module === moduleFilter) && (!search || r.key.toLowerCase().includes(search.toLowerCase())));
  }, [moduleFilter, search, allowedModules]);

  const stats = useMemo(() => ({ modules: allowedModules.length, roles: roles.length, perms: allowedModules.length * actions.length }), [roles, allowedModules]);

  const toggle = (role, perm, checked) => {
    setAssignments((prev) => {
      const curr = new Set(prev[role] || []);
      if (checked) curr.add(perm); else curr.delete(perm);
      return { ...prev, [role]: Array.from(curr) };
    });
  };

  const save = async () => {
    const rs = roleFilter === 'all' ? roles : [roleFilter];
    for (const r of rs) {
      try { await rbacApi.setPermissions(r, assignments[r] || []); } catch (_) { }
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Permissions</Heading>
          <Text color={textColorSecondary}>Fine-grained access control across modules and roles</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Export PDF</Button>
          <Button colorScheme='green' onClick={save}>Save</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Modules" value={String(stats.modules)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdSecurity} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Roles" value={String(stats.roles)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdAdminPanelSettings} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Permissions" value={String(stats.perms)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdPeople} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSecurity color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search permission' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
            <option value='all'>All Modules</option>
            {allowedModules.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select maxW='220px' value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value='all'>All Roles</option>
            {roles.map(r => <option key={r} value={r}>{roleMap[r] || r}</option>)}
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple' size='sm'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Permission</Th>
                {roles.filter(r => roleFilter === 'all' || r === roleFilter).map((r) => (
                  <Th key={r} isNumeric>{roleMap[r] || r}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((r) => (
                <Tr key={r.key} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.key}</Text></Td>
                  {roles.filter(x => roleFilter === 'all' || x === roleFilter).map((role) => (
                    <Td key={role} isNumeric>
                      <Checkbox isChecked={(assignments[role] || []).includes(r.key)} onChange={(e) => toggle(role, r.key, e.target.checked)} />
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
