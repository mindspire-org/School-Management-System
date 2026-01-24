import React, { useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Button, ButtonGroup, useColorModeValue, Grid, GridItem, FormControl, FormLabel, Input, Textarea, Select } from '@chakra-ui/react';
import { MdBusiness, MdSave, MdRefresh, MdFileDownload } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

export default function SchoolProfile() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const [name, setName] = useState('City Public School');
  const [branch, setBranch] = useState('Main Campus');
  const [phone, setPhone] = useState('+92 300 0000000');
  const [email, setEmail] = useState('info@school.com');
  const [address, setAddress] = useState('123 Main Road, Karachi');
  const [principal, setPrincipal] = useState('Adeel Khan');
  const [session, setSession] = useState('2025-2026');

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>School Profile</Heading>
          <Text color={textColorSecondary}>Identity, contact, and academic session details</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export</Button>
          <Button leftIcon={<MdSave />} colorScheme='blue'>Save Changes</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Branches" value="3" startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdBusiness} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Students" value="1,240" startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdBusiness} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Teachers" value="84" startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdBusiness} w='28px' h='28px' color='white' />} />} />
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
              <Input placeholder='https://...' />
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
