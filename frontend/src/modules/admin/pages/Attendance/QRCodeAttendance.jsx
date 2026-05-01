import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    useColorModeValue,
    VStack,
    HStack,
    InputGroup,
    InputLeftElement,
    Input,
    List,
    ListItem,
    Icon,
    useToast,
    Spinner,
    Select,
    useOutsideClick,
} from '@chakra-ui/react';
import { MdQrCodeScanner } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import { useAuth } from '../../../../contexts/AuthContext';
import { qrAttendanceApi, studentsApi, teachersApi } from '../../../../services/api';
import { useNavigate } from 'react-router-dom';

const toIntId = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const asString = String(value);
    const direct = parseInt(asString, 10);
    if (Number.isFinite(direct)) return direct;
    const m = asString.match(/(\d+)\s*$/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : null;
};

const normalizeAttendanceType = (t, fallback) => {
    const v = String(t || '').toLowerCase();
    if (v === 'student') return 'Student';
    if (v === 'teacher' || v === 'staff') return 'Teacher';
    return fallback;
};

const parseQrPayload = (raw, fallbackType) => {
    const text = String(raw || '').trim();
    if (!text) return null;

    try {
        const obj = JSON.parse(text);
        if (obj && typeof obj === 'object') {
            const attendanceType = normalizeAttendanceType(obj.attendanceType || obj.type || obj.role, fallbackType);
            const personId = toIntId(obj.personId ?? obj.id ?? obj.studentId ?? obj.teacherId);
            const personName = String(obj.personName ?? obj.name ?? obj.fullName ?? '').trim() || null;
            return { attendanceType, personId, personName, qrCode: text };
        }
    } catch (_) { }

    const pref = text.match(/^(student|teacher|staff)\s*[:\-]\s*(\d+)\s*(?:\|\s*name\s*[:=]\s*(.+))?$/i);
    if (pref) {
        const attendanceType = normalizeAttendanceType(pref[1], fallbackType);
        const personId = toIntId(pref[2]);
        const personName = (pref[3] ? String(pref[3]).trim() : '') || null;
        return { attendanceType, personId, personName, qrCode: text };
    }

    const short = text.match(/^([ST])\s*[-:]\s*(\d+)\s*(?:\|\s*(.+))?$/i);
    if (short) {
        const attendanceType = short[1].toUpperCase() === 'T' ? 'Teacher' : 'Student';
        const personId = toIntId(short[2]);
        const personName = (short[3] ? String(short[3]).trim() : '') || null;
        return { attendanceType, personId, personName, qrCode: text };
    }

    return { attendanceType: fallbackType, personId: null, personName: null, qrCode: text };
};

