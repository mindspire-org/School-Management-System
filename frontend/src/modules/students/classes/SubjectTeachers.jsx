import React, { useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, Avatar, HStack, Badge, Icon, useColorModeValue, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Flex } from '@chakra-ui/react';
import Card from '../../../components/card/Card';
import { MdEmail, MdPhone, MdPerson, MdGroup, MdLibraryBooks, MdClass } from 'react-icons/md';
import { mockTeachers, mockTodayClasses } from '../../../utils/mockData';
import BarChart from '../../../components/charts/BarChart';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';

export default function SubjectTeachers() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState(null);

  const myClass = useMemo(() => {
    const counts = {};
    (mockTodayClasses||[]).forEach(c=>{ counts[c.className] = (counts[c.className]||0)+1; });
    const entry = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    return entry ? entry[0] : '10A';
  }, []);

  const items = useMemo(() => {
    const list = mockTeachers.filter(t => Array.isArray(t.classes) && t.classes.includes(myClass));
    return list.map(t => ({
      name: t.name,
      subject: t.subject,
      email: t.email,
      phone: t.phone,
      avatar: t.avatar,
      classes: t.classes,
      exp: t.experience,
    }));
  }, [myClass]);

  const chartData = useMemo(() => ([{
    name: 'Sessions/Month',
    data: items.map((_, i) => 4 + (i % 5)),
  }]), [items]);
  const chartOptions = useMemo(() => ({
    xaxis: { categories: items.map(t => t.subject) },
    colors: ['#805AD5'],
    dataLabels: { enabled: false },
  }), [items]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Subject Teachers</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Teachers assigned to {myClass}</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdGroup} w='22px' h='22px' color='white' />} />}
            name='Total Teachers'
            value={String(items.length)}
            trendData={[1,1,2,2,items.length]}
            trendColor='#01B574'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdLibraryBooks} w='22px' h='22px' color='white' />} />}
            name='Subjects'
            value={String(new Set(items.map(t => t.subject)).size)}
            trendData={[1,1,2,2,new Set(items.map(t => t.subject)).size]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdClass} w='22px' h='22px' color='white' />} />}
            name='Class'
            value={myClass}
            trendData={[1,1,1,1,1]}
            trendColor='#805AD5'
          />
        </Flex>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing='16px'>
        {items.map((t, i) => (
          <Card key={i} p='16px'>
            <HStack spacing={4} align='start' flexWrap='wrap' rowGap={3}>
              <Avatar name={t.name} src={t.avatar} />
              <VStack spacing={1} align='start' w='full'>
                <HStack justify='space-between' w='full'>
                  <HStack><Icon as={MdPerson} /><Text fontWeight='700'>{t.name}</Text></HStack>
                  <Badge colorScheme='blue'>{t.subject}</Badge>
                </HStack>
                <Text fontSize='sm' color={textSecondary}>Exp: {t.exp}</Text>
                <HStack spacing={3} color={textSecondary} fontSize='sm' flexWrap='wrap' rowGap={1}>
                  <HStack><Icon as={MdEmail} /><Text>{t.email}</Text></HStack>
                  <HStack><Icon as={MdPhone} /><Text>{t.phone}</Text></HStack>
                </HStack>
                <Button size='sm' alignSelf='flex-start' mt={2} colorScheme='purple' onClick={() => { setSelected(t); onOpen(); }}>View</Button>
              </VStack>
            </HStack>
          </Card>
        ))}
      </SimpleGrid>

      <Card p='16px' mt='16px'>
        <Text fontSize='md' fontWeight='bold' mb='8px'>Monthly Sessions by Subject</Text>
        <BarChart chartData={chartData} chartOptions={chartOptions} height={240} />
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Teacher Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selected ? (
              <VStack align='start' spacing={2}>
                <Text><b>Name:</b> {selected.name}</Text>
                <Text><b>Subject:</b> {selected.subject}</Text>
                <Text><b>Email:</b> {selected.email}</Text>
                <Text><b>Phone:</b> {selected.phone}</Text>
                <Text><b>Office Hour:</b> Wed 01:30 PM - 02:00 PM</Text>
                <Badge colorScheme='green'>Hardcoded Demo</Badge>
              </VStack>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
