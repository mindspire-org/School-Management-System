import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, Progress, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { MdAttachMoney, MdTrendingUp, MdWarning, MdFileDownload, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRows = [
  { class: '10-A', billed: 360000, collected: 290000, refunds: 0 },
  { class: '10-B', billed: 340000, collected: 270000, refunds: 5000 },
  { class: '9-A', billed: 280000, collected: 230000, refunds: 0 },
];

export default function FeeCollection() {
  const [range, setRange] = useState('this-month');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const summary = useMemo(() => {
    const billed = mockRows.reduce((s, r) => s + r.billed, 0);
    const collected = mockRows.reduce((s, r) => s + r.collected, 0);
    const refunds = mockRows.reduce((s, r) => s + r.refunds, 0);
    const rate = Math.round((collected / billed) * 100);
    const outstanding = billed - collected - refunds;
    return { billed, collected, refunds, outstanding, rate };
  }, []);

  const filtered = useMemo(() => mockRows.filter(r => !search || r.class.toLowerCase().includes(search.toLowerCase())), [search]);
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
          <Heading as="h3" size="lg" mb={1}>Fee Collection</Heading>
          <Text color={textColorSecondary}>Collections performance by class</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={5} mb={5}>
        <MiniStatistics name="Billed" value={`Rs. ${summary.billed.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdAttachMoney} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Collected" value={`Rs. ${summary.collected.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Refunds" value={`Rs. ${summary.refunds.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarning} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Outstanding" value={`Rs. ${summary.outstanding.toLocaleString()}`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdAttachMoney} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Collection Rate" value={`${summary.rate}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#8360c3 0%,#2ebf91 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex
          gap={3}
          direction={{ base: 'column', md: 'row' }}
          align={{ md: 'center' }}
          flexWrap={{ base: 'wrap', md: 'wrap' }}
          rowGap={3}
        >
          <Flex gap={3} flexWrap='wrap' align='center' flex={{ base: '1 1 100%', md: '1 1 auto' }}>
            <Select maxW={{ base: '100%', md: '220px' }} w={{ base: '100%', md: 'auto' }} value={range} onChange={(e) => setRange(e.target.value)}>
              <option value='this-month'>This Month</option>
              <option value='last-month'>Last Month</option>
              <option value='last-90'>Last 90 Days</option>
            </Select>
            <InputGroup maxW={{ base: '100%', md: '240px' }} w={{ base: '100%', md: 'auto' }}>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search class' value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
            <Input type='date' maxW={{ base: '100%', md: '200px' }} w={{ base: '100%', md: 'auto' }} value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type='date' maxW={{ base: '100%', md: '200px' }} w={{ base: '100%', md: 'auto' }} value={to} onChange={(e) => setTo(e.target.value)} />
          </Flex>
          <Flex gap={2} flexShrink={0} w={{ base: '100%', md: 'auto' }} justify={{ base: 'flex-end', md: 'flex-start' }} flexWrap='wrap'>
            <Button size='sm' onClick={() => applyPreset(7)}>Last 7d</Button>
            <Button size='sm' variant='outline' onClick={() => applyPreset(30)}>Last 30d</Button>
          </Flex>
        </Flex>
      </Card>

      <Card>
        <Box overflowX='auto'>
          <Table variant='simple'>
            <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
              <Tr>
                <Th>Class</Th>
                <Th isNumeric>Billed</Th>
                <Th isNumeric>Collected</Th>
                <Th isNumeric>Refunds</Th>
                <Th isNumeric>Outstanding</Th>
                <Th isNumeric>Rate</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => {
                const outstanding = r.billed - r.collected - r.refunds;
                const rate = Math.round((r.collected / r.billed) * 100);
                return (
                  <Tr key={r.class} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Badge colorScheme='blue'>{r.class}</Badge></Td>
                    <Td isNumeric>Rs. {r.billed.toLocaleString()}</Td>
                    <Td isNumeric>Rs. {r.collected.toLocaleString()}</Td>
                    <Td isNumeric>Rs. {r.refunds.toLocaleString()}</Td>
                    <Td isNumeric>Rs. {outstanding.toLocaleString()}</Td>
                    <Td isNumeric>
                      <Flex align='center' gap={3} justify='flex-end'>
                        <Text fontWeight='600'>{rate}%</Text>
                        <Box w='120px'>
                          <Progress value={rate} size='sm' colorScheme={rate >= 90 ? 'green' : rate >= 75 ? 'yellow' : 'red'} borderRadius='md' />
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Button size='sm' variant='outline' onClick={() => { setSelected({ ...r, outstanding, rate }); onOpen(); }}>Details</Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size='md'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Class Collection Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Class:</strong> {selected.class}</Text>
                <Text><strong>Billed:</strong> Rs. {selected.billed.toLocaleString()}</Text>
                <Text><strong>Collected:</strong> Rs. {selected.collected.toLocaleString()}</Text>
                <Text><strong>Refunds:</strong> Rs. {selected.refunds.toLocaleString()}</Text>
                <Text><strong>Outstanding:</strong> Rs. {selected.outstanding.toLocaleString()}</Text>
                <Text><strong>Collection Rate:</strong> {selected.rate}%</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
