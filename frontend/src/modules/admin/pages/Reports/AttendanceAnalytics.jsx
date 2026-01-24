import React, { useMemo, useState } from 'react';
import { Box, Flex, Heading, Text, SimpleGrid, Icon, Badge, Button, ButtonGroup, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, Select, Input, Progress, InputGroup, InputLeftElement, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from '@chakra-ui/react';
import { MdCalendarToday, MdCheckCircle, MdCancel, MdAvTimer, MdFileDownload, MdRefresh, MdSearch } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';

const mockClass = [
  { class: '10-A', totalDays: 30, present: 28, absent: 1, late: 1 },
  { class: '10-B', totalDays: 30, present: 26, absent: 3, late: 1 },
  { class: '9-A', totalDays: 30, present: 27, absent: 2, late: 1 },
];

export default function AttendanceAnalytics() {
  const [cls, setCls] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const summary = useMemo(() => {
    const present = mockClass.reduce((s, r) => s + r.present, 0);
    const total = mockClass.reduce((s, r) => s + r.totalDays, 0);
    const absent = mockClass.reduce((s, r) => s + r.absent, 0);
    const late = mockClass.reduce((s, r) => s + r.late, 0);
    const rate = Math.round((present / total) * 100);
    return { rate, present, absent, late };
  }, []);

  const filtered = useMemo(() =>
    mockClass.filter(r => {
      const byClass = cls === 'all' || r.class === cls;
      const bySearch = !search || r.class.toLowerCase().includes(search.toLowerCase());
      return byClass && bySearch;
    })
  , [cls, search]);

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
          <Heading as="h3" size="lg" mb={1}>Attendance Reports</Heading>
          <Text color={textColorSecondary}>Class-wise attendance analytics</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue'>Export CSV</Button>
          <Button leftIcon={<MdFileDownload />} colorScheme='blue'>Download PDF</Button>
        </ButtonGroup>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mb={5}>
        <MiniStatistics name="Overall %" value={`${summary.rate}%`} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#11998e 0%,#38ef7d 100%)' icon={<Icon as={MdCalendarToday} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Present" value={String(summary.present)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<Icon as={MdCheckCircle} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Absent" value={String(summary.absent)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdCancel} w='28px' h='28px' color='white' />} />} />
        <MiniStatistics name="Late" value={String(summary.late)} startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdAvTimer} w='28px' h='28px' color='white' />} />} />
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
              <Input placeholder='Search class' value={search} onChange={(e) => setSearch(e.target.value)} />
            </InputGroup>
            <Select maxW={{ base: '100%', md: '220px' }} w={{ base: '100%', md: 'auto' }} value={cls} onChange={(e) => setCls(e.target.value)}>
              <option value='all'>All Classes</option>
              <option value='10-A'>10-A</option>
              <option value='10-B'>10-B</option>
              <option value='9-A'>9-A</option>
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
                <Th>Class</Th>
                <Th isNumeric>Present</Th>
                <Th isNumeric>Absent</Th>
                <Th isNumeric>Late</Th>
                <Th isNumeric>Overall</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((r) => {
                const overall = Math.round((r.present / r.totalDays) * 100);
                return (
                  <Tr key={r.class} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                    <Td><Text fontWeight='600'>{r.class}</Text></Td>
                    <Td isNumeric><Badge colorScheme='green'>{r.present}</Badge></Td>
                    <Td isNumeric><Badge colorScheme='red'>{r.absent}</Badge></Td>
                    <Td isNumeric><Badge colorScheme='yellow'>{r.late}</Badge></Td>
                    <Td isNumeric>
                      <Flex align='center' gap={3} justify='flex-end'>
                        <Text fontWeight='600'>{overall}%</Text>
                        <Box w='120px'>
                          <Progress value={overall} size='sm' colorScheme={overall >= 90 ? 'green' : overall >= 75 ? 'yellow' : 'red'} borderRadius='md' />
                        </Box>
                      </Flex>
                    </Td>
                    <Td>
                      <Button size='sm' variant='outline' onClick={() => { setSelected(r); onOpen(); }}>Details</Button>
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
          <ModalHeader>Attendance Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected && (
              <Box>
                <Text><strong>Class:</strong> {selected.class}</Text>
                <Text><strong>Present:</strong> {selected.present}</Text>
                <Text><strong>Absent:</strong> {selected.absent}</Text>
                <Text><strong>Late:</strong> {selected.late}</Text>
                <Text><strong>Total Days:</strong> {selected.totalDays}</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
