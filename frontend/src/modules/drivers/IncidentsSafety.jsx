import React, { useMemo, useState } from 'react';
import { Box, SimpleGrid, Text, HStack, VStack, Badge, Icon, useColorModeValue, Button, Select, Input, Table, Thead, Tr, Th, Tbody, Td, Tooltip, IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Textarea } from '@chakra-ui/react';
import { MdReportProblem, MdCheckCircle, MdVisibility, MdAddAlert } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';
import PieChart from '../../components/charts/PieChart';
import SparklineChart from '../../components/charts/SparklineChart';

export default function IncidentsSafety() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'gray.600');
  const viewDisc = useDisclosure();
  const reportDisc = useDisclosure();
  const [viewItem, setViewItem] = useState(null);
  const [type, setType] = useState('delay');
  const [note, setNote] = useState('');

  const dataset = useMemo(() => ([
    { id: 'INC-101', type: 'delay', title: 'Traffic congestion on Oak St', time: '07:22 AM', status: 'open', severity: 'low' },
    { id: 'INC-102', type: 'vehicle', title: 'Minor engine noise', time: '07:40 AM', status: 'in_progress', severity: 'medium' },
    { id: 'INC-103', type: 'behavior', title: 'Student standing while bus moving', time: '07:55 AM', status: 'resolved', severity: 'low' },
    { id: 'INC-104', type: 'security', title: 'Gate blocked at Old Town', time: '08:05 AM', status: 'open', severity: 'high' },
    { id: 'INC-105', type: 'medical', title: 'Student motion sickness', time: '08:10 AM', status: 'resolved', severity: 'medium' },
  ]), []);

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = useMemo(() => {
    let list = dataset;
    if (filterType !== 'all') list = list.filter(i => i.type === filterType);
    if (filterStatus !== 'all') list = list.filter(i => i.status === filterStatus);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    return list;
  }, [dataset, filterType, filterStatus, query]);

  const typeCounts = useMemo(() => {
    const counts = { delay: 0, behavior: 0, vehicle: 0, security: 0, medical: 0 };
    dataset.forEach(d => counts[d.type] = (counts[d.type] || 0) + 1);
    return counts;
  }, [dataset]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Incidents & Safety</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Log, track, and resolve safety incidents</Text>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing='20px'>
        <Card p='16px'>
          <HStack justify='space-between' align='start'>
            <HStack>
              <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdReportProblem} w='22px' h='22px' color='white' />} />
              <VStack align='start' spacing={0}>
                <Text fontWeight='600'>By Type</Text>
                <Text fontSize='sm' color={textSecondary}>Open and resolved</Text>
              </VStack>
            </HStack>
            <Badge>{dataset.length} total</Badge>
          </HStack>
          <PieChart chartData={[typeCounts.delay, typeCounts.vehicle, typeCounts.behavior, typeCounts.security, typeCounts.medical]} chartOptions={{ labels: ['Delay','Vehicle','Behavior','Security','Medical'], legend: { show: true, position: 'right' }, tooltip: { enabled: true } }} />
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold'>Last 12 updates</Text>
          <Box mt='10px'>
            <SparklineChart data={[2,3,4,3,5,4,3,6,4,5,4,3]} color='#E53E3E' height={80} valueFormatter={(v)=>`${v} incidents`} />
          </Box>
          <Text fontSize='sm' color={textSecondary} mt='8px'>Trend of incident count</Text>
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='10px'>Quick Report</Text>
          <VStack align='stretch' spacing={3}>
            <Select value={type} onChange={e=>setType(e.target.value)}>
              <option value='delay'>Delay</option>
              <option value='vehicle'>Vehicle</option>
              <option value='behavior'>Behavior</option>
              <option value='security'>Security</option>
              <option value='medical'>Medical</option>
            </Select>
            <Textarea placeholder='Describe the incident...' value={note} onChange={e=>setNote(e.target.value)} />
            <Button leftIcon={<MdAddAlert />} onClick={reportDisc.onOpen}>Submit Report</Button>
          </VStack>
        </Card>
      </SimpleGrid>

      <Card p='16px' mt='20px'>
        <HStack justify='space-between' mb='12px' flexWrap='wrap' rowGap={2}>
          <HStack>
            <Select size='sm' value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value='all'>All types</option>
              <option value='delay'>Delay</option>
              <option value='vehicle'>Vehicle</option>
              <option value='behavior'>Behavior</option>
              <option value='security'>Security</option>
              <option value='medical'>Medical</option>
            </Select>
            <Select size='sm' value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value='all'>All status</option>
              <option value='open'>Open</option>
              <option value='in_progress'>In Progress</option>
              <option value='resolved'>Resolved</option>
            </Select>
          </HStack>
          <HStack>
            <Input size='sm' placeholder='Search...' value={query} onChange={e=>setQuery(e.target.value)} />
            <Button size='sm'>Export CSV</Button>
          </HStack>
        </HStack>
        <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
          <Box maxH='380px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                <Tr>
                  <Th>ID</Th>
                  <Th>Type</Th>
                  <Th>Title</Th>
                  <Th>Time</Th>
                  <Th>Status</Th>
                  <Th textAlign='right'>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(item => (
                  <Tr key={item.id}>
                    <Td>{item.id}</Td>
                    <Td><Badge>{item.type}</Badge></Td>
                    <Td maxW='320px'><Text noOfLines={1}>{item.title}</Text></Td>
                    <Td>{item.time}</Td>
                    <Td><Badge colorScheme={item.status==='resolved'?'green':item.status==='in_progress'?'orange':'red'}>{item.status}</Badge></Td>
                    <Td isNumeric>
                      <HStack spacing={2} justify='flex-end'>
                        <Tooltip label='View details'>
                          <IconButton size='sm' aria-label='view' icon={<MdVisibility />} onClick={()=>{ setViewItem(item); viewDisc.onOpen(); }} />
                        </Tooltip>
                        <Tooltip label='Mark resolved'>
                          <IconButton size='sm' aria-label='resolve' icon={<MdCheckCircle />} onClick={()=>{ /* noop demo */ }} />
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

      <Modal isOpen={viewDisc.isOpen} onClose={viewDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Incident Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='start' spacing={1}>
              <Text><b>ID:</b> {viewItem?.id}</Text>
              <Text><b>Type:</b> {viewItem?.type}</Text>
              <Text><b>Status:</b> {viewItem?.status}</Text>
              <Text><b>Time:</b> {viewItem?.time}</Text>
              <Text><b>Summary:</b> {viewItem?.title}</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={viewDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={reportDisc.isOpen} onClose={reportDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Submitted</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Thank you. Your incident has been logged for review.</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={reportDisc.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
