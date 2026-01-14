import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, Progress, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { MdPerson, MdTrendingUp, MdSchool, MdWarningAmber, MdFileDownload, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRows = [
  { id: 'T-001', name: 'Adeel Khan', subject: 'Math', classes: 24, avgScore: 91, attendance: 98, trend: 'up' },
  { id: 'T-002', name: 'Hina Shah', subject: 'Science', classes: 22, avgScore: 87, attendance: 96, trend: 'flat' },
  { id: 'T-003', name: 'Omar Ali', subject: 'English', classes: 20, avgScore: 72, attendance: 92, trend: 'down' },
];

export default function TeacherPerformanceReport() {
  const [subject, setSubject] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ avgScore: 83, top: 6, classes: 210, alerts: 2 }), []);

  const filtered = useMemo(() =>
    mockRows.filter(r => {
      const bySubject = subject==='all' || r.subject.toLowerCase()===subject;
      const bySearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
      return bySubject && bySearch;
    })
  , [subject, search]);

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
          <Heading as="h3" size="lg" mb={1}>Teacher Performance</Heading>
          <Text color={textColorSecondary}>Subject-wise performance and attendance</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Avg Score" value={`${stats.avgScore}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Top Teachers" value={String(stats.top)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdPerson} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Classes Observed" value={String(stats.classes)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdSchool} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Alerts" value={String(stats.alerts)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarningAmber} w='28px' h='28px' color='white' />} />} />
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
            <InputGroup maxW={{ base: '100%', md: '280px' }} w={{ base: '100%', md: 'auto' }}>
              <InputLeftElement pointerEvents='none'>
                <MdSearch color='gray.400' />
              </InputLeftElement>
              <Input placeholder='Search teacher or ID' value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
            <Select maxW={{ base: '100%', md: '220px' }} w={{ base: '100%', md: 'auto' }} value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value='all'>All Subjects</option>
              <option value='math'>Math</option>
              <option value='science'>Science</option>
              <option value='english'>English</option>
            </Select>
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
                <Th>Teacher</Th>
                <Th>ID</Th>
                <Th>Subject</Th>
                <Th isNumeric>Classes</Th>
                <Th isNumeric>Avg Score</Th>
                <Th isNumeric>Attendance</Th>
                <Th>Trend</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.name}</Text></Td>
                  <Td>{r.id}</Td>
                  <Td><Badge colorScheme='blue'>{r.subject}</Badge></Td>
                  <Td isNumeric>{r.classes}</Td>
                  <Td isNumeric>{r.avgScore}%</Td>
                  <Td isNumeric>{r.attendance}%</Td>
                  <Td>
                    <Flex align='center' gap={3}>
                      <Text fontWeight='600' color={r.trend==='up'?'green.400':r.trend==='down'?'red.400':'yellow.400'}>{r.trend==='up'?'+2%':r.trend==='down'?'-2%':'0%'}</Text>
                      <Box w='120px'>
                        <Progress value={r.avgScore} size='sm' colorScheme={r.avgScore>=90?'green':r.avgScore>=75?'yellow':'red'} borderRadius='md' />
                      </Box>
                    </Flex>
                  </Td>
                  <Td>
                    <Button size='sm' variant='outline' onClick={() => { setSelected(r); onOpen(); }}>Details</Button>
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
          <ModalHeader>Teacher Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Name:</strong> {selected.name}</Text>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Subject:</strong> {selected.subject}</Text>
                <Text><strong>Classes:</strong> {selected.classes}</Text>
                <Text><strong>Avg Score:</strong> {selected.avgScore}%</Text>
                <Text><strong>Attendance:</strong> {selected.attendance}%</Text>
                <Text><strong>Trend:</strong> {selected.trend}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
