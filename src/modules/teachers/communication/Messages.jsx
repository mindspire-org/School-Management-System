import React, { useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Input,
  Button,
  Icon,
  Avatar,
  Badge,
  useColorModeValue,
  Textarea,
  IconButton,
  Select,
} from '@chakra-ui/react';
import { MdSend, MdRefresh, MdFileDownload, MdPrint, MdSearch, MdMessage, MdMail } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';

const seedConversations = [
  { id: 'c1', name: 'Admin Office', last: 'Please share the timetable PDF.', unread: 1, type: 'Admin' },
  { id: 'c2', name: 'Parent: Ali (9-A)', last: 'Thank you!', unread: 0, type: 'Parent' },
  { id: 'c3', name: 'Parent: Sara (10-A)', last: 'Absent today.', unread: 2, type: 'Parent' },
];

const seedMessages = {
  c1: [
    { id: 1, from: 'Admin', text: 'Please share the timetable PDF.', time: '09:05' },
    { id: 2, from: 'You', text: 'Sure, sending now.', time: '09:07' },
  ],
  c2: [
    { id: 1, from: 'Parent', text: 'Thanks for the update.', time: '10:15' },
    { id: 2, from: 'You', text: 'You are welcome.', time: '10:17' },
  ],
  c3: [
    { id: 1, from: 'Parent', text: 'Student will be absent today.', time: '08:30' },
  ],
};

