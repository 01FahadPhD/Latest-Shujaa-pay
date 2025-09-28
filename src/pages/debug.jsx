import React from 'react';

const DebugPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'green', fontSize: '24px' }}>🛠️ Debug Page</h1>
      <p>If you can see this, Next.js routing is working!</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Test Links:</h2>
        <ul>
          <li><a href="/seller/dashboard" style={{ color: 'blue' }}>/seller/dashboard</a></li>
          <li><a href="/seller/generate-link" style={{ color: 'blue' }}>/seller/generate-link</a></li>
          <li><a href="/auth/login" style={{ color: 'blue' }}>/auth/login</a></li>
        </ul>
      </div>
    </div>
  );
};

export default DebugPage;