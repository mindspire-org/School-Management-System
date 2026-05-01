import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Input,
  Select,
  Textarea,
  Button,
  Icon,
  Avatar,
  useColorModeValue,
  FormControl,
  FormLabel,
  Switch,
  Tooltip,
} from '@chakra-ui/react';
import { MdRefresh, MdSave, MdClass, MdPeople, MdHistory } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import * as teachersApi from '../../../services/api/teachers';
import { useToast } from '@chakra-ui/react';

const initialProfile = {
  name: '',
  email: '',
  phone: '',
  designation: '',
  department: '',
  gender: '',
  address: '',
  city: '',
  avatar: '',
  twoFA: false,
};

export default function Profile() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [form, setForm] = useState(initialProfile);
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const kpis = useMemo(() => ({
    classes: 4,
    students: 120,
    tenure: '3y 7m',
  }), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await teachersApi.me();
        setTeacherId(me?.id || null);
        setForm({
          name: me?.name || '',
          email: me?.email || '',
          phone: me?.phone || '',
          designation: me?.designation || '',
          department: me?.department || '',
          gender: me?.gender || '',
          address: [me?.address1, me?.address2].filter(Boolean).join(', ') || '',
          city: me?.city || '',
          avatar: me?.avatar || '',
          twoFA: false,
        });
      } catch (_) {
        setForm(initialProfile);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const reset = () => setForm((s)=>({ ...s }));
  const save = async () => {
    try {
      setSaving(true);
      // Split address into line1/line2 naive split
      const [address1='', address2=''] = String(form.address||'').split(',').map(x=>x.trim()).slice(0,2).concat(['','']).slice(0,2);
      const payload = {
        name: form.name,
        phone: form.phone,
        designation: form.designation,
        department: form.department,
        gender: form.gender,
        address1,
        address2,
        city: form.city,
        avatar: form.avatar,
      };
      // Update own profile
      await teachersApi.updateMe(payload);
      toast({ title: 'Profile updated', status: 'success' });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Save failed';
      toast({ title: 'Error', description: msg, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handle = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target ? e.target.value : e }));

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Profile</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Manage personal information and account settings</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdClass color='white' />} />} name='Classes' value={String(kpis.classes)} trendData={[3,3,4,4,4,5]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdPeople color='white' />} />} name='Students' value={String(kpis.students)} trendData={[100,110,115,120]} trendColor='#01B574' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdHistory color='white' />} />} name='Tenure' value={String(kpis.tenure)} trendData={[1,1,1,1]} trendColor='#B721FF' />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing='16px'>
        <Card p='16px' gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <VStack align='stretch' spacing={4}>
            <HStack spacing={3} flexWrap='wrap' rowGap={3}>
              <Avatar name={form.name} src={form.avatar} size='lg' />
              <Input size='sm' placeholder='Avatar URL' value={form.avatar} onChange={handle('avatar')} maxW='320px' />
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing='12px'>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input size='sm' value={form.name} onChange={handle('name')} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input size='sm' type='email' value={form.email} onChange={handle('email')} />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input size='sm' value={form.phone} onChange={handle('phone')} />
              </FormControl>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <Select size='sm' value={form.gender} onChange={handle('gender')}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Designation</FormLabel>
                <Input size='sm' value={form.designation} onChange={handle('designation')} />
              </FormControl>
              <FormControl>
                <FormLabel>Department</FormLabel>
                <Input size='sm' value={form.department} onChange={handle('department')} />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Textarea size='sm' rows={3} value={form.address} onChange={handle('address')} />
            </FormControl>

            <HStack spacing={3} flexWrap='wrap' rowGap={3}>
              <FormControl display='flex' alignItems='center' width='auto'>
                <FormLabel htmlFor='twoFA' mb='0'>Enable Two‑Factor</FormLabel>
                <Switch id='twoFA' isChecked={form.twoFA} onChange={(e)=>setForm(s=>({...s, twoFA: e.target.checked}))} />
              </FormControl>
              <Tooltip label='City used for transport and HR processes'>
                <Input size='sm' placeholder='City' value={form.city} onChange={handle('city')} maxW='200px' />
              </Tooltip>
            </HStack>

            <Flex justify='flex-end' gap={2} flexWrap='wrap' rowGap={3}>
              <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={reset} isDisabled={loading || saving}>Reset</Button>
              <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdSave} />} onClick={save} isLoading={saving}>Save</Button>
            </Flex>
          </VStack>
        </Card>

        <Card p='16px'>
          <VStack spacing={3} align='stretch'>
            <Text fontWeight='700'>Preview</Text>
            <HStack spacing={4}>
              <Avatar name={form.name} src={form.avatar} />
              <VStack spacing={0} align='start'>
                <Text fontWeight='700'>{form.name}</Text>
                <Text fontSize='sm' color={textSecondary}>{form.designation}</Text>
                <Text fontSize='sm' color={textSecondary}>{form.department}</Text>
              </VStack>
            </HStack>
            <VStack spacing={1} align='start' fontSize='sm' color={textSecondary}>
              <Text>{form.email}</Text>
              <Text>{form.phone}</Text>
              <Text>{form.address}</Text>
              <Text>{form.city}</Text>
            </VStack>
          </VStack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
