import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Textarea, Input, InputGroup, InputLeftElement, Switch, FormControl, FormLabel, HStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, NumberInput, NumberInputField } from '@chakra-ui/react';
import { MdSms, MdSend, MdSchedule, MdPeople, MdCheckCircle, MdBarChart, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockLogs = [
  { id: 'SMS-001', audience: 'Class 10-A', sent: 28, delivered: 27, time: '09:30 AM', status: 'Sent' },
  { id: 'SMS-002', audience: 'All Parents', sent: 420, delivered: 408, time: '09:45 AM', status: 'Sent' },
  { id: 'SMS-003', audience: 'Bus Route R1', sent: 55, delivered: 53, time: '10:10 AM', status: 'Queued' },
];

export default function SendSMS() {
  const [audience, setAudience] = useState('all');
  const [klass, setKlass] = useState('10-A');
  const [section, setSection] = useState('A');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [rows, setRows] = useState(mockLogs);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', audience: '', sent: 0, delivered: 0, time: '', status: 'Sent' });

  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ balance: 12500, today: 740, deliveredRate: 96, pending: 32 }), []);

  const remaining = 160 - message.length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Send SMS</Heading>
          <Text color={textColorSecondary}>Broadcast SMS to parents, students or custom audience</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdSend />} colorScheme='blue'>Send Now</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="SMS Balance" value={String(stats.balance)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdSms} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Sent Today" value={String(stats.today)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdSend} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Delivery Rate" value={`${stats.deliveredRate}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdCheckCircle} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Pending" value={String(stats.pending)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdBarChart} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Audience</FormLabel>
            <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value='all'>All Parents</option>
              <option value='class'>By Class</option>
              <option value='section'>By Section</option>
              <option value='custom'>Custom</option>
            </Select>
          </FormControl>
          <FormControl isDisabled={audience === 'all' || audience === 'custom'}>
            <FormLabel>Class</FormLabel>
            <Select value={klass} onChange={(e) => setKlass(e.target.value)}>
              <option>10-A</option>
              <option>10-B</option>
              <option>9-A</option>
            </Select>
          </FormControl>
          <FormControl isDisabled={audience !== 'section'}>
            <FormLabel>Section</FormLabel>
            <Select value={section} onChange={(e) => setSection(e.target.value)}>
              <option>A</option>
              <option>B</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Schedule</FormLabel>
            <HStack>
              <Switch isChecked={schedule} onChange={(e) => setSchedule(e.target.checked)} />
              <Text color={textColorSecondary}>{schedule ? 'Scheduled' : 'Send immediately'}</Text>
            </HStack>
          </FormControl>
          {schedule && (
            <FormControl>
              <FormLabel>Schedule At</FormLabel>
              <Input type='datetime-local' value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
            </FormControl>
          )}
          <FormControl gridColumn={{ md: '1 / span 2' }}>
            <FormLabel>Message</FormLabel>
            <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Type your message...' />
            <Text mt={1} fontSize='sm' color={remaining < 0 ? 'red.500' : textColorSecondary}>{remaining} characters remaining</Text>
          </FormControl>
        </SimpleGrid>
        <Flex mt={4} gap={3}>
          <Button leftIcon={<MdSend />} colorScheme='blue'>Send</Button>
          <Button leftIcon={<MdSchedule />} variant='outline' isDisabled={!schedule}>Schedule</Button>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>ID</Th>
                <Th>Audience</Th>
                <Th isNumeric>Sent</Th>
                <Th isNumeric>Delivered</Th>
                <Th>Time</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((l) => (
                <Tr key={l.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{l.id}</Text></Td>
                  <Td>{l.audience}</Td>
                  <Td isNumeric>{l.sent}</Td>
                  <Td isNumeric>{l.delivered}</Td>
                  <Td><Text color={textColorSecondary}>{l.time}</Text></Td>
                  <Td><Badge colorScheme={l.status === 'Sent' ? 'green' : 'yellow'}>{l.status}</Badge></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(l); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(l); setForm({ ...l }); editDisc.onOpen(); }} />
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
          <ModalHeader>SMS Log</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Audience:</strong> {selected.audience}</Text>
                <Text><strong>Sent:</strong> {selected.sent}</Text>
                <Text><strong>Delivered:</strong> {selected.delivered}</Text>
                <Text><strong>Time:</strong> {selected.time}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit SMS Log</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Audience</FormLabel>
              <Input value={form.audience} onChange={(e)=> setForm(f=>({ ...f, audience: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Sent</FormLabel>
              <NumberInput value={form.sent} min={0} onChange={(v)=> setForm(f=>({ ...f, sent: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Delivered</FormLabel>
              <NumberInput value={form.delivered} min={0} onChange={(v)=> setForm(f=>({ ...f, delivered: Number(v)||0 }))}><NumberInputField /></NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Time</FormLabel>
              <Input value={form.time} onChange={(e)=> setForm(f=>({ ...f, time: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={form.status.toLowerCase()} onChange={(e)=> setForm(f=>({ ...f, status: e.target.value==='sent'?'Sent':'Queued' }))}>
                <option value='sent'>Sent</option>
                <option value='queued'>Queued</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => prev.map(r => r.id===form.id ? { ...r, audience: form.audience, sent: form.sent, delivered: form.delivered, time: form.time, status: form.status } : r)); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
