import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  ButtonGroup,
  NumberInput,
  NumberInputField,
  Input,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import Card from 'components/card/Card.js';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import StatCard from '../../../../components/card/StatCard';
import { MdSave, MdRestore, MdAssignment, MdLeaderboard, MdFileDownload, MdPictureAsPdf, MdRefresh } from 'react-icons/md';
import * as gradingApi from '../../../../services/api/grading';

export default function GradeCalculation() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();
  const [bands, setBands] = useState({ A: 80, B: 70, C: 60, D: 50 });
  const [score, setScore] = useState(73);
  const [schemeId, setSchemeId] = useState(null);
  const [name, setName] = useState('Default');
  const [academicYear, setAcademicYear] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const def = await gradingApi.getDefault();
        const data = def?.id ? def : (def && def.bands ? def : null);
        if (mounted && data) {
          setSchemeId(data.id || null);
          setName(data.name || 'Default');
          setAcademicYear(data.academicYear || '');
          setBands(data.bands && Object.keys(data.bands).length ? data.bands : { A: 80, B: 70, C: 60, D: 50 });
        } else if (mounted) {
          const listResp = await gradingApi.list();
          const items = Array.isArray(listResp?.items) ? listResp.items : Array.isArray(listResp) ? listResp : [];
          if (items.length) {
            const s = items[0];
            setSchemeId(s.id || null);
            setName(s.name || 'Default');
            setAcademicYear(s.academicYear || '');
            setBands(s.bands || { A: 80, B: 70, C: 60, D: 50 });
          }
        }
      } catch (_) {
        // keep defaults
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const grade = useMemo(() => {
    const s = Number(score) || 0;
    const entries = Object.entries(bands || {}).map(([k, v]) => [k, Number(v) || 0]).sort((a, b) => b[1] - a[1]);
    for (const [g, min] of entries) { if (s >= min) return g; }
    return 'F';
  }, [bands, score]);

  const update = (k) => (v) => setBands((b) => ({ ...b, [k]: Number(v) || 0 }));

  const addBand = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const existing = new Set(Object.keys(bands));
    let next = 'E';
    for (const ch of letters) { if (!existing.has(ch)) { next = ch; break; } }
    setBands((b) => ({ ...b, [next]: 0 }));
  };

  const removeBand = (k) => {
    setBands((b) => {
      const n = { ...b };
      delete n[k];
      return n;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { name: name || 'Default', academicYear, bands, isDefault: true };
      if (schemeId) {
        await gradingApi.update(schemeId, payload);
      } else {
        const created = await gradingApi.create(payload);
        setSchemeId(created?.id || null);
      }
      toast({ title: 'Grading scheme saved', status: 'success', duration: 2500 });
    } catch (e) {
      toast({ title: 'Save failed', description: e?.message || 'Try again', status: 'error', duration: 3000 });
    } finally { setSaving(false); }
  };

  const resetDefaults = () => {
    setBands({ A: 80, B: 70, C: 60, D: 50 });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justifyContent="space-between" alignItems="center">
        <Box>
          <Heading as="h3" size="lg" mb={1} color={textColor}>Grade Calculation</Heading>
          <Text color={textColorSecondary}>Configure grade bands and preview computed grade</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant='outline' onClick={() => window.location.reload()} isDisabled={loading}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant='outline' colorScheme='blue' isDisabled>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme='blue' isDisabled>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      <Card mb={5}>
        <Flex p={4} justifyContent="space-between" alignItems="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <Box>Sample Score</Box>
            <NumberInput maxW="120px" value={score} min={0} max={100} onChange={(v) => setScore(v)}>
              <NumberInputField />
            </NumberInput>
          </HStack>
          <HStack>
            <Button leftIcon={<MdSave />} colorScheme="blue" onClick={save} isLoading={saving} loadingText='Saving'>Save Bands</Button>
            <Button leftIcon={<MdRestore />} variant="ghost" onClick={resetDefaults}>Reset Defaults</Button>
            <Button leftIcon={<MdAssignment />} variant="outline" colorScheme="blue">Generate Report</Button>
          </HStack>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb={5}>
        <StatCard
          title="Computed Grade"
          value={grade}
          icon={MdLeaderboard}
          colorScheme="blue"
        />
        <StatCard
          title="Bands Defined"
          value={String(Object.keys(bands).length)}
          icon={MdSave}
          colorScheme="green"
        />
        <StatCard
          title="Sample Score"
          value={`${score}%`}
          icon={MdAssignment}
          colorScheme="purple"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Card>
          <HStack justify="space-between">
            <Heading size="sm">Scheme Name</Heading>
            <Input maxW='240px' value={name} onChange={(e) => setName(e.target.value)} placeholder='Default' />
          </HStack>
        </Card>
        <Card>
          <HStack justify="space-between">
            <Heading size="sm">Academic Year</Heading>
            <Input maxW='180px' value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder='2024-2025' />
          </HStack>
        </Card>
        {Object.keys(bands).map((k) => (
          <Card key={k}>
            <HStack justify="space-between">
              <Heading size="sm">Minimum for {k}</Heading>
              <NumberInput maxW="120px" value={bands[k]} min={0} max={100} onChange={update(k)}>
                <NumberInputField />
              </NumberInput>
            </HStack>
            <Flex justify='flex-end' p={2}>
              <Button size='sm' variant='ghost' colorScheme='red' onClick={() => removeBand(k)}>Remove</Button>
            </Flex>
          </Card>
        ))}
        <Card>
          <Flex p={3} justify='center'>
            <Button onClick={addBand} variant='outline'>Add Band</Button>
          </Flex>
        </Card>
      </SimpleGrid>

      <Card overflow="hidden">
        <Heading size="md" p={4} borderBottomWidth={1} borderColor={useColorModeValue('gray.200', 'gray.700')}>
          Grade Bands
        </Heading>
        <Box overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Band</Th>
                <Th>Min %</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(bands)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => (
                  <Tr key={k}>
                    <Td>{k}</Td>
                    <Td>{v}%</Td>
                  </Tr>
                ))}
              <Tr>
                <Td>Computed Grade for {score}%</Td>
                <Td>{grade}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}
