import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  useColorModeValue,
  HStack,
  Button,
  ButtonGroup,
  Select,
  Input,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
} from '@chakra-ui/react';
import Card from '../../../../components/card/Card';
import MiniStatistics from '../../../../components/card/MiniStatistics';
import IconBox from '../../../../components/icons/IconBox';
import { MdWhatshot, MdCalendarToday, MdThumbUp, MdFileDownload, MdPictureAsPdf, MdRefresh } from 'react-icons/md';
import * as reportsApi from '../../../../services/api/reports';
import * as studentsApi from '../../../../services/api/students';
import { useAuth } from '../../../../contexts/AuthContext';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
const periods = Array.from({ length: 8 }, (_, i) => `P${i+1}`);

export default function AttendanceHeatmaps() {
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const disabledColor = useColorModeValue('#EDF2F7', '#2D3748');
  const toast = useToast();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [cls, setCls] = useState('');
  const [section, setSection] = useState('');
  const [location, setLocation] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0,10));
  const [heatMap, setHeatMap] = useState(Array.from({ length: 6 }, () => Array(8).fill(0)));
  const [denom, setDenom] = useState(0);
  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const fetchingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [cell, setCell] = useState({ open: false, dayIndex: 0, periodIndex: 0, value: 0 });

  const getColor = (val) => {
    if (val === 0) return disabledColor;
    if (val >= 95) return '#38A169';
    if (val >= 90) return '#D69E2E';
    return '#E53E3E';
  };

  const peak = useMemo(() => {
    let max = -1, di = 0, pj = 0;
    heatMap.forEach((row, i) => row.forEach((v, j) => { if (v > max) { max = v; di = i; pj = j; } }));
    return { day: days[di], period: periods[pj], rate: max > -1 ? max : 0 };
  }, [heatMap]);

  const best = useMemo(() => {
    let max = -1, di = 0;
    heatMap.forEach((row, i) => row.forEach((v) => { if (v > max) { max = v; di = i; } }));
    return { day: days[di], rate: max > -1 ? max : 0 };
  }, [heatMap]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const payload = await studentsApi.list({ pageSize: 200 });
        const rows = Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload) ? payload : []);
        const classes = Array.from(new Set((rows || []).map((s) => s.class).filter(Boolean)));
        const sections = Array.from(new Set((rows || []).map((s) => s.section).filter(Boolean)));
        setClassOptions(classes);
        setSectionOptions(sections);
      } catch (_) {}
    };
    if (!authLoading && isAuthenticated) loadOptions();
  }, [authLoading, isAuthenticated]);

  const loadHeatmap = async () => {
    if (fetchingRef.current) return; fetchingRef.current = true;
    try {
      setLoading(true);
      const params = { fromDate, toDate, class: cls || undefined, section: section || undefined, location: location || undefined };
      const data = await reportsApi.attendanceHeatmap(params);
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      const m = Array.from({ length: 6 }, () => Array(8).fill(0));
      (items || []).forEach((it) => {
        const i = (Number(it.dow) - 1);
        const j = Number(it.period);
        if (i >= 0 && i < 6 && j >= 0 && j < 8) m[i][j] = Number(it.pct || 0);
      });
      setHeatMap(m);
      setDenom(Number(data?.denom || 0));
    } catch (e) {
      const details = Array.isArray(e?.data?.errors) ? e.data.errors.map(x=>`${x.param}: ${x.msg}`).join(', ') : '';
      const msg = (e?.data?.message || e?.message || 'Failed to load heatmap') + (details ? ` — ${details}` : '');
      const id = 'attendance-heatmap-error';
      if (!toast.isActive(id)) toast({ id, title: 'Failed to load heatmap', description: msg, status: 'error' });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) loadHeatmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, fromDate, toDate, cls, section, location]);

  const exportCSV = () => {
    const header = ['Day', ...periods];
    const rowsCsv = days.map((d, i) => [d, ...heatMap[i]]);
    const csv = [header, ...rowsCsv].map(r => r.map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'attendance_heatmap.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank'); if (!w) return;
    const styles = `<style>body{font-family:Arial;padding:16px;} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:6px;font-size:12px;text-align:center} th{background:#f5f5f5}</style>`;
    const header = `<tr><th>Day</th>${periods.map(p=>`<th>${p}</th>`).join('')}</tr>`;
    const body = days.map((d,i)=>`<tr><td>${d}</td>${heatMap[i].map(v=>`<td>${v}</td>`).join('')}</tr>`).join('');
    w.document.write(`<html><head><title>Attendance Heatmap</title>${styles}</head><body><h2>Attendance Heatmap</h2><table>${header}${body}</table><script>window.onload=function(){window.print();setTimeout(()=>window.close(),300);}</script></body></html>`);
    w.document.close();
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Flex mb={5} justify="space-between" align="center">
        <Box>
          <Heading as="h3" size="lg" mb={1}>Attendance Heatmaps</Heading>
          <Text color={textColorSecondary}>Visualize attendance concentration by day and period</Text>
        </Box>
        <ButtonGroup>
          <Button leftIcon={<MdRefresh />} variant="outline" onClick={loadHeatmap} isLoading={loading}>Refresh</Button>
          <Button leftIcon={<MdFileDownload />} variant="outline" colorScheme="blue" onClick={exportCSV}>Export CSV</Button>
          <Button leftIcon={<MdPictureAsPdf />} colorScheme="blue" onClick={exportPDF}>Export PDF</Button>
        </ButtonGroup>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={5}>
        <MiniStatistics
          name="Peak Attendance"
          value={`${peak.rate}% (${peak.day} - ${peak.period})`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00b09b 0%,#96c93d 100%)' icon={<MdWhatshot size={28} color='white' />} />}
        />
        <MiniStatistics
          name="Best Day"
          value={`${best.day} (${best.rate}%)`}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#667eea 0%,#764ba2 100%)' icon={<MdThumbUp size={28} color='white' />} />}
        />
        <MiniStatistics
          name="School Days"
          value={'Mon-Fri'}
          startContent={<IconBox w='56px' h='56px' bg='linear-gradient(90deg,#00c6ff 0%,#0072ff 100%)' icon={<MdCalendarToday size={28} color='white' />} />}
        />
      </SimpleGrid>

      <Card mb={5}>
        <Flex p={4} justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
          <HStack>
            <Select w="180px" placeholder='Class' value={cls} onChange={(e)=>setCls(e.target.value)}>
              {classOptions.map((c)=>(<option key={c} value={c}>{c}</option>))}
            </Select>
            <Select w="140px" placeholder='Section' value={section} onChange={(e)=>setSection(e.target.value)}>
              {sectionOptions.map((s)=>(<option key={s} value={s}>{s}</option>))}
            </Select>
            <Input type="text" placeholder='Location (optional)' value={location} onChange={(e)=>setLocation(e.target.value)} w="200px" />
            <Input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} w="170px" />
            <Input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} w="170px" />
          </HStack>
        </Flex>
      </Card>

      {/* Heatmap */}
      <Card p={4}>
        <Box overflowX='auto' w='100%'>
          <Box display='grid' gridTemplateColumns={`repeat(${periods.length + 1}, minmax(80px, 1fr))`} gap={2}>
            <Box />
            {periods.map((p) => (
              <Box key={p} textAlign='center' fontWeight='600' whiteSpace='nowrap'>{p}</Box>
            ))}
            {days.map((d, i) => (
              <React.Fragment key={d}>
                <Box fontWeight='600' whiteSpace='nowrap'>{d}</Box>
                {heatMap[i].map((v, j) => (
                  <Tooltip key={`t-${i}-${j}`} label={`${d} ${periods[j]}: ${v || '-'}% of ${denom || 0}`}>
                    <Box
                      key={`${i}-${j}`}
                      h={{ base: '36px', md: '40px' }}
                      borderRadius='md'
                      bg={getColor(v)}
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      color='white'
                      fontWeight='700'
                      cursor='default'
                    >
                      {v ? `${v}%` : '-'}
                    </Box>
                  </Tooltip>
                ))}
              </React.Fragment>
            ))}
          </Box>
        </Box>
        <Flex mt={4} gap={4} align='center'>
          <Text fontSize='sm' color={textColorSecondary}>Legend:</Text>
          <Badge colorScheme='green'>{'>=95%'}</Badge>
          <Badge colorScheme='yellow'>90-94%</Badge>
          <Badge colorScheme='red'>{'< 90%'}</Badge>
        </Flex>
      </Card>

      <Modal isOpen={cell.open} onClose={()=>setCell((c)=>({ ...c, open:false }))} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{days[cell.dayIndex]} — {periods[cell.periodIndex]}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2} color={textColorSecondary}>Edit attendance for this slot</Text>
            <HStack>
              <Slider value={cell.value} min={50} max={100} step={1} onChange={(v)=>setCell((c)=>({ ...c, value:v }))}>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Badge>{cell.value}%</Badge>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={()=>setCell((c)=>({ ...c, open:false }))}>Close</Button>
            <Button colorScheme='blue' onClick={()=>{
              setHeatMap((m)=>{
                const next = m.map((row)=>row.slice());
                next[cell.dayIndex][cell.periodIndex] = cell.value;
                return next;
              });
              setCell((c)=>({ ...c, open:false }));
            }}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
