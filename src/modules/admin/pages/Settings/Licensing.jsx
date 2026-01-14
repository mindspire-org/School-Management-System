import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardBody, Checkbox, Flex, Heading, SimpleGrid, Text, useToast } from '@chakra-ui/react';
import { useAuth } from '../../../../contexts/AuthContext';
import { rbacApi, settingsApi } from '../../../../services/api';

const ALL_MODULES = [
  'Dashboard',
  'Parents',
  'Students',
  'Teachers',
  'Academics',
  'Attendance',
  'Transport',
  'Finance',
  'Settings',
];

export default function Licensing() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState([]);

  const isOwner = String(user?.role || '') === 'owner';

  const load = async () => {
    try {
      setLoading(true);
      const data = await rbacApi.getModules();
      const adminCfg = data?.assignments?.admin || { allowModules: [], allowSubroutes: [] };
      setAllowed(Array.isArray(adminCfg.allowModules) ? adminCfg.allowModules : []);
    } catch (e) {
      toast({ title: 'Failed to load licensing', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = (name) => {
    setAllowed((prev) => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const save = async () => {
    try {
      setSaving(true);
      await rbacApi.setModules('admin', { allowModules: allowed, allowSubroutes: ['ALL'] });
      // Persist the selected modules to settings for login gating
      await settingsApi.set('licensing.allowed_modules', allowed);
      // Mark licensing as configured only after Owner saves module unlocks
      await settingsApi.set('licensing.configured', 'true');
      toast({ title: 'Licensing saved', description: 'Admin module access updated. System setup completed.', status: 'success' });
    } catch (e) {
      toast({ title: 'Save failed', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOwner) {
    return (
      <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
        <Heading size="lg" mb={3}>Licensing</Heading>
        <Text color="gray.600">Only the Owner can manage licensing.</Text>
      </Box>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Heading size="lg" mb={4}>Module Licensing (Academia Pro — Mindspire)</Heading>
      <Text color="gray.600" mb={6}>Unlock modules for this installation. By default, modules are locked for Admin users until enabled here.</Text>

      <Card>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {ALL_MODULES.map((m) => (
              <Flex key={m} align="center" p={3} borderWidth="1px" borderRadius="md">
                <Checkbox isChecked={allowed.includes(m)} onChange={() => toggle(m)} isDisabled={loading}>
                  <Text fontWeight="600">{m}</Text>
                </Checkbox>
              </Flex>
            ))}
          </SimpleGrid>
          <Flex mt={6} justify="flex-end">
            <Button colorScheme="blue" onClick={save} isLoading={saving || loading}>Save Changes</Button>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
}
