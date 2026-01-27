import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import { MdFileDownload, MdVisibility, MdPrint, MdDescription, MdLibraryBooks, MdAccessTime, MdInsertDriveFile } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import { useAuth } from '../../../contexts/AuthContext';
import { sharedContentApi, studentsApi } from '../../../services/api';

function formatDate(d){ return d.toLocaleDateString(undefined, { day:'2-digit', month:'short', year:'numeric' }); }

export default function Notes(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const selfRes = await studentsApi.list();
        const self = selfRes?.rows?.[0] || null;
        if (!alive) return;
        setStudent(self);

        const res = await sharedContentApi.list({ type: 'note' });
        const items = Array.isArray(res?.items) ? res.items : [];
        if (!alive) return;
        setRows(items);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || 'Failed to load notes');
        setRows([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, []);

  const classSection = useMemo(() => {
    if (!student) return '';
    return `${student.class || ''}${student.section || ''}`;
  }, [student]);

  const demoNotes = useMemo(() => {
    return (rows || []).map((it) => {
      const dateRaw = it?.publishedAt || it?.createdAt;
      const date = dateRaw ? new Date(dateRaw) : new Date();
      return {
        id: it?.id,
        title: it?.title || '-',
        subject: it?.subjectName || '-',
        teacher: it?.teacherName || '-',
        pages: '-',
        date,
        tags: [],
        excerpt: it?.description || '-',
        url: it?.url || null,
      };
    });
  }, [rows]);

  const subjects = useMemo(() => {
    return Array.from(new Set(demoNotes.map((n) => n.subject))).filter(Boolean);
  }, [demoNotes]);

  const [subject, setSubject] = useState('all');
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => demoNotes.filter(n => (
    (subject==='all' || n.subject===subject) &&
    (!query || n.title.toLowerCase().includes(query.toLowerCase()) || (n.tags || []).join(',').toLowerCase().includes(query.toLowerCase()))
  )), [demoNotes, subject, query]);

  const kpis = useMemo(()=>({ total: demoNotes.length, subjects: new Set(demoNotes.map(n=>n.subject)).size, recent: demoNotes.filter(n => (Date.now()-n.date.getTime())/(1000*60*60*24) <= 7).length, pages: 0}), [demoNotes]);
  const chartData = useMemo(()=> ([{ name:'Notes', data: subjects.map(s => demoNotes.filter(n=>n.subject===s).length) }]), [demoNotes, subjects]);
  const chartOptions = useMemo(()=> ({ xaxis:{ categories: subjects }, colors:['#667eea'], dataLabels:{ enabled:false } }), [subjects]);

  const downloadNote = (n) => {
    const content = `${n.title}\n${n.excerpt}\n\nTags: ${n.tags.join(', ')}`;
    const blob = new Blob([content], { type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${n.title.replace(/\s+/g,'_')}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Notes</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student?.name || user?.name || 'Student'}{student?.rollNumber ? ` • Roll ${student.rollNumber}` : ''}{classSection ? ` • Class ${classSection}` : ''}</Text>

      {loading ? (
        <Card p='16px' mb='16px'>
          <Text color={textSecondary}>Loading notes...</Text>
        </Card>
      ) : null}

      {error ? (
        <Card p='16px' mb='16px'>
          <Text color='red.500'>{error}</Text>
        </Card>
      ) : null}

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<Icon as={MdDescription} w='22px' h='22px' color='white' />} />}
            name='Total Notes'
            value={String(kpis.total)}
            trendData={[1,2,2,3,4]}
            trendColor='#B721FF'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdLibraryBooks} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(kpis.subjects)}
            trendData={[1,1,2,2,2]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdAccessTime} w='22px' h='22px' color='white' />} />}
            name='Recent (7d)'
            value={String(kpis.recent)}
            trendData={[0,1,1,2,2]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdInsertDriveFile} w='22px' h='22px' color='white' />} />}
            name='Total Pages'
            value={String(kpis.pages)}
            trendData={[50,60,70,80,90]}
            trendColor='#FD7853'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={subject} onChange={e=>setSubject(e.target.value)} maxW='220px'>
            <option value='all'>All Subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Input size='sm' placeholder='Search title or tags...' value={query} onChange={e=>setQuery(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
            <Button size='sm' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>filtered.forEach(downloadNote)}>Download All</Button>
          </HStack>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Teacher</Th><Th>Pages</Th><Th>Date</Th><Th>Tags</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filtered.map(n => (
              <Tr key={n.id}>
                <Td>{n.title}</Td>
                <Td>{n.subject}</Td>
                <Td>{n.teacher}</Td>
                <Td>{n.pages}</Td>
                <Td>{formatDate(n.date)}</Td>
                <Td><HStack spacing={1} wrap='wrap'>{n.tags.map(t => <Badge key={t}>{t}</Badge>)}</HStack></Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>{ setSelected(n); onOpen(); }}>Preview</Button>
                    <Button size='xs' colorScheme='purple' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>downloadNote(n)}>Download</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card p='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Notes by Subject</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Preview: {selected?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text fontWeight='600'>{selected.subject} • {selected.teacher}</Text>
                <Text color={textSecondary}>{selected.excerpt}</Text>
                <HStack spacing={2}>{selected.tags.map(t => <Badge key={t}>{t}</Badge>)}</HStack>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
