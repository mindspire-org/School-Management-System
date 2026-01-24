import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Button, Icon, useColorModeValue, FormControl, FormLabel, Input, Select, Avatar, useToast, Divider, Badge, Flex } from '@chakra-ui/react';
import { MdSave, MdRefresh, MdFileDownload, MdCameraAlt, MdClass, MdPeople, MdPermIdentity } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProfileInfo(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const toast = useToast();

  const student = useMemo(()=>{
    if (user?.role==='student'){
      const byEmail = mockStudents.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s=>s.name?.toLowerCase()===user.name?.toLowerCase());
      if (byName) return byName;
      return { id:999, name:user.name, rollNumber:'STU999', class:'10', section:'A', email:user.email, parentName:'Parent', parentPhone:'', avatar:'' };
    }
    return mockStudents[0];
  },[user]);
  const classSection = `${student.class}${student.section}`;

  const [form, setForm] = useState({
    name: student.name,
    roll: student.rollNumber,
    classSection,
    email: student.email || '',
    phone: student.phone || '+92',
    address: student.address || '',
    parentName: student.parentName || '',
    parentPhone: student.parentPhone || '',
    emergency: student.emergency || '',
  });

  const handle = (k,v)=> setForm(prev=> ({ ...prev, [k]: v }));

  const onSave = ()=>{
    toast({ status: 'success', title: 'Profile updated (demo)', description: 'Your changes are saved locally.' });
  };
  const onReset = ()=> setForm({
    name: student.name,
    roll: student.rollNumber,
    classSection,
    email: student.email || '',
    phone: student.phone || '+92',
    address: student.address || '',
    parentName: student.parentName || '',
    parentPhone: student.parentPhone || '',
    emergency: student.emergency || '',
  });

  const exportTxt = ()=>{
    const lines = [
      `${form.name} (${form.roll}) - ${form.classSection}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Address: ${form.address}`,
      `Parent: ${form.parentName} (${form.parentPhone})`,
      `Emergency: ${form.emergency}`,
    ];
    const blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='profile-info.txt'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Profile Info</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
            name='Class'
            value={String(classSection)}
            trendData={[1,1,1,1,1]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdPeople} w='22px' h='22px' color='white' />} />}
            name='Guardian'
            value={String(form.parentName || '—')}
            trendData={[1,1,1,1,1]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdPermIdentity} w='22px' h='22px' color='white' />} />}
            name='Roll'
            value={String(form.roll)}
            trendData={[1,1,1,1,1]}
            trendColor='#FD7853'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3}>
          <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdSave} />} onClick={onSave}>Save Changes</Button>
          <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={onReset}>Reset</Button>
          <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={exportTxt}>Export</Button>
        </HStack>
      </Card>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='12px'>Basic Information</Text>
          <SimpleGrid columns={{ base:1, sm:2 }} spacing={3}>
            <FormControl><FormLabel>Name</FormLabel><Input value={form.name} onChange={e=>handle('name', e.target.value)} /></FormControl>
            <FormControl isReadOnly><FormLabel>Roll Number</FormLabel><Input value={form.roll} /></FormControl>
            <FormControl isReadOnly><FormLabel>Class-Section</FormLabel><Input value={form.classSection} /></FormControl>
            <FormControl><FormLabel>Email</FormLabel><Input type='email' value={form.email} onChange={e=>handle('email', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Phone</FormLabel><Input value={form.phone} onChange={e=>handle('phone', e.target.value)} /></FormControl>
            <FormControl gridColumn={{ base:'1', sm:'1 / span 2' }}><FormLabel>Address</FormLabel><Input value={form.address} onChange={e=>handle('address', e.target.value)} /></FormControl>
          </SimpleGrid>
        </Card>

        <Card p='16px'>
          <Text fontWeight='bold' mb='12px'>Guardian & Emergency</Text>
          <SimpleGrid columns={{ base:1, sm:2 }} spacing={3}>
            <FormControl><FormLabel>Guardian Name</FormLabel><Input value={form.parentName} onChange={e=>handle('parentName', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Guardian Phone</FormLabel><Input value={form.parentPhone} onChange={e=>handle('parentPhone', e.target.value)} /></FormControl>
            <FormControl gridColumn={{ base:'1', sm:'1 / span 2' }}><FormLabel>Emergency Contact</FormLabel><Input value={form.emergency} onChange={e=>handle('emergency', e.target.value)} /></FormControl>
            <FormControl><FormLabel>Blood Group</FormLabel><Select placeholder='Select'><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></Select></FormControl>
            <FormControl><FormLabel>Bus Route</FormLabel><Input placeholder='Route number / stop' /></FormControl>
          </SimpleGrid>
          <Divider my='12px' />
          <HStack>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdSave} />} onClick={onSave}>Save</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={onReset}>Reset</Button>
          </HStack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
