import React, { useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Select, Input, Switch, FormControl, FormLabel, Grid, GridItem, Textarea } from '@chakra-ui/react';
import { MdSettings, MdFileDownload, MdSave, MdRefresh } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

export default function SystemSettings() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [schoolName, setSchoolName] = useState('City Public School');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [language, setLanguage] = useState('en');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [pwdMinLen, setPwdMinLen] = useState(8);
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [about, setAbout] = useState('');

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>System Settings</Heading>
          <Text color={textColorSecondary}>General, notifications, and security configurations</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export Config</Button>
          <Button leftIcon={<MdSave />} colorScheme='blue'>Save Changes</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Version" value="v1.0.0" startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdSettings} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Uptime" value="99.98%" startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdSettings} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Backups" value={backupSchedule.toUpperCase()} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdSettings} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Alerts" value={emailNotif || smsNotif ? 'Enabled' : 'Off'} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdSettings} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={5}>
        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>General</Heading>
            <FormControl mb={4}>
              <FormLabel>School Name</FormLabel>
              <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Timezone</FormLabel>
              <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value='Asia/Karachi'>Asia/Karachi</option>
                <option value='Asia/Kolkata'>Asia/Kolkata</option>
                <option value='UTC'>UTC</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Language</FormLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value='en'>English</option>
                <option value='ur'>Urdu</option>
              </Select>
            </FormControl>
          </Card>
        </GridItem>

        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Notifications</Heading>
            <FormControl display='flex' alignItems='center' mb={4}>
              <FormLabel mb='0' flex='1'>Email Notifications</FormLabel>
              <Switch isChecked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
            </FormControl>
            <FormControl display='flex' alignItems='center' mb={4}>
              <FormLabel mb='0' flex='1'>SMS Notifications</FormLabel>
              <Switch isChecked={smsNotif} onChange={(e) => setSmsNotif(e.target.checked)} />
            </FormControl>
            <FormControl>
              <FormLabel>Backup Schedule</FormLabel>
              <Select value={backupSchedule} onChange={(e) => setBackupSchedule(e.target.value)}>
                <option value='daily'>Daily</option>
                <option value='weekly'>Weekly</option>
                <option value='monthly'>Monthly</option>
              </Select>
            </FormControl>
          </Card>
        </GridItem>

        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Security</Heading>
            <FormControl display='flex' alignItems='center' mb={4}>
              <FormLabel mb='0' flex='1'>Two-Factor Authentication</FormLabel>
              <Switch isChecked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Password Min Length</FormLabel>
              <Select value={pwdMinLen} onChange={(e) => setPwdMinLen(Number(e.target.value))}>
                <option value={8}>8</option>
                <option value={10}>10</option>
                <option value={12}>12</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>About / Footer Text</FormLabel>
              <Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder='Short description shown in footer or login screen' />
            </FormControl>
          </Card>
        </GridItem>

        <GridItem>
          <Card p={5}>
            <Heading size='md' mb={4}>Branding</Heading>
            <FormControl mb={4}>
              <FormLabel>Primary Color</FormLabel>
              <Input type='color' defaultValue='#2b6cb0' />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Secondary Color</FormLabel>
              <Input type='color' defaultValue='#38a169' />
            </FormControl>
            <FormControl>
              <FormLabel>Logo URL</FormLabel>
              <Input placeholder='https://...' />
            </FormControl>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}
