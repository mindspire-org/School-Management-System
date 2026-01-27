import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, SimpleGrid, VStack, HStack, Button, Icon, useColorModeValue, FormControl, FormLabel, Input, InputGroup, InputRightElement, Progress, useToast, Flex } from '@chakra-ui/react';
import { MdSave, MdRefresh, MdVisibility, MdVisibilityOff, MdSecurity, MdListAlt, MdLightbulb } from 'react-icons/md';
import Card from '../../../components/card/Card';
import { useAuth } from '../../../contexts/AuthContext';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import * as studentsApi from '../../../services/api/students';

function strengthScore(p){
  let s = 0; if (!p) return 0; if (p.length>=8) s++; if (/[A-Z]/.test(p)) s++; if (/[a-z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++; return Math.min(s,5);
}

export default function Password(){
  const textSecondary = useColorModeValue('gray.600','gray.400');
  const { user } = useAuth();
  const toast = useToast();

  const [student, setStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role !== 'student') return;
        const payload = await studentsApi.list({ pageSize: 1 });
        const me = Array.isArray(payload?.rows) && payload.rows.length ? payload.rows[0] : null;
        setStudent(me);
      } catch {
        setStudent(null);
      }
    };
    load();
  }, [user?.role]);

  const classSection = `${student?.class || ''}${student?.section || ''}`;

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  const score = strengthScore(next);
  const valid = next && confirm && next===confirm && score>=3;

  const onSave = async ()=>{
    if (!valid) { toast({ status:'error', title:'Check password requirements' }); return; }
    try {
      await studentsApi.changeMyPassword({ currentPassword: current, newPassword: next });
      toast({ status:'success', title:'Password updated' });
      setCurrent(''); setNext(''); setConfirm('');
    } catch {
      toast({ status:'error', title:'Failed to update password' });
    }
  };

  const onReset = ()=>{ setCurrent(''); setNext(''); setConfirm(''); };

  return (
    <Box pt={{ base:'130px', md:'80px', xl:'80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Password</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {(student?.name || user?.name || '')}
        {student?.rollNumber ? ` • Roll ${student.rollNumber}` : ''}
        {classSection ? ` • Class ${classSection}` : ''}
      </Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#805AD5 0%,#D53F8C 100%)' icon={<Icon as={MdSecurity} w='22px' h='22px' color='white' />} />}
            name='Security Level'
            value={['Weak','Weak','Fair','Good','Strong','Strong'][score]}
            trendData={[1,2,3,4,score]}
            trendColor='#805AD5'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<Icon as={MdListAlt} w='22px' h='22px' color='white' />} />}
            name='Requirements'
            value={'4 rules'}
            trendData={[1,1,1,1,1]}
            trendColor='#4481EB'
          />
          <MiniStatistics
            compact
            startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<Icon as={MdLightbulb} w='22px' h='22px' color='white' />} />}
            name='Tip'
            value={'Unique password'}
            trendData={[1,1,1,1,1]}
            trendColor='#01B574'
          />
        </Flex>
      </Box>

      <Card p='16px'>
        <SimpleGrid columns={{ base:1, sm:2 }} spacing={4}>
          <FormControl>
            <FormLabel>Current Password</FormLabel>
            <InputGroup>
              <Input type={show1?'text':'password'} value={current} onChange={e=>setCurrent(e.target.value)} placeholder='Current password' />
              <InputRightElement>
                <Icon as={show1? MdVisibilityOff: MdVisibility} cursor='pointer' onClick={()=>setShow1(!show1)} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel>New Password</FormLabel>
            <InputGroup>
              <Input type={show2?'text':'password'} value={next} onChange={e=>setNext(e.target.value)} placeholder='New password' />
              <InputRightElement>
                <Icon as={show2? MdVisibilityOff: MdVisibility} cursor='pointer' onClick={()=>setShow2(!show2)} />
              </InputRightElement>
            </InputGroup>
            <Progress mt={2} value={(score/5)*100} size='sm' colorScheme={score>=4?'green':score>=3?'yellow':'red'} borderRadius='md' />
          </FormControl>
          <FormControl>
            <FormLabel>Confirm New Password</FormLabel>
            <InputGroup>
              <Input type={show3?'text':'password'} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder='Confirm password' />
              <InputRightElement>
                <Icon as={show3? MdVisibilityOff: MdVisibility} cursor='pointer' onClick={()=>setShow3(!show3)} />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </SimpleGrid>
        <HStack mt={4}>
          <Button colorScheme='purple' leftIcon={<Icon as={MdSave} />} onClick={onSave} isDisabled={!valid}>Update Password</Button>
          <Button variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={onReset}>Reset</Button>
        </HStack>
      </Card>
    </Box>
  );
}
