import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, NumberInput, NumberInputField } from '@chakra-ui/react';
import { MdAlarm, MdSchedule, MdSend, MdSearch, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockReminders = [
  { id: 'REM-001', type: 'Fee Due', audience: 'Outstanding', count: 120, schedule: 'Daily 9:00 AM', channel: 'SMS' },
  { id: 'REM-002', type: 'Event', audience: 'All Parents', count: 420, schedule: 'One-time', channel: 'Email' },
];

export default function Reminders() {
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('all');
  const [rows, setRows] = useState(mockReminders);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', type: '', audience: '', count: 0, schedule: '', channel: 'SMS' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ active: 2, paused: 0, sentToday: 260 }), []);

  const filtered = useMemo(() => mockReminders.filter(r => (channel==='all' || r.channel.toLowerCase()===channel) && (!search || r.type.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))), [channel, search]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Reminders</Heading>
          <Text color={textColorSecondary}>Automated SMS/Email reminders</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdSend />} colorScheme='blue'>Create Reminder</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Active" value={String(stats.active)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdAlarm} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Paused" value={String(stats.paused)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdSchedule} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Sent Today" value={String(stats.sentToday)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdSend} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search reminders' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value='all'>All Channels</option>
            <option value='sms'>SMS</option>
            <option value='email'>Email</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>ID</Th>
                <Th>Type</Th>
                <Th>Audience</Th>
                <Th isNumeric>Count</Th>
                <Th>Schedule</Th>
                <Th>Channel</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.id}</Text></Td>
                  <Td>{r.type}</Td>
                  <Td>{r.audience}</Td>
                  <Td isNumeric>{r.count}</Td>
                  <Td><Text color={textColorSecondary}>{r.schedule}</Text></Td>
                  <Td><Badge colorScheme='blue'>{r.channel}</Badge></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(r); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(r); setForm({ ...r }); editDisc.onOpen(); }} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reminder Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Type:</strong> {selected.type}</Text>
                <Text><strong>Audience:</strong> {selected.audience}</Text>
                <Text><strong>Count:</strong> {selected.count}</Text>
                <Text><strong>Schedule:</strong> {selected.schedule}</Text>
                <Text><strong>Channel:</strong> {selected.channel}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Reminder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Type</FormLabel>
              <Input value={form.type} onChange={(e)=> setForm(f=>({ ...f, type: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Audience</FormLabel>
              <Input value={form.audience} onChange={(e)=> setForm(f=>({ ...f, audience: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Count</FormLabel>
              <NumberInput value={form.count} min={0} onChange={(v)=> setForm(f=>({ ...f, count: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Schedule</FormLabel>
              <Input value={form.schedule} onChange={(e)=> setForm(f=>({ ...f, schedule: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Channel</FormLabel>
              <Select value={form.channel.toLowerCase()} onChange={(e)=> setForm(f=>({ ...f, channel: e.target.value==='sms'?'SMS':'Email' }))}>
                <option value='sms'>SMS</option>
                <option value='email'>Email</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => prev.map(x => x.id===form.id ? { ...form } : x)); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
