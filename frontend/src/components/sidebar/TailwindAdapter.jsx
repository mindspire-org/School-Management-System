import React from 'react';
import { Box } from '@chakra-ui/react';

/**
 * TailwindAdapter allows us to use Tailwind CSS classes with Chakra UI components
 * by passing them through the className prop to a Chakra Box component
 */
const TailwindAdapter = ({ children, className, ...rest }) => {
  return (
    <Box className={className} {...rest}>
      {children}
    </Box>
  );
};

export default TailwindAdapter;