export default function AdminQRAttendance({
    defaultAttendanceType = 'Student',
    defaultSessionType = 'Student',
    logsPath = '/admin/students/attendance/qr/logs',
} = {}) {
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
    const toast = useToast();
    const { user, campusId } = useAuth();
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);
    const zxingRef = useRef(null);
    const zxingStopRef = useRef(null);

    const [attendanceType, setAttendanceType] = useState(defaultAttendanceType);
    const [sessionType, setSessionType] = useState(defaultSessionType);
    const [sessionMinutes, setSessionMinutes] = useState('3');
    const [sessionPayload, setSessionPayload] = useState(null);
    const [creatingSession, setCreatingSession] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isStartingCamera, setIsStartingCamera] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [manualPersonId, setManualPersonId] = useState('');
    const [manualPersonName, setManualPersonName] = useState('');
    const [lastCode, setLastCode] = useState('');
    const [lastMarkedAt, setLastMarkedAt] = useState(null);
    const [error, setError] = useState(null);

    const personLookupRef = useRef(null);
    const personLookupTimerRef = useRef(null);
    const lastEditedFieldRef = useRef(null);
    const suppressLookupRef = useRef(false);
    const [personLookupLoading, setPersonLookupLoading] = useState(false);
    const [personLookupOpen, setPersonLookupOpen] = useState(false);
    const [personLookupResults, setPersonLookupResults] = useState([]);

    useOutsideClick({
        ref: personLookupRef,
        handler: () => setPersonLookupOpen(false),
    });

    const supportsBarcodeDetector = useMemo(() => {
        return typeof window !== 'undefined' && 'BarcodeDetector' in window;
    }, []);

    const normalizePeopleRows = useCallback((payload) => {
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.rows)) return payload.rows;
        if (Array.isArray(payload?.items)) return payload.items;
        return [];
    }, []);

    const toLookupItem = useCallback((raw) => {
        const id = raw?.id ?? raw?._id;
        const name = raw?.name ?? raw?.fullName ?? raw?.employeeName ?? raw?.studentName;
        const roll = raw?.rollNumber ?? raw?.roll_no ?? raw?.roll;
        const emp = raw?.employeeId ?? raw?.employee_id;
        const cls = raw?.class ?? raw?.className;
        const sec = raw?.section ?? raw?.sectionName;
        const secondary = attendanceType === 'Student'
            ? (roll ? `Roll: ${roll}` : (cls && sec ? `${cls}-${sec}` : (cls || sec || '')))
            : (emp ? `Emp: ${emp}` : (raw?.designation || raw?.department || ''));
        return {
            id: id != null ? String(id) : '',
            name: name != null ? String(name) : '',
            secondary: secondary != null ? String(secondary) : '',
            raw,
        };
    }, [attendanceType]);

    const fetchPeople = useCallback(async (query) => {
        const q = String(query || '').trim();
        if (!q) {
            setPersonLookupResults([]);
            setPersonLookupOpen(false);
            return;
        }

        setPersonLookupLoading(true);
        try {
            const params = { q, pageSize: 8 };
            const cid = toIntId(campusId);
            if (cid) params.campusId = cid;

            const payload = attendanceType === 'Student'
                ? await studentsApi.list(params)
                : await teachersApi.list(params);

            const rows = normalizePeopleRows(payload);
            const items = rows.map(toLookupItem).filter((it) => it.id && it.name);
            setPersonLookupResults(items);
            setPersonLookupOpen(true);
        } catch (_) {
            setPersonLookupResults([]);
            setPersonLookupOpen(false);
        } finally {
            setPersonLookupLoading(false);
        }
    }, [attendanceType, campusId, normalizePeopleRows, toLookupItem]);

    useEffect(() => {
        if (suppressLookupRef.current) return;

        const field = lastEditedFieldRef.current;
        const query = field === 'id' ? manualPersonId : manualPersonName;

        if (personLookupTimerRef.current) {
            clearTimeout(personLookupTimerRef.current);
            personLookupTimerRef.current = null;
        }

        if (!field) return;
        if (!String(query || '').trim()) {
            setPersonLookupResults([]);
            setPersonLookupOpen(false);
            return;
        }

        personLookupTimerRef.current = setTimeout(() => {
            fetchPeople(query);
        }, 350);

        return () => {
            if (personLookupTimerRef.current) {
                clearTimeout(personLookupTimerRef.current);
                personLookupTimerRef.current = null;
            }
        };
    }, [fetchPeople, manualPersonId, manualPersonName]);

    useEffect(() => {
        setPersonLookupResults([]);
        setPersonLookupOpen(false);
    }, [attendanceType]);

    const stopScanner = useCallback(() => {
        if (zxingStopRef.current) {
            try { zxingStopRef.current(); } catch (_) { }
            zxingStopRef.current = null;
        }
        if (zxingRef.current) {
            try { zxingRef.current.reset(); } catch (_) { }
            zxingRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            try {
                streamRef.current.getTracks().forEach((t) => t.stop());
            } catch (_) { }
            streamRef.current = null;
        }
        if (videoRef.current) {
            try {
                videoRef.current.srcObject = null;
            } catch (_) { }
        }
        setIsScanning(false);
        setIsStartingCamera(false);
    }, []);

    useEffect(() => {
        return () => stopScanner();
    }, [stopScanner]);

    const submitAttendance = useCallback(async ({ qrCode, personId, personName, attendanceType: typeOverride }) => {
        const cid = toIntId(campusId);
        if (!cid) {
            toast({
                title: 'Select a campus',
                description: 'Campus is required to mark attendance.',
                status: 'warning',
                duration: 3500,
                isClosable: true,
            });
            return;
        }

        const pid = toIntId(personId);
        if (!pid) {
            toast({
                title: 'Invalid QR data',
                description: 'QR code must include a numeric person ID (or enter it manually).',
                status: 'error',
                duration: 4500,
                isClosable: true,
            });
            return;
        }

        const code = String(qrCode || '').trim();
        if (!code) {
            toast({
                title: 'No QR code',
                description: 'Scan a QR code or enter it manually.',
                status: 'warning',
                duration: 2500,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const now = new Date();
            await qrAttendanceApi.markPerson({
                attendanceType: normalizeAttendanceType(typeOverride, attendanceType),
                personId: pid,
                personName: String(personName || '').trim() || undefined,
                qrCode: code,
                status: 'Present',
            });
            setLastMarkedAt(now);
            toast({
                title: 'Attendance marked',
                description: 'Attendance has been recorded.',
                status: 'success',
                duration: 2500,
                isClosable: true,
            });
        } catch (e) {
            setError(e?.message || 'Failed to mark attendance');
            toast({
                title: 'Failed to mark attendance',
                description: e?.message || 'Request failed',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [attendanceType, campusId, toast, user?.email, user?.name]);

    const createSession = useCallback(async () => {
        const cid = toIntId(campusId);
        if (!cid) {
            toast({
                title: 'Select a campus',
                description: 'Campus is required to generate a QR session.',
                status: 'warning',
                duration: 3500,
                isClosable: true,
            });
            return;
        }
        setCreatingSession(true);
        try {
            const payload = await qrAttendanceApi.createSession({
                attendanceType: sessionType,
                expiresInMinutes: Number(sessionMinutes) || 3,
            });
            setSessionPayload(payload);
            toast({ title: 'QR session created', status: 'success', duration: 2000 });
        } catch (e) {
            toast({
                title: 'Failed to create session',
                description: e?.message || 'Request failed',
                status: 'error',
                duration: 4000,
            });
        } finally {
            setCreatingSession(false);
        }
    }, [campusId, sessionMinutes, sessionType, toast]);

    const onDetected = useCallback(async (rawValue) => {
        const parsed = parseQrPayload(rawValue, attendanceType);
        if (!parsed?.qrCode) return;

        if (parsed.qrCode === lastCode) return;

        setLastCode(parsed.qrCode);
        setManualCode(parsed.qrCode);
        setAttendanceType(parsed.attendanceType);
        suppressLookupRef.current = true;
        setManualPersonId(parsed.personId ? String(parsed.personId) : '');
        setManualPersonName(parsed.personName || '');
        lastEditedFieldRef.current = null;
        setTimeout(() => { suppressLookupRef.current = false; }, 0);

        await submitAttendance(parsed);
    }, [attendanceType, lastCode, submitAttendance]);

    const startScanner = useCallback(async () => {
        setError(null);

        try {
            setIsStartingCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setIsScanning(true);

            if (supportsBarcodeDetector) {
                const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                intervalRef.current = setInterval(async () => {
                    try {
                        if (!videoRef.current || videoRef.current.readyState < 2) return;
                        if (isSubmitting) return;
                        const codes = await detector.detect(videoRef.current);
                        if (codes && codes.length > 0) {
                            await onDetected(codes[0]?.rawValue);
                        }
                    } catch (_) {
                    }
                }, 500);
            } else {
                // Fallback for browsers without BarcodeDetector
                let BrowserMultiFormatReaderCtor;
                try {
                    const mod = await import('@zxing/browser');
                    BrowserMultiFormatReaderCtor = mod?.BrowserMultiFormatReader;
                } catch (e) {
                    toast({
                        title: 'Scanner dependency missing',
                        description: 'Please run "npm install" and restart the app to enable camera scanning. You can still use manual entry.',
                        status: 'info',
                        duration: 6000,
                        isClosable: true,
                    });
                    setIsScanning(false);
                    return;
                }

                const reader = new BrowserMultiFormatReaderCtor();
                zxingRef.current = reader;

                const controls = await reader.decodeFromVideoElement(videoRef.current, (result, err, ctrl) => {
                    if (!result) return;
                    if (isSubmitting) return;
                    const txt = typeof result?.getText === 'function' ? result.getText() : String(result?.text || '');
                    if (!txt) return;
                    onDetected(txt);
                });
                zxingStopRef.current = () => {
                    try { controls?.stop?.(); } catch (_) { }
                };
            }
        } catch (e) {
            setError(e?.message || 'Camera permission denied');
            toast({
                title: 'Camera error',
                description: e?.message || 'Unable to access camera',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
            stopScanner();
        } finally {
            setIsStartingCamera(false);
        }
    }, [isSubmitting, onDetected, stopScanner, supportsBarcodeDetector, toast]);

    const submitManual = useCallback(async () => {
        await submitAttendance({
            attendanceType,
            personId: manualPersonId,
            personName: manualPersonName,
            qrCode: manualCode,
        });
    }, [attendanceType, manualCode, manualPersonId, manualPersonName, submitAttendance]);

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>QR Code Attendance</Heading>
                    <Text color={textColorSecondary}>Scan QR codes to mark attendance for Students or Staff</Text>
                </Box>
                <HStack spacing={3}>
                    <Button variant="outline" onClick={() => navigate(logsPath)}>View Logs</Button>
                    {!isScanning ? (
                        <Button
                            leftIcon={<MdQrCodeScanner />}
                            colorScheme="blue"
                            onClick={startScanner}
                            isLoading={isStartingCamera}
                        >
                            Start Scanner
                        </Button>
                    ) : (
                        <Button colorScheme="red" variant="outline" onClick={stopScanner}>
                            Stop
                        </Button>
                    )}
                </HStack>
            </Flex>
            <Card p={6}>
                <VStack align="stretch" spacing={4}>
                    <Box>
                        <Text fontWeight="800" mb={2}>Generate Session QR (Students/Teachers scan this)</Text>
                        <HStack spacing={3} flexWrap="wrap">
                            <Box minW={{ base: '100%', md: '220px' }}>
                                <Text fontWeight="700" mb={1}>Session Type</Text>
                                <Select value={sessionType} onChange={(e) => setSessionType(e.target.value)}>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                </Select>
                            </Box>
                            <Box minW={{ base: '100%', md: '220px' }}>
                                <Text fontWeight="700" mb={1}>Expires (minutes)</Text>
                                <Input value={sessionMinutes} onChange={(e) => setSessionMinutes(e.target.value)} placeholder="3" />
                            </Box>
                            <Button colorScheme="green" onClick={createSession} isLoading={creatingSession}>
                                Create QR
                            </Button>
                        </HStack>

                        {!!sessionPayload?.qrPayload && (
                            <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
                                <Text fontWeight="700" mb={2}>QR Payload (copy or show on a screen)</Text>
                                <Input value={sessionPayload.qrPayload} isReadOnly />
                                <Text mt={2} fontSize="sm" color={textColorSecondary}>
                                    Expires at: {String(sessionPayload.expiresAt || '').replace('T', ' ').slice(0, 19)}
                                </Text>
                                <Box mt={3} textAlign="center">
                                    <img
                                        alt="QR"
                                        style={{ width: 220, height: 220 }}
                                        src={`https://quickchart.io/qr?text=${encodeURIComponent(sessionPayload.qrPayload)}&size=220`}
                                    />
                                    <Text fontSize="xs" color={textColorSecondary} mt={2}>
                                        If QR image doesn’t load (offline), students/teachers can paste the payload in manual entry.
                                    </Text>
                                </Box>
                            </Box>

                        )}

                        <Box ref={personLookupRef} position="relative">
                    <HStack spacing={3} align="end" flexWrap="wrap">
                        <Box minW={{ base: '100%', md: '220px' }}>
                            <Text fontWeight="700" mb={1}>Attendance Type</Text>
                            <Select value={attendanceType} onChange={(e) => setAttendanceType(e.target.value)}>
                                <option value="Student">Student</option>
                                <option value="Teacher">Staff</option>
                            </Select>
                        </Box>
                        <Box minW={{ base: '100%', md: '220px' }}>
                            <Text fontWeight="700" mb={1}>Person ID</Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    {personLookupLoading && lastEditedFieldRef.current === 'id' ? <Spinner size="sm" /> : <Icon as={MdQrCodeScanner} color="gray.400" />}
                                </InputLeftElement>
                                <Input
                                    value={manualPersonId}
                                    onChange={(e) => {
                                        lastEditedFieldRef.current = 'id';
                                        setManualPersonId(e.target.value);
                                    }}
                                    onFocus={() => {
                                        lastEditedFieldRef.current = 'id';
                                        if (personLookupResults.length > 0) setPersonLookupOpen(true);
                                    }}
                                    placeholder="e.g. 123"
                                />
                            </InputGroup>
                        </Box>
                        <Box flex="1" minW={{ base: '100%', md: '260px' }}>
                            <Text fontWeight="700" mb={1}>Person Name</Text>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    {personLookupLoading && lastEditedFieldRef.current === 'name' ? <Spinner size="sm" /> : <Icon as={MdQrCodeScanner} color="gray.400" />}
                                </InputLeftElement>
                                <Input
                                    value={manualPersonName}
                                    onChange={(e) => {
                                        lastEditedFieldRef.current = 'name';
                                        setManualPersonName(e.target.value);
                                    }}
                                    onFocus={() => {
                                        lastEditedFieldRef.current = 'name';
                                        if (personLookupResults.length > 0) setPersonLookupOpen(true);
                                    }}
                                    placeholder={attendanceType === 'Student' ? 'Type student name' : 'Type staff name'}
                                />
                            </InputGroup>
                        </Box>
                    </HStack>

                    {personLookupOpen && personLookupResults.length > 0 && (
                        <List
                            position="absolute"
                            top="100%"
                            left={0}
                            right={0}
                            bg="white"
                            _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
                            boxShadow="xl"
                            borderRadius="12px"
                            mt={2}
                            zIndex={100}
                            borderWidth="1px"
                            overflow="hidden"
                            borderColor="gray.100"
                        >
                            {personLookupResults.map((p) => (
                                <ListItem
                                    key={`${attendanceType}-${p.id}`}
                                    p={3}
                                    cursor="pointer"
                                    _hover={{ bg: 'blue.50', _dark: { bg: 'gray.600' } }}
                                    onClick={() => {
                                        suppressLookupRef.current = true;
                                        setManualPersonId(p.id);
                                        setManualPersonName(p.name);
                                        lastEditedFieldRef.current = null;
                                        setPersonLookupOpen(false);
                                        setTimeout(() => { suppressLookupRef.current = false; }, 0);
                                    }}
                                    borderBottomWidth="1px"
                                    _last={{ borderBottomWidth: 0 }}
                                    borderColor="gray.50"
                                    _dark={{ borderColor: 'gray.600' }}
                                >
                                    <Box>
                                        <Text fontWeight="bold" fontSize="sm">{p.name}</Text>
                                        <Text fontSize="xs" color="gray.500">ID: {p.id}{p.secondary ? ` · ${p.secondary}` : ''}</Text>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    )}
                        </Box>

                    </Box>

                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                    >
                        <>
                            <video
                                ref={videoRef}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                playsInline
                                muted
                            />
                            {!isScanning && (
                                <Box position="absolute" textAlign="center" px={4}>
                                    <Text color="gray.600" fontWeight="700">Click “Start Scanner” to begin</Text>
                                    {!supportsBarcodeDetector && (
                                        <Text color="gray.500" fontSize="sm" mt={1}>
                                            Your browser doesn’t support the native scanner. Using fallback scanner.
                                        </Text>
                                    )}
                                </Box>
                            )}
                            {isStartingCamera && (
                                <Box position="absolute" textAlign="center">
                                    <Spinner />
                                    <Text mt={2} color="gray.600">Starting camera…</Text>
                                </Box>
                            )}
                        </>
                    </Box>

                    <VStack align="stretch" spacing={2}>
                        <Text fontWeight="700">Manual QR code</Text>
                        <HStack>
                            <Input
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Paste/enter QR code value"
                            />
                            <Button colorScheme="blue" onClick={submitManual} isLoading={isSubmitting}>
                                Submit
                            </Button>
                        </HStack>
                        {!!lastCode && (
                            <Text fontSize="sm" color={textColorSecondary}>
                                Last scanned: {lastCode}
                            </Text>
                        )}
                        {!!lastMarkedAt && (
                            <Text fontSize="sm" color={textColorSecondary}>
                                Last marked: {lastMarkedAt.toLocaleString()}
                            </Text>
                        )}
                        {!!error && (
                            <Text fontSize="sm" color="red.500">{error}</Text>
                        )}
                    </VStack>
                </VStack>
            </Card>
        </Box>
    );
}
