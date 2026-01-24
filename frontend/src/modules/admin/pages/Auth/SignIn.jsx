import React, { useState } from 'react';
import { Box, Flex, Heading, Text, Button, Input, InputGroup, InputLeftElement, FormControl, FormLabel, Checkbox, Link, useToast, VStack, HStack, Icon, useColorModeValue, Badge, Divider } from '@chakra-ui/react';
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';
import Card from '../../../../components/card/Card';
import { useNavigate } from 'react-router-dom';

export default function SignIn({ redirectTo = '/admin/dashboard' }) {
  const [email, setEmail] = useState('admin@school.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const heroBg = useColorModeValue('linear-gradient(135deg, #6a85f1 0%, #53c0f0 50%, #7f53f0 100%)', 'linear-gradient(135deg, #4b5bc7 0%, #3b9ec9 50%, #6f3bc9 100%)');

  const roleCreds = {
    admin: { email: 'admin@school.com', password: 'password' },
    teacher: { email: 'teacher@school.com', password: 'password' },
    student: { email: 'student@school.com', password: 'password' },
    driver: { email: 'driver@school.com', password: 'password' },
  };

  const fillRole = (role) => {
    const c = roleCreds[role];
    if (!c) return;
    setEmail(c.email);
    setPassword(c.password);
  };

  const handleSignIn = () => {
    setLoading(true);
    toast({ title: 'Signing in...', status: 'info', duration: 1200, isClosable: true });
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'Welcome back!', status: 'success', duration: 1500, isClosable: true });
      navigate(redirectTo);
    }, 1500);
  };

  return (
    <Box pt={{ base: '80px', md: '40px', xl: '40px' }}>
      <Flex direction={{ base: 'column', xl: 'row' }} gap={6} align='stretch' justify='center' mx='auto' maxW='1200px'>
        {/* Left: Form */}
        <Box flex='1' minW={{ base: '100%', xl: '50%' }} px={{ base: 4, md: 8 }}>
          <Heading size='lg' mb={1}>MINDSPIRE SMS</Heading>
          <Text color={textColorSecondary} mb={6}>School Management System Portal</Text>

          <Card p={6} mb={6}>
            <VStack align='stretch' spacing={3}>
              <Text fontWeight='700'>Demo Credentials:</Text>
              <Text color={textColorSecondary} fontSize='sm'>Click on a role to auto-fill credentials</Text>
              <HStack spacing={2} wrap='wrap'>
                <Badge as='button' onClick={()=>fillRole('admin')} colorScheme='blue' px={3} py={1} borderRadius='full'>ADMIN</Badge>
                <Badge as='button' onClick={()=>fillRole('teacher')} colorScheme='green' px={3} py={1} borderRadius='full'>TEACHER</Badge>
                <Badge as='button' onClick={()=>fillRole('student')} colorScheme='purple' px={3} py={1} borderRadius='full'>STUDENT</Badge>
                <Badge as='button' onClick={()=>fillRole('driver')} colorScheme='orange' px={3} py={1} borderRadius='full'>DRIVER</Badge>
              </HStack>
            </VStack>
          </Card>

          <Card maxW='560px' w='100%' p={8}>
            <VStack spacing={4} align='stretch'>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <Icon as={MdEmail} color='gray.400' />
                  </InputLeftElement>
                  <Input type='email' value={email} onChange={(e)=>setEmail(e.target.value)} placeholder='Enter your email' />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <Icon as={MdLock} color='gray.400' />
                  </InputLeftElement>
                  <Input type='password' value={password} onChange={(e)=>setPassword(e.target.value)} placeholder='Enter your password' />
                </InputGroup>
              </FormControl>
              <Flex align='center' justify='space-between'>
                <Checkbox defaultChecked>Keep me logged in</Checkbox>
                <Link color='blue.500'>Forgot password?</Link>
              </Flex>
              <Button colorScheme='blue' leftIcon={<MdLogin />} isLoading={loading} onClick={handleSignIn}>Sign In</Button>
              <Flex align='center' justify='space-between' mt={2}>
                <Text color={textColorSecondary} fontSize='sm'>Don't have an account?</Text>
                <Link color='blue.500' fontSize='sm' onClick={() => navigate('/auth/sign-up')}>
                  Sign up
                </Link>
              </Flex>
              <Divider />
              <Text color={textColorSecondary} fontSize='xs'>MINDSPIRE School Management System · Version 1.0.0</Text>
            </VStack>
          </Card>
        </Box>

        {/* Right: Hero */}
        <Box flex='1' minW={{ base: '100%', xl: '50%' }} borderRadius='16px' overflow='hidden' position='relative'>
          <Box w='100%' h={{ base: '220px', md: '320px', xl: '560px' }} bg={heroBg} display='flex' alignItems='center' justifyContent='center'>
            <VStack spacing={3} color='white'>
              <Box w='100px' h='100px' borderRadius='full' bg='whiteAlpha.900' />
              <Text fontSize='lg' fontWeight='700'>Horizon UI</Text>
              <Text fontSize='sm' opacity={0.9}>Learn more at horizon-ui.com</Text>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
