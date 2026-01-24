import React, { useMemo, useState } from 'react';
import { Box, SimpleGrid, Text, HStack, VStack, Icon, useColorModeValue, Input, Button, Badge, Textarea, Divider, Avatar, List, ListItem, Tag, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select } from '@chakra-ui/react';
import { MdMessage, MdSend, MdCampaign } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';

export default function DriverCommunications() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'gray.600');
  const broadcastDisc = useDisclosure();

  const conversations = useMemo(() => ([
    { id: 'admin', name: 'Transport Admin', last: 'Please confirm today\'s route timing.', time: '10:32 AM', unread: 1 },
    { id: 'safety', name: 'Safety Team', last: 'Remember to run pre-trip checks.', time: '09:10 AM', unread: 0 },
    { id: 'mechanic', name: 'Mechanic Bay', last: 'Oil change scheduled next week.', time: 'Yesterday', unread: 0 },
  ]), []);

  const [activeId, setActiveId] = useState(conversations[0].id);
  const [message, setMessage] = useState('');

  const thread = useMemo(() => ({
    admin: [
      { from: 'them', text: 'Please confirm today\'s route timing.', ts: '10:32 AM' },
      { from: 'me', text: 'Confirmed. Starting at 07:30 AM.', ts: '10:33 AM' },
    ],
    safety: [
      { from: 'them', text: 'Remember to run pre-trip checks.', ts: '09:10 AM' },
    ],
    mechanic: [
      { from: 'them', text: 'Oil change scheduled next week.', ts: 'Yesterday' },
    ],
  }), []);

  const activeThread = thread[activeId] || [];

  const send = () => {
    if (!message.trim()) return;
    activeThread.push({ from: 'me', text: message.trim(), ts: new Date().toLocaleTimeString() });
    setMessage('');
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Communications</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Messages with admin, safety and support teams</Text>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing='20px'>
        <Card p='16px'>
          <HStack mb='10px'>
            <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdMessage} w='22px' h='22px' color='white' />} />
            <VStack align='start' spacing={0}>
              <Text fontWeight='600'>Conversations</Text>
              <Text fontSize='sm' color={textSecondary}>Select a thread</Text>
            </VStack>
          </HStack>
          <Input placeholder='Search...' size='sm' mb='8px' />
          <VStack align='stretch' spacing={2}>
            {conversations.map(c => (
              <Card key={c.id} p='10px' borderColor={activeId===c.id? 'blue.400': undefined} borderWidth={activeId===c.id? '2px':'1px'} cursor='pointer' onClick={()=>setActiveId(c.id)}>
                <HStack justify='space-between'>
                  <HStack>
                    <Avatar size='sm' name={c.name} />
                    <VStack align='start' spacing={0}>
                      <Text fontWeight='600' noOfLines={1} maxW='180px'>{c.name}</Text>
                      <Text fontSize='xs' color={textSecondary} noOfLines={1} maxW='180px'>{c.last}</Text>
                    </VStack>
                  </HStack>
                  <VStack spacing={0} align='end'>
                    <Text fontSize='xs' color={textSecondary}>{c.time}</Text>
                    {c.unread>0 && <Badge colorScheme='blue'>{c.unread}</Badge>}
                  </VStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        </Card>
        <Card p='16px' gridColumn={{ base: 'span 1', xl: 'span 2' }}>
          <HStack justify='space-between' mb='10px'>
            <Text fontSize='lg' fontWeight='bold'>Chat</Text>
            <Button size='sm' leftIcon={<MdCampaign />} variant='outline' onClick={broadcastDisc.onOpen}>Broadcast</Button>
          </HStack>
          <Box borderWidth='1px' borderColor={border} borderRadius='10px' p='12px' h='380px' overflowY='auto'>
            <VStack align='stretch' spacing={3}>
              {activeThread.map((m, idx) => (
                <Box key={idx} alignSelf={m.from==='me'?'flex-end':'flex-start'} bg={m.from==='me'?useColorModeValue('blue.50','blue.700'):'transparent'} borderWidth='1px' borderColor={border} borderRadius='10px' p='8px' maxW='75%'>
                  <Text>{m.text}</Text>
                  <Text fontSize='xs' color={textSecondary} mt='2px' textAlign='right'>{m.ts}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
          <HStack mt='10px'>
            <Textarea placeholder='Type a message...' value={message} onChange={e=>setMessage(e.target.value)} rows={2} />
            <Button onClick={send} leftIcon={<MdSend />} colorScheme='blue'>Send</Button>
          </HStack>
        </Card>
      </SimpleGrid>

      <Modal isOpen={broadcastDisc.isOpen} onClose={broadcastDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Broadcast Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select defaultValue='all'>
                <option value='all'>All Drivers</option>
                <option value='route'>Drivers on Route A</option>
                <option value='shift'>Drivers On Duty</option>
              </Select>
              <Textarea placeholder='Write your broadcast...' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={broadcastDisc.onClose}>Send</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
