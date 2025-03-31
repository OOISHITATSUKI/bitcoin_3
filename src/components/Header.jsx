import React from 'react';
import { DollarSign, Activity, AlertTriangle } from 'lucide-react';

const Header = ({ isRunning, onEmergencyStop }) => {
  return (
    <header className="bg-gray-900 text-white shadow-md px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Activity className="h-6 w-6 text-green-400" />
        <h1 className="text-xl font-bold">Crypto Grid Trader</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {isRunning && (
          <button 
            onClick={onEmergencyStop}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center shadow-lg font-bold transition duration-200"
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
            緊急停止
          </button>
        )}
        <div className="flex items-center space-x-1">
          <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm font-medium">{isRunning ? 'システム稼働中' : 'システム停止中'}</span>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-700">
          <DollarSign className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header; 