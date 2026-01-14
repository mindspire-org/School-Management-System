import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardBody, Flex, Heading, HStack, Icon, Input, InputGroup, InputLeftAddon, Select, Textarea, useToast } from '@chakra-ui/react';
import { MdArrowBack } from 'react-icons/md';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { parentsApi } from '../../../../services/api';

export default function ParentInform() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [parentId, setParentId] = useState(params.get('parentId') || '');
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await parentsApi.list({ pageSize: 200 });
        const rows = data?.rows || data?.items || [];
        setParents(rows);
        if (parentId) {
          const p = rows.find((r) => String(r.id) === String(parentId));
          if (p) {
            const pd = await parentsApi.getById(p.id);
            setChildren(pd?.children || []);
          }
        }
      } catch (_) { }
    };
    load();
  }, [parentId]);

  const onParentChange = async (id) => {
    setParentId(id);
    setChildId('');
    try {
      if (!id) { setChildren([]); return; }
      const data = await parentsApi.getById(id);
      setChildren(data?.children || []);
    } catch (_) { }
  };

  const handleSend = async () => {
    if (!parentId || !message.trim()) {
      toast({ title: 'Parent and message are required', status: 'warning' });
      return;
    }
    try {
      setLoading(true);
      await parentsApi.inform(parentId, { childId: childId || null, message });
      toast({ title: 'Message queued', description: 'If WhatsApp webhook is configured, a message will be sent.', status: 'success' });
      setMessage('');
    } catch (e) {
      toast({ title: 'Failed to send', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <HStack justify="space-between" mb={4}>
        <Heading size="lg">Inform Parent</Heading>
        <Button
          leftIcon={<MdArrowBack />}
          variant="ghost"
          onClick={() => navigate('/admin/parents/list')}
        >
          Back to List
        </Button>
      </HStack>
      <Card>
        <CardBody>
          <Flex direction="column" gap={4}>
            <Select placeholder="Select parent" value={parentId} onChange={(e) => onParentChange(e.target.value)}>
              {(parents || []).map((p) => (
                <option key={p.id} value={p.id}>{p.primaryName || p.fatherName || p.motherName || p.familyNumber}</option>
              ))}
            </Select>
            <Select placeholder="Select child (optional)" value={childId} onChange={(e) => setChildId(e.target.value)}>
              {(children || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.class}-{c.section}</option>
              ))}
            </Select>
            <Textarea placeholder="Write a custom message for this parent" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
            <Button colorScheme="blue" onClick={handleSend} isLoading={loading}>Send via WhatsApp</Button>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
}