export default function Messages() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const [conversations, setConversations] = useState(seedConversations);
  const [activeId, setActiveId] = useState('c1');
  const [messages, setMessages] = useState(seedMessages);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [draft, setDraft] = useState('');

  const activeConv = useMemo(() => conversations.find(c => c.id === activeId) || conversations[0], [conversations, activeId]);
  const filteredConvs = useMemo(() => conversations.filter(c =>
    (filterType === 'All' || c.type === filterType) && (!search || c.name.toLowerCase().includes(search.toLowerCase()))
  ), [conversations, search, filterType]);

  const kpis = useMemo(() => ({
    total: conversations.length,
    unread: conversations.filter(c => c.unread > 0).length,
    today: Object.values(messages).reduce((acc, arr) => acc + arr.filter(() => true).length, 0),
  }), [conversations, messages]);

  const chartData = useMemo(() => ([{ name: 'Msgs', data: [4, 6, 3, 8, 5, 7, 6] }]), []);
  const chartOptions = useMemo(() => ({ xaxis: { categories: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] }, colors: ['#4C51BF'] }), []);

  const typeDistribution = useMemo(() => {
    const map = {};
    filteredConvs.forEach(c => { const t = c.type || 'Other'; map[t] = (map[t] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [filteredConvs]);

  const reset = () => { setSearch(''); setFilterType('All'); };

  const sendMessage = () => {
    if (!draft.trim() || !activeConv) return;
    setMessages(prev => ({ ...prev, [activeConv.id]: [...(prev[activeConv.id] || []), { id: Date.now(), from: 'You', text: draft.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }));
    setDraft('');
    setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, last: draft.trim(), unread: 0 } : c));
  };

  const exportCSV = () => {
    const conv = activeConv; const arr = messages[conv.id] || [];
    const header = ['From', 'Time', 'Text'];
    const csv = [header, ...arr.map(m => [m.from, m.time, m.text])]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${conv.name.replace(/\s+/g,'_')}_chat.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Messages</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Chat with admin and parents</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdMessage color='white' />} />}
            name='Conversations'
            value={String(kpis.total)}
            trendData={[2,3,4,3,5,6]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdMail color='white' />} />}
            name='Unread'
            value={String(kpis.unread)}
            trendData={[1,1,2,1,2,2]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdSend color='white' />} />}
            name='Messages (sample)'
            value={String(kpis.today)}
            trendData={[4,5,6,5,7,8]}
            trendColor='#B721FF'
          />
        </Flex>
      </Box>

      <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
        <Card p='12px' w={{ base: '100%', md: '320px' }}>
          <HStack mb='10px' spacing={2}>
            <Icon as={MdSearch} color={textSecondary} />
            <Input placeholder='Search' value={search} onChange={e=>setSearch(e.target.value)} size='sm' />
          </HStack>
          <HStack mb='10px'>
            <Select value={filterType} onChange={e=>setFilterType(e.target.value)} size='sm'>
              <option>All</option>
              <option>Admin</option>
              <option>Parent</option>
            </Select>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh}/>} onClick={reset}>Reset</Button>
          </HStack>
          <VStack align='stretch' spacing={2} maxH='420px' overflowY='auto' pr='4px'>
            {filteredConvs.map(c => (
              <HStack key={c.id} p='10px' borderRadius='10px' cursor='pointer' bg={c.id===activeId?useColorModeValue('gray.100','whiteAlpha.200'):undefined} _hover={{ bg: hoverBg }} onClick={()=>setActiveId(c.id)}>
                <Avatar name={c.name} size='sm' />
                <Box flex='1'>
                  <Text fontWeight='600' fontSize='sm' noOfLines={1}>{c.name}</Text>
                  <Text fontSize='xs' color={textSecondary} noOfLines={1}>{c.last}</Text>
                </Box>
                {c.unread>0 && <Badge colorScheme='red'>{c.unread}</Badge>}
              </HStack>
            ))}
            {filteredConvs.length===0 && <Box p='8px' textAlign='center' color={textSecondary} fontSize='sm'>No conversations</Box>}
          </VStack>
        </Card>

        <Card p='0' flex='1' display='flex' flexDirection='column'>
          <Flex align='center' justify='space-between' p='12px' borderBottom='1px solid' borderColor={useColorModeValue('gray.200','whiteAlpha.300')}>
            <HStack>
              <Avatar name={activeConv?.name} size='sm' />
              <VStack spacing={0} align='start'>
                <Text fontWeight='600'>{activeConv?.name}</Text>
                <Text fontSize='xs' color={textSecondary}>{activeConv?.type}</Text>
              </VStack>
            </HStack>
            <HStack>
              <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint}/>} onClick={()=>window.print()}>Print</Button>
              <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdFileDownload}/>} onClick={exportCSV}>Export</Button>
            </HStack>
          </Flex>

          <VStack align='stretch' spacing={3} flex='1' overflowY='auto' p='12px'>
            {(messages[activeConv?.id]||[]).map(m => (
              <Flex key={m.id} justify={m.from==='You'?'flex-end':'flex-start'}>
                <Box maxW='70%' p='10px' borderRadius='12px' bg={m.from==='You'?useColorModeValue('blue.500','blue.400'):useColorModeValue('gray.100','whiteAlpha.200')} color={m.from==='You'?'white':undefined}>
                  <Text fontSize='sm' whiteSpace='pre-wrap'>{m.text}</Text>
                  <Text fontSize='10px' opacity={0.8} mt='4px' textAlign='right'>{m.time}</Text>
                </Box>
              </Flex>
            ))}
          </VStack>

          <HStack p='12px' borderTop='1px solid' borderColor={useColorModeValue('gray.200','whiteAlpha.300')}>
            <Textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={1} resize='none' placeholder='Type a message…' onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } }} />
            <IconButton aria-label='Send' icon={<MdSend/>} colorScheme='blue' onClick={sendMessage} />
          </HStack>
        </Card>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt='16px'>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Messages per Day</Text>
          <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
        </Card>
        <Card p='16px'>
          <Text fontWeight='700' mb='8px'>Conversation Types</Text>
          <PieChart height={240} chartData={typeDistribution.values} chartOptions={{ labels: typeDistribution.labels, legend:{ position:'right' } }} />
        </Card>
      </SimpleGrid>
    </Box>
  );
}
