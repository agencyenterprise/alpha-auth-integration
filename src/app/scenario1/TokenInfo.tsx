'use client';

import { useState } from 'react';

interface DecodedToken {
  header: any;
  payload: any;
}

function decodeJwt(token: string): DecodedToken {
  try {
    const parts = token.split('.');
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    return { header, payload };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return { 
      header: { error: 'Invalid token format' }, 
      payload: { error: 'Invalid token format' } 
    };
  }
}

function formatTime(timestamp: number): string {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

interface TokenInfoProps {
  token: string;
  type: 'id' | 'access';
}

export default function TokenInfo({ token, type }: TokenInfoProps) {
  const [showRaw, setShowRaw] = useState(false);
  const decoded = decodeJwt(token);
  
  const isExpired = decoded.payload.exp 
    ? new Date(decoded.payload.exp * 1000) < new Date() 
    : false;
  
  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-lg">
          {type === 'id' ? 'ID Token' : 'Access Token'} Details
        </h4>
        <button 
          onClick={() => setShowRaw(!showRaw)}
          className="text-blue-500 text-sm hover:underline"
        >
          {showRaw ? 'Show Decoded' : 'Show Raw'}
        </button>
      </div>
      
      {showRaw ? (
        <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto max-h-48 overflow-y-auto">
          {token}
        </pre>
      ) : (
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-sm text-gray-700 mb-1">Header</h5>
            <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto max-h-32 overflow-y-auto">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          
          <div>
            <h5 className="font-medium text-sm text-gray-700 mb-1">Payload</h5>
            <pre className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto max-h-32 overflow-y-auto">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Issued At:</span>{' '}
              {formatTime(decoded.payload.iat)}
            </div>
            <div>
              <span className="font-medium">Expires:</span>{' '}
              <span className={isExpired ? 'text-red-500' : ''}>
                {formatTime(decoded.payload.exp)}
                {isExpired && ' (Expired)'}
              </span>
            </div>
            {type === 'access' && decoded.payload.scope && (
              <div className="col-span-2">
                <span className="font-medium">Scopes:</span>{' '}
                <span className="text-green-600">
                  {decoded.payload.scope.split(' ').join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 