import React, { useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Select, Input, FormControl, FormLabel, Grid, GridItem } from '@chakra-ui/react';
import { MdSettings, MdFileDownload, MdSave, MdRefresh } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';

export default function SystemSettings() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [schoolName, setSchoolName] = useState('City Public School');
  const [timezone, setTimezone] = useState('Asia/Karachi');
  const [language, setLanguage] = useState('en');

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

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={5}>
        <StatCard title="Version" value="v1.0.0" icon={MdSettings} colorScheme="blue" />
        <StatCard title="Uptime" value="99.98%" icon={MdSettings} colorScheme="green" />
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


      </Grid>
    </Box>
  );
}
