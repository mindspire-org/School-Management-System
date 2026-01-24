import React from 'react';

const DebugTeacher = () => {
  console.log('DebugTeacher component is rendering');
  
  return (
    <div style={{
      padding: '100px 20px 20px 20px',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>
        🚀 DEBUG: Teacher Component is Working!
      </h1>
      <p>If you can see this, the routing is working correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default DebugTeacher;
