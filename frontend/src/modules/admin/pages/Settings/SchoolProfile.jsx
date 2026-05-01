import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Grid, GridItem, FormControl, FormLabel, Input, Textarea, Select, useToast, Image, HStack } from '@chakra-ui/react';
import { MdBusiness, MdSave, MdRefresh, MdFileDownload, MdCloudUpload } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { settingsApi, campusesApi } from '../../../../services/api';

export default function SchoolProfile() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [name, setName] = useState('City Public School');
  const [branch, setBranch] = useState('Main Campus');
  const [branchId, setBranchId] = useState(null);
  const [phone, setPhone] = useState('+92 300 0000000');
  const [email, setEmail] = useState('info@school.com');
  const [address, setAddress] = useState('123 Main Road, Karachi');
  const [principal, setPrincipal] = useState('Adeel Khan');
  const [session, setSession] = useState('2025-2026');
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const fileRef = useRef(null);

  const defaults = {
    name: 'City Public School',
    branch: 'Main Campus',
    branchId: null,
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
      setBranchId(p.branchId || null);
      setPhone(p.phone);
      setEmail(p.email);
      setAddress(p.address);
      setPrincipal(p.principal);
      setSession(p.session);
      setLogoUrl(p.logoUrl || '');
    } catch (_) {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  const loadCampuses = async () => {
    try {
      const res = await campusesApi.list({ pageSize: 100 });
      const rows = res?.rows || [];
      setCampuses(rows);
      // Align selected campus from saved profile
      if (rows.length) {
        if (branchId) {
          const found = rows.find(c => String(c.id) === String(branchId));
          if (found) {
            setBranch(found.name);
          }
        } else if (branch) {
          const found = rows.find(c => String(c.name).toLowerCase() === String(branch).toLowerCase());
          if (found) setBranchId(found.id);
        }
      }
    } catch (_) {
      setCampuses([]);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    loadCampuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = { name, branch, branchId, phone, email, address, principal, session, logoUrl };
      await settingsApi.saveSchoolProfile(payload);
      toast({ title: 'Saved', description: 'School profile updated successfully.', status: 'success', duration: 4000, isClosable: true });
    } catch (e) {
      toast({ title: 'Save failed', description: e?.message || 'Unable to save profile.', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const payload = { name, branch, branchId, phone, email, address, principal, session, logoUrl };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'school-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const onPickLogo = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setLogoUrl(String(dataUrl || ''));
      toast({ title: 'Logo selected', description: 'The logo will be saved on Save Changes.', status: 'info', duration: 2500 });
    };
    reader.readAsDataURL(file);
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
              <Select
                value={branchId || ''}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  setBranchId(id);
                  const found = campuses.find(c => String(c.id) === String(id));
                  setBranch(found?.name || '');
                }}
              >
                <option value=''>Select branch</option>
                {campuses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Logo</FormLabel>
              <HStack spacing={3}>
                <Image src={logoUrl || undefined} alt='Logo preview' boxSize='48px' borderRadius='md' fallbackSrc='' />
                <Input flex='1' placeholder='https://...' value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
                <input type='file' ref={fileRef} accept='image/*' style={{ display: 'none' }} onChange={onPickLogo} />
                <Button leftIcon={<MdCloudUpload />} onClick={() => fileRef.current?.click()}>Upload</Button>
              </HStack>
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
      </Grid>
    </Box>
  );
}
