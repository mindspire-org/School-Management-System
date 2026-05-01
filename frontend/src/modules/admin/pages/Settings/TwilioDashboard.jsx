import React, { useEffect, useState, useCallback } from 'react';
import {
    Alert, AlertIcon, AlertTitle, AlertDescription,
    Badge, Box, Button, Card, CardBody, CardHeader,
    Flex, FormControl, FormLabel, FormHelperText, Heading, HStack,
    Input, Select, SimpleGrid, Spinner, Stat, StatLabel,
    StatNumber, StatHelpText, Table, Tbody, Td, Text,
    Th, Thead, Tr, useToast, VStack, Icon, Divider,
    Tooltip, Tag, TagLabel, useColorModeValue, Tabs, TabList, TabPanels, Tab, TabPanel, GridItem
} from '@chakra-ui/react';
import {
    MdRefresh, MdSend, MdMessage, MdPhone, MdAccountCircle,
    MdCheckCircle, MdError, MdWhatsapp, MdSettings, MdOpenInNew, MdDataUsage
} from 'react-icons/md';
import { FaWhatsapp, FaSms } from 'react-icons/fa';
import { http } from '../../../../services/http';

const api = {
    account: () => http.get('/twilio-dashboard/account'),
    messages: (pageSize = 50) => http.get(`/twilio-dashboard/messages?pageSize=${pageSize}`),
    numbers: () => http.get('/twilio-dashboard/numbers'),
    testSend: (data) => http.post('/twilio-dashboard/test-send', data),
};

const statusColor = (s) => {
    if (!s) return 'gray';
    const m = { delivered: 'green', sent: 'blue', queued: 'yellow', failed: 'red', undelivered: 'red', received: 'purple', read: 'teal' };
    return m[s.toLowerCase()] || 'gray';
};

const directionIcon = (d) => d?.includes('inbound') ? '⬇️' : '⬆️';

const formatDate = (d) => {
    if (!d) return '—';
    try {
        const date = new Date(d);
        return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return d; }
};

const StatCard = ({ label, value, helper, color = 'blue.500', icon: Ic, bgIcon }) => {
    const bgCard = useColorModeValue('white', 'gray.800');
    return (
        <Card bg={bgCard} shadow="sm" borderRadius="xl" overflow="hidden">
            <CardBody>
                <HStack justify="space-between" align="start">
                    <Stat>
                        <StatLabel color="gray.500" fontWeight="medium" mb={1}>{label}</StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="bold" color="gray.800">{value ?? '—'}</StatNumber>
                        {helper && <StatHelpText mt={2} mb={0} fontSize="xs" fontWeight="medium">{helper}</StatHelpText>}
                    </Stat>
                    {Ic && (
                        <Box p={3} bg={bgIcon || `${color.split('.')[0]}.50`} rounded="xl">
                            <Icon as={Ic} boxSize={7} color={color} />
                        </Box>
                    )}
                </HStack>
            </CardBody>
        </Card>
    );
};

