// Chakra imports
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";
import FixedPlugin from "components/fixedPlugin/FixedPlugin";
import { MdSchool } from "react-icons/md";

function AuthIllustration(props) {
  const { children, illustrationBackground } = props;

  return (
    <Flex
      position='relative'
      minH='100vh'
      w='100%'
      bg='gray.50'
      align='center'
      justify='center'
      overflow='hidden'
      py={{ base: "10", md: "16" }}>
      {/* Decorative background blobs */}
      <Box
        position='absolute'
        top='-120px'
        right='-80px'
        w='400px'
        h='400px'
        borderRadius='full'
        bgGradient='linear(135deg, rgba(66,42,251,0.12), rgba(117,81,255,0.08))'
        filter='blur(80px)'
        zIndex='0'
      />
      <Box
        position='absolute'
        bottom='-100px'
        left='-60px'
        w='350px'
        h='350px'
        borderRadius='full'
        bgGradient='linear(135deg, rgba(1,181,116,0.10), rgba(66,42,251,0.06))'
        filter='blur(70px)'
        zIndex='0'
      />

      <Box
        w='100%'
        maxW='1140px'
        mx='4'
        bg='white'
        borderRadius='3xl'
        boxShadow='0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)'
        overflow='hidden'
        zIndex='1'
        position='relative'>
        <Flex direction={{ base: "column", md: "row" }} w='100%' h='100%'>
          {/* Left illustration panel */}
          <Box
            w={{ base: "100%", md: "50%" }}
            display={{ base: "none", md: "flex" }}
            alignItems='center'
            justifyContent='center'
            position='relative'
            bgGradient='linear(135deg, #422AFB 0%, #7551FF 40%, #a78bfa 100%)'
            borderRightWidth={{ base: "0", md: "0px" }}
            borderColor='transparent'
            py='10'
            overflow='hidden'>
            {/* Decorative circles */}
            <Box
              position='absolute'
              top='-40px'
              left='-40px'
              w='180px'
              h='180px'
              borderRadius='full'
              bg='whiteAlpha.200'
            />
            <Box
              position='absolute'
              bottom='60px'
              right='-30px'
              w='140px'
              h='140px'
              borderRadius='full'
              bg='whiteAlpha.150'
            />
            <Box
              position='absolute'
              top='50%'
              left='20px'
              w='60px'
              h='60px'
              borderRadius='full'
              bg='whiteAlpha.100'
            />
            {/* Decorative dots grid */}
            <Box
              position='absolute'
              top='20px'
              right='20px'
              opacity='0.15'
              display='grid'
              gridTemplateColumns='repeat(5, 1fr)'
              gap='8px'>
              {Array.from({ length: 25 }).map((_, i) => (
                <Box key={i} w='4px' h='4px' borderRadius='full' bg='white' />
              ))}
            </Box>

            <Box
              maxW='380px'
              textAlign='center'
              color='white'
              px='10'
              position='relative'
              zIndex='1'>
              <Flex
                justify='center'
                mb='6'>
                <Flex
                  w='64px'
                  h='64px'
                  borderRadius='2xl'
                  bg='whiteAlpha.300'
                  backdropFilter='blur(10px)'
                  align='center'
                  justify='center'>
                  <Icon as={MdSchool} boxSize='8' color='white' />
                </Flex>
              </Flex>
              <Text fontSize='2xl' fontWeight='800' mb='3' letterSpacing='-0.5px'>
                MindSpire SMS
              </Text>
              <Text fontSize='sm' color='whiteAlpha.800' mb='8' lineHeight='tall'>
                A central hub where schools manage classes, staff, students, and
                daily operations in one place.
              </Text>
              <Box
                bgImage={illustrationBackground}
                bgSize='contain'
                bgRepeat='no-repeat'
                bgPosition='center'
                w='100%'
                h='240px'
                opacity='0.9'
              />
            </Box>
          </Box>

          {/* Right form panel */}
          <Box
            w={{ base: "100%", md: "50%" }}
            px={{ base: "6", md: "12" }}
            py={{ base: "8", md: "10" }}
            display='flex'
            alignItems='center'
            justifyContent='center'
            bg='white'>
            <Box w='100%' maxW='420px'>
              {children}
            </Box>
          </Box>
        </Flex>
      </Box>
      <FixedPlugin />
    </Flex>
  );
}

AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  image: PropTypes.any,
};

export default AuthIllustration;
