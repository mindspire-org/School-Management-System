import React, { useMemo, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  HStack,
  VStack,
  Input,
  Button,
  Icon,
  InputGroup,
  InputRightElement,
  Progress,
  useColorModeValue,
  FormControl,
  FormLabel,
  Switch,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import { MdRefresh, MdSave, MdVisibility, MdVisibilityOff, MdSecurity, MdVerifiedUser, MdListAlt } from 'react-icons/md';
import Card from '../../../components/card/Card';
import MiniStatistics from '../../../components/card/MiniStatistics';
import IconBox from '../../../components/icons/IconBox';
import { useAuth } from '../../../contexts/AuthContext';
import * as teachersApi from '../../../services/api/teachers';

export default function Password() {
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const { user } = useAuth();
  const toast = useToast();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [saving, setSaving] = useState(false);

  const strength = useMemo(() => {
    let s = 0;
    if (next.length >= 8) s += 25;
    if (/[A-Z]/.test(next)) s += 25;
    if (/[0-9]/.test(next)) s += 25;
    if (/[^A-Za-z0-9]/.test(next)) s += 25;
    return s;
  }, [next]);

  const mismatch = confirm && next !== confirm;
  const isValid = current && next && confirm && !mismatch && strength >= 50;

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); setTwoFA(false); };

  const save = async () => {
    if (!isValid) {
      toast({ status: 'error', title: 'Check password requirements', description: 'All fields must be filled, passwords must match, and strength must be at least Fair.' });
      return;
    }
    setSaving(true);
    try {
      await teachersApi.changeMyPassword({ currentPassword: current, newPassword: next });
      toast({ status: 'success', title: 'Password updated successfully', description: 'Your password has been changed. Please use it on your next login.' });
      reset();
    } catch (e) {
      const msg = e?.data?.message || e?.message || 'Failed to update password';
      toast({ status: 'error', title: 'Error', description: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Text fontSize='2xl' fontWeight='bold' mb='6px'>Password</Text>
      <Text fontSize='md' color={textSecondary} mb='16px'>
        {user?.name ? `${user.name} — ` : ''}Update your password and security preferences
      </Text>

      <Box mb='16px'>
        <Flex gap='16px' w='100%' wrap='nowrap'>
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#4481EB 0%,#04BEFE 100%)' icon={<MdSecurity color='white' />} />} name='Strength' value={`${strength}%`} trendData={[25, 50, 75, 100]} trendColor='#4481EB' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#01B574 0%,#51CB97 100%)' icon={<MdVerifiedUser color='white' />} />} name='2FA' value={twoFA ? 'Enabled' : 'Disabled'} trendData={[0, 1, 0, 1]} trendColor='#01B574' />
          <MiniStatistics compact startContent={<IconBox w='44px' h='44px' bg='linear-gradient(90deg,#B721FF 0%,#21D4FD 100%)' icon={<MdListAlt color='white' />} />} name='Requirements' value='8+ chars' trendData={[1, 1, 1, 1]} trendColor='#B721FF' />
        </Flex>
      </Box>

      <Card p='16px'>
        <VStack align='stretch' spacing={4}>
          <FormControl>
            <FormLabel>Current Password</FormLabel>
            <InputGroup size='sm'>
              <Input type={show1 ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} placeholder='Enter current password' />
              <InputRightElement>
                <Icon as={show1 ? MdVisibilityOff : MdVisibility} cursor='pointer' onClick={() => setShow1(s => !s)} />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel>New Password</FormLabel>
            <InputGroup size='sm'>
              <Input type={show2 ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} placeholder='8+ chars, uppercase, number, symbol' />
              <InputRightElement>
                <Icon as={show2 ? MdVisibilityOff : MdVisibility} cursor='pointer' onClick={() => setShow2(s => !s)} />
              </InputRightElement>
            </InputGroup>
            <Progress mt={2} value={strength} size='sm' colorScheme={strength < 50 ? 'red' : strength < 75 ? 'yellow' : 'green'} borderRadius='md' />
          </FormControl>

          <FormControl isInvalid={!!mismatch}>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup size='sm'>
              <Input type={show3 ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder='Re-enter new password' isInvalid={mismatch} />
              <InputRightElement>
                <Icon as={show3 ? MdVisibilityOff : MdVisibility} cursor='pointer' onClick={() => setShow3(s => !s)} />
              </InputRightElement>
            </InputGroup>
            {mismatch && <Text fontSize='xs' color='red.500' mt='4px'>Passwords do not match</Text>}
          </FormControl>

          <HStack spacing={3} flexWrap='wrap' rowGap={3}>
            <FormControl display='flex' alignItems='center' width='auto'>
              <FormLabel htmlFor='twoFA' mb='0'>Enable Two‑Factor</FormLabel>
              <Switch id='twoFA' isChecked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
            </FormControl>
            <Tooltip label='Receive an email when your password changes'>
              <Switch colorScheme='blue' />
            </Tooltip>
          </HStack>

          <Flex justify='flex-end' gap={2} flexWrap='wrap' rowGap={3}>
            <Button size='sm' variant='outline' leftIcon={<Icon as={MdRefresh} />} onClick={reset} isDisabled={saving}>Reset</Button>
            <Button
              size='sm' colorScheme='blue' leftIcon={<Icon as={MdSave} />}
              isDisabled={!isValid}
              isLoading={saving}
              loadingText='Saving...'
              onClick={save}
            >
              Save
            </Button>
          </Flex>
        </VStack>
      </Card>
    </Box>
  );
}
