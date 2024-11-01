import React from 'react';

const StaffDirectory = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="https://www.purdue.edu/directory/"
        title="Purdue University Staff Directory"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
      />
    </div>
  );
};

export default StaffDirectory;
