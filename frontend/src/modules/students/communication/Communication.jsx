import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Input, Textarea, Button, Icon, useColorModeValue, Badge, Avatar, Select, Divider, Flex } from '@chakra-ui/react';
import { MdSend, MdFileDownload, MdMarkEmailRead, MdChat, MdNotificationsActive, MdPeople } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { mockStudents, mockTeachers } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';

function formatDateTime(d){ return d.toLocaleString(undefined, { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }); }

export default function Communication(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const scrollerRef = useRef(null);

  const student = useMemo(()=>{
    if (user?.role==='student'){
      const byEmail = mockStudents.find(s=>s.email?.toLowerCase()===user.email?.toLowerCase());
      if (byEmail) return byEmail;
      const byName = mockStudents.find(s=>s.name?.toLowerCase()===user.name?.toLowerCase());
      if (byName) return byName;
      return { id:999, name:user.name, rollNumber:'STU999', class:'10', section:'A', email:user.email };
    }
    return mockStudents[0];
  },[user]);
  const classSection = `${student.class}${student.section}`;

  // Teachers relevant to student's class
  const teachers = useMemo(() => mockTeachers.filter(t => (t.classes||[]).includes(classSection)), [classSection]);
  const subjects = useMemo(() => Array.from(new Set(teachers.map(t => t.subject))), [teachers]);

  // Demo conversations
  const demoConversations = useMemo(() => {
    const today = new Date();
    const makeThread = (id, teacher, subject) => {
      const msgs = [
        { id:`${id}-m1`, from:'teacher', text:`Hello ${student.name}, please review the ${subject} material posted.`, at: new Date(today.getFullYear(), today.getMonth(), today.getDate()-2, 10, 30) },
        { id:`${id}-m2`, from:'student', text:'Thanks, I have seen it.', at: new Date(today.getFullYear(), today.getMonth(), today.getDate()-2, 10, 45) },
        { id:`${id}-m3`, from:'teacher', text:'Assignment is due on Friday. Let me know if you have questions.', at: new Date(today.getFullYear(), today.getMonth(), today.getDate()-1, 9, 10) },
      ];
      const unread = Math.random() > 0.5 ? 1 : 0;
      if (unread) msgs.push({ id:`${id}-m4`, from:'teacher', text:'Reminder: submit before 6 PM.', at: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 25) });
      return { id, teacher, subject, lastAt: msgs[msgs.length-1].at, messages: msgs, unread };
    };
    const base = teachers.slice(0, Math.min(4, teachers.length));
    return base.map((t, idx) => makeThread(`T${idx+1}`, t, t.subject));
  }, [teachers, student.name]);

  const [threads, setThreads] = useState(demoConversations);
  const [activeId, setActiveId] = useState(threads[0]?.id || null);
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredThreads = useMemo(() => threads
    .filter(t => teacherFilter==='all' || t.teacher.name === teacherFilter)
    .filter(t => subjectFilter==='all' || t.subject === subjectFilter)
    .filter(t => !search || t.messages.some(m => m.text.toLowerCase().includes(search.toLowerCase()))),
  [threads, teacherFilter, subjectFilter, search]);

  const active = useMemo(() => filteredThreads.find(t => t.id === activeId) || filteredThreads[0] || null, [filteredThreads, activeId]);

  const kpis = useMemo(() => ({
    convos: threads.length,
    unread: threads.reduce((s,t)=> s + (t.unread||0), 0),
    teachers: teachers.length,
  }), [threads, teachers]);

  const sendMessage = (text) => {
    if (!text.trim() || !active) return;
    setThreads(prev => prev.map(t => t.id === active.id ? {
      ...t,
      messages: [...t.messages, { id:`${t.id}-m${t.messages.length+1}`, from:'student', text: text.trim(), at: new Date() }],
      lastAt: new Date(),
    } : t));
  };

  const markActiveRead = () => {
    if (!active) return;
    setThreads(prev => prev.map(t => t.id===active.id ? { ...t, unread:0 } : t));
  };

  const exportConversation = (t) => {
    if (!t) return;
    const lines = [
      `Conversation with ${t.teacher.name} (${t.subject})`,
      `${student.name} • ${student.rollNumber} • Class ${classSection}`,
      '',
      ...t.messages.map(m => `${m.from==='student' ? student.name : t.teacher.name} [${formatDateTime(m.at)}]: ${m.text}`),
    ];
    const blob = new Blob([lines.join('\n')], { type:'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`chat-${t.teacher.name.replace(/\s+/g,'_')}.txt`; a.click(); URL.revokeObjectURL(url);
  };

  // Auto scroll to bottom when active changes/messages update
  useEffect(() => { if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight; }, [activeId, threads]);

  // Compose
  const [draft, setDraft] = useState('');

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Communication</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>{student.name} • Roll {student.rollNumber} • Class {classSection}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdChat} w='22px' h='22px' color='white' />} />}
            name='Conversations'
            value={String(kpis.convos)}
            trendData={[1,2,2,3,kpis.convos]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#f5576c 0%,#f093fb 100%)' icon={<Icon as={MdNotificationsActive} w='22px' h='22px' color='white' />} />}
            name='Unread'
            value={String(kpis.unread)}
            trendData={[0,1,1,2,kpis.unread]}
            trendColor='#f5576c'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdPeople} w='22px' h='22px' color='white' />} />}
            name='Teachers'
            value={String(kpis.teachers)}
            trendData={[1,1,2,2,kpis.teachers]}
            trendColor='#4481EB'
          />
        </Flex>
      </Box>

      <Card p='16px' mb='16px'>
        <HStack spacing={3} flexWrap='wrap' rowGap={3}>
          <Select size='sm' value={teacherFilter} onChange={e=>setTeacherFilter(e.target.value)} maxW='220px'>
            <option value='all'>All Teachers</option>
            {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
          </Select>
          <Select size='sm' value={subjectFilter} onChange={e=>setSubjectFilter(e.target.value)} maxW='220px'>
            <option value='all'>All Subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Input size='sm' placeholder='Search messages...' value={search} onChange={e=>setSearch(e.target.value)} maxW='260px' />
          <HStack ml='auto'>
            <Button size='sm' leftIcon={<Icon as={MdMarkEmailRead} />} onClick={markActiveRead} isDisabled={!active}>Mark Read</Button>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={()=>exportConversation(active)} isDisabled={!active}>Export Chat</Button>
          </HStack>
        </HStack>
      </Card>

      <SimpleGrid columns={{ base:1, lg:3 }} spacing='16px'>
        {/* Left: conversations */}
        <Card p='0' gridColumn={{ base:'1', lg:'1' }}>
          <Box maxH={{ base:'260px', lg:'540px' }} overflowY='auto'>
            {filteredThreads.map(t => (
              <HStack key={t.id} p='12px' spacing={3} borderBottom='1px solid' borderColor={useColorModeValue('gray.100','whiteAlpha.200')} cursor='pointer' bg={active?.id===t.id? useColorModeValue('gray.50','whiteAlpha.100'):'transparent'} onClick={()=>setActiveId(t.id)}>
                <Avatar size='sm' name={t.teacher.name} src={t.teacher.avatar} />
                <VStack align='start' spacing={0} flex='1'>
                  <Text fontWeight='600'>{t.teacher.name}</Text>
                  <Text fontSize='xs' color={textSecondary}>{t.subject} • {formatDateTime(t.lastAt)}</Text>
                </VStack>
                {t.unread? <Badge colorScheme='purple'>{t.unread}</Badge> : null}
              </HStack>
            ))}
          </Box>
        </Card>

        {/* Right: active messages */}
        <Card p='0' gridColumn={{ base:'1', lg:'2 / span 2' }}>
          {active ? (
            <VStack align='stretch' spacing={0} h='full'>
              <HStack p='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.100','whiteAlpha.200')}>
                <Avatar size='sm' name={active.teacher.name} src={active.teacher.avatar} />
                <VStack align='start' spacing={0}>
                  <Text fontWeight='600'>{active.teacher.name}</Text>
                  <Text fontSize='xs' color={textSecondary}>{active.subject}</Text>
                </VStack>
              </HStack>
              <Box ref={scrollerRef} p='12px' minH='260px' maxH={{ base:'320px', lg:'460px' }} overflowY='auto' bg={useColorModeValue('gray.50','whiteAlpha.100')}>
                {active.messages.map(m => (
                  <VStack key={m.id} align={m.from==='student'?'end':'start'} mb='8px'>
                    <Box maxW='70%' px='12px' py='8px' borderRadius='md' bg={m.from==='student'? 'purple.500':'white'} color={m.from==='student'? 'white': undefined} boxShadow='sm'>
                      <Text fontSize='sm'>{m.text}</Text>
                    </Box>
                    <Text fontSize='xs' color={textSecondary}>{m.from==='student'? student.name : active.teacher.name} • {formatDateTime(m.at)}</Text>
                  </VStack>
                ))}
              </Box>
              <Divider />
              <HStack p='12px' spacing={3}>
                <Textarea size='sm' placeholder='Type your message...' value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(draft); setDraft(''); } }} />
                <Button colorScheme='purple' leftIcon={<Icon as={MdSend} />} onClick={()=>{ sendMessage(draft); setDraft(''); }}>Send</Button>
              </HStack>
            </VStack>
          ) : (
            <Box p='16px'><Text color={textSecondary}>No conversation found with current filters.</Text></Box>
          )}
        </Card>
      </SimpleGrid>
    </Box>
  );
}
