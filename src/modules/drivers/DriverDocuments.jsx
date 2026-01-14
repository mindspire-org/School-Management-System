import React, { useMemo, useState } from 'react';
import { Box, SimpleGrid, Text, HStack, VStack, Icon, useColorModeValue, Badge, Select, Input, Button, Table, Thead, Tr, Th, Tbody, Td, Tooltip, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, InputGroup, InputLeftElement, Tag } from '@chakra-ui/react';
import { MdDescription, MdSearch, MdCloudUpload, MdVisibility, MdDownload, MdWarningAmber } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';
import SparklineChart from '../../components/charts/SparklineChart';

export default function DriverDocuments() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'gray.600');
  const uploadDisc = useDisclosure();
  const viewDisc = useDisclosure();

  const docs = useMemo(() => ([
    { id: 'DOC-01', type: 'Driving License', number: 'DL-78652', issue: '2021-03-15', expires: '2026-03-15', status: 'Valid' },
    { id: 'DOC-02', type: 'CNIC/National ID', number: '35202-1234567-8', issue: '2020-06-01', expires: '2030-06-01', status: 'Valid' },
    { id: 'DOC-03', type: 'Vehicle Registration', number: 'REG-52-9012', issue: '2023-10-01', expires: '2027-10-01', status: 'Valid' },
    { id: 'DOC-04', type: 'Vehicle Insurance', number: 'INS-AB1234', issue: '2024-12-20', expires: '2025-12-20', status: 'Expiring Soon' },
    { id: 'DOC-05', type: 'Fitness/Emission', number: 'FIT-7789', issue: '2024-08-05', expires: '2025-08-05', status: 'Valid' },
  ]), []);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    let list = docs;
    if (type !== 'all') list = list.filter(d => d.type === type);
    if (status !== 'all') list = list.filter(d => d.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(d => d.type.toLowerCase().includes(q) || d.number.toLowerCase().includes(q));
    }
    return list;
  }, [docs, type, status, query]);

  const expiringSoon = docs.filter(d => d.status.includes('Expiring')).length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Documents</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Manage licenses, IDs and vehicle documents with expiry alerts</Text>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing='20px'>
        <Card p='16px'>
          <HStack justify='space-between'>
            <HStack>
              <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#00C6FB 0%,#005BEA 100%)' icon={<Icon as={MdDescription} w='22px' h='22px' color='white' />} />
              <VStack align='start' spacing={0}>
                <Text fontWeight='600'>Overview</Text>
                <Text fontSize='sm' color={textSecondary}>Total documents</Text>
              </VStack>
            </HStack>
            <Badge colorScheme='blue'>{docs.length}</Badge>
          </HStack>
          <Box mt='10px'>
            <SparklineChart data={[2,3,4,4,5,5,5,5]} color='#3182CE' height={60} valueFormatter={(v)=>`${v} docs`} />
          </Box>
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold'>Expiring Soon</Text>
          <HStack mt='8px' spacing={2}>
            <Tag colorScheme='orange' size='lg'><Icon as={MdWarningAmber} style={{ marginRight: 6 }} />{expiringSoon} items</Tag>
          </HStack>
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Quick Upload</Text>
          <Button leftIcon={<MdCloudUpload />} onClick={uploadDisc.onOpen}>Upload Document</Button>
        </Card>
      </SimpleGrid>

      <Card p='16px' mt='20px'>
        <HStack justify='space-between' mb='12px' flexWrap='wrap' rowGap={2}>
          <HStack>
            <Select size='sm' value={type} onChange={e=>setType(e.target.value)}>
              <option value='all'>All Types</option>
              {[...new Set(docs.map(d=>d.type))].map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select size='sm' value={status} onChange={e=>setStatus(e.target.value)}>
              <option value='all'>All Status</option>
              <option value='Valid'>Valid</option>
              <option value='Expiring Soon'>Expiring Soon</option>
            </Select>
          </HStack>
          <HStack>
            <InputGroup size='sm'>
              <InputLeftElement children={<MdSearch />} />
              <Input placeholder='Search number or type...' value={query} onChange={e=>setQuery(e.target.value)} />
            </InputGroup>
          </HStack>
        </HStack>
        <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
          <Box maxH='360px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                <Tr>
                  <Th>ID</Th>
                  <Th>Type</Th>
                  <Th>Number</Th>
                  <Th>Issue</Th>
                  <Th>Expiry</Th>
                  <Th>Status</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(d => (
                  <Tr key={d.id}>
                    <Td>{d.id}</Td>
                    <Td>{d.type}</Td>
                    <Td>{d.number}</Td>
                    <Td>{d.issue}</Td>
                    <Td>{d.expires}</Td>
                    <Td><Badge colorScheme={d.status.includes('Expiring')?'orange':'green'}>{d.status}</Badge></Td>
                    <Td isNumeric>
                      <HStack spacing={2} justify='flex-end'>
                        <Tooltip label='View'>
                          <IconButton size='sm' aria-label='view' icon={<MdVisibility />} onClick={viewDisc.onOpen} />
                        </Tooltip>
                        <Tooltip label='Download'>
                          <IconButton size='sm' aria-label='download' icon={<MdDownload />} />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={uploadDisc.isOpen} onClose={uploadDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select defaultValue='Driving License'>
                <option>Driving License</option>
                <option>CNIC/National ID</option>
                <option>Vehicle Registration</option>
                <option>Vehicle Insurance</option>
                <option>Fitness/Emission</option>
              </Select>
              <Input placeholder='Document Number' />
              <Input type='file' accept='image/*,application/pdf' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={uploadDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={uploadDisc.onClose}>Upload</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Document Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize='sm' color={textSecondary}>Preview placeholder. Attach viewer integration here.</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
