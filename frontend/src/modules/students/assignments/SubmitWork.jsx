import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Select, Input, Textarea, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Icon, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex, useToast } from '@chakra-ui/react';
import { MdUpload, MdSend, MdVisibility, MdPendingActions, MdCheckCircle, MdClass } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { useAuth } from '../../../contexts/AuthContext';
import * as studentsApi from '../../../services/api/students';
import * as assignmentsApi from '../../../services/api/assignments';

export default function SubmitWork() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');

  const [student, setStudent] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role !== 'student') return;
        const payload = await studentsApi.list({ pageSize: 1 });
        const me = Array.isArray(payload?.rows) && payload.rows.length ? payload.rows[0] : null;
        setStudent(me);
      } catch {
        setStudent(null);
      }

      try {
        const payload = await assignmentsApi.list({ page: 1, pageSize: 200 });
        setRows(Array.isArray(payload?.rows) ? payload.rows : []);
      } catch {
        setRows([]);
      }
    };
    load();
  }, [user?.role]);

  const classSection = `${student?.class || ''}${student?.section || ''}`;

  const pending = useMemo(() => (rows || []).filter((a) => !a.submissionId).map((a) => ({
    id: a.id,
    title: a.title,
    subject: a.subject || a.class || '-',
    teacher: a.createdByName || '—',
    dueDate: a.dueDate ? String(a.dueDate).slice(0, 10) : '-',
    status: 'pending',
    description: a.description || '',
  })), [rows]);

  const submitted = useMemo(() => (rows || []).filter((a) => !!a.submissionId).map((a) => ({
    id: a.id,
    title: a.title,
    subject: a.subject || a.class || '-',
    teacher: a.createdByName || '—',
    dueDate: a.dueDate ? String(a.dueDate).slice(0, 10) : '-',
    status: 'submitted',
    description: a.description || '',
  })), [rows]);

  const subjects = useMemo(
    () => Array.from(new Set([...pending, ...submitted].map((a) => a.subject).filter(Boolean))),
    [pending, submitted]
  );

  const [subject, setSubject] = useState('all');
  const filteredPending = useMemo(() => pending.filter(a => subject === 'all' || a.subject === subject), [pending, subject]);

  const beginSubmit = (a) => { setSelected(a); setFile(null); setComment(''); onOpen(); };
  const doSubmit = async () => {
    if (!selected?.id) return;
    try {
      const content = comment || (file ? `File: ${file.name}` : 'Submitted');
      await assignmentsApi.submitWork(selected.id, { content });
      toast({ title: 'Submitted', status: 'success', duration: 2500, isClosable: true });
    } catch (e) {
      toast({ title: 'Submit failed', description: e?.message || 'Request failed', status: 'error', duration: 3500, isClosable: true });
    } finally {
      onClose();
      try {
        const payload = await assignmentsApi.list({ page: 1, pageSize: 200 });
        setRows(Array.isArray(payload?.rows) ? payload.rows : []);
      } catch {
        setRows([]);
      }
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Submit Work</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {(student?.name || user?.name || '')}
        {student?.rollNumber ? ` • Roll ${student.rollNumber}` : ''}
        {classSection ? ` • Class ${classSection}` : ''}
      </Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<Icon as={MdPendingActions} w='22px' h='22px' color='white' />} />}
            name='Pending'
            value={String(pending.length)}
            trendData={[1,1,2,2,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdCheckCircle} w='22px' h='22px' color='white' />} />}
            name='Submitted'
            value={String(submitted.length)}
            trendData={[0,1,1,2,3]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(subjects.length)}
            trendData={[1,1,1,1,1]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={subject} onChange={e=>setSubject(e.target.value)} maxW='200px'>
            <option value='all'>All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </HStack>
      </Card>

      <Card p='0' mb='16px'>
        <Table size='sm' variant='striped' colorScheme='gray'>
          <Thead><Tr><Th>Title</Th><Th>Subject</Th><Th>Teacher</Th><Th>Due</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {filteredPending.map(a => (
              <Tr key={a.id}>
                <Td>
                  <HStack spacing={2}>
                    <Text>{a.title}</Text>
                  </HStack>
                </Td>
                <Td>{a.subject}</Td>
                <Td>{a.teacher}</Td>
                <Td>{a.dueDate}</Td>
                <Td><Badge colorScheme='yellow'>{a.status}</Badge></Td>
                <Td>
                  <HStack>
                    <Button size='xs' leftIcon={<Icon as={MdUpload} />} colorScheme='purple' onClick={()=>beginSubmit(a)}>Upload</Button>
                    <Button size='xs' leftIcon={<Icon as={MdVisibility} />} onClick={()=>alert(a.description)}>View</Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit: {selected?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Input type='file' onChange={e=>setFile(e.target.files?.[0])} />
              <Textarea placeholder='Add a comment (optional)...' value={comment} onChange={e=>setComment(e.target.value)} />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme='purple' leftIcon={<Icon as={MdSend} />} onClick={doSubmit}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
