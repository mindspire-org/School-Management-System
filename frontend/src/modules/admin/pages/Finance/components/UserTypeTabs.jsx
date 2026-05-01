import React from 'react';
import { Tabs, TabList, Tab, Box } from '@chakra-ui/react';

const USER_TYPES = [
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'driver', label: 'Drivers' },
];

const UserTypeTabs = ({ userType, onChange, disabled = false }) => {
  return (
    <Box mb={6}>
      <Tabs index={USER_TYPES.findIndex(t => t.value === userType)} onChange={(index) => onChange(USER_TYPES[index].value)}>
        <TabList>
          {USER_TYPES.map((type) => (
            <Tab key={type.value} isDisabled={disabled}>
              {type.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </Box>
  );
};

export default UserTypeTabs;
