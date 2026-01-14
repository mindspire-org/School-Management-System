import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'redux/hooks';
import { login, clearError } from 'redux/features/auth/authSlice';

const ReduxLoginExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  // Redux state
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  
  // Colors for theming
  const textColor = useColorModeValue('navy.700', 'white');
  const textColorSecondary = 'gray.400';
  const brandStars = useColorModeValue('brand.500', 'brand.400');
  
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
    
    // Clear previous error messages when component mounts
    dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      return;
    }
    
    // Dispatch login action
    dispatch(login({ email, password }));
  };
  
  return (
    <Flex
      direction="column"
      alignSelf="center"
      justifySelf="center"
      overflow="hidden"
    >
      <Box
        p="16px"
        bg={useColorModeValue('white', 'navy.800')}
        borderRadius="30px"
        mx={{ base: '10px', lg: 'auto' }}
        width={{ base: '100%', md: '420px' }}
        boxShadow="0 20px 27px 0 rgb(0 0 0 / 5%)"
      >
        <Flex
          mb="10px"
          justifyContent="space-between"
          align="center"
        >
          <Heading color={textColor} fontSize="36px" mb="10px">
            Sign In
          </Heading>
        </Flex>
        <Text
          mb="36px"
          ms="4px"
          color={textColorSecondary}
          fontWeight="400"
          fontSize="md"
        >
          Enter your email and password to sign in
        </Text>
        
        {error && (
          <Alert status="error" variant="subtle" mb="15px" borderRadius="10px">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormControl mb="24px">
            <FormLabel
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              display="flex"
            >
              Email<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              variant="auth"
              fontSize="sm"
              ms={{ base: "0px", md: "4px" }}
              placeholder="mail@school.com"
              mb="24px"
              fontWeight="500"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <FormLabel
              ms="4px"
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              display="flex"
            >
              Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md">
              <Input
                variant="auth"
                fontSize="sm"
                ms={{ base: "0px", md: "4px" }}
                placeholder="Min. 8 characters"
                mb="24px"
                fontWeight="500"
                size="lg"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <InputRightElement display="flex" alignItems="center" mt="4px">
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  variant="ghost"
                />
              </InputRightElement>
            </InputGroup>
            
            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50"
              mb="24px"
              type="submit"
              isLoading={loading}
              loadingText="Signing in"
            >
              Sign In
            </Button>
          </FormControl>
        </form>
        
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          maxW="100%"
          mt="0px"
        >
          <Text color={textColorSecondary} fontWeight="400" fontSize="sm">
            Demo Credentials:
          </Text>
          <Text color={textColorSecondary} fontWeight="400" fontSize="sm">
            Email: admin@school.com | Password: password
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ReduxLoginExample;
