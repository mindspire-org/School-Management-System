import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Checkbox, InputGroup, InputLeftElement, Input } from '@chakra-ui/react';
import { MdSecurity, MdAdminPanelSettings, MdPeople, MdFileDownload, MdRefresh } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const roles = ['Administrator','Teacher','Accountant','Viewer'];
const modules = ['Students','Teachers','Finance','Transport','Attendance','Reports','Communication','Settings'];
const permList = ['view','create','edit','delete','export','manage'];

export default function Permissions() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [roleFilter, setRoleFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const base = modules.flatMap((m) => permList.map((p) => ({ key: `${m}.${p}`, module: m, action: p })));
    return base.filter(r => (moduleFilter==='all' || r.module===moduleFilter) && (!search || r.key.toLowerCase().includes(search.toLowerCase())));
  }, [moduleFilter, search]);

  const stats = useMemo(() => ({ modules: modules.length, roles: roles.length, perms: modules.length * permList.length }), []);

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
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Select maxW='220px' value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value='all'>All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple' size='sm'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Permission</Th>
                {roles.filter(r => roleFilter==='all' || r===roleFilter).map((r) => (
                  <Th key={r} isNumeric>{r}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((r) => (
                <Tr key={r.key} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.key}</Text></Td>
                  {roles.filter(x => roleFilter==='all' || x===roleFilter).map((role) => (
                    <Td key={role} isNumeric>
                      <Checkbox defaultChecked={Math.random() > 0.5} />
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
