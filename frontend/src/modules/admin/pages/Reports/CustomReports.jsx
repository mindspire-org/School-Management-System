import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, CheckboxGroup, Checkbox, Stack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import { MdAssessment, MdFileDownload, MdPictureAsPdf, MdTableChart, MdRemoveRedEye } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRows = [
  { id: 'ROW-001', title: 'Class 10-A Collection', type: 'Finance', records: 35, created: '2025-11-10' },
  { id: 'ROW-002', title: 'Route R1 Usage', type: 'Transport', records: 12, created: '2025-11-11' },
];

export default function CustomReports() {
  const [module, setModule] = useState('finance');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fields, setFields] = useState(['name','amount']);
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ saved: 12, lastRun: 'Today 10:30 AM', templates: 6 }), []);

  const availableFields = useMemo(() => {
    if (module === 'finance') return ['name','class','amount','status','date'];
    if (module === 'transport') return ['bus','route','trips','distance','occupancy'];
    if (module === 'attendance') return ['student','class','present','absent','late'];
    return ['name','value'];
  }, [module]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Custom Reports</Heading>
          <Text color={textColorSecondary}>Build and export tailored reports</Text>
        </Box>
        <Flex gap={3}>
          <Button leftIcon={<MdPictureAsPdf />} variant='outline' colorScheme='blue'>Export PDF</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Export CSV</Button>
        </Flex>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics name="Saved Reports" value={String(stats.saved)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdAssessment} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Templates" value={String(stats.templates)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdTableChart} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Last Run" value={stats.lastRun} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdFileDownload} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box>
            <Text fontWeight='600' mb={2}>Module</Text>
            <Select value={module} onChange={(e) => setModule(e.target.value)}>
              <option value='finance'>Finance</option>
              <option value='transport'>Transport</option>
              <option value='attendance'>Attendance</option>
            </Select>
          </Box>
          <Box>
            <Text fontWeight='600' mb={2}>From</Text>
            <Input type='date' value={from} onChange={(e) => setFrom(e.target.value)} />
          </Box>
          <Box>
            <Text fontWeight='600' mb={2}>To</Text>
            <Input type='date' value={to} onChange={(e) => setTo(e.target.value)} />
          </Box>
          <Box gridColumn={{ md: '1 / span 3' }}>
            <Text fontWeight='600' mb={2}>Fields</Text>
            <CheckboxGroup value={fields} onChange={setFields}>
              <Stack direction='row' wrap='wrap' spacing={4}>
                {availableFields.map((f) => (
                  <Checkbox key={f} value={f}>{f}</Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </Box>
          <Flex gap={3} gridColumn={{ md: '1 / span 3' }}>
            <Button colorScheme='blue'>Generate</Button>
            <Button variant='outline'>Save as Template</Button>
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
                <Th>Type</Th>
                <Th isNumeric>Records</Th>
                <Th>Created</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockRows.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.id}</Text></Td>
                  <Td>{r.title}</Td>
                  <Td><Badge colorScheme='blue'>{r.type}</Badge></Td>
                  <Td isNumeric>{r.records}</Td>
                  <Td><Text color={textColorSecondary}>{r.created}</Text></Td>
                  <Td>
                    <Button size='sm' leftIcon={<MdRemoveRedEye />} variant='outline' onClick={() => { setSelected(r); onOpen(); }}>View</Button>
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
          <ModalHeader>Report Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Title:</strong> {selected.title}</Text>
                <Text><strong>Type:</strong> {selected.type}</Text>
                <Text><strong>Records:</strong> {selected.records}</Text>
                <Text><strong>Created:</strong> {selected.created}</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
