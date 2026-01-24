import React, { useMemo, useState } from 'react';
import { Box, Flex, SimpleGrid, Text, Button, HStack, VStack, Badge, Icon, useColorModeValue, Wrap, WrapItem, Tooltip, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast, Select, Input, Textarea, Divider } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';
import { MdHome, MdMap, MdGpsFixed, MdPlace, MdDirectionsBus, MdAccessTime, MdReportProblem, MdPlayArrow, MdStop, MdLogin } from 'react-icons/md';
import SparklineChart from '../../components/charts/SparklineChart';
import PieChart from '../../components/charts/PieChart';

export default function DriverDashboard() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const subtle = useColorModeValue('gray.50', 'gray.700');
  const toast = useToast();
  const sosDisc = useDisclosure();
  const incidentDisc = useDisclosure();
  const navigate = useNavigate();

  const data = {
    routeName: 'Route A - North Loop',
    stops: 18,
    progress: 62, // percent
    gpsStatus: 'Connected',
    nextStop: 'Stop #7 - Oak Street',
    eta: '08:42 AM',
    vehicleId: 'BUS-12',
    capacity: '48 seats',
    shift: { start: '07:30 AM', end: '02:30 PM' },
    lastUpdate: '1 min ago',
    speed: '36 km/h',
    speedTrend: [28, 32, 30, 35, 36, 31, 34, 38, 33, 36, 37, 35],
  };

  const [shiftOn, setShiftOn] = useState(false);
  const [shiftSince, setShiftSince] = useState('');
  const [sosType, setSosType] = useState('accident');
  const [incidentType, setIncidentType] = useState('delay');
  const [incidentNote, setIncidentNote] = useState('');
  const completedStops = useMemo(() => Math.round((data.progress / 100) * data.stops), [data.progress, data.stops]);
  const remainingStops = useMemo(() => Math.max(0, data.stops - completedStops), [data.stops, completedStops]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex align='center' justify='space-between' mb='20px'>
        <Box>
          <Text fontSize='2xl' fontWeight='bold' mb='4px'>Driver Dashboard</Text>
          <Text fontSize='md' color={textSecondary}>Your route, vehicle and shift at a glance</Text>
        </Box>
        <Button size='sm' colorScheme='blue' leftIcon={<MdLogin />} onClick={()=>navigate('/auth/sign-in')}>Sign In</Button>
      </Flex>

      {/* Top KPIs */}
      <Box overflowX='auto' mb='20px'>
        <SimpleGrid minChildWidth='220px' spacing='16px'>
          <Card p='16px'>
            <Flex align='start' justify='space-between' flexWrap='wrap' columnGap={3} rowGap={2}>
              <HStack spacing={3} align='start'>
                <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#00b09b 0%,#96c93d 100%)' icon={<Icon as={MdMap} w='22px' h='22px' color='white' />} />
                <Box>
                  <Text fontWeight='600'>Today’s Route</Text>
                  <Text fontSize='sm' color={textSecondary} noOfLines={1} maxW={{ base:'160px', md:'220px' }}>{data.routeName}</Text>
                </Box>
              </HStack>
              <Badge colorScheme='blue' whiteSpace='nowrap' alignSelf='center' size='sm'>{data.stops} stops</Badge>
            </Flex>
            <Box mt='10px' h='8px' bg={useColorModeValue('gray.200','gray.600')} borderRadius='full'>
              <Box h='100%' w={`${data.progress}%`} bg='blue.400' borderRadius='full' />
            </Box>
          </Card>

          <Card p='16px'>
            <Flex align='start' justify='space-between' flexWrap='wrap' columnGap={3} rowGap={2}>
              <HStack spacing={3} align='start'>
                <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<Icon as={MdGpsFixed} w='22px' h='22px' color='white' />} />
                <Box>
                  <Text fontWeight='600'>Live Location</Text>
                  <Text fontSize='sm' color={textSecondary}>GPS: {data.gpsStatus}</Text>
                </Box>
              </HStack>
              <Badge whiteSpace='nowrap' alignSelf='center' size='sm'>{data.speed}</Badge>
            </Flex>
            <Text fontSize='sm' color={textSecondary} mt='8px'>Last update {data.lastUpdate}</Text>
          </Card>

          <Card p='16px'>
            <Flex align='start' justify='space-between' flexWrap='wrap' columnGap={3} rowGap={2}>
              <HStack spacing={3} align='start'>
                <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FDBB2D 0%,#22C1C3 100%)' icon={<Icon as={MdPlace} w='22px' h='22px' color='white' />} />
                <Box>
                  <Text fontWeight='600'>Next Pickup/Drop</Text>
                  <Text fontSize='sm' color={textSecondary} noOfLines={1} maxW={{ base:'160px', md:'220px' }}>{data.nextStop}</Text>
                </Box>
              </HStack>
              <Badge colorScheme='blue' whiteSpace='nowrap' alignSelf='center' size='sm'>ETA {data.eta}</Badge>
            </Flex>
          </Card>

          <Card p='16px'>
            <Flex align='start' justify='space-between' flexWrap='wrap' columnGap={3} rowGap={2}>
              <HStack spacing={3} align='start'>
                <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#00C6FB 0%,#005BEA 100%)' icon={<Icon as={MdDirectionsBus} w='22px' h='22px' color='white' />} />
                <Box>
                  <Text fontWeight='600'>Assigned Vehicle</Text>
                  <Text fontSize='sm' color={textSecondary}>{data.vehicleId}</Text>
                </Box>
              </HStack>
              <Badge whiteSpace='nowrap' alignSelf='center' size='sm'>{data.capacity}</Badge>
            </Flex>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Map and Actions */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing='20px'>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='12px'>Live Tracking</Text>
          <Box h={{ base: '260px', md: '320px' }} borderRadius='12px' bg={subtle} borderWidth='1px' borderColor={useColorModeValue('gray.200','gray.600')} display='flex' alignItems='center' justifyContent='center'>
            <VStack spacing={1}>
              <Icon as={MdMap} w='32px' h='32px' color='gray.400' />
              <Text fontSize='sm' color={textSecondary}>Map placeholder — integrate map SDK here</Text>
            </VStack>
          </Box>
        </Card>

        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='10px'>Shift & Quick Actions</Text>
          <HStack spacing={3} mb='12px' flexWrap='wrap'>
            <Badge colorScheme='green' size='sm' whiteSpace='nowrap'>Start {data.shift.start}</Badge>
            <Badge colorScheme='red' size='sm' whiteSpace='nowrap'>End {data.shift.end}</Badge>
            {shiftOn ? (
              <Badge colorScheme='purple' size='sm' whiteSpace='nowrap'>On Duty {shiftSince && `• since ${shiftSince}`}</Badge>
            ) : (
              <Badge colorScheme='gray' size='sm' whiteSpace='nowrap'>Off Duty</Badge>
            )}
          </HStack>
          <Wrap spacing='10px' shouldWrapChildren>
            <WrapItem>
              <Tooltip label='Start your shift and begin tracking'>
                <Button size='sm' borderRadius='full' leftIcon={<MdPlayArrow />} colorScheme='green' variant='solid' onClick={()=>{ setShiftOn(true); setShiftSince(new Date().toLocaleTimeString()); toast({ status:'success', title:'Shift started' }); }}>Start Shift</Button>
              </Tooltip>
            </WrapItem>
            <WrapItem>
              <Tooltip label='End your shift and stop tracking'>
                <Button size='sm' borderRadius='full' leftIcon={<MdStop />} colorScheme='red' variant='outline' onClick={()=>{ if(!shiftOn){ toast({ status:'info', title:'Shift not active' }); return;} setShiftOn(false); toast({ status:'success', title:'Shift ended' }); }}>
                  End Shift
                </Button>
              </Tooltip>
            </WrapItem>
            <WrapItem>
              <Tooltip label='Send emergency alert to admin'>
                <Button size='sm' borderRadius='full' leftIcon={<MdReportProblem />} colorScheme='orange' variant='outline' onClick={sosDisc.onOpen}>SOS</Button>
              </Tooltip>
            </WrapItem>
            <WrapItem>
              <Tooltip label='Report a non-emergency issue'>
                <Button size='sm' borderRadius='full' leftIcon={<MdReportProblem />} colorScheme='pink' variant='outline' onClick={incidentDisc.onOpen}>Report Incident</Button>
              </Tooltip>
            </WrapItem>
          </Wrap>
          <Box mt='14px'>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing='12px'>
              <Box p='12px' bg={subtle} borderWidth='1px' borderColor={useColorModeValue('gray.200','gray.600')} borderRadius='12px'>
                <Text fontSize='xs' fontWeight='700' textTransform='uppercase' letterSpacing='0.6px' color={textSecondary} mb='6px'>Status & Progress</Text>
                <HStack spacing={2} mb='4px' flexWrap='wrap'>
                  <Badge colorScheme={shiftOn ? 'purple' : 'gray'}>{shiftOn ? 'On Duty' : 'Off Duty'}</Badge>
                  {shiftOn && <Badge colorScheme='purple' variant='outline'>since {shiftSince}</Badge>}
                  <Badge variant='subtle' maxW='100%' overflow='hidden' minW={0} flexShrink={1}>
                    <HStack spacing={1} maxW='100%' minW={0}>
                      <Icon as={MdAccessTime} me='4px' />
                      <Text as='span' noOfLines={1} isTruncated display='inline-block' maxW='100%'>
                        Shift {data.shift.start} - {data.shift.end}
                      </Text>
                    </HStack>
                  </Badge>
                </HStack>
                <HStack spacing={2} mb='6px'>
                  <Text fontSize='sm' color={textSecondary}>Stops</Text>
                  <Badge colorScheme='green'>{completedStops}</Badge>
                  <Text fontSize='sm' color={textSecondary}>/ {data.stops}</Text>
                </HStack>
                <Box mt='4px' h='8px' bg={useColorModeValue('gray.200','gray.600')} borderRadius='full' position='relative'>
                  <Box h='100%' w={`${data.progress}%`} bg='green.400' borderRadius='full' />
                  <Text position='absolute' top='-18px' right='0' fontSize='xs' color={textSecondary}>{data.progress}%</Text>
                </Box>
              </Box>

              <Box p='12px' bg={subtle} borderWidth='1px' borderColor={useColorModeValue('gray.200','gray.600')} borderRadius='12px'>
                <Text fontSize='xs' fontWeight='700' textTransform='uppercase' letterSpacing='0.6px' color={textSecondary} mb='6px'>Next Up</Text>
                <Text fontSize='sm' color={textSecondary} noOfLines={2}>{data.nextStop}</Text>
                <HStack spacing={2} mt='6px' flexWrap='wrap'>
                  <Badge colorScheme='blue'><Icon as={MdAccessTime} me='4px' />ETA {data.eta}</Badge>
                  <Badge><Icon as={MdDirectionsBus} me='4px' />Bus {data.vehicleId}</Badge>
                </HStack>
                <HStack spacing={2} mt='8px' flexWrap='wrap'>
                  <Badge colorScheme='green' variant='subtle'>Completed {completedStops}</Badge>
                  <Badge colorScheme='gray' variant='subtle'>Remaining {remainingStops}</Badge>
                </HStack>
                <Divider my='8px' />
                <Text fontSize='sm' color={textSecondary}>GPS: {data.gpsStatus} • Speed {data.speed}</Text>
                <Text fontSize='xs' color={textSecondary} mt='2px'>Updated {data.lastUpdate}</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </Card>
      </SimpleGrid>

      {/* Mini analytics */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing='20px' mt='20px'>
        <Card p='16px'>
          <HStack justify='space-between' align='start'>
            <VStack align='start' spacing={0}>
              <Text fontSize='lg' fontWeight='bold'>Speed Trend</Text>
              <Text fontSize='sm' color={textSecondary}>Last 12 updates</Text>
            </VStack>
            <Badge>{data.speed}</Badge>
          </HStack>
          <Box mt='8px'>
            <SparklineChart data={data.speedTrend} color="#3182CE" height={60} valueFormatter={(v)=>`${v} km/h`} />
          </Box>
        </Card>
        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Stops Status</Text>
          <PieChart chartData={[completedStops, remainingStops]} chartOptions={{ labels:['Completed','Remaining'], colors:['#38A169','#CBD5E0'], legend:{ show:true, position:'right' } }} />
        </Card>
      </SimpleGrid>

      {/* SOS Modal */}
      <Modal isOpen={sosDisc.isOpen} onClose={sosDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send SOS</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select value={sosType} onChange={e=>setSosType(e.target.value)}>
                <option value='accident'>Accident</option>
                <option value='medical'>Medical</option>
                <option value='security'>Security</option>
                <option value='vehicle'>Vehicle Breakdown</option>
              </Select>
              <Input placeholder='Location (optional)' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={sosDisc.onClose}>Cancel</Button>
            <Button colorScheme='orange' onClick={()=>{ sosDisc.onClose(); toast({ status:'warning', title:`SOS sent (${sosType})` }); }}>Send SOS</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Incident Modal */}
      <Modal isOpen={incidentDisc.isOpen} onClose={incidentDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Report Incident</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select value={incidentType} onChange={e=>setIncidentType(e.target.value)}>
                <option value='delay'>Delay</option>
                <option value='behavior'>Student Behavior</option>
                <option value='traffic'>Traffic/Route</option>
                <option value='vehicle'>Vehicle Issue</option>
              </Select>
              <Textarea placeholder='Describe the incident...' value={incidentNote} onChange={e=>setIncidentNote(e.target.value)} />
              <Input type='file' accept='image/*' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={incidentDisc.onClose}>Cancel</Button>
            <Button colorScheme='pink' onClick={()=>{ incidentDisc.onClose(); toast({ status:'success', title:'Incident submitted' }); setIncidentNote(''); }}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
