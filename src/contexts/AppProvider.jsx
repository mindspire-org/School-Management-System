import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './AuthContext';
import { SidebarContext } from './SidebarContext';
import initialTheme from '../theme/theme';

/**
 * Main App Provider that combines all necessary providers
 * This ensures consistent provider hierarchy across the application
 * Note: Router should be wrapped in index.js, not here
 */
export const AppProvider = ({ children, theme = initialTheme }) => {
  const [toggleSidebar, setToggleSidebar] = React.useState(false);
  
  return (
    <ChakraProvider theme={theme}>
      <SidebarContext.Provider
        value={{
          toggleSidebar,
          setToggleSidebar,
        }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </SidebarContext.Provider>
    </ChakraProvider>
  );
};

export default AppProvider;
