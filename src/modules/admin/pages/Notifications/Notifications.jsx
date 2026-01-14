import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Checkbox } from '@chakra-ui/react';
import { MdNotifications, MdSms, MdEmail, MdWarning, MdFileDownload, MdRefresh, MdSearch, MdCheckCircle, MdDelete } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRows = [
  { id: 'NT-0001', ts: '2025-11-16 09:10', title: 'Invoice INV-1023 marked paid', channel: 'System', severity: 'Info', status: 'Unread', target: 'Admin User' },
  { id: 'NT-0002', ts: '2025-11-16 09:25', title: 'Bus R1 delay 10 mins', channel: 'SMS', severity: 'Warning', status: 'Unread', target: 'Parents (R1)' },
  { id: 'NT-0003', ts: '2025-11-15 17:40', title: 'Exam schedule published', channel: 'Email', severity: 'Info', status: 'Read', target: 'All Students' },
  { id: 'NT-0004', ts: '2025-11-15 13:05', title: 'Multiple login attempts blocked', channel: 'System', severity: 'Critical', status: 'Read', target: 'Security' },
];

export default function Notifications() {
  const [channel, setChannel] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [preset, setPreset] = useState('none');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({
    unread: mockRows.filter(r=>r.status==='Unread').length,
    today: mockRows.filter(r=>r.ts.startsWith('2025-11-16')).length,
    alerts: mockRows.filter(r=>['Warning','Critical'].includes(r.severity)).length,
    total: mockRows.length,
  }), []);

  const filtered = useMemo(() => mockRows.filter(r => {
    const byChannel = channel==='all' || r.channel.toLowerCase()===channel;
    const bySeverity = severity==='all' || r.severity.toLowerCase()===severity;
    const byStatus = status==='all' || r.status.toLowerCase()===status;
    const bySearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    return byChannel && bySeverity && byStatus && bySearch;
  }), [channel, severity, status, search]);

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setFrom(start.toISOString().slice(0,10));
    setTo(end.toISOString().slice(0,10));
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Notifications</Heading>
          <Text color={textColorSecondary}>Inbox of system alerts, emails, and SMS</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdDelete />} variant='outline' colorScheme='red'>Clear All</Button>
          <Button leftIcon={<MdCheckCircle />} colorScheme='blue'>Mark All Read</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Unread" value={String(stats.unread)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdNotifications} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Today" value={String(stats.today)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdEmail} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="System Alerts" value={String(stats.alerts)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Total" value={String(stats.total)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdSms} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} flexWrap='wrap'>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search id or title' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='200px' value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value='all'>All Channels</option>
            <option value='system'>System</option>
            <option value='email'>Email</option>
            <option value='sms'>SMS</option>
          </Select>
          <Select maxW='200px' value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value='all'>All Severity</option>
            <option value='info'>Info</option>
            <option value='warning'>Warning</option>
            <option value='critical'>Critical</option>
          </Select>
          <Select maxW='200px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='unread'>Unread</option>
            <option value='read'>Read</option>
          </Select>
          <Input type='date' maxW='180px' value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type='date' maxW='180px' value={to} onChange={(e) => setTo(e.target.value)} />
          <ButtonGroup isAttached size='sm' variant='outline'>
            <Button colorScheme={preset==='7' ? 'blue' : undefined} onClick={() => { applyPreset(7); setPreset('7'); }}>
              Last 7d
            </Button>
            <Button colorScheme={preset==='30' ? 'blue' : undefined} onClick={() => { applyPreset(30); setPreset('30'); }}>
              Last 30d
            </Button>
          </ButtonGroup>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th><Checkbox aria-label='select-all' /></Th>
                <Th>ID</Th>
                <Th>Time</Th>
                <Th>Title</Th>
                <Th>Channel</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Target</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((n) => (
                <Tr key={n.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Checkbox aria-label={`select-${n.id}`} /></Td>
                  <Td><Text fontWeight='600'>{n.id}</Text></Td>
                  <Td><Text color={textColorSecondary}>{n.ts}</Text></Td>
                  <Td>{n.title}</Td>
                  <Td><Badge colorScheme={n.channel==='System'?'purple':n.channel==='Email'?'blue':'green'}>{n.channel}</Badge></Td>
                  <Td><Badge colorScheme={n.severity==='Critical'?'red':n.severity==='Warning'?'yellow':'gray'}>{n.severity}</Badge></Td>
                  <Td><Badge colorScheme={n.status==='Unread'?'red':'green'}>{n.status}</Badge></Td>
                  <Td>{n.target}</Td>
                  <Td>
                    <Button size='sm' variant='outline' mr={2} onClick={() => { setSelected(n); onOpen(); }}>View</Button>
                    <Button size='sm' colorScheme='blue' variant='ghost'>Mark Read</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Time:</strong> {selected.ts}</Text>
                <Text><strong>Title:</strong> {selected.title}</Text>
                <Text><strong>Channel:</strong> {selected.channel}</Text>
                <Text><strong>Severity:</strong> {selected.severity}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
                <Text><strong>Target:</strong> {selected.target}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
