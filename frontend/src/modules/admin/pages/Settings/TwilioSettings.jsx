import React, { useEffect, useState } from 'react';
import {
    Alert, AlertIcon, AlertTitle, AlertDescription,
    Box, Button, ButtonGroup, Card, CardBody,
    FormControl, FormHelperText, FormLabel,
    Heading, HStack, Input, InputGroup, InputLeftAddon,
    InputRightElement, IconButton, Spinner, Tag, Text,
    VStack, useToast, SimpleGrid, GridItem, Icon, Divider,
    Badge, useColorModeValue
} from '@chakra-ui/react';
import { MdSave, MdRefresh, MdVisibility, MdVisibilityOff, MdCheckCircle, MdCancel, MdVpnKey, MdPhone, MdLink, MdSupportAgent, MdCheck, MdSettings } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { http } from '../../../../services/http';

const KEYS = {
    sid: 'twilio.account_sid',
    token: 'twilio.auth_token',
    waFrom: 'twilio.whatsapp_from',
    smsFrom: 'twilio.sms_from',
};

const getByKey = (key) => http.get(`/settings/${encodeURIComponent(key)}`).catch(() => null);
const upsertKey = (key, value) => http.put(`/settings/${encodeURIComponent(key)}`, { value });

export default function TwilioSettings() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const [sid, setSid] = useState('');
    const [token, setToken] = useState('');
    const [waFrom, setWaFrom] = useState('');
    const [smsFrom, setSmsFrom] = useState('');

    const bgCard = useColorModeValue('white', 'gray.800');
    const bgInfo = useColorModeValue('blue.50', 'blue.900');
    const textMuted = useColorModeValue('gray.500', 'gray.400');

    const load = async () => {
        setLoading(true);
        try {
            const [s, t, wa, sms] = await Promise.all([
                getByKey(KEYS.sid),
                getByKey(KEYS.token),
                getByKey(KEYS.waFrom),
                getByKey(KEYS.smsFrom),
            ]);
            setSid(s?.value || '');
            setToken(t?.value || '');
            setWaFrom(wa?.value || '');
            setSmsFrom(sms?.value || '');
        } catch (_) { }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await Promise.all([
                upsertKey(KEYS.sid, sid.trim()),
                upsertKey(KEYS.token, token.trim()),
                upsertKey(KEYS.waFrom, waFrom.trim()),
                upsertKey(KEYS.smsFrom, smsFrom.trim()),
            ]);
            toast({ title: 'Twilio settings saved successfully.', status: 'success', duration: 3000 });
            setTestResult(null);
        } catch (e) {
            toast({ title: 'Failed to save', description: e?.message, status: 'error' });
        }
        setSaving(false);
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            if (!sid.trim() || !token.trim() || !waFrom.trim()) {
                setTestResult({ ok: false, message: 'Please fill in Account SID, Auth Token, and WhatsApp From.' });
                setTesting(false);
                return;
            }
            const b64 = btoa(`${sid.trim()}:${token.trim()}`);
            const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid.trim())}.json`, {
                headers: { Authorization: `Basic ${b64}` },
            });
            if (resp.ok) {
                const data = await resp.json().catch(() => ({}));
                setTestResult({ ok: true, message: `Connected! Account: ${data.friendly_name || sid}` });
            } else {
                const data = await resp.json().catch(() => ({}));
                setTestResult({ ok: false, message: data?.message || 'Invalid Twilio credentials.' });
            }
        } catch (e) {
            setTestResult({ ok: false, message: e?.message || 'Connection failed.' });
        }
        setTesting(false);
    };

    if (loading) return <Box pt={{ base: '130px', md: '80px' }}><Spinner size="xl" color="blue.500" /></Box>;

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <HStack justify="space-between" mb={8} wrap="wrap" gap={4}>
                <Box>
                    <HStack mb={1}>
                        <Icon as={MdSettings} boxSize={7} color="blue.500" />
                        <Heading as="h3" size="lg">Twilio Configuration</Heading>
                    </HStack>
                    <Text color={textMuted}>Manage your WhatsApp and SMS gateway credentials.</Text>
                </Box>
                <ButtonGroup size="md">
                    <Button leftIcon={<MdRefresh />} variant="outline" onClick={load} isLoading={loading}>Refresh</Button>
                    <Button leftIcon={<MdSave />} colorScheme="blue" onClick={handleSave} isLoading={saving}>Save Changes</Button>
                </ButtonGroup>
            </HStack>

            <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={8}>
                {/* Left Column - Forms */}
                <GridItem colSpan={{ base: 1, xl: 2 }}>
                    <VStack spacing={6} align="stretch">

                        {/* Credentials Card */}
                        <Card bg={bgCard} shadow="sm" borderRadius="xl">
                            <CardBody py={6} px={8}>
                                <HStack mb={6} spacing={3}>
                                    <Box p={2} bg="blue.50" rounded="md"><Icon as={MdVpnKey} color="blue.500" boxSize={5} /></Box>
                                    <Heading size="md">Account Credentials</Heading>
                                </HStack>
                                <VStack spacing={5} align="stretch">
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="600">Account SID</FormLabel>
                                        <Input
                                            size="lg"
                                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                            value={sid}
                                            onChange={(e) => setSid(e.target.value)}
                                            fontFamily="mono"
                                            bg="white"
                                        />
                                        <FormHelperText>Your unique Twilio Account Identifier. Starts with "AC".</FormHelperText>
                                    </FormControl>

                                    <FormControl isRequired>
                                        <FormLabel fontWeight="600">Auth Token</FormLabel>
                                        <InputGroup size="lg">
                                            <Input
                                                type={showToken ? 'text' : 'password'}
                                                placeholder="Your Twilio Auth Token"
                                                value={token}
                                                onChange={(e) => setToken(e.target.value)}
                                                fontFamily="mono"
                                                pr="4rem"
                                                bg="white"
                                            />
                                            <InputRightElement width="4rem">
                                                <IconButton
                                                    h="1.75rem" size="sm" variant="ghost"
                                                    icon={showToken ? <MdVisibilityOff /> : <MdVisibility />}
                                                    onClick={() => setShowToken(!showToken)}
                                                    aria-label="Toggle visibility"
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                        <FormHelperText>Keep this secret. This functions as your API password.</FormHelperText>
                                    </FormControl>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Sender Numbers Card */}
                        <Card bg={bgCard} shadow="sm" borderRadius="xl">
                            <CardBody py={6} px={8}>
                                <HStack mb={6} spacing={3}>
                                    <Box p={2} bg="green.50" rounded="md"><Icon as={MdPhone} color="green.500" boxSize={5} /></Box>
                                    <Heading size="md">Sender Numbers</Heading>
                                </HStack>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                    <FormControl isRequired>
                                        <FormLabel fontWeight="600">WhatsApp From Number</FormLabel>
                                        <InputGroup size="lg">
                                            <InputLeftAddon bg="gray.50">whatsapp:</InputLeftAddon>
                                            <Input
                                                placeholder="+14155238886"
                                                value={waFrom.replace(/^whatsapp:/i, '')}
                                                onChange={(e) => setWaFrom(`whatsapp:${e.target.value}`)}
                                                fontFamily="mono"
                                                bg="white"
                                            />
                                        </InputGroup>
                                        <FormHelperText mt={2}>Sandbox: <Badge>+14155238886</Badge></FormHelperText>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="600">SMS From Number <Text as="span" fontWeight="normal" color="gray.400" fontSize="sm">(optional)</Text></FormLabel>
                                        <Input
                                            size="lg"
                                            placeholder="+14155238886 or Twilio Number"
                                            value={smsFrom}
                                            onChange={(e) => setSmsFrom(e.target.value)}
                                            fontFamily="mono"
                                            bg="white"
                                        />
                                        <FormHelperText mt={2}>Fallback number used if WhatsApp delivery fails.</FormHelperText>
                                    </FormControl>
                                </SimpleGrid>
                            </CardBody>
                        </Card>

                        {/* Webhook Configuration Card */}
                        <Card bg={bgCard} shadow="sm" borderRadius="xl" borderLeft="4px solid" borderColor="purple.400">
                            <CardBody py={6} px={8}>
                                <HStack mb={4} spacing={3}>
                                    <Box p={2} bg="purple.50" rounded="md"><Icon as={MdLink} color="purple.500" boxSize={5} /></Box>
                                    <Heading size="md">Inbound Webhook</Heading>
                                </HStack>
                                <Text color={textMuted} mb={4}>
                                    To receive replies from parents directly inside the software, paste this URL into your Twilio WhatsApp configuration under "When a message comes in".
                                </Text>
                                <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4} fontFamily="mono" fontSize="sm" color="gray.800" display="flex" justifyContent="space-between" alignItems="center">
                                    <Text>{window.location.origin.replace(':5173', ':5000')}/api/webhooks/twilio/messages</Text>
                                    <Badge colorScheme="purple">HTTP POST</Badge>
                                </Box>
                            </CardBody>
                        </Card>

                        {/* Connection Test */}
                        <Card bg="transparent" shadow="none">
                            <CardBody px={0}>
                                <HStack spacing={4}>
                                    <Button
                                        size="lg"
                                        colorScheme="teal"
                                        leftIcon={<MdSupportAgent />}
                                        onClick={handleTest}
                                        isLoading={testing}
                                        loadingText="Verifying..."
                                        shadow="md"
                                    >
                                        Test API Connection
                                    </Button>
                                    {testResult && (
                                        <Tag colorScheme={testResult.ok ? 'green' : 'red'} size="lg" px={4} py={3} borderRadius="full">
                                            {testResult.ok ? <MdCheckCircle size={20} style={{ marginRight: 8 }} /> : <MdCancel size={20} style={{ marginRight: 8 }} />}
                                            <TagLabel fontWeight="bold">{testResult.message}</TagLabel>
                                        </Tag>
                                    )}
                                </HStack>
                            </CardBody>
                        </Card>
                    </VStack>
                </GridItem>

                {/* Right Column - Information */}
                <GridItem>
                    <VStack spacing={6} align="stretch" position="sticky" top="100px">
                        <Card bg={bgInfo} shadow="none" borderRadius="xl" borderWidth="1px" borderColor="blue.100">
                            <CardBody>
                                <Heading size="sm" mb={4} color="blue.800" display="flex" alignItems="center">
                                    <Icon as={MdSupportAgent} mr={2} /> Quick Guide
                                </Heading>
                                <VStack align="stretch" spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="blue.900" mb={1}>Where to find credentials?</Text>
                                        <Text fontSize="sm" color="blue.700">Log in to <a href="https://console.twilio.com" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Twilio Console</a>. Your Account SID and Auth Token are on the main dashboard.</Text>
                                    </Box>
                                    <Divider borderColor="blue.200" />
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm" color="blue.900" mb={1}>Sandbox vs Production</Text>
                                        <Text fontSize="sm" color="blue.700" mb={2}>
                                            <b>Sandbox:</b> Parents must send "join machine-contrast" to +14155238886 before receiving messages.
                                        </Text>
                                        <Text fontSize="sm" color="blue.700">
                                            <b>Production:</b> Register your business and purchase a number in Twilio to send messages to anyone without a join code.
                                        </Text>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Card shadow="sm" borderRadius="xl">
                            <CardBody>
                                <Heading size="sm" mb={4} display="flex" alignItems="center">
                                    <Icon as={FaWhatsapp} color="green.500" mr={2} /> WhatsApp Benefits
                                </Heading>
                                <VStack align="stretch" spacing={3}>
                                    <HStack alignItems="start"><Icon as={MdCheck} color="green.500" mt={1} /><Text fontSize="sm">Rich text messages</Text></HStack>
                                    <HStack alignItems="start"><Icon as={MdCheck} color="green.500" mt={1} /><Text fontSize="sm">Higher read rates</Text></HStack>
                                    <HStack alignItems="start"><Icon as={MdCheck} color="green.500" mt={1} /><Text fontSize="sm">Free inbound replies</Text></HStack>
                                    <HStack alignItems="start"><Icon as={MdCheck} color="green.500" mt={1} /><Text fontSize="sm">Global reach</Text></HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    </VStack>
                </GridItem>
            </SimpleGrid>
        </Box>
    );
}
