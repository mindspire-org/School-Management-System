import React, { useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Input,
  Select,
  Button,
  Icon,
  Switch,
  useColorModeValue,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { MdRefresh, MdSave, MdPrint, MdFileDownload, MdNotifications, MdAccessTime, MdViewAgenda } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import BarChart from '../../../components/charts/BarChart';

export default function Notifications() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const [emailOn, setEmailOn] = useState(true);
  const [pushOn, setPushOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);
  const [digest, setDigest] = useState('Daily');
  const [quietFrom, setQuietFrom] = useState('21:00');
  const [quietTo, setQuietTo] = useState('07:00');
  const [keywords, setKeywords] = useState('exam, assignment, leave');

  const kpis = useMemo(() => ({
    channels: [emailOn, pushOn, smsOn].filter(Boolean).length,
    quietHours: `${quietFrom}–${quietTo}`,
    mode: digest,
  }), [emailOn, pushOn, smsOn, quietFrom, quietTo, digest]);

  const chartData = useMemo(() => ([{ name: 'Notifications', data: [emailOn?60:0, pushOn?90:0, smsOn?20:0] }]), [emailOn, pushOn, smsOn]);
  const chartOptions = useMemo(() => ({ xaxis: { categories: ['Email','Push','SMS'] }, colors: ['#805AD5'] }), []);

  const reset = () => { setEmailOn(true); setPushOn(true); setSmsOn(false); setDigest('Daily'); setQuietFrom('21:00'); setQuietTo('07:00'); setKeywords('exam, assignment, leave'); };
  const save = () => { console.log('Notifications saved'); };

  const exportCSV = () => {
    const header = ['Channel','Enabled'];
    const rows = [
      ['Email', emailOn],
      ['Push', pushOn],
      ['SMS', smsOn],
      ['Digest', digest],
      ['Quiet From', quietFrom],
      ['Quiet To', quietTo],
      ['Keywords', keywords],
    ];
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='notification_prefs.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Notifications</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>Choose how and when you want to be notified</Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdNotifications color='white' />} />} name='Channels' value={String(kpis.channels)} trendData={[1,2,2,3,3,3]} trendColor='#B721FF' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdAccessTime color='white' />} />} name='Quiet Hours' value={String(kpis.quietHours)} trendData={[1,1,1,1,1,1]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdViewAgenda color='white' />} />} name='Digest' value={String(kpis.mode)} trendData={[1,1,1,1,1,1]} trendColor='#01B574' />
        </Flex>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing='16px'>
        <Card p='16px' gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <VStack align='stretch' spacing={4}>
            <Text fontWeight='700'>Channels</Text>
            <HStack spacing={3} flexWrap='wrap' rowGap={3}>
              <FormControl display='flex' alignItems='center' width='auto'>
                <FormLabel htmlFor='emailOn' mb='0'>Email</FormLabel>
                <Switch id='emailOn' isChecked={emailOn} onChange={(e)=>setEmailOn(e.target.checked)} />
              </FormControl>
              <FormControl display='flex' alignItems='center' width='auto'>
                <FormLabel htmlFor='pushOn' mb='0'>Push</FormLabel>
                <Switch id='pushOn' isChecked={pushOn} onChange={(e)=>setPushOn(e.target.checked)} />
              </FormControl>
              <FormControl display='flex' alignItems='center' width='auto'>
                <FormLabel htmlFor='smsOn' mb='0'>SMS</FormLabel>
                <Switch id='smsOn' isChecked={smsOn} onChange={(e)=>setSmsOn(e.target.checked)} />
              </FormControl>
              <Select size='sm' value={digest} onChange={(e)=>setDigest(e.target.value)} maxW='200px'>
                <option>Instant</option>
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
              </Select>
            </HStack>

            <Text fontWeight='700'>Quiet Hours</Text>
            <HStack spacing={3} flexWrap='wrap' rowGap={3}>
              <Input type='time' size='sm' value={quietFrom} onChange={(e)=>setQuietFrom(e.target.value)} maxW='160px' />
              <Input type='time' size='sm' value={quietTo} onChange={(e)=>setQuietTo(e.target.value)} maxW='160px' />
            </HStack>

            <Text fontWeight='700'>Keyword Alerts</Text>
            <Textarea size='sm' rows={3} value={keywords} onChange={(e)=>setKeywords(e.target.value)} placeholder='Comma separated keywords' />

            <Flex justify='flex-end' gap={2} flexWrap='wrap' rowGap={3}>
              <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={reset}>Reset</Button>
              <Button size='sm' variant='outline' leftIcon={<Icon as={MdPrint} />} onClick={()=>window.print()}>Print</Button>
              <Button size='sm' variant='outline' leftIcon={<Icon as={MdFileDownload} />} onClick={exportCSV}>Export CSV</Button>
              <Button size='sm' colorScheme='blue' leftIcon={<Icon as={MdSave} />} onClick={save}>Save</Button>
            </Flex>
          </VStack>
        </Card>

        <Card p='16px'>
          <VStack align='stretch' spacing={3}>
            <Text fontWeight='700'>Recent Volume</Text>
            <BarChart chartData={chartData} chartOptions={chartOptions} height={220} />
            <Text fontSize='sm' color={textSecondary}>Numbers are illustrative for UI demo.</Text>
          </VStack>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
