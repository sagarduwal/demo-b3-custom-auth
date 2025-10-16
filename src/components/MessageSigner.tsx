import React, { useState } from 'react';
import { b3Service } from '../services/b3Service';

const MessageSigner: React.FC = () => {
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleSignMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message to sign');
      return;
    }

    try {
      setIsSigning(true);
      const result = await b3Service.signMessage(message);
      setSignature(result);
    } catch (error: any) {
      console.error('Error signing message:', error);
      alert('Failed to sign message: ' + error.message);
    } finally {
      setIsSigning(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    setSignature(null);
  };

  return (
    <div className="card">
      <h3>Message Signing</h3>
      <div>
        <label htmlFor="message">Message to sign:</label>
        <textarea
          id="message"
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message to sign..."
          rows={3}
        />
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <button 
          className="button" 
          onClick={handleSignMessage}
          disabled={isSigning || !message.trim()}
        >
          {isSigning ? 'Signing...' : 'Sign Message'}
        </button>
        
        <button 
          className="button" 
          onClick={handleClear}
          style={{ marginLeft: '10px' }}
        >
          Clear
        </button>
      </div>

      {signature && (
        <div style={{ marginTop: '15px' }}>
          <strong>Signature:</strong>
          <div className="address" style={{ marginTop: '5px' }}>
            {signature}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageSigner;
