import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel } from '@chakra-ui/react';
import { MdEvent, MdAdd, MdCalendarToday, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockEvents = [
  { id: 'EV-001', title: 'Sports Day', date: '2025-11-20', audience: 'All Students', type: 'Holiday' },
  { id: 'EV-002', title: 'PTM', date: '2025-11-18', audience: 'All Parents', type: 'Meeting' },
  { id: 'EV-003', title: 'Mid Term Exams', date: '2025-12-01', audience: 'Classes 9-10', type: 'Exam' },
];

export default function EventCalendar() {
  const [month, setMonth] = useState('2025-11');
  const [rows, setRows] = useState(mockEvents);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', title: '', date: '', audience: '', type: 'Holiday' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ total: mockEvents.length, upcoming: 2, thisMonth: 2 }), []);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Event Calendar</Heading>
          <Text color={textColorSecondary}>School-wide events and important dates</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAdd />} colorScheme='blue' onClick={()=>{ setForm({ id: `EV-${String(rows.length+1).padStart(3,'0')}`, title: 'New Event', date: month+'-01', audience: 'All', type: 'Meeting' }); editDisc.onOpen(); }}>Add Event</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Total Events" value={String(stats.total)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdEvent} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Upcoming" value={String(stats.upcoming)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdCalendarToday} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="This Month" value={String(stats.thisMonth)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdCalendarToday} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
          <Input type='month' maxW='200px' value={month} onChange={(e) => setMonth(e.target.value)} />
          <Select maxW='220px'>
            <option>All Types</option>
            <option>Holiday</option>
            <option>Exam</option>
            <option>Meeting</option>
          </Select>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>ID</Th>
                <Th>Title</Th>
                <Th>Date</Th>
                <Th>Audience</Th>
                <Th>Type</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((e) => (
                <Tr key={e.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{e.id}</Text></Td>
                  <Td>{e.title}</Td>
                  <Td><Text color={textColorSecondary}>{e.date}</Text></Td>
                  <Td>{e.audience}</Td>
                  <Td><Badge colorScheme='blue'>{e.type}</Badge></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(e); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setForm({ ...e }); editDisc.onOpen(); }} />
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
          <ModalHeader>Event Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Title:</strong> {selected.title}</Text>
                <Text><strong>Date:</strong> {selected.date}</Text>
                <Text><strong>Audience:</strong> {selected.audience}</Text>
                <Text><strong>Type:</strong> {selected.type}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Title</FormLabel>
              <Input value={form.title} onChange={(e)=> setForm(f=>({ ...f, title: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Date</FormLabel>
              <Input type='date' value={form.date} onChange={(e)=> setForm(f=>({ ...f, date: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Audience</FormLabel>
              <Input value={form.audience} onChange={(e)=> setForm(f=>({ ...f, audience: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select value={form.type.toLowerCase()} onChange={(e)=> setForm(f=>({ ...f, type: e.target.value==='holiday'?'Holiday':e.target.value==='exam'?'Exam':'Meeting' }))}>
                <option value='holiday'>Holiday</option>
                <option value='exam'>Exam</option>
                <option value='meeting'>Meeting</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setRows(prev => prev.map(r => r.id===form.id ? { ...form } : r)); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
