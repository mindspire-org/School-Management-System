import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Grid, GridItem, FormControl, FormLabel, Input, Textarea, Select, useToast } from '@chakra-ui/react';
import { MdBusiness, MdSave, MdRefresh, MdFileDownload } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { settingsApi } from '../../../../services/api';

export default function SchoolProfile() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [name, setName] = useState('City Public School');
  const [branch, setBranch] = useState('Main Campus');
  const [phone, setPhone] = useState('+92 300 0000000');
  const [email, setEmail] = useState('info@school.com');
  const [address, setAddress] = useState('123 Main Road, Karachi');
  const [principal, setPrincipal] = useState('Adeel Khan');
  const [session, setSession] = useState('2025-2026');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [whatsappWebhook, setWhatsappWebhook] = useState('');

  const defaults = {
    name: 'City Public School',
    branch: 'Main Campus',
    phone: '+92 300 0000000',
    email: 'info@school.com',
    address: '123 Main Road, Karachi',
    principal: 'Adeel Khan',
    session: '2025-2026',
    logoUrl: '',
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getSchoolProfile();
      const p = data && typeof data === 'object' ? { ...defaults, ...data } : defaults;
      setName(p.name);
      setBranch(p.branch);
      setPhone(p.phone);
      setEmail(p.email);
      setAddress(p.address);
      setPrincipal(p.principal);
      setSession(p.session);
      setLogoUrl(p.logoUrl || '');
      try {
        const hook = await settingsApi.get('whatsapp.webhook.url');
        setWhatsappWebhook(hook?.value || '');
      } catch (_) { }
    } catch (_) {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { name, branch, phone, email, address, principal, session, logoUrl };
      await settingsApi.saveSchoolProfile(payload);
      await settingsApi.set('whatsapp.webhook.url', whatsappWebhook || '');
      toast({ title: 'Saved', description: 'School profile updated successfully.', status: 'success', duration: 4000, isClosable: true });
    } catch (e) {
      toast({ title: 'Save failed', description: e?.message || 'Unable to save profile.', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const payload = { name, branch, phone, email, address, principal, session, logoUrl };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'school-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>School Profile</Heading>
          <Text color={textColorSecondary}>Identity, contact, and academic session details</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={loadProfile} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' onClick={handleExport}>Export</Button>
          <Button leftIcon={<MdSave />} colorScheme='blue' onClick={handleSave} isLoading={saving}>Save Changes</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <StatCard title="Branches" value="3" icon={MdBusiness} colorScheme="blue" />
        <StatCard title="Students" value="1,240" icon={MdBusiness} colorScheme="green" />
        <StatCard title="Teachers" value="84" icon={MdBusiness} colorScheme="orange" />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={5}>
        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Identity</Heading>
            <FormControl mb={4}>
              <FormLabel>School Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Branch</FormLabel>
              <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option>Main Campus</option>
                <option>Gulshan Campus</option>
                <option>Johar Campus</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Logo URL</FormLabel>
              <Input placeholder='https://...' value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </FormControl>
          </Card>
        </GridItem>

        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Contact</Heading>
            <FormControl mb={4}>
              <FormLabel>Phone</FormLabel>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Email</FormLabel>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
            </FormControl>
          </Card>
        </GridItem>

        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Administration</Heading>
            <FormControl mb={4}>
              <FormLabel>Principal</FormLabel>
              <Input value={principal} onChange={(e) => setPrincipal(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Academic Session</FormLabel>
              <Select value={session} onChange={(e) => setSession(e.target.value)}>
                <option>2025-2026</option>
                <option>2024-2025</option>
                <option>2023-2024</option>
              </Select>
            </FormControl>
          </Card>
        </GridItem>

        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Brand Colors</Heading>
            <FormControl mb={4}>
              <FormLabel>Primary Color</FormLabel>
              <Input type='color' defaultValue='#2b6cb0' />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Secondary Color</FormLabel>
              <Input type='color' defaultValue='#38a169' />
            </FormControl>
            <FormControl>
              <FormLabel>Accent Color</FormLabel>
              <Input type='color' defaultValue='#805ad5' />
            </FormControl>
          </Card>
        </GridItem>

        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Messaging & Integrations</Heading>
            <FormControl>
              <FormLabel>WhatsApp Webhook URL</FormLabel>
              <Input placeholder='https://your-gateway.example.com/api/whatsapp' value={whatsappWebhook} onChange={(e) => setWhatsappWebhook(e.target.value)} />
            </FormControl>
            <Text mt={2} color={textColorSecondary} fontSize='sm'>
              When you use Parents → Inform, the server will POST a JSON body to this URL: {`{ to, text, familyNumber, childId }`}
            </Text>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}
