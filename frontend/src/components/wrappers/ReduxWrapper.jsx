import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';

/**
 * Redux wrapper to provide Redux store context to components
 * This ensures all components have access to Redux even in nested routes
 */
const ReduxWrapper = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxWrapper;
