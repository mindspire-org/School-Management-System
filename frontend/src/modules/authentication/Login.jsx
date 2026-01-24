import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  VStack,
  HStack,
} from '@chakra-ui/react';
// Custom components
import DefaultAuth from '../../layouts/auth/Default';
// Assets
import illustration from '../../assets/img/auth/auth.png';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
// Auth Context
import { useAuth } from '../../contexts/AuthContext';

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  const googleBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.200');
  const googleText = useColorModeValue('navy.700', 'white');
  const googleHover = useColorModeValue(
    { bg: 'gray.200' },
    { bg: 'whiteAlpha.300' }
  );
  const googleActive = useColorModeValue(
    { bg: 'secondaryGray.300' },
    { bg: 'whiteAlpha.200' }
  );

  // State
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const quickProfiles = useMemo(() => ({
    admin: { email: 'admin@mindspire.com', password: 'password123', label: 'Admin', colorScheme: 'blue' },
    teacher: { email: 'teacher@mindspire.com', password: 'password123', label: 'Teacher', colorScheme: 'green' },
    student: { email: 'student@mindspire.com', password: 'password123', label: 'Student', colorScheme: 'purple' },
    driver: { email: 'driver@mindspire.com', password: 'password123', label: 'Driver', colorScheme: 'orange' },
  }), []);

  // Auth Context
  const { login, clearError, loading: authLoading, error: authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle click to show/hide password
  const handleClick = () => setShow(!show);

  // On mount and auth changes, just clear previous errors (do not auto-redirect)
  useEffect(() => {
    clearError();
  }, [clearError, isAuthenticated]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password, rememberMe);
  };

  // Quick login buttons call backend using seeded accounts
  const quickLogin = async (role) => {
    const preset = quickProfiles[role];
    if (!preset) return;
    setEmail(preset.email);
    setPassword(preset.password);
    await login(preset.email, preset.password, false);
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: '100%', md: 'max-content' }}
        w='100%'
        mx={{ base: 'auto', lg: '0px' }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: '30px', md: '60px' }}
        px={{ base: '25px', md: '0px' }}
        mt={{ base: '40px', md: '14vh' }}
        flexDirection='column'>
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>
            MINDSPIRE SMS
          </Heading>
          <Text
            mb='36px'
            ms='4px'
            color={textColorSecondary}
            fontWeight='400'
            fontSize='md'>
            School Management System Portal
          </Text>
        </Box>
        
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: '100%', md: '420px' }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: 'auto', lg: 'unset' }}
          me='auto'
          mb={{ base: '20px', md: 'auto' }}>
          
          {/* Demo Credentials */}
          <Alert status='info' borderRadius='12px' mb='20px'>
            <AlertIcon />
            <VStack align='start' spacing={1} fontSize='sm'>
              <Text fontWeight='bold'>Demo Credentials:</Text>
              <HStack spacing={2} flexWrap='wrap'>
                {Object.entries(quickProfiles).map(([roleKey, preset]) => (
                  <Button
                    key={roleKey}
                    size='sm'
                    colorScheme={preset.colorScheme}
                    variant='solid'
                    onClick={() => quickLogin(roleKey)}
                    isDisabled={authLoading}
                  >
                    {preset.label}
                  </Button>
                ))}
              </HStack>
              <Text fontSize='xs' color='gray.600'>
                Click on a role to auto-fill credentials

              </Text>
            </VStack>
          </Alert>

          {/* Error Alert */}
          {authError && (
            <Alert status='error' borderRadius='12px' mb='20px'>
              <AlertIcon />
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel
                display='flex'
                ms='4px'
                fontSize='sm'
                fontWeight='500'
                color={textColor}
                mb='8px'>
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired={true}
                variant='auth'
                fontSize='sm'
                ms={{ base: '0px', md: '0px' }}
                type='email'
                placeholder='Enter your email'
                mb='24px'
                fontWeight='500'
                size='lg'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={authLoading}
              />
              
              <FormLabel
                ms='4px'
                fontSize='sm'
                fontWeight='500'
                color={textColor}
                display='flex'>
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size='md'>
                <Input
                  isRequired={true}
                  fontSize='sm'
                  placeholder='Enter your password'
                  mb='24px'
                  size='lg'
                  type={show ? 'text' : 'password'}
                  variant='auth'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading}
                />
                <InputRightElement display='flex' alignItems='center' mt='4px'>
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: 'pointer' }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>
              
              <Flex justifyContent='space-between' align='center' mb='24px'>
                <FormControl display='flex' alignItems='center'>
                  <Checkbox
                    id='remember-login'
                    colorScheme='brandScheme'
                    me='10px'
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={authLoading}
                  />
                  <FormLabel
                    htmlFor='remember-login'
                    mb='0'
                    fontWeight='normal'
                    color={textColor}
                    fontSize='sm'>
                    Keep me logged in
                  </FormLabel>
                </FormControl>
                <NavLink to='/auth/forgot-password'>
                  <Text color={brandStars} fontSize='sm' w='124px' fontWeight='500'>
                    Forgot password?
                  </Text>
                </NavLink>
              </Flex>
              
              <Button
                fontSize='sm'
                variant='brand'
                fontWeight='500'
                w='100%'
                h='50'
                mb='24px'
                type='submit'
                isLoading={authLoading}
                loadingText='Signing in...'>
                Sign In
              </Button>
              <Flex justifyContent='center' mb='24px'>
                <Text color={textColorSecondary} fontSize='sm'>
                  Don't have an account?{' '}
                  <NavLink to='/auth/sign-up'>
                    <Text as='span' color={brandStars} fontWeight='500'>
                      Sign up
                    </Text>
                  </NavLink>
                </Text>
              </Flex>
            </FormControl>
          </form>
          
          <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='start'
            maxW='100%'
            mt='0px'>
            <Text color={textColorSecondary} fontWeight='400' fontSize='14px'>
              MINDSPIRE School Management System
            </Text>
            <Text color={textColorSecondary} fontWeight='400' fontSize='14px'>
              Version 1.0.0
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
