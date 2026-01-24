import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, InputGroup, InputLeftElement, Progress, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { MdGrade, MdTrendingUp, MdWarningAmber, MdAssessment, MdFileDownload, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockRows = [
  { id: 'STU-1001', name: 'Ahsan Ali', class: '10-A', avg: 92, rank: 1, trend: 'up' },
  { id: 'STU-1002', name: 'Sara Khan', class: '10-A', avg: 84, rank: 5, trend: 'up' },
  { id: 'STU-1003', name: 'Hamza Iqbal', class: '10-B', avg: 68, rank: 18, trend: 'down' },
];

export default function StudentPerformanceReport() {
  const [cls, setCls] = useState('all');
  const [subject, setSubject] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [preset, setPreset] = useState('none');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const stats = useMemo(() => ({ avgGrade: 86, top: 12, risk: 5, exams: 6 }), []);

  const filtered = useMemo(() =>
    mockRows.filter(r => {
      const byClass = (cls==='all' || r.class===cls);
      const bySubject = (subject==='all');
      const bySearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
      return byClass && bySubject && bySearch;
    })
  , [cls, subject, search]);

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
          <Heading as="h3" size="lg" mb={1}>Student Performance</Heading>
          <Text color={textColorSecondary}>Class-wise academic performance with trends</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Avg Grade" value={`${stats.avgGrade}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdGrade} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Top Performers" value={String(stats.top)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<Icon as={MdTrendingUp} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="At Risk" value={String(stats.risk)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdWarningAmber} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Exams Count" value={String(stats.exams)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdAssessment} w='28px' h='28px' color='white' />} />} />
      </SimpleGrid>

      <Card p={4} mb={5}>
        <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }} flexWrap='wrap'>
          <InputGroup maxW='280px'>
            <InputLeftElement pointerEvents='none'>
              <MdSearch color='gray.400' />
            </InputLeftElement>
            <Input placeholder='Search student or ID' value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
          <Select maxW='200px' value={cls} onChange={(e) => setCls(e.target.value)}>
            <option value='all'>All Classes</option>
            <option value='10-A'>10-A</option>
            <option value='10-B'>10-B</option>
            <option value='9-A'>9-A</option>
          </Select>
          <Select maxW='200px' value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value='all'>All Subjects</option>
            <option value='math'>Math</option>
            <option value='science'>Science</option>
            <option value='english'>English</option>
          </Select>
          <Input type='date' maxW='200px' value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type='date' maxW='200px' value={to} onChange={(e) => setTo(e.target.value)} />
          <ButtonGroup isAttached size='sm' variant='outline'>
            <Button
              colorScheme={preset==='7' ? 'blue' : undefined}
              onClick={() => { applyPreset(7); setPreset('7'); }}
            >
              Last 7d
            </Button>
            <Button
              colorScheme={preset==='30' ? 'blue' : undefined}
              onClick={() => { applyPreset(30); setPreset('30'); }}
            >
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
                <Th>Student</Th>
                <Th>ID</Th>
                <Th>Class</Th>
                <Th isNumeric>Avg %</Th>
                <Th isNumeric>Rank</Th>
                <Th>Trend</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => (
                <Tr key={r.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td><Text fontWeight='600'>{r.name}</Text></Td>
                  <Td>{r.id}</Td>
                  <Td><Badge colorScheme='blue'>{r.class}</Badge></Td>
                  <Td isNumeric>{r.avg}%</Td>
                  <Td isNumeric>{r.rank}</Td>
                  <Td>
                    <Flex align='center' gap={3}>
                      <Text fontWeight='600' color={r.trend==='up'?'green.400':'red.400'}>{r.trend==='up'?'+':'-'}2%</Text>
                      <Box w='120px'>
                        <Progress value={r.avg} size='sm' colorScheme={r.avg>=90?'green':r.avg>=75?'yellow':'red'} borderRadius='md' />
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
          <ModalHeader>Student Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Name:</strong> {selected.name}</Text>
                <Text><strong>ID:</strong> {selected.id}</Text>
                <Text><strong>Class:</strong> {selected.class}</Text>
                <Text><strong>Average:</strong> {selected.avg}%</Text>
                <Text><strong>Rank:</strong> {selected.rank}</Text>
                <Text><strong>Trend:</strong> {selected.trend}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
