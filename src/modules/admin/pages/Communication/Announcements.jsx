import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, IconButton, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Input, Textarea, FormControl, FormLabel, Select, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import { MdCampaign, MdAdd, MdPublic, MdSchedule, MdFileDownload, MdPictureAsPdf, MdRemoveRedEye, MdEdit } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockAnnouncements = [
  { id: 'AN-001', title: 'Sports Day', audience: 'All Students', date: '2025-11-20', status: 'Published' },
  { id: 'AN-002', title: 'PTM Schedule', audience: 'All Parents', date: '2025-11-18', status: 'Draft' },
];

export default function Announcements() {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('all');
  const [body, setBody] = useState('');
  const [rows, setRows] = useState(mockAnnouncements);
  const [selected, setSelected] = useState(null);
  const viewDisc = useDisclosure();
  const editDisc = useDisclosure();
  const [form, setForm] = useState({ id: '', title: '', audience: '', date: '', status: 'Draft' });
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ total: 12, published: 8, drafts: 4 }), []);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Announcements</Heading>
          <Text color={textColorSecondary}>Create and publish announcements</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdAdd />} colorScheme='blue'>New</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Total" value={String(stats.total)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdCampaign} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Published" value={String(stats.published)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdPublic} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Drafts" value={String(stats.drafts)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdSchedule} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Announcement title' />
          </FormControl>
          <FormControl>
            <FormLabel>Audience</FormLabel>
            <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value='all'>All</option>
              <option value='students'>Students</option>
              <option value='parents'>Parents</option>
              <option value='teachers'>Teachers</option>
            </Select>
          </FormControl>
          <FormControl gridColumn={{ md: '1 / span 2' }}>
            <FormLabel>Body</FormLabel>
            <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder='Write announcement...' />
          </FormControl>
          <Flex gap={3} gridColumn={{ md: '1 / span 2' }}>
            <Button colorScheme='blue'>Publish</Button>
            <Button variant='outline'>Save Draft</Button>
          </Flex>
        </SimpleGrid>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>ID</Th>
                <Th>Title</Th>
                <Th>Audience</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((a) => (
                <Tr key={a.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{a.id}</Text></Td>
                  <Td>{a.title}</Td>
                  <Td>{a.audience}</Td>
                  <Td><Text color={textColorSecondary}>{a.date}</Text></Td>
                  <Td><Badge colorScheme={a.status==='Published'?'green':'yellow'}>{a.status}</Badge></Td>
                  <Td>
                    <IconButton aria-label='View' icon={<MdRemoveRedEye />} size='sm' variant='ghost' onClick={()=>{ setSelected(a); viewDisc.onOpen(); }} />
                    <IconButton aria-label='Edit' icon={<MdEdit />} size='sm' variant='ghost' onClick={()=>{ setSelected(a); setForm({ ...a }); editDisc.onOpen(); }} />
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
          <ModalHeader>Announcement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Title:</strong> {selected.title}</Text>
                <Text><strong>Audience:</strong> {selected.audience}</Text>
                <Text><strong>Date:</strong> {selected.date}</Text>
                <Text><strong>Status:</strong> {selected.status}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Announcement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Title</FormLabel>
              <Input value={form.title} onChange={(e)=> setForm(f=>({ ...f, title: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Audience</FormLabel>
              <Select value={form.audience} onChange={(e)=> setForm(f=>({ ...f, audience: e.target.value }))}>
                <option value='All Students'>Students</option>
                <option value='All Parents'>Parents</option>
                <option value='Teachers'>Teachers</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Date</FormLabel>
              <Input type='date' value={form.date} onChange={(e)=> setForm(f=>({ ...f, date: e.target.value }))} />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select value={form.status.toLowerCase()} onChange={(e)=> setForm(f=>({ ...f, status: e.target.value==='published'?'Published':'Draft' }))}>
                <option value='published'>Published</option>
                <option value='draft'>Draft</option>
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
