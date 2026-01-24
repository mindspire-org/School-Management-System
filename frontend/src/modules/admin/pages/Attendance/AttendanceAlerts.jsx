import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Button,
  ButtonGroup,
  Checkbox,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdNotificationsActive, MdReportProblem, MdDone, MdWarningAmber, MdSearch, MdFileDownload, MdPictureAsPdf, MdRefresh, MdVisibility, MdMarkEmailRead, MdCheckCircle, MdAssignmentInd } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockAlerts = [
  { id: 'A-001', type: 'Absent', severity: 'High', message: 'Student STU-1002 absent for 3 consecutive days', status: 'Active', date: '2025-11-12' },
  { id: 'A-002', type: 'Late', severity: 'Medium', message: 'Spike in late arrivals in class 10-B', status: 'Active', date: '2025-11-12' },
  { id: 'A-003', type: 'Device', severity: 'Low', message: 'RFID reader #2 intermittent failures', status: 'Resolved', date: '2025-11-11' },
];

export default function AttendanceAlerts() {
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState(mockAlerts);
  const [selected, setSelected] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [active, setActive] = useState(null);
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => {
    const active = mockAlerts.filter((a) => a.status === 'Active').length;
    const resolved = mockAlerts.filter((a) => a.status === 'Resolved').length;
    const newToday = mockAlerts.filter((a) => a.date === '2025-11-12').length;
    return { active, resolved, newToday };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts.filter((a) =>
      (severity === 'all' || a.severity.toLowerCase() === severity) &&
      (status === 'all' || a.status.toLowerCase() === status) &&
      (!q || a.id.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.message.toLowerCase().includes(q))
    );
  }, [alerts, severity, status, query]);

  const toggleSelect = (id) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectAll = (checked) => {
    setSelected(checked ? filtered.map((a) => a.id) : []);
  };

  const markRead = (ids) => {
    setAlerts((as) => as.map((a) => (ids.includes(a.id) ? { ...a, status: 'Active' } : a)));
    setSelected([]);
  };

  const resolve = (ids) => {
    setAlerts((as) => as.map((a) => (ids.includes(a.id) ? { ...a, status: 'Resolved' } : a)));
    setSelected([]);
  };

  const openDetails = (a) => {
    setActive(a);
    onOpen();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Alerts</Heading>
          <Text color={textColorSecondary}>Proactive notifications on attendance patterns</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={()=>window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue">Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue">Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Active Alerts"
          value={String(stats.active)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f7971e 0%,#ffd200 100%)' icon={<MdNotificationsActive size={28} color='white' />} />}
        />
        <MiniStatistics
          name="New Today"
          value={String(stats.newToday)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<MdWarningAmber size={28} color='white' />} />}
        />
        <MiniStatistics
          name="Resolved"
          value={String(stats.resolved)}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<MdDone size={28} color='white' />} />}
        />
      </SimpleGrid>

      {/* Filters */}
      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW='320px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.300' />
            </InputLeftElement>
            <Input placeholder='Search ID, type or message...' value={query} onChange={(e)=>setQuery(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value='all'>All Severities</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </Select>
          <Select maxW='220px' value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='resolved'>Resolved</option>
          </Select>
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<MdMarkEmailRead />} onClick={()=>markRead(selected)} isDisabled={selected.length===0}>Mark Read</Button>
            <Button size='sm' colorScheme='green' leftIcon={<MdCheckCircle />} onClick={()=>resolve(selected)} isDisabled={selected.length===0}>Resolve</Button>
          </HStack>
        </Flex>
      </Card>

      {/* Table */}
      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>
                  <Checkbox isChecked={selected.length===filtered.length && filtered.length>0} isIndeterminate={selected.length>0 && selected.length<filtered.length} onChange={(e)=>selectAll(e.target.checked)} />
                </Th>
                <Th>ID</Th>
                <Th>Type</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Message</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((a) => (
                <Tr key={a.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Checkbox isChecked={selected.includes(a.id)} onChange={()=>toggleSelect(a.id)} /></Td>
                  <Td><Badge>{a.id}</Badge></Td>
                  <Td><Text fontWeight='500'>{a.type}</Text></Td>
                  <Td><Badge colorScheme={a.severity === 'High' ? 'red' : a.severity === 'Medium' ? 'yellow' : 'blue'}>{a.severity}</Badge></Td>
                  <Td><Badge colorScheme={a.status === 'Active' ? 'yellow' : 'green'}>{a.status}</Badge></Td>
                  <Td><Text color={textColorSecondary}>{a.date}</Text></Td>
                  <Td><Text>{a.message}</Text></Td>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton aria-label='View' icon={<MdVisibility />} size='sm' variant='ghost' onClick={()=>openDetails(a)} />
                      <IconButton aria-label='Mark Read' icon={<MdMarkEmailRead />} size='sm' variant='ghost' onClick={()=>markRead([a.id])} />
                      <IconButton aria-label='Resolve' icon={<MdCheckCircle />} size='sm' variant='ghost' colorScheme='green' onClick={()=>resolve([a.id])} />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alert Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {active && (
              <Box>
                <HStack mb={3} spacing={3}>
                  <Badge>{active.id}</Badge>
                  <Badge colorScheme={active.severity === 'High' ? 'red' : active.severity === 'Medium' ? 'yellow' : 'blue'}>{active.severity}</Badge>
                  <Badge colorScheme={active.status === 'Active' ? 'yellow' : 'green'}>{active.status}</Badge>
                </HStack>
                <Text fontWeight='600' mb={1}>{active.type}</Text>
                <Text mb={4} color={textColorSecondary}>{active.message}</Text>
                <Select placeholder='Assign to' mb={3} icon={<MdAssignmentInd />}>
                  <option>Admin</option>
                  <option>Class Teacher</option>
                  <option>Attendance Incharge</option>
                </Select>
                <Textarea placeholder='Add a note or response...' rows={4} />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>Close</Button>
            <Button leftIcon={<MdMarkEmailRead />} variant='outline' onClick={()=>{ if(active) markRead([active.id]); onClose(); }}>Mark Read</Button>
            <Button leftIcon={<MdCheckCircle />} colorScheme='green' ml={2} onClick={()=>{ if(active) resolve([active.id]); onClose(); }}>Resolve</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
