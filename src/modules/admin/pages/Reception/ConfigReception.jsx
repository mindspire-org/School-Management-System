import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Heading, Text, Button, useColorModeValue, FormControl, FormLabel, Input, Switch, useToast, Textarea, Spinner
} from '@chakra-ui/react';
import { MdSettings } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import { receptionConfigApi } from '../../../../services/moduleApis';
import { useAuth } from '../../../../contexts/AuthContext';

export default function ConfigReception() {
    const { campusId } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        id: '',
        visitorBadgeTemplate: 'Standard Template',
        autoNotification: true,
        requireIDVerification: true,
        complaintCategories: 'Facilities, Administration, Academic, Transport, Other',
        autoAssignment: false,
        workingHours: '08:00 AM - 05:00 PM',
        receptionEmail: 'reception@school.com',
        receptionContact: '0300-1234567',
    });

    const textColorSecondary = useColorModeValue('gray.600', 'gray.400');

    useEffect(() => {
        fetchConfig();
    }, [campusId]);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const data = await receptionConfigApi.list({ campusId });
            if (data && data.length > 0) {
                setConfig(data[0]);
            }
        } catch (error) {
            toast({ title: 'Error fetching configuration', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (config.id) {
                await receptionConfigApi.update(config.id, { ...config, campusId });
            } else {
                await receptionConfigApi.create({ ...config, campusId });
            }
            toast({ title: 'Configuration saved successfully', status: 'success' });
            fetchConfig();
        } catch (error) {
            toast({ title: 'Error saving configuration', status: 'error' });
        }
    };

    if (loading) {
        return <Spinner size="xl" mt={20} ml="50%" />;
    }

    return (
        <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
            <Flex mb={5} justify="space-between" align="center" gap={3} flexWrap="wrap">
                <Box>
                    <Heading as="h3" size="lg" mb={1}>Reception Configuration</Heading>
                    <Text color={textColorSecondary}>Configure reception settings and preferences</Text>
                </Box>
                <Button leftIcon={<MdSettings />} colorScheme="blue" onClick={handleSave}>
                    Save Configuration
                </Button>
            </Flex>

            <Card p={6} mb={5}>
                <Heading size="md" mb={4}>General Settings</Heading>
                <FormControl mb={4}>
                    <FormLabel>Reception Email</FormLabel>
                    <Input value={config.receptionEmail} onChange={(e) => setConfig({ ...config, receptionEmail: e.target.value })} />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Reception Contact Number</FormLabel>
                    <Input value={config.receptionContact} onChange={(e) => setConfig({ ...config, receptionContact: e.target.value })} />
                </FormControl>
                <FormControl mb={4}>
                    <FormLabel>Working Hours</FormLabel>
                    <Input value={config.workingHours} onChange={(e) => setConfig({ ...config, workingHours: e.target.value })} />
                </FormControl>
            </Card>

            <Card p={6} mb={5}>
                <Heading size="md" mb={4}>Visitor Management</Heading>
                <FormControl mb={4}>
                    <FormLabel>Visitor Badge Template</FormLabel>
                    <Input value={config.visitorBadgeTemplate} onChange={(e) => setConfig({ ...config, visitorBadgeTemplate: e.target.value })} />
                </FormControl>
                <FormControl display="flex" alignItems="center" mb={4}>
                    <FormLabel mb="0">Require ID Verification</FormLabel>
                    <Switch isChecked={config.requireIDVerification} onChange={(e) => setConfig({ ...config, requireIDVerification: e.target.checked })} />
                </FormControl>
                <FormControl display="flex" alignItems="center" mb={4}>
                    <FormLabel mb="0">Auto Notification to Person to Meet</FormLabel>
                    <Switch isChecked={config.autoNotification} onChange={(e) => setConfig({ ...config, autoNotification: e.target.checked })} />
                </FormControl>
            </Card>

            <Card p={6}>
                <Heading size="md" mb={4}>Complaint Management</Heading>
                <FormControl mb={4}>
                    <FormLabel>Complaint Categories (comma-separated)</FormLabel>
                    <Textarea value={config.complaintCategories} onChange={(e) => setConfig({ ...config, complaintCategories: e.target.value })} rows={3} />
                </FormControl>
                <FormControl display="flex" alignItems="center" mb={4}>
                    <FormLabel mb="0">Auto-assign Complaints to Departments</FormLabel>
                    <Switch isChecked={config.autoAssignment} onChange={(e) => setConfig({ ...config, autoAssignment: e.target.checked })} />
                </FormControl>
            </Card>
        </Box>
    );
}
