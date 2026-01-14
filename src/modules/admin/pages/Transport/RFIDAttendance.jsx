import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  Button,
  ButtonGroup,
  useColorModeValue,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { MdCheckCircle, MdLogout, MdCreditCard, MdSearch, MdFilterList, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';

const mockLogs = [
  { id: 'T-001', time: '07:40 AM', student: 'Ahsan Ali', studentId: 'STU-1001', bus: 'BUS-101', stop: 'Main Gate', type: 'Boarding', card: 'RFID-001A' },
  { id: 'T-002', time: '07:55 AM', student: 'Sara Khan', studentId: 'STU-1002', bus: 'BUS-101', stop: 'Canal View', type: 'Boarding', card: 'RFID-002B' },
  { id: 'T-003', time: '02:35 PM', student: 'Ahsan Ali', studentId: 'STU-1001', bus: 'BUS-101', stop: 'Main Gate', type: 'Alighting', card: 'RFID-001A' },
];

export default function RFIDAttendance() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [rows, setRows] = useState(mockLogs);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', time: '', student: '', studentId: '', bus: '', stop: '', type: 'Boarding', card: '' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const filtered = useMemo(() => {
    return rows.filter((l) => {
      const s = search.toLowerCase();
      const matchesSearch = !search || l.student.toLowerCase().includes(s) || l.studentId.toLowerCase().includes(s) || l.card.toLowerCase().includes(s);
      const matchesType = type === 'all' || l.type.toLowerCase() === type;
      return matchesSearch && matchesType;
    });
  }, [rows, search, type]);

  const stats = useMemo(() => {
    const board = rows.filter((l) => l.type === 'Boarding').length;
    const alight = rows.filter((l) => l.type === 'Alighting').length;
    const unique = new Set(rows.map((l) => l.studentId)).size;
    const buses = new Set(rows.map((l) => l.bus)).size;
    return { board, alight, unique, buses };
  }, [rows]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>RFID Attendance</Heading>
          <Text color={textColorSecondary}>Boarding and alighting activity across routes</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <StatCard title="Boardings" value={String(stats.board)} icon={MdCheckCircle} colorScheme="green" />
        <StatCard title="Alightings" value={String(stats.alight)} icon={MdLogout} colorScheme="red" />
        <StatCard title="Unique Students" value={String(stats.unique)} icon={MdCreditCard} colorScheme="blue" />
        <StatCard title="Active Buses" value={String(stats.buses)} icon={MdCreditCard} colorScheme="orange" />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search name, ID or card' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='220px' icon={<MdFilterList />} value={type} onChange={(e) => setType(e.target.value)}>
            <option value='all'>All Types</option>
            <option value='boarding'>Boarding</option>
            <option value='alighting'>Alighting</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Time</Th>
                <Th>Student</Th>
                <Th>ID</Th>
                <Th>Bus</Th>
                <Th>Stop</Th>
                <Th>Type</Th>
                <Th>Card</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((l) => (
                <Tr key={l.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Badge>{l.time}</Badge></Td>
                  <Td><Text fontWeight='500'>{l.student}</Text></Td>
                  <Td><Text color={textColorSecondary}>{l.studentId}</Text></Td>
                  <Td><Badge colorScheme='blue'>{l.bus}</Badge></Td>
                  <Td>{l.stop}</Td>
                  <Td><Badge colorScheme={l.type === 'Boarding' ? 'green' : 'purple'}>{l.type}</Badge></Td>
                  <Td><Text fontFamily='mono'>{l.card}</Text></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={() => { setSelected(l); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={() => { setSelected(l); setForm({ ...l, type: l.type }); editDisc.onOpen(); }} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Attendance Detail</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Time</Text><Text>{selected.time}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Student</Text><Text>{selected.student}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>ID</Text><Text>{selected.studentId}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Bus</Text><Text>{selected.bus}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Stop</Text><Text>{selected.stop}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Type</Text><Badge colorScheme={selected.type === 'Boarding' ? 'green' : 'purple'}>{selected.type}</Badge></Flex>
                <Flex justify='space-between'><Text fontWeight='600'>Card</Text><Text>{selected.card}</Text></Flex>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Attendance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Type</FormLabel>
              <Select value={form.type.toLowerCase()} onChange={(e) => setForm(f => ({ ...f, type: e.target.value === 'boarding' ? 'Boarding' : 'Alighting' }))}>
                <option value='boarding'>Boarding</option>
                <option value='alighting'>Alighting</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Stop</FormLabel>
              <Input value={form.stop} onChange={(e) => setForm(f => ({ ...f, stop: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Bus</FormLabel>
              <Input value={form.bus} onChange={(e) => setForm(f => ({ ...f, bus: e.target.value }))} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={() => {
              if (!selected) return;
              setRows(prev => prev.map(r => r.id === selected.id ? { ...r, type: form.type, stop: form.stop, bus: form.bus } : r));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
