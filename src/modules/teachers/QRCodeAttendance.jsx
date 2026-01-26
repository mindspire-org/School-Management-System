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
    Input,
    useToast,
    Spinner,
} from '@chakra-ui/react';
import { MdQrCodeScanner } from 'react-icons/md';
import Card from '../../components/card/Card';
import { useAuth } from '../../contexts/AuthContext';
import { qrAttendanceApi } from '../../services/api';
import * as teachersApi from '../../services/api/teachers';

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

export default function TeacherQRAttendance() {
    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
    const toast = useToast();
    const { user, campusId } = useAuth();

    const [teacherProfile, setTeacherProfile] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    const [isScanning, setIsScanning] = useState(false);
    const [isStartingCamera, setIsStartingCamera] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [lastCode, setLastCode] = useState('');
    const [lastMarkedAt, setLastMarkedAt] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const loadSelf = async () => {
            try {
                const payload = await teachersApi.list();
                const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
                const self = rows && rows.length ? rows[0] : null;
                if (mounted) setTeacherProfile(self);
            } catch (_) {
                if (mounted) setTeacherProfile(null);
            }
        };
        if (user?.role === 'teacher') loadSelf();
        return () => { mounted = false; };
    }, [user?.role, campusId]);

    const supportsBarcodeDetector = useMemo(() => {
        return typeof window !== 'undefined' && 'BarcodeDetector' in window;
    }, []);

    const stopScanner = useCallback(() => {
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

    const submitAttendance = useCallback(async (qrCode) => {
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
        if (!qrCode) {
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
            await qrAttendanceApi.scanSession({ token: String(qrCode).trim() });
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
    }, [campusId, toast, user?.email, user?.name]);

    const onDetected = useCallback(async (rawValue) => {
        const code = String(rawValue || '').trim();
        if (!code) return;

        if (code === lastCode) return;

        setLastCode(code);
        setManualCode(code);
        await submitAttendance(code);
    }, [lastCode, submitAttendance]);

    const startScanner = useCallback(async () => {
        setError(null);
        if (!supportsBarcodeDetector) {
            toast({
                title: 'Scanner not supported',
                description: 'Your browser does not support QR scanning here. Please enter the code manually.',
                status: 'info',
                duration: 4000,
                isClosable: true,
            });
            return;
        }

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

            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            setIsScanning(true);

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

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>QR Code Attendance</Heading>
                    <Text color={textColorSecondary}>Scan a QR code to mark your attendance</Text>
                    {(teacherProfile?.id || teacherProfile?.name) && (
                        <Text color={textColorSecondary} fontSize="sm">
                            {teacherProfile?.name ? `Teacher: ${teacherProfile.name}` : 'Teacher'}
                            {teacherProfile?.id ? ` (ID: ${teacherProfile.id})` : ''}
                        </Text>
                    )}
                </Box>
                <HStack spacing={3}>
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
                    <Text>
                        Point your camera at the QR code to mark attendance.
                    </Text>
                    <Box
                        bg="gray.100"
                        h="300px"
                        borderRadius="md"
                        overflow="hidden"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                    >
                        {supportsBarcodeDetector ? (
                            <>
                                <video
                                    ref={videoRef}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    playsInline
                                    muted
                                />
                                {!isScanning && (
                                    <Box position="absolute" textAlign="center">
                                        <Text color="gray.500">Click “Start Scanner” to begin</Text>
                                    </Box>
                                )}
                                {isStartingCamera && (
                                    <Box position="absolute" textAlign="center">
                                        <Spinner />
                                        <Text mt={2} color="gray.600">Starting camera…</Text>
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Text color="gray.500">QR scanning is not supported in this browser. Use manual entry below.</Text>
                        )}
                    </Box>
                    <VStack align="stretch" spacing={2}>
                        <Text fontWeight="700">Manual entry</Text>
                        <HStack>
                            <Input
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Paste/enter QR code value"
                            />
                            <Button
                                colorScheme="blue"
                                onClick={() => submitAttendance(manualCode)}
                                isLoading={isSubmitting}
                            >
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
                            <Text fontSize="sm" color="red.500">
                                {error}
                            </Text>
                        )}
                    </VStack>
                </VStack>
            </Card>
        </Box>
    );
}
