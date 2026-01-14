import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Button, Icon, useColorModeValue, FormControl, FormLabel, Switch, Select, Input, Checkbox, useToast, Divider, Badge, Flex } from '@chakra-ui/react';
import { MdSave, MdRefresh, MdFileDownload, MdNotificationsActive, MdSettings, MdSchedule } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents, mockNotifications } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

export default function Notifications(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const toast = useToast();

  const student = useMemo(()=>{
    if (user?.role==='student'){
      const byEmail = mockStudents.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s=>s.name?.toLowerCase()===user.name?.toLowerCase());
      if (byName) return byName;
      return { id:999, name:user.name, rollNumber:'STU999', class:'10', section:'A', email:user.email };
    }
    return mockStudents[0];
  },[user]);
  const classSection = `${student.class}${student.section}`;

  const unread = useMemo(()=> mockNotifications.filter(n=>!n.read).length, []);

  const [prefs, setPrefs] = useState({
    email:true,
    sms:false,
    push:true,
    assignment:true,
    grade:true,
    attendance:true,
    fee:true,
    events:true,
    dnd:false,
    dndStart:'21:00',
    dndEnd:'07:00',
    digest:'daily',
  });

  const handle = (k,v)=> setPrefs(prev => ({ ...prev, [k]: v }));

  const onSave = ()=>{ toast({ status:'success', title:'Notification preferences saved (demo)' }); };
  const onReset = ()=> setPrefs({ email:true, sms:false, push:true, assignment:true, grade:true, attendance:true, fee:true, events:true, dnd:false, dndStart:'21:00', dndEnd:'07:00', digest:'daily' });

  const exportTxt = ()=>{
    const lines = [
      `${student.name} (${student.rollNumber}) - Class ${classSection}`,
      `Channels: Email=${prefs.email}, SMS=${prefs.sms}, Push=${prefs.push}`,
      `Types: assignment=${prefs.assignment}, grade=${prefs.grade}, attendance=${prefs.attendance}, fee=${prefs.fee}, events=${prefs.events}`,
      `DND: ${prefs.dnd? `${prefs.dndStart}-${prefs.dndEnd}` : 'off'}`,
      `Digest: ${prefs.digest}`,
    ];
    const blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='notification-preferences.txt'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Notifications</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<Icon as={MdNotificationsActive} w='22px' h='22px' color='white' />} />}
            name='Unread'
            value={String(unread)}
            trendData={[1,1,2,2,3]}
            trendColor='#B721FF'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdSettings} w='22px' h='22px' color='white' />} />}
            name='Channels'
            value={String([prefs.email,prefs.sms,prefs.push].filter(Boolean).length)}
            trendData={[1,1,2,2,2]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdSchedule} w='22px' h='22px' color='white' />} />}
            name='Digest'
            value={String(prefs.digest)}
            trendData={[1,1,1,1,1]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3}>
          <Button size='sm' colorScheme='purple' onClick={onSave} leftIcon={<Icon as={MdSave} />}>Save</Button>
          <Button size='sm' variant='outline' onClick={onReset} leftIcon={<Icon as={MdRefresh} />}>Reset</Button>
          <Button size='sm' variant='outline' onClick={exportTxt} leftIcon={<Icon as={MdFileDownload} />}>Export</Button>
        </HStack>
      </Card>

      <SimpleGrid columns={{ base:1, lg:2 }} spacing='16px'>
        <Card p='16px'>
          <Text fontWeight='bold' mb='12px'>Channels</Text>
          <VStack align='stretch' spacing={3}>
            <FormControl display='flex' alignItems='center' justifyContent='space-between'>
              <FormLabel m='0'>Email</FormLabel>
              <Switch isChecked={prefs.email} onChange={e=>handle('email', e.target.checked)} />
            </FormControl>
            <FormControl display='flex' alignItems='center' justifyContent='space-between'>
              <FormLabel m='0'>SMS</FormLabel>
              <Switch isChecked={prefs.sms} onChange={e=>handle('sms', e.target.checked)} />
            </FormControl>
            <FormControl display='flex' alignItems='center' justifyContent='space-between'>
              <FormLabel m='0'>Push Notifications</FormLabel>
              <Switch isChecked={prefs.push} onChange={e=>handle('push', e.target.checked)} />
            </FormControl>
            <Divider />
            <Text color={textSecondary} fontSize='sm'>Digest</Text>
            <Select value={prefs.digest} onChange={e=>handle('digest', e.target.value)} maxW='220px'>
              <option value='instant'>Instant</option>
              <option value='hourly'>Hourly</option>
              <option value='daily'>Daily</option>
              <option value='weekly'>Weekly</option>
            </Select>
          </VStack>
        </Card>

        <Card p='16px'>
          <Text fontWeight='bold' mb='12px'>Types & DND</Text>
          <VStack align='stretch' spacing={3}>
            <Checkbox isChecked={prefs.assignment} onChange={e=>handle('assignment', e.target.checked)}>Assignments & Homework</Checkbox>
            <Checkbox isChecked={prefs.grade} onChange={e=>handle('grade', e.target.checked)}>Grades & Results</Checkbox>
            <Checkbox isChecked={prefs.attendance} onChange={e=>handle('attendance', e.target.checked)}>Attendance</Checkbox>
            <Checkbox isChecked={prefs.fee} onChange={e=>handle('fee', e.target.checked)}>Fees & Payments</Checkbox>
            <Checkbox isChecked={prefs.events} onChange={e=>handle('events', e.target.checked)}>Events & Activities</Checkbox>
            <Divider />
            <FormControl display='flex' alignItems='center' justifyContent='space-between'>
              <FormLabel m='0'>Do Not Disturb</FormLabel>
              <Switch isChecked={prefs.dnd} onChange={e=>handle('dnd', e.target.checked)} />
            </FormControl>
            <HStack>
              <FormControl maxW='180px' isDisabled={!prefs.dnd}><FormLabel>Start</FormLabel><Input type='time' value={prefs.dndStart} onChange={e=>handle('dndStart', e.target.value)} /></FormControl>
              <FormControl maxW='180px' isDisabled={!prefs.dnd}><FormLabel>End</FormLabel><Input type='time' value={prefs.dndEnd} onChange={e=>handle('dndEnd', e.target.value)} /></FormControl>
            </HStack>
          </VStack>
        </Card>
      </SimpleGrid>

      <Card p='16px' mt='16px'>
        <Text fontWeight='bold' mb='8px'>Recent Notifications</Text>
        <VStack align='stretch' spacing={2}>
          {mockNotifications.slice(0,6).map(n => (
            <HStack key={n.id} justify='space-between' bg={useColorModeValue('gray.50','whiteAlpha.100')} p='10px' borderRadius='md'>
              <HStack spacing={3}><Badge colorScheme={n.type==='fee'?'purple': n.type==='assignment'?'blue': n.type==='grade'?'green': n.type==='attendance'?'yellow':'gray'} textTransform='capitalize'>{n.type}</Badge><Text>{n.title}</Text></HStack>
              <Text color={textSecondary} fontSize='sm'>{n.time}</Text>
            </HStack>
          ))}
        </VStack>
      </Card>
    </Box>
  );
}
