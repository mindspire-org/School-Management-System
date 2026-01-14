import React, { useState } from 'react';
import { Box, SimpleGrid, Text, HStack, VStack, Icon, useColorModeValue, Input, Select, Switch, FormControl, FormLabel, Button, useToast, Textarea, Tag, Wrap, WrapItem } from '@chakra-ui/react';
import { MdSettings, MdPhone, MdAlternateEmail, MdLanguage, MdDarkMode, MdLightMode } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';

export default function DriverSettings() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const [profile, setProfile] = useState({ name: 'Imran Khan', phone: '+92 300 1234567', email: 'driver@example.com' });
  const [prefs, setPrefs] = useState({ lang: 'en', theme: 'system', notifEmail: true, notifSMS: true, notifPush: true });
  const [dnd, setDnd] = useState({ enabled: false, from: '21:00', to: '06:00' });
  const [sos, setSos] = useState({ primary: '+92 300 9999999', secondary: '+92 333 8888888', note: '' });
  const [routePref, setRoutePref] = useState({ defaultRoute: 'R-A', defaultVehicle: 'BUS-12' });

  const saveAll = () => toast({ status: 'success', title: 'Settings saved' });
  const resetAll = () => { setProfile({ name: '', phone: '', email: '' }); setPrefs({ lang: 'en', theme: 'system', notifEmail: true, notifSMS: true, notifPush: true }); setDnd({ enabled: false, from: '21:00', to: '06:00' }); setSos({ primary: '', secondary: '', note: '' }); setRoutePref({ defaultRoute: '', defaultVehicle: '' }); };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Settings</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Profile, preferences, notifications, SOS contacts</Text>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing='20px'>
        <Card p='16px'>
          <HStack mb='10px'>
            <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<Icon as={MdSettings} w='22px' h='22px' color='white' />} />
            <VStack align='start' spacing={0}><Text fontWeight='600'>Profile</Text><Text fontSize='sm' color={textSecondary}>Basic info</Text></VStack>
          </HStack>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing='12px'>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={profile.name} onChange={e=>setProfile(p=>({ ...p, name: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input value={profile.phone} onChange={e=>setProfile(p=>({ ...p, phone: e.target.value }))} />
            </FormControl>
            <FormControl gridColumn={{ base: 'span 1', sm: 'span 2' }}>
              <FormLabel>Email</FormLabel>
              <Input value={profile.email} onChange={e=>setProfile(p=>({ ...p, email: e.target.value }))} />
            </FormControl>
          </SimpleGrid>
        </Card>

        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Preferences</Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing='12px'>
            <FormControl>
              <FormLabel><Icon as={MdLanguage} style={{ marginRight: 6 }} />Language</FormLabel>
              <Select value={prefs.lang} onChange={e=>setPrefs(p=>({ ...p, lang: e.target.value }))}>
                <option value='en'>English</option>
                <option value='ur'>Urdu</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel><Icon as={prefs.theme==='dark'?MdDarkMode:MdLightMode} style={{ marginRight: 6 }} />Theme</FormLabel>
              <Select value={prefs.theme} onChange={e=>setPrefs(p=>({ ...p, theme: e.target.value }))}>
                <option value='system'>System</option>
                <option value='light'>Light</option>
                <option value='dark'>Dark</option>
              </Select>
            </FormControl>
            <FormControl display='flex' alignItems='center'>
              <FormLabel mb='0'>Email Notifications</FormLabel>
              <Switch isChecked={prefs.notifEmail} onChange={e=>setPrefs(p=>({ ...p, notifEmail: e.target.checked }))} />
            </FormControl>
            <FormControl display='flex' alignItems='center'>
              <FormLabel mb='0'>SMS Notifications</FormLabel>
              <Switch isChecked={prefs.notifSMS} onChange={e=>setPrefs(p=>({ ...p, notifSMS: e.target.checked }))} />
            </FormControl>
            <FormControl display='flex' alignItems='center'>
              <FormLabel mb='0'>Push Notifications</FormLabel>
              <Switch isChecked={prefs.notifPush} onChange={e=>setPrefs(p=>({ ...p, notifPush: e.target.checked }))} />
            </FormControl>
          </SimpleGrid>
        </Card>

        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Do Not Disturb</Text>
          <HStack mb='8px'>
            <FormControl display='flex' alignItems='center'>
              <FormLabel mb='0'>Enable DND</FormLabel>
              <Switch isChecked={dnd.enabled} onChange={e=>setDnd(d=>({ ...d, enabled: e.target.checked }))} />
            </FormControl>
          </HStack>
          <HStack>
            <FormControl>
              <FormLabel>From</FormLabel>
              <Input type='time' value={dnd.from} onChange={e=>setDnd(d=>({ ...d, from: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>To</FormLabel>
              <Input type='time' value={dnd.to} onChange={e=>setDnd(d=>({ ...d, to: e.target.value }))} />
            </FormControl>
          </HStack>
        </Card>

        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>SOS & Defaults</Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing='12px'>
            <FormControl>
              <FormLabel>Primary SOS</FormLabel>
              <Input value={sos.primary} onChange={e=>setSos(s=>({ ...s, primary: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Secondary SOS</FormLabel>
              <Input value={sos.secondary} onChange={e=>setSos(s=>({ ...s, secondary: e.target.value }))} />
            </FormControl>
            <FormControl gridColumn={{ base: 'span 1', sm: 'span 2' }}>
              <FormLabel>Note</FormLabel>
              <Textarea rows={3} value={sos.note} onChange={e=>setSos(s=>({ ...s, note: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Default Route</FormLabel>
              <Select value={routePref.defaultRoute} onChange={e=>setRoutePref(r=>({ ...r, defaultRoute: e.target.value }))}>
                <option value='R-A'>Route A</option>
                <option value='R-B'>Route B</option>
                <option value='R-C'>Route C</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Default Vehicle</FormLabel>
              <Select value={routePref.defaultVehicle} onChange={e=>setRoutePref(r=>({ ...r, defaultVehicle: e.target.value }))}>
                <option value='BUS-12'>BUS-12</option>
                <option value='BUS-08'>BUS-08</option>
                <option value='BUS-15'>BUS-15</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </Card>
      </SimpleGrid>

      <HStack mt='16px' spacing={3}>
        <Button colorScheme='blue' onClick={saveAll}>Save Changes</Button>
        <Button variant='outline' onClick={resetAll}>Reset</Button>
      </HStack>
    </Box>
  );
}
