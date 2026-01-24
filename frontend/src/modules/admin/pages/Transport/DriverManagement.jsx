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
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { MdPerson, MdSearch, MdAdd, MdThumbUp, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdMoreVert, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockDrivers = [
  { id: 'DRV-01', name: 'Imran Khan', phone: '0300-1111111', license: 'L-12345', status: 'On Duty', bus: 'BUS-101', rating: 4.7 },
  { id: 'DRV-02', name: 'Ali Raza', phone: '0301-2222222', license: 'L-54321', status: 'Off Duty', bus: '-', rating: 4.4 },
  { id: 'DRV-03', name: 'Zeeshan', phone: '0302-3333333', license: 'L-67890', status: 'On Duty', bus: 'BUS-103', rating: 4.8 },
];

export default function DriverManagement() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [rows, setRows] = useState(mockDrivers);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', name: '', phone: '', license: '', status: 'On Duty', bus: '', rating: 0 });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const filtered = useMemo(() => {
    return rows.filter((d) => {
      const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || d.status.toLowerCase() === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const stats = useMemo(() => {
    const total = rows.length;
    const onDuty = rows.filter((d) => d.status === 'On Duty').length;
    const offDuty = rows.filter((d) => d.status === 'Off Duty').length;
    const avgRating = (rows.reduce((s, d) => s + d.rating, 0) / (total || 1)).toFixed(1);
    return { total, onDuty, offDuty, avgRating };
  }, [rows]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Driver Management</Heading>
          <Text color={textColorSecondary}>Manage drivers, duty status, and licenses</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAdd />} colorScheme="blue">Add Driver</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Total Drivers" value={String(stats.total)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdPerson} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="On Duty" value={String(stats.onDuty)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdThumbUp} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Off Duty" value={String(stats.offDuty)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdPerson} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Avg Rating" value={`${stats.avgRating}/5`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdThumbUp} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search driver name or ID' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW="200px" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value='all'>All Status</option>
            <option value='on duty'>On Duty</option>
            <option value='off duty'>Off Duty</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Driver</Th>
                <Th>ID</Th>
                <Th>Phone</Th>
                <Th>License</Th>
                <Th>Status</Th>
                <Th>Assigned Bus</Th>
                <Th isNumeric>Rating</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((d) => (
                <Tr key={d.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{d.name}</Text></Td>
                  <Td>{d.id}</Td>
                  <Td>{d.phone}</Td>
                  <Td>{d.license}</Td>
                  <Td><Badge colorScheme={d.status === 'On Duty' ? 'green' : 'gray'}>{d.status}</Badge></Td>
                  <Td>{d.bus}</Td>
                  <Td isNumeric>{d.rating.toFixed(1)}</Td>
                  <Td>
                    <Flex align='center' gap={1}>
                      <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(d); viewDisc.onOpen(); }} />
                      <Menu>
                        <MenuButton as={IconButton} aria-label='More' icon={<MdMoreVert />} size='sm' variant='ghost' />
                        <MenuList>
                          <MenuItem onClick={()=>{ setSelected(d); viewDisc.onOpen(); }}>View Details</MenuItem>
                          <MenuItem onClick={()=>{ setSelected(d); setForm({ ...d }); editDisc.onOpen(); }}>Edit</MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
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
          <ModalHeader>Driver Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected && (
              <Box>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Name</Text><Text>{selected.name}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>ID</Text><Text>{selected.id}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Phone</Text><Text>{selected.phone}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>License</Text><Text>{selected.license}</Text></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Status</Text><Badge colorScheme={selected.status==='On Duty'?'green':'gray'}>{selected.status}</Badge></Flex>
                <Flex justify='space-between' mb={2}><Text fontWeight='600'>Assigned Bus</Text><Text>{selected.bus}</Text></Flex>
                <Flex justify='space-between'><Text fontWeight='600'>Rating</Text><Text>{selected.rating.toFixed(1)}</Text></Flex>
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
          <ModalHeader>Edit Driver</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={form.name} onChange={(e)=> setForm(f=>({ ...f, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Phone</FormLabel>
              <Input value={form.phone} onChange={(e)=> setForm(f=>({ ...f, phone: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>License</FormLabel>
              <Input value={form.license} onChange={(e)=> setForm(f=>({ ...f, license: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Status</FormLabel>
              <Select value={form.status.toLowerCase()} onChange={(e)=> setForm(f=>({ ...f, status: e.target.value==='on duty'?'On Duty':'Off Duty' }))}>
                <option value='on duty'>On Duty</option>
                <option value='off duty'>Off Duty</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Assigned Bus</FormLabel>
              <Input value={form.bus} onChange={(e)=> setForm(f=>({ ...f, bus: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Rating</FormLabel>
              <NumberInput min={0} max={5} step={0.1} value={form.rating} onChange={(v)=> setForm(f=>({ ...f, rating: Number(v)||0 }))}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{
              setRows(prev => prev.map(r => r.id===form.id ? { ...form } : r));
              editDisc.onClose();
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
