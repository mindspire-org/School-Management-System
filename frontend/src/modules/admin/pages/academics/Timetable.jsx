import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Select,
  Grid,
  GridItem,
  Flex,
  SimpleGrid,
  Button,
  ButtonGroup,
  IconButton,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useColorModeValue,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import { MdSchedule, MdAccessTime, MdGridOn, MdAssignment, MdUpdate, MdCalendarToday, MdChevronLeft, MdChevronRight, MdViewWeek, MdViewModule, MdFileDownload, MdPictureAsPdf } from 'react-icons/md';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const periods = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const sample = {
  'Class 1-A': {
    Monday: ['Eng', 'Math', 'Sci', 'Urdu', 'PE', 'Art'],
    Tuesday: ['Math', 'Eng', 'Sci', 'Isl', 'Comp', 'PE'],
    Wednesday: ['Sci', 'Math', 'Eng', 'Urdu', 'Art', 'Lib'],
    Thursday: ['Isl', 'Eng', 'Math', 'Sci', 'PE', 'Comp'],
    Friday: ['Urdu', 'Sci', 'Math', 'Eng', 'Art', 'PE'],
  },
};

export default function Timetable() {
  const [cls, setCls] = useState('Class 1');
  const [section, setSection] = useState('A');
  const [view, setView] = useState('week'); // 'day' | 'week' | 'month'
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [timetable, setTimetable] = useState({}); // { key: { 'YYYY-MM-DD': ['Eng', ...] } }
  const editDisc = useDisclosure();
  const [editValues, setEditValues] = useState(Array(periods.length).fill(''));
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

  const key = `${cls}-${section}`;
  const grid = useMemo(() => sample[key] || {}, [key]);
  const totalCells = days.length * periods.length;
  const filledCells = useMemo(() => {
    return days.reduce((acc, d) => acc + (grid[d]?.filter(Boolean).length || 0), 0);
  }, [grid]);
  const freeCells = totalCells - filledCells;
  const uniqueSubjects = useMemo(() => {
    const set = new Set();
    days.forEach((d) => (grid[d] || []).forEach((s) => s && set.add(s)));
    return set.size;
  }, [grid]);

  // Helpers
  const fmt = (d) => d.toISOString().slice(0, 10);
  const dayName = (d) => days[d.getDay() === 0 ? 6 : d.getDay() - 1];
  const monthMatrix = useMemo(() => {
    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startDay = (d.getDay() + 6) % 7; // Monday start
    const first = new Date(d);
    first.setDate(1 - startDay);
    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const row = [];
      for (let i = 0; i < 7; i++) {
        const cell = new Date(first);
        cell.setDate(first.getDate() + w * 7 + i);
        row.push(cell);
      }
      weeks.push(row);
    }
    return weeks;
  }, [selectedDate]);

  const getScheduleForDate = (date) => {
    const map = timetable[key] || {};
    const k = fmt(date);
    if (map[k]) return map[k];
    const dn = dayName(date);
    return grid[dn] || Array(periods.length).fill('');
  };

  const setScheduleForDate = (date, values) => {
    setTimetable((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [fmt(date)]: values },
    }));
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Timetable</Heading>
          <Text color={textColorSecondary}>Plan lessons with day/week/month views</Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap="20px" mb={5}>
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)" icon={<MdSchedule color="white" />} />}
          name="Total Periods"
          value={String(totalCells)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#01B574 0%,#51CB97 100%)" icon={<MdGridOn color="white" />} />}
          name="Scheduled"
          value={String(filledCells)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)" icon={<MdAccessTime color="white" />} />}
          name="Free Slots"
          value={String(freeCells)}
        />
        <MiniStatistics
          startContent={<IconBox w="56px" h="56px" bg="linear-gradient(90deg,#8952FF 0%,#AA80FF 100%)" icon={<MdGridOn color="white" />} />}
          name="Subjects"
          value={String(uniqueSubjects)}
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <Select w="160px" value={cls} onChange={(e) => setCls(e.target.value)}>
              <option>Class 1</option>
              <option>Class 2</option>
              <option>Class 3</option>
            </Select>
            <Select w="100px" value={section} onChange={(e) => setSection(e.target.value)}>
              <option>A</option>
              <option>B</option>
            </Select>
          </HStack>
          <HStack>
            <Button leftIcon={<MdUpdate />} colorScheme="blue">Update Timetable</Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue">Generate Report</Button>
            <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue">Export CSV</Button>
            <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue">Export PDF</Button>
          </HStack>
        </Flex>
      </Card>

      {/* View Controls */}
      <Card mb={5}>
        <Flex p={4} gap={4} align="center" direction={{ base: 'column', md: 'row' }}>
          <ButtonGroup isAttached>
            <Button leftIcon={<MdCalendarToday />} variant={view==='day'?'solid':'outline'} colorScheme='blue' onClick={()=>setView('day')}>Day</Button>
            <Button leftIcon={<MdViewWeek />} variant={view==='week'?'solid':'outline'} colorScheme='blue' onClick={()=>setView('week')}>Week</Button>
            <Button leftIcon={<MdViewModule />} variant={view==='month'?'solid':'outline'} colorScheme='blue' onClick={()=>setView('month')}>Month</Button>
          </ButtonGroup>
          <HStack>
            <IconButton aria-label='Prev' icon={<MdChevronLeft />} onClick={()=>{
              const d=new Date(selectedDate);
              if(view==='day') d.setDate(d.getDate()-1);
              else if(view==='week') d.setDate(d.getDate()-7);
              else d.setMonth(d.getMonth()-1);
              setSelectedDate(d);
            }} />
            <Input type='date' value={fmt(selectedDate)} onChange={(e)=>setSelectedDate(new Date(e.target.value))} maxW='220px' />
            <IconButton aria-label='Next' icon={<MdChevronRight />} onClick={()=>{
              const d=new Date(selectedDate);
              if(view==='day') d.setDate(d.getDate()+1);
              else if(view==='week') d.setDate(d.getDate()+7);
              else d.setMonth(d.getMonth()+1);
              setSelectedDate(d);
            }} />
            <Button onClick={()=>setSelectedDate(new Date())}>Today</Button>
          </HStack>
        </Flex>
      </Card>

      {/* Views */}
      {view==='day' && (
        <Card>
          <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            {cls} - Section {section} • {selectedDate.toDateString()}
          </Heading>
          <Box p={4}>
            <Grid templateColumns={`160px 1fr`} gap={2}>
              {periods.map((p, i)=> (
                <React.Fragment key={p}>
                  <GridItem><Text fontWeight='600'>{p}</Text></GridItem>
                  <GridItem>
                    <Box borderWidth='1px' borderRadius='md' p={3} cursor='pointer' onClick={()=>{ setEditValues([...getScheduleForDate(selectedDate)]); editDisc.onOpen(); }}>
                      <Text>{getScheduleForDate(selectedDate)[i] || '- (click to edit)'}</Text>
                    </Box>
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        </Card>
      )}

      {view==='week' && (()=>{
        const d = new Date(selectedDate); const day=(d.getDay()+6)%7; const monday=new Date(d); monday.setDate(d.getDate()-day);
        const weekDays=[...Array(5)].map((_,i)=>{ const t=new Date(monday); t.setDate(monday.getDate()+i); return t;});
        return (
          <Card overflow="hidden">
            <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
              {cls} - Section {section} • Week of {monday.toDateString()}
            </Heading>
            <Box overflowX="auto">
              <Grid templateColumns={`120px repeat(${periods.length}, 1fr)`} gap={2} p={4}>
                <GridItem />
                {periods.map((p) => (
                  <GridItem key={p}>
                    <Text fontWeight="600" textAlign="center">{p}</Text>
                  </GridItem>
                ))}
                {weekDays.map((dateObj) => (
                  <React.Fragment key={fmt(dateObj)}>
                    <GridItem><Text fontWeight="600">{dayName(dateObj)}<br/><Text as='span' fontWeight='400' color={textColorSecondary}>{fmt(dateObj)}</Text></Text></GridItem>
                    {periods.map((p, i) => (
                      <GridItem key={`${fmt(dateObj)}-${p}`}>
                        <Box borderWidth="1px" borderRadius="md" p={3} textAlign="center" cursor='pointer' _hover={{ bg: useColorModeValue('gray.50','gray.700') }} onClick={()=>{ setSelectedDate(dateObj); setEditValues([...getScheduleForDate(dateObj)]); editDisc.onOpen(); }}>
                          <Text>{getScheduleForDate(dateObj)[i] || '-'}</Text>
                        </Box>
                      </GridItem>
                    ))}
                  </React.Fragment>
                ))}
              </Grid>
            </Box>
          </Card>
        );
      })()}

      {view==='month' && (
        <Card>
          <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
            {cls} - Section {section} • {selectedDate.toLocaleString(undefined,{ month:'long', year:'numeric'})}
          </Heading>
          <Box p={4}>
            <Grid templateColumns="repeat(7, 1fr)" gap={2}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d)=> (
                <GridItem key={d}><Text fontWeight='600' textAlign='center'>{d}</Text></GridItem>
              ))}
              {monthMatrix.map((week, wi)=> week.map((d, i)=> (
                <GridItem key={`${wi}-${i}`}>
                  <Box borderWidth='1px' borderRadius='md' p={2} h='90px' cursor='pointer' _hover={{ bg: useColorModeValue('gray.50','gray.700') }} onClick={()=>{ setSelectedDate(d); setEditValues([...getScheduleForDate(d)]); editDisc.onOpen(); }} opacity={d.getMonth()===selectedDate.getMonth()?1:0.5}>
                    <Text fontSize='sm' fontWeight='600'>{d.getDate()}</Text>
                    <Text color={textColorSecondary} fontSize='xs' mt={1}>{getScheduleForDate(d).filter(Boolean).length} periods</Text>
                  </Box>
                </GridItem>
              )))}
            </Grid>
          </Box>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editDisc.isOpen} onClose={editDisc.onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Schedule • {fmt(selectedDate)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns='120px 1fr' gap={3}>
              {periods.map((p, idx)=> (
                <React.Fragment key={`edit-${p}`}>
                  <GridItem><Text fontWeight='600'>{p}</Text></GridItem>
                  <GridItem>
                    <Input placeholder='Subject' value={editValues[idx] || ''} onChange={(e)=>{
                      const v=[...editValues]; v[idx]=e.target.value; setEditValues(v);
                    }} />
                  </GridItem>
                </React.Fragment>
              ))}
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={editDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={()=>{ setScheduleForDate(selectedDate, editValues); editDisc.onClose(); }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
