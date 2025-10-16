import React, { useState } from 'react';
import { b3Service } from '../services/b3Service';

const ContractInteraction: React.FC = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [method, setMethod] = useState('');
  const [params, setParams] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleInteract = async () => {
    if (!contractAddress.trim() || !method.trim()) {
      alert('Please enter contract address and method');
      return;
    }

    try {
      setIsInteracting(true);
      
      // Parse parameters (simple comma-separated values)
      const parsedParams = params.trim() 
        ? params.split(',').map(p => p.trim()).filter(p => p)
        : [];

      const txHash = await b3Service.interactWithContract(contractAddress, method, parsedParams);
      setResult(txHash);
    } catch (error: any) {
      console.error('Error interacting with contract:', error);
      alert('Failed to interact with contract: ' + error.message);
    } finally {
      setIsInteracting(false);
    }
  };

  const handleClear = () => {
    setContractAddress('');
    setMethod('');
    setParams('');
    setResult(null);
  };

  return (
    <div className="card">
      <h3>Contract Interaction</h3>
      
      <div>
        <label htmlFor="contractAddress">Contract Address:</label>
        <input
          id="contractAddress"
          type="text"
          className="input"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>

      <div>
        <label htmlFor="method">Method Name:</label>
        <input
          id="method"
          type="text"
          className="input"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          placeholder="transfer, approve, etc."
        />
      </div>

      <div>
        <label htmlFor="params">Parameters (comma-separated):</label>
        <input
          id="params"
          type="text"
          className="input"
          value={params}
          onChange={(e) => setParams(e.target.value)}
          placeholder="param1, param2, param3"
        />
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <button 
          className="button" 
          onClick={handleInteract}
          disabled={isInteracting || !contractAddress.trim() || !method.trim()}
        >
          {isInteracting ? 'Interacting...' : 'Interact with Contract'}
        </button>
        
        <button 
          className="button" 
          onClick={handleClear}
          style={{ marginLeft: '10px' }}
        >
          Clear
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '15px' }}>
          <strong>Transaction Hash:</strong>
          <div className="address" style={{ marginTop: '5px' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractInteraction;
