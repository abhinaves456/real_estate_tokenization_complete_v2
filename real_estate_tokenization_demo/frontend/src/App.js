// Minimal React UI to demonstrate connect & actions (very small for demo)
import React from 'react';
import RegisterProperty from './components/RegisterProperty';
import TokenizeProperty from './components/TokenizeProperty';
import VerifyProperty from './components/VerifyProperty';

export default function App(){
  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Real Estate Tokenization - Demo</h1>
      <RegisterProperty />
      <hr />
      <TokenizeProperty />
      <hr />
      <VerifyProperty />
    </div>
  );
}
