import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Select, Input, FormControl, FormLabel, Grid, GridItem, useToast } from '@chakra-ui/react';
import { MdSettings, MdFileDownload, MdSave, MdRefresh } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import StatCard from '../../../../components/card/StatCard';
import * as settingsApi from '../../../../services/api/settings';
import { http } from '../../../../services/api';

export default function SystemSettings() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [schoolName, setSchoolName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [language, setLanguage] = useState('en');
  const [schoolStartTime, setSchoolStartTime] = useState('08:00');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  

  const loadSettings = async () => {
    setLoading(true);
    try {
      const profile = await settingsApi.getSchoolProfile();
      if (profile) {
        setSchoolName(profile.schoolName || '');
        setTimezone(profile.timezone || 'Asia/Karachi');
        setLanguage(profile.language || 'en');
        setSchoolStartTime(profile.schoolStartTime || '08:00');
      }
      
    } catch (error) {
      toast({
        title: 'Error loading settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsApi.saveSchoolProfile({
        schoolName,
        timezone,
        language,
        schoolStartTime,
      });
      
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error saving settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>System Settings</Heading>
          <Text color={textColorSecondary}>General, notifications, and security configurations</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={loadSettings} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdSave />} colorScheme='blue' onClick={handleSave} isLoading={loading}>Save Changes</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={5}>
        <StatCard title="Version" value="v1.0.0" icon={MdSettings} colorScheme="blue" />
        <StatCard title="Uptime" value="100%" icon={MdSettings} colorScheme="green" />
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
            <FormControl mb={4}>
              <FormLabel>Language</FormLabel>
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value='en'>English</option>
                <option value='ur'>Urdu</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>School Start Time</FormLabel>
              <Input type="time" value={schoolStartTime} onChange={(e) => setSchoolStartTime(e.target.value)} />
              <Text fontSize="xs" color="gray.500" mt={1}>Attendance after this time will be marked as "Late".</Text>
            </FormControl>
          </Card>
        </GridItem>
        
      </Grid>
    </Box>
  );
}
