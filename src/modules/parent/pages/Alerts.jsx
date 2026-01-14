import React, { useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Badge, VStack, HStack, Button, Icon, useToast } from '@chakra-ui/react';
import { MdNotificationsActive, MdRefresh } from 'react-icons/md';
import Card from '../../../components/card/Card';
import { alertsApi } from '../../../services/api';

export default function ParentAlerts() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await alertsApi.listMine({ pageSize: 100 });
      const items = res?.rows || res?.items || res?.data || [];
      setRows(items);
    } catch (e) {
      toast({ title: 'Failed to load alerts', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const colorFor = (sev) => sev === 'critical' ? 'red' : sev === 'warning' ? 'orange' : 'blue';

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Alerts</Heading>
          <Text color="gray.500">Messages and notifications from your school</Text>
        </Box>
        <Button leftIcon={<MdRefresh />} onClick={load} isLoading={loading} variant="outline">Refresh</Button>
      </Flex>

      <Card p={4}>
        <VStack align="stretch" spacing={3}>
          {rows.length === 0 && (
            <Flex align="center" justify="center" p={10} direction="column" color="gray.500">
              <Icon as={MdNotificationsActive} boxSize={8} mb={2} />
              <Text>No alerts yet.</Text>
            </Flex>
          )}
          {rows.map((a) => (
            <Flex key={a.id} p={3} borderWidth="1px" borderRadius="md" align="start" justify="space-between" bg="white">
              <Box>
                <HStack mb={1} spacing={2}>
                  <Badge colorScheme={colorFor(a.severity)} textTransform="capitalize">{a.severity || 'info'}</Badge>
                  <Text fontSize="xs" color="gray.500">{new Date(a.created_at || a.createdAt || a.createdAtUtc || Date.now()).toLocaleString()}</Text>
                </HStack>
                <Text fontWeight="600">{a.title || a.type || 'School Alert'}</Text>
                <Text color="gray.700">{a.message}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Card>
    </Box>
  );
}
