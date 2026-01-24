import React, { useMemo, useState } from 'react';
import { Box, SimpleGrid, Text, HStack, VStack, Badge, Icon, useColorModeValue, Checkbox, Button, Table, Thead, Tr, Th, Tbody, Td, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, Select, Progress, InputGroup, InputLeftElement, Divider, Tag, Tooltip, IconButton, Textarea } from '@chakra-ui/react';
import { MdListAlt, MdCloudUpload, MdAccessTime, MdWarningAmber, MdDirectionsBus, MdLocalGasStation, MdSpeed, MdBuild, MdAdd, MdPhotoCamera, MdSearch } from 'react-icons/md';
import Card from '../../components/card/Card';
import IconBox from '../../components/icons/IconBox';

export default function VehicleChecklist() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const border = useColorModeValue('gray.200', 'gray.600');
  const subtle = useColorModeValue('gray.50', 'gray.700');
  const chipBg = useColorModeValue('gray.100', 'gray.600');

  const [vehicle, setVehicle] = useState({ id: 'BUS-12', model: 'Hino RK8', odometer: 58210, fuel: 62, lastService: '2025-10-20', nextServiceAt: 60000, health: 'Good' });
  const [odometerInput, setOdometerInput] = useState(String(58210));
  const [fuelInput, setFuelInput] = useState(62);
  const [preStarted, setPreStarted] = useState(false);
  const [preCompleted, setPreCompleted] = useState(false);

  const pretripItems = useMemo(() => ([
    { key: 'tires', label: 'Tires & Pressure' },
    { key: 'brakes', label: 'Brakes' },
    { key: 'lights', label: 'Lights & Indicators' },
    { key: 'horn', label: 'Horn' },
    { key: 'mirrors', label: 'Mirrors & Visibility' },
    { key: 'seatbelts', label: 'Seatbelts' },
    { key: 'firstaid', label: 'First Aid Kit' },
    { key: 'fire', label: 'Fire Extinguisher' },
    { key: 'fuel', label: 'Fuel Level' },
    { key: 'gps', label: 'GPS Connected' },
  ]), []);

  const posttripItems = useMemo(() => ([
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'damage', label: 'New Damage' },
    { key: 'lost', label: 'Lost & Found' },
    { key: 'parking', label: 'Safe Parking' },
  ]), []);

  const [pretrip, setPretrip] = useState(Object.fromEntries(pretripItems.map(i => [i.key, false])));
  const [posttrip, setPosttrip] = useState(Object.fromEntries(posttripItems.map(i => [i.key, false])));

  const documents = [
    { type: 'Driving License', number: 'DL-78652', expires: '2026-03-15', status: 'Valid' },
    { type: 'Vehicle Registration', number: 'REG-52-9012', expires: '2027-10-01', status: 'Valid' },
    { type: 'Insurance', number: 'INS-AB1234', expires: '2025-12-20', status: 'Expiring Soon' },
    { type: 'Fitness/Emission', number: 'FIT-7789', expires: '2025-08-05', status: 'Valid' },
  ];

  const maintenance = [
    { id: 1, title: 'Engine Oil Change', dueAt: '2025-12-01', odometer: '58,200 km', priority: 'Medium' },
    { id: 2, title: 'Brake Pad Inspection', dueAt: '2025-11-25', odometer: '58,450 km', priority: 'High' },
    { id: 3, title: 'Wheel Alignment', dueAt: '2026-01-15', odometer: '60,000 km', priority: 'Low' },
  ];

  const uploadDisc = useDisclosure();
  const [uploadDoc, setUploadDoc] = useState({ type: 'Driving License', number: '' });
  const issueDisc = useDisclosure();
  const [newIssue, setNewIssue] = useState({ category: 'vehicle', severity: 'medium', description: '' });

  const issuesData = useMemo(() => ([
    { id: 'ISS-2101', category: 'vehicle', severity: 'low', title: 'Minor engine noise observed', status: 'open', created: '2025-11-01 07:40' },
    { id: 'ISS-2102', category: 'safety', severity: 'high', title: 'Emergency exit latch loose', status: 'in_progress', created: '2025-11-05 08:15' },
    { id: 'ISS-2103', category: 'cleanliness', severity: 'low', title: 'Trash bin replacement needed', status: 'resolved', created: '2025-11-06 14:20' },
    { id: 'ISS-2104', category: 'documentation', severity: 'medium', title: 'Insurance expiring soon', status: 'open', created: '2025-11-10 09:05' },
  ]), []);
  const [issueType, setIssueType] = useState('all');
  const [issueStatus, setIssueStatus] = useState('all');
  const [issueQuery, setIssueQuery] = useState('');

  const completedPre = Object.values(pretrip).filter(Boolean).length;
  const completedPost = Object.values(posttrip).filter(Boolean).length;

  const filteredIssues = useMemo(() => {
    let list = issuesData;
    if (issueType !== 'all') list = list.filter(i => i.category === issueType);
    if (issueStatus !== 'all') list = list.filter(i => i.status === issueStatus);
    if (issueQuery.trim()) {
      const q = issueQuery.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
    }
    return list;
  }, [issuesData, issueType, issueStatus, issueQuery]);

  const exportCSV = () => {
    const header = ['Section', 'Item', 'Checked'];
    const rows = [
      ...pretripItems.map(i => ['Pre-trip', i.label, pretrip[i.key] ? 'Yes' : 'No']),
      ...posttripItems.map(i => ['Post-trip', i.label, posttrip[i.key] ? 'Yes' : 'No']),
    ];
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vehicle_checklist.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportIssuesCSV = () => {
    const header = ['ID','Category','Severity','Title','Status','Created'];
    const rows = filteredIssues.map(i => [i.id, i.category, i.severity, i.title, i.status, i.created]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vehicle_issues.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='8px'>Vehicle Checklist</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Pre/Post-trip checks, documents and maintenance</Text>

      <Card p='16px' mb='16px'>
        <HStack justify='space-between' align='start' flexWrap='wrap' rowGap={2}>
          <HStack>
            <Icon as={MdDirectionsBus} />
            <VStack align='start' spacing={0}>
              <Text fontWeight='600'>Vehicle {vehicle.id}</Text>
              <Text fontSize='sm' color={textSecondary}>{vehicle.model}</Text>
            </VStack>
          </HStack>
          <HStack spacing={2} flexWrap='wrap'>
            <Tag>Health: {vehicle.health}</Tag>
            <Tag>Last Service: {vehicle.lastService}</Tag>
            <Tag>Next at: {vehicle.nextServiceAt.toLocaleString()} km</Tag>
          </HStack>
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing='12px' mt='10px'>
          <Card p='12px'>
            <HStack justify='space-between'>
              <HStack><Icon as={MdSpeed} /><Text fontWeight='600'>Odometer</Text></HStack>
              <Badge>{vehicle.odometer.toLocaleString()} km</Badge>
            </HStack>
            <InputGroup mt='8px'>
              <InputLeftElement children={<MdSpeed />} />
              <Input value={odometerInput} onChange={e=>setOdometerInput(e.target.value)} placeholder='Update reading' />
            </InputGroup>
            <Button mt='8px' size='sm' onClick={()=>setVehicle(v=>({ ...v, odometer: Number(odometerInput)||v.odometer }))}>Save Reading</Button>
          </Card>
          <Card p='12px'>
            <HStack justify='space-between'>
              <HStack><Icon as={MdLocalGasStation} /><Text fontWeight='600'>Fuel</Text></HStack>
              <Badge colorScheme='green'>{vehicle.fuel}%</Badge>
            </HStack>
            <Progress value={vehicle.fuel} mt='8px' colorScheme='green' borderRadius='full' />
            <HStack mt='8px'>
              <Input type='number' value={fuelInput} onChange={e=>setFuelInput(Number(e.target.value))} min={0} max={100} />
              <Button size='sm' onClick={()=>setVehicle(v=>({ ...v, fuel: Math.max(0, Math.min(100, Number(fuelInput))) }))}>Update</Button>
            </HStack>
          </Card>
          <Card p='12px'>
            <Text fontWeight='600'>Inspection Actions</Text>
            <HStack mt='8px' spacing={3}>
              <Button size='sm' onClick={()=>setPreStarted(true)} isDisabled={preStarted}>Start Pre-Trip</Button>
              <Button size='sm' variant='outline' onClick={()=>setPreCompleted(true)} isDisabled={!preStarted || preCompleted}>Complete Pre-Trip</Button>
            </HStack>
            <HStack mt='8px' spacing={2} flexWrap='wrap'>
              <Tag colorScheme={preStarted?'blue':'gray'}>Started: {preStarted?'Yes':'No'}</Tag>
              <Tag colorScheme={preCompleted?'green':'gray'}>Completed: {preCompleted?'Yes':'No'}</Tag>
            </HStack>
          </Card>
        </SimpleGrid>
      </Card>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing='20px'>
        <Card p='16px'>
          <HStack mb='12px' justify='space-between'>
            <HStack>
              <IconBox w='44px' h='44px' bg='linear-gradient(90deg,#22c1c3 0%,#fdbb2d 100%)' icon={<Icon as={MdListAlt} w='22px' h='22px' color='white' />} />
              <VStack align='start' spacing={0}>
                <Text fontWeight='600'>Pre-trip</Text>
                <Text fontSize='sm' color={textSecondary}>{completedPre}/{pretripItems.length} completed</Text>
              </VStack>
            </HStack>
            <Button size='sm' onClick={exportCSV}>Export CSV</Button>
          </HStack>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing='8px'>
            {pretripItems.map(i => (
              <Checkbox key={i.key} isChecked={pretrip[i.key]} onChange={e=>setPretrip(p=>({ ...p, [i.key]: e.target.checked }))}>{i.label}</Checkbox>
            ))}
          </SimpleGrid>
          <Box h='1px' bg={border} my='14px' />
          <HStack mb='8px'>
            <Icon as={MdAccessTime} />
            <Text fontWeight='600'>Post-trip</Text>
            <Badge ml='auto'>{completedPost}/{posttripItems.length}</Badge>
          </HStack>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing='8px'>
            {posttripItems.map(i => (
              <Checkbox key={i.key} isChecked={posttrip[i.key]} onChange={e=>setPosttrip(p=>({ ...p, [i.key]: e.target.checked }))}>{i.label}</Checkbox>
            ))}
          </SimpleGrid>
        </Card>

        <Card p='16px'>
          <Text fontSize='lg' fontWeight='bold' mb='8px'>Documents & Expiry</Text>
          <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
            <Box maxH='260px' overflowY='auto'>
              <Table size='sm' variant='simple'>
                <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Number</Th>
                    <Th>Expiry</Th>
                    <Th>Status</Th>
                    <Th textAlign='right'>Upload</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {documents.map(doc => (
                    <Tr key={doc.type}>
                      <Td>{doc.type}</Td>
                      <Td>{doc.number}</Td>
                      <Td>{doc.expires}</Td>
                      <Td>
                        <Badge colorScheme={doc.status.includes('Expiring') ? 'orange' : 'green'}>{doc.status}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Button size='xs' leftIcon={<MdCloudUpload />} onClick={uploadDisc.onOpen}>Upload</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
          <Box mt='12px'>
            <Text fontSize='lg' fontWeight='bold' mb='8px'>Maintenance</Text>
            <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
              <Table size='sm' variant='simple'>
                <Thead bg={useColorModeValue('white','gray.800')}>
                  <Tr>
                    <Th>#</Th>
                    <Th>Task</Th>
                    <Th>Due Date</Th>
                    <Th>Odometer</Th>
                    <Th>Priority</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {maintenance.map(m => (
                    <Tr key={m.id}>
                      <Td>{m.id}</Td>
                      <Td>{m.title}</Td>
                      <Td>{m.dueAt}</Td>
                      <Td>{m.odometer}</Td>
                      <Td>
                        <Badge colorScheme={m.priority === 'High' ? 'red' : m.priority === 'Medium' ? 'orange' : 'gray'}>{m.priority}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Card>
      </SimpleGrid>

      <Card p='16px' mt='20px'>
        <HStack justify='space-between' mb='12px' flexWrap='wrap' rowGap={2}>
          <HStack>
            <Select size='sm' value={issueType} onChange={e=>setIssueType(e.target.value)}>
              <option value='all'>All Categories</option>
              <option value='vehicle'>Vehicle</option>
              <option value='safety'>Safety</option>
              <option value='cleanliness'>Cleanliness</option>
              <option value='documentation'>Documentation</option>
            </Select>
            <Select size='sm' value={issueStatus} onChange={e=>setIssueStatus(e.target.value)}>
              <option value='all'>All Status</option>
              <option value='open'>Open</option>
              <option value='in_progress'>In Progress</option>
              <option value='resolved'>Resolved</option>
            </Select>
          </HStack>
          <HStack>
            <InputGroup size='sm'>
              <InputLeftElement children={<MdSearch />} />
              <Input placeholder='Search issues...' value={issueQuery} onChange={e=>setIssueQuery(e.target.value)} />
            </InputGroup>
            <Button size='sm' onClick={exportIssuesCSV}>Export CSV</Button>
            <Button size='sm' leftIcon={<MdAdd />} colorScheme='blue' onClick={issueDisc.onOpen}>Add Issue</Button>
          </HStack>
        </HStack>
        <Box borderWidth='1px' borderColor={border} borderRadius='10px' overflow='hidden'>
          <Box maxH='360px' overflowY='auto'>
            <Table size='sm' variant='simple'>
              <Thead position='sticky' top={0} zIndex={1} bg={useColorModeValue('white','gray.800')}>
                <Tr>
                  <Th>ID</Th>
                  <Th>Category</Th>
                  <Th>Title</Th>
                  <Th>Severity</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredIssues.map(i => (
                  <Tr key={i.id}>
                    <Td>{i.id}</Td>
                    <Td><Badge>{i.category}</Badge></Td>
                    <Td maxW='360px'><Text noOfLines={1}>{i.title}</Text></Td>
                    <Td><Badge colorScheme={i.severity==='high'?'red':i.severity==='medium'?'orange':'gray'}>{i.severity}</Badge></Td>
                    <Td><Badge colorScheme={i.status==='resolved'?'green':i.status==='in_progress'?'orange':'red'}>{i.status}</Badge></Td>
                    <Td>{i.created}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <Modal isOpen={uploadDisc.isOpen} onClose={uploadDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select value={uploadDoc.type} onChange={e=>setUploadDoc(d=>({ ...d, type: e.target.value }))}>
                <option>Driving License</option>
                <option>Vehicle Registration</option>
                <option>Insurance</option>
                <option>Fitness/Emission</option>
              </Select>
              <Input placeholder='Document number' value={uploadDoc.number} onChange={e=>setUploadDoc(d=>({ ...d, number: e.target.value }))} />
              <Input type='file' accept='image/*,application/pdf' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={uploadDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={uploadDisc.onClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={issueDisc.isOpen} onClose={issueDisc.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Issue</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align='stretch' spacing={3}>
              <Select value={newIssue.category} onChange={e=>setNewIssue(i=>({ ...i, category: e.target.value }))}>
                <option value='vehicle'>Vehicle</option>
                <option value='safety'>Safety</option>
                <option value='cleanliness'>Cleanliness</option>
                <option value='documentation'>Documentation</option>
              </Select>
              <Select value={newIssue.severity} onChange={e=>setNewIssue(i=>({ ...i, severity: e.target.value }))}>
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
              </Select>
              <Textarea placeholder='Describe the issue...' value={newIssue.description} onChange={e=>setNewIssue(i=>({ ...i, description: e.target.value }))} />
              <Input type='file' accept='image/*' />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={issueDisc.onClose}>Cancel</Button>
            <Button colorScheme='blue' onClick={issueDisc.onClose}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
