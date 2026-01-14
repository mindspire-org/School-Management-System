// Chakra imports
import { Box, Flex, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React from "react";
import FixedPlugin from "components/fixedPlugin/FixedPlugin";

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
      py={{ base: "10", md: "16" }}>
      <Box
        w='100%'
        maxW='1100px'
        mx='4'
        bg='white'
        borderRadius='2xl'
        boxShadow='xl'
        overflow='hidden'>
        <Flex direction={{ base: "column", md: "row" }} w='100%' h='100%'>
          <Box
            w={{ base: "100%", md: "50%" }}
            display={{ base: "none", md: "flex" }}
            alignItems='center'
            justifyContent='center'
            bgGradient='linear(to-b, #eef2ff, #e0f2fe)'
            borderRightWidth={{ base: "0", md: "1px" }}
            borderColor='gray.100'>
            <Box
              maxW='360px'
              textAlign='left'
              color='navy.700'
              px='10'>
              <Text fontSize='lg' fontWeight='700' mb='2'>
                MindSpire SMS
              </Text>
              <Text fontSize='sm' color='gray.500' mb='6'>
                A central hub where schools manage classes, staff, students, and
                daily operations in one place.
              </Text>
              <Box
                bgImage={illustrationBackground}
                bgSize='contain'
                bgRepeat='no-repeat'
                bgPosition='center'
                w='100%'
                h='260px'
              />
            </Box>
          </Box>
          <Box
            w={{ base: "100%", md: "50%" }}
            px={{ base: "6", md: "10" }}
            py={{ base: "8", md: "10" }}
            display='flex'
            alignItems='center'
            justifyContent='center'>
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