export default function TwilioDashboard() {
    const toast = useToast();
    const bgCard = useColorModeValue('white', 'gray.800');
    const textMuted = useColorModeValue('gray.500', 'gray.400');

    // Data states
    const [account, setAccount] = useState(null);
    const [messages, setMessages] = useState([]);
    const [numbers, setNumbers] = useState([]);
    const [loading, setLoading] = useState({ account: true, messages: false, numbers: false });

    // Test send form
    const [testTo, setTestTo] = useState('');
    const [testBody, setTestBody] = useState('Hello from your School Management System! 🚀 This is a test message to verify the connection is active.');
    const [testChannel, setTestChannel] = useState('whatsapp');
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const loadAccount = useCallback(async () => {
        setLoading((p) => ({ ...p, account: true }));
        try { setAccount(await api.account()); } catch (_) { }
        setLoading((p) => ({ ...p, account: false }));
    }, []);

    const loadMessages = useCallback(async () => {
        setLoading((p) => ({ ...p, messages: true }));
        try { const r = await api.messages(50); setMessages(r?.messages || []); } catch (_) { }
        setLoading((p) => ({ ...p, messages: false }));
    }, []);

    const loadNumbers = useCallback(async () => {
        setLoading((p) => ({ ...p, numbers: true }));
        try { const r = await api.numbers(); setNumbers(r?.numbers || []); } catch (_) { }
        setLoading((p) => ({ ...p, numbers: false }));
    }, []);

    useEffect(() => { loadAccount(); }, [loadAccount]);

    const handleTabChange = (index) => {
        if (index === 1 && messages.length === 0) loadMessages();
        if (index === 2 && numbers.length === 0) loadNumbers();
    };

    const handleTestSend = async () => {
        if (!testTo.trim()) { toast({ title: 'Enter a recipient number', status: 'warning' }); return; }
        setTestLoading(true);
        setTestResult(null);
        try {
            const r = await api.testSend({ to: testTo.trim(), body: testBody, channel: testChannel });
            setTestResult(r);
            if (r?.ok) {
                toast({ title: 'Message Sent Successfully', description: `SID: ${r.sid}`, status: 'success' });
                // Refresh messages if we are on the messages tab
            } else {
                toast({ title: 'Delivery Failed', description: r?.error, status: 'error', duration: 8000, isClosable: true });
            }
        } catch (e) {
            toast({ title: 'Error', description: e?.message, status: 'error' });
        }
        setTestLoading(false);
    };

    const notConfigured = account && !account.configured;

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            {/* Header */}
            <Flex mb={8} justify="space-between" align="center" wrap="wrap" gap={3}>
                <Box>
                    <HStack mb={2}>
                        <Icon as={FaWhatsapp} color="green.500" boxSize={8} />
                        <Heading as="h3" size="lg">Communication Dashboard</Heading>
                    </HStack>
                    <Text color={textMuted}>Live analytics, message logs, and account health via Twilio</Text>
                </Box>
                <HStack>
                    <Button as="a" href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" rightIcon={<MdOpenInNew />} variant="outline" colorScheme="purple">
                        Open Twilio Console
                    </Button>
                    <Button leftIcon={<MdRefresh />} onClick={loadAccount} isLoading={loading.account}>Sync Data</Button>
                </HStack>
            </Flex>

            {notConfigured && (
                <Alert status="error" mb={8} borderRadius="xl" borderLeft="4px solid" borderColor="red.400" shadow="sm">
                    <AlertIcon boxSize="20px" mr={4} />
                    <Box>
                        <AlertTitle fontSize="md" mb={1}>Twilio Gateway Not Configured</AlertTitle>
                        <AlertDescription fontSize="sm">
                            Messaging services are currently disabled. Please go to <strong>Settings → Twilio Configuration</strong> to enter your API credentials and sender numbers.
                        </AlertDescription>
                    </Box>
                </Alert>
            )}

            <Tabs variant="soft-rounded" colorScheme="blue" onChange={handleTabChange} isLazy>
                <TabList mb={6} overflowX="auto" py={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                    <Tab fontWeight="600" borderRadius="full" px={6} mr={2}><Icon as={MdDataUsage} mr={2} /> Overview</Tab>
                    <Tab fontWeight="600" borderRadius="full" px={6} mr={2}><Icon as={MdMessage} mr={2} /> Message Logs</Tab>
                    <Tab fontWeight="600" borderRadius="full" px={6} mr={2}><Icon as={MdPhone} mr={2} /> Phone Numbers</Tab>
                    <Tab fontWeight="600" borderRadius="full" px={6}><Icon as={MdSend} mr={2} /> Test Gateway</Tab>
                </TabList>

                <TabPanels>
                    {/* ── OVERVIEW TAB ── */}
                    <TabPanel px={0} pt={4}>
                        {loading.account ? (
                            <Flex justify="center" py={20}><Spinner color="blue.500" size="xl" thickness="3px" /></Flex>
                        ) : account?.configured ? (
                            <>
                                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} mb={8}>
                                    <StatCard label="Account Name" value={account.friendlyName} icon={MdAccountCircle} color="blue.500" />
                                    <StatCard label="Live Status" value={<Badge colorScheme={account.status === 'active' ? 'green' : 'red'} px={3} py={1} borderRadius="md" fontSize="md">{account.status?.toUpperCase()}</Badge>} icon={account.status === 'active' ? MdCheckCircle : MdError} color={account.status === 'active' ? 'green.500' : 'red.500'} bgIcon={account.status === 'active' ? 'green.50' : 'red.50'} />
                                    <StatCard label="Available Balance" value={`${account.currency || '$'} ${parseFloat(account.balance || 0).toFixed(2)}`} icon={MdSettings} color="purple.500" helper="Deducted per outbound SMS/WhatsApp" />
                                    <StatCard label="Account Type" value={account.type?.toUpperCase()} icon={MdSettings} color="orange.400" />
                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                    <Card shadow="sm" borderRadius="xl" borderTop="4px solid" borderColor="green.400">
                                        <CardBody>
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={FaWhatsapp} boxSize={6} color="green.500" />
                                                <Heading size="sm">WhatsApp Sender Channel</Heading>
                                            </HStack>
                                            <Box bg="gray.50" p={4} borderRadius="lg" border="1px solid" borderColor="gray.100">
                                                <Text fontFamily="mono" fontSize="lg" fontWeight="bold" color={account.waFrom ? 'green.700' : 'red.500'}>
                                                    {account.waFrom || '❌ Not configured'}
                                                </Text>
                                                {account.waFrom?.includes('14155238886') && (
                                                    <Badge colorScheme="orange" mt={2} variant="subtle">SANDBOX MODE</Badge>
                                                )}
                                            </Box>
                                        </CardBody>
                                    </Card>

                                    <Card shadow="sm" borderRadius="xl" borderTop="4px solid" borderColor="blue.400">
                                        <CardBody>
                                            <HStack spacing={3} mb={4}>
                                                <Icon as={FaSms} boxSize={6} color="blue.500" />
                                                <Heading size="sm">SMS Fallback Channel</Heading>
                                            </HStack>
                                            <Box bg="gray.50" p={4} borderRadius="lg" border="1px solid" borderColor="gray.100">
                                                <Text fontFamily="mono" fontSize="lg" fontWeight="bold" color={account.smsFrom ? 'blue.700' : 'gray.400'}>
                                                    {account.smsFrom || '— Not configured (Optional)'}
                                                </Text>
                                                {!account.smsFrom && <Text fontSize="xs" color="gray.500" mt={2}>SMS texts will not be sent if WhatsApp fails.</Text>}
                                            </Box>
                                        </CardBody>
                                    </Card>
                                </SimpleGrid>
                            </>
                        ) : (
                            <Flex justify="center" py={10}><Text color="gray.400">Unable to establish connection to Twilio API.</Text></Flex>
                        )}
                    </TabPanel>

                    {/* ── MESSAGE LOGS TAB ── */}
                    <TabPanel px={0} pt={4}>
                        <Card shadow="sm" borderRadius="xl">
                            <CardHeader borderBottomWidth="1px" pb={4} pt={6} px={6}>
                                <HStack justify="space-between" wrap="wrap" gap={4}>
                                    <Heading size="md" color="gray.800">Recent Communication History</Heading>
                                    <Button size="sm" leftIcon={<MdRefresh />} onClick={loadMessages} isLoading={loading.messages} variant="outline" colorScheme="blue" borderRadius="full">Refresh Logs</Button>
                                </HStack>
                            </CardHeader>
                            <CardBody px={0} py={0} overflowX="auto">
                                {loading.messages ? (
                                    <Flex justify="center" py={16}><Spinner color="blue.500" size="lg" /></Flex>
                                ) : messages.length === 0 ? (
                                    <Flex direction="column" align="center" py={16} color="gray.400">
                                        <Icon as={MdMessage} boxSize={10} mb={3} opacity={0.5} />
                                        <Text>No traffic found in the last 50 entries.</Text>
                                    </Flex>
                                ) : (
                                    <Table variant="simple" size="sm">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th py={4} pl={6}>Dir</Th>
                                                <Th py={4}>From → To</Th>
                                                <Th py={4}>Message Body</Th>
                                                <Th py={4}>Status</Th>
                                                <Th py={4}>Timestamp</Th>
                                                <Th py={4} isNumeric pr={6}>Cost</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {messages.map((m) => (
                                                <Tr key={m.sid} _hover={{ bg: 'blue.50' }} transition="background 0.2s">
                                                    <Td pl={6} fontSize="xl" title={m.direction}>{directionIcon(m.direction)}</Td>
                                                    <Td>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontFamily="mono" fontSize="xs" color="gray.500">From: {m.from}</Text>
                                                            <Text fontFamily="mono" fontSize="xs" fontWeight="bold" color="blue.600">To: {m.to}</Text>
                                                        </VStack>
                                                    </Td>
                                                    <Td maxW="300px">
                                                        <Tooltip label={m.body} hasArrow placement="top">
                                                            <Text fontSize="sm" noOfLines={1} color="gray.700">{m.body}</Text>
                                                        </Tooltip>
                                                        {m.errorMessage && (
                                                            <Text fontSize="2xs" color="red.500" mt={1} fontWeight="bold">Error: {m.errorMessage}</Text>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        <Badge colorScheme={statusColor(m.status)} px={2} py={0.5} borderRadius="full">{m.status.toUpperCase()}</Badge>
                                                    </Td>
                                                    <Td fontSize="xs" color="gray.600" whiteSpace="nowrap">{formatDate(m.dateSent || m.dateCreated)}</Td>
                                                    <Td isNumeric pr={6} fontSize="xs" fontFamily="mono">
                                                        {m.price ? <Badge colorScheme="red" variant="subtle">{m.currency.toUpperCase()} {Math.abs(parseFloat(m.price)).toFixed(4)}</Badge> : '—'}
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* ── PHONE NUMBERS TAB ── */}
                    <TabPanel px={0} pt={4}>
                        <Card shadow="sm" borderRadius="xl">
                            <CardHeader borderBottomWidth="1px" pb={4} pt={6} px={6}>
                                <HStack justify="space-between">
                                    <Heading size="md" color="gray.800">Purchased Phone Numbers</Heading>
                                    <Button size="sm" leftIcon={<MdRefresh />} onClick={loadNumbers} isLoading={loading.numbers} variant="outline" colorScheme="blue" borderRadius="full">Refresh Inventory</Button>
                                </HStack>
                            </CardHeader>
                            <CardBody p={6}>
                                {loading.numbers ? (
                                    <Flex justify="center" py={12}><Spinner color="blue.500" /></Flex>
                                ) : numbers.length === 0 ? (
                                    <VStack py={12} spacing={5} bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.300">
                                        <Text color="gray.500">No active phone numbers associated with this Twilio account.</Text>
                                        <Button as="a" href="https://console.twilio.com/us1/develop/phone-numbers/manage/search" target="_blank" colorScheme="blue" size="md" rightIcon={<MdOpenInNew />} borderRadius="full">
                                            Buy a Number in Twilio
                                        </Button>
                                    </VStack>
                                ) : (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                        {numbers.map((n) => (
                                            <Card key={n.sid} variant="outline" borderColor="gray.200" shadow="sm" _hover={{ shadow: 'md', borderColor: 'blue.300' }} transition="all 0.2s">
                                                <CardBody>
                                                    <VStack align="stretch" spacing={3}>
                                                        <Text fontSize="2xl" fontWeight="bold" fontFamily="mono" color="gray.800">{n.phoneNumber}</Text>
                                                        <Text fontSize="sm" color="gray.500" fontWeight="medium">{n.friendlyName}</Text>
                                                        <Divider />
                                                        <HStack spacing={2} pt={1}>
                                                            {n.capabilities?.sms && <Tag size="sm" colorScheme="blue" borderRadius="full"><TagLabel>SMS</TagLabel></Tag>}
                                                            {n.capabilities?.voice && <Tag size="sm" colorScheme="orange" borderRadius="full"><TagLabel>VOICE</TagLabel></Tag>}
                                                            {n.capabilities?.mms && <Tag size="sm" colorScheme="purple" borderRadius="full"><TagLabel>MMS</TagLabel></Tag>}
                                                        </HStack>
                                                        <Text fontSize="2xs" color="gray.400" textAlign="right">Acquired: {formatDate(n.dateCreated)}</Text>
                                                    </VStack>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </SimpleGrid>
                                )}
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* ── TEST SEND TAB ── */}
                    <TabPanel px={0} pt={4}>
                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                            <GridItem>
                                <Card shadow="sm" borderRadius="xl">
                                    <CardBody p={8}>
                                        <HStack mb={6} spacing={3}>
                                            <Box p={2} bg="teal.50" rounded="md"><Icon as={MdSend} color="teal.500" boxSize={6} /></Box>
                                            <Heading size="md">Test Gateway Form</Heading>
                                        </HStack>
                                        <VStack spacing={6} align="stretch">
                                            <FormControl isRequired>
                                                <FormLabel fontWeight="600">Communication Channel</FormLabel>
                                                <Select size="lg" bg="white" value={testChannel} onChange={(e) => setTestChannel(e.target.value)}>
                                                    <option value="whatsapp">WhatsApp (Rich Text)</option>
                                                    <option value="sms">Standard SMS</option>
                                                </Select>
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel fontWeight="600">Recipient Mobile Number</FormLabel>
                                                <Input size="lg" bg="white" placeholder="e.g. +923001234567" value={testTo} onChange={(e) => setTestTo(e.target.value)} fontFamily="mono" />
                                                <FormHelperText>Include country code without spaces.</FormHelperText>
                                            </FormControl>

                                            <FormControl isRequired>
                                                <FormLabel fontWeight="600">Message Content</FormLabel>
                                                <Input size="lg" bg="white" value={testBody} onChange={(e) => setTestBody(e.target.value)} />
                                            </FormControl>

                                            <Button mt={2} size="lg" colorScheme="teal" leftIcon={<MdSend />} onClick={handleTestSend} isLoading={testLoading} loadingText="Transmitting..." borderRadius="full" shadow="md">
                                                Transmit Message
                                            </Button>

                                            {testResult && (
                                                <Alert mt={4} status={testResult.ok ? 'success' : 'error'} borderRadius="lg" borderLeft="4px solid" shadow="sm">
                                                    <AlertIcon />
                                                    <Box flex="1">
                                                        <AlertTitle fontSize="sm">{testResult.ok ? 'Transmission Successful' : 'Transmission Failed'}</AlertTitle>
                                                        <AlertDescription display="block" fontSize="xs" mt={1}>
                                                            {testResult.ok ? (
                                                                <Flex justify="space-between" align="center">
                                                                    <Text fontFamily="mono">SID: {testResult.sid}</Text>
                                                                    <Badge colorScheme="green">{testResult.status}</Badge>
                                                                </Flex>
                                                            ) : (
                                                                <Text fontWeight="bold">{testResult.error}</Text>
                                                            )}
                                                        </AlertDescription>
                                                    </Box>
                                                </Alert>
                                            )}
                                        </VStack>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem>
                                {testChannel === 'whatsapp' && (
                                    <Card bg="blue.50" shadow="none" border="1px solid" borderColor="blue.100" borderRadius="xl">
                                        <CardBody>
                                            <Heading size="sm" mb={4} color="blue.800" display="flex" align="center">
                                                <Icon as={FaWhatsapp} mr={2} color="green.500" /> WhatsApp Testing Requirements
                                            </Heading>
                                            <Text fontSize="sm" color="blue.900" mb={4}>
                                                Before sending a WhatsApp message to a number in Sandbox mode, the recipient MUST opt-in.
                                            </Text>
                                            <Box bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.200">
                                                <Text fontSize="sm" fontWeight="bold" mb={2}>Step 1: Open WhatsApp on the destination phone</Text>
                                                <Text fontSize="sm" fontWeight="bold" mb={2}>Step 2: Send a message to <b>+14155238886</b></Text>
                                                <Text fontSize="sm" fontWeight="bold" mb={2}>Step 3: Type exactly: <Badge colorScheme="orange" fontSize="sm">join machine-contrast</Badge></Text>
                                                <Text fontSize="sm" color="gray.500" mt={3} fontStyle="italic">Once you receive the confirmation reply from Twilio, you can test sending messages from this form!</Text>
                                            </Box>
                                        </CardBody>
                                    </Card>
                                )}
                            </GridItem>
                        </SimpleGrid>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
}
