import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Text, Flex, HStack, VStack, SimpleGrid, Input, Select, Textarea, Button,
  useColorModeValue, Icon, useToast, Badge
} from '@chakra-ui/react';
import { MdRefresh, MdSave, MdAssignment, MdPending, MdCheckCircle } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';
import PieChart from '../../../components/charts/PieChart';
import useApi from '../../../hooks/useApi';
import { assignmentsApi } from '../../../services/api';

export default function CreateAssignment() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const toast = useToast();

  const [form, setForm] = useState({
    title: '', subject: '', cls: '', section: '', dueDate: '', description: ''
  });

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const reset = () => setForm({ title: '', subject: '', cls: '', section: '', dueDate: '', description: '' });

  // API hooks
  const { execute: fetchAssignments, loading: loadingList, error: listError, data: listData } = useApi(assignmentsApi.list);
  const { execute: createAssignment, loading: saving, error: saveError } = useApi(assignmentsApi.create, {
    onSuccess: () => {
      toast({ title: 'Assignment created', description: form.title, status: 'success' });
      reset();
      fetchAssignments();
    }
  });

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    if (!form.title || !form.subject || !form.cls || !form.section || !form.dueDate) {
      toast({ title: 'Fill required fields', status: 'warning' });
      return;
    }
    createAssignment({
      title: form.title,
      subject: form.subject,
      class: form.cls,
      section: form.section,
      dueDate: form.dueDate,
      description: form.description,
    });
  };

  const assignments = useMemo(() => {
    if (Array.isArray(listData)) return listData;
    if (Array.isArray(listData?.data)) return listData.data;
    if (Array.isArray(listData?.items)) return listData.items;
    return [];
  }, [listData]);

  const kpis = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter(a => a?.status !== 'graded' && a?.status !== 'submitted').length;
    const submitted = assignments.filter(a => a?.status === 'submitted').length;
    return { total, pending, submitted };
  }, [assignments]);

  const chartData = useMemo(() => ([{ name: 'Assignments', data: [kpis.pending, kpis.submitted, kpis.total] }]), [kpis]);
  const chartOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Pending', 'Submitted', 'Total'] },
    dataLabels: { enabled: false },
    colors: ['#3182CE']
  }), []);

  const subjectDistribution = useMemo(() => {
    const map = {};
    assignments.forEach(a => { if (a?.subject) map[a.subject] = (map[a.subject] || 0) + 1; });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [assignments]);

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Create Assignment</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Publish new work for your classes</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdAssignment color='white' />} />}
            name='Total'
            value={String(kpis.total)}
            trendData={[2,3,2,4,3,4]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#FFB36D 0%,#FD7853 100%)' icon={<MdPending color='white' />} />}
            name='Pending'
            value={String(kpis.pending)}
            trendData={[1,1,2,1,2,1]}
            trendColor='#FD7853'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdCheckCircle color='white' />} />}
            name='Submitted'
            value={String(kpis.submitted)}
            trendData={[1,2,2,3,2,3]}
            trendColor='#01B574'
          />
        </Flex>
        {/* Loading/Error States */}
        {loadingList && <Text mt={2} color={textSecondary}>Loading assignments...</Text>}
        {listError && <Text mt={2} color='red.500'>Failed to load assignments</Text>}
      </Box>

      <Card p='16px' mb='16px'>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing='12px'>
          <Input placeholder='Title*' value={form.title} onChange={handle('title')} size='sm' />
          <Select placeholder='Subject*' value={form.subject} onChange={handle('subject')} size='sm'>
            <option>Mathematics</option><option>Physics</option><option>Chemistry</option><option>English</option>
          </Select>
          <Select placeholder='Class*' value={form.cls} onChange={handle('cls')} size='sm'>
            <option>7</option><option>8</option><option>9</option><option>10</option>
          </Select>
          <Select placeholder='Section*' value={form.section} onChange={handle('section')} size='sm'>
            <option>A</option><option>B</option>
          </Select>
          <Input type='date' placeholder='Due Date*' value={form.dueDate} onChange={handle('dueDate')} size='sm' />
          <Box>
            <Badge mb={1}>Description</Badge>
            <Textarea placeholder='Instructions' value={form.description} onChange={handle('description')} size='sm' rows={4} />
          </Box>
        </SimpleGrid>
        <Flex justify='flex-end' gap={2} mt={4} flexWrap='wrap'>
          <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={reset}>Reset</Button>
          <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdSave} />} onClick={save} isLoading={saving}>Save</Button>
          {saveError && <Text color='red.500' fontSize='sm'>Save failed</Text>}
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Assignments Overview</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
          </Box>
        </Card>
        <Card p='16px'>
          <Box>
            <Text fontWeight='700' mb='8px'>Subjects Distribution</Text>
            <PieChart height={240} chartData={subjectDistribution.values} chartOptions={{ labels: subjectDistribution.labels, legend:{ position:'right' } }} />
          </Box>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
