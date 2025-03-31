import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { binanceService } from '../services/binance';
import { message } from 'antd';
import { useBinance } from '../hooks/useBinance';

// 互換性のために古いキーも定義
const LEGACY_API_CONNECTED_KEYS = [
  'crypto_bot_api_connected',
  'binance_api_connected',
  'is_api_connected'
];

const API_CONNECTED_KEY = 'api_connected';
const LAST_SYNC_TIME_KEY = 'last_sync_time';
const API_KEY_STORAGE_KEY = 'binance_api_key';
const API_SECRET_STORAGE_KEY = 'binance_secret_key_encrypted';

const ApiContext = createContext();

// 接続状態を取得する関数
const getStoredConnectionState = () => {
  // メインのキーをチェック
  if (localStorage.getItem(API_CONNECTED_KEY) === 'true') {
    return true;
  }
  
  // 古いキーをチェック
  return LEGACY_API_CONNECTED_KEYS.some(key => 
    localStorage.getItem(key) === 'true'
  );
};

// 接続状態を設定する関数
const setStoredConnectionState = (connected) => {
  // メインのキーを設定
  localStorage.setItem(API_CONNECTED_KEY, connected.toString());
  
  // 互換性のために古いキーも設定
  LEGACY_API_CONNECTED_KEYS.forEach(key => {
    localStorage.setItem(key, connected.toString());
  });
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const { price, loading, error: binanceError, getPrice, getBalance } = useBinance();

  // APIキーの読み込みと接続確認
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const hasKeys = await binanceService.loadApiKeys();
        if (hasKeys) {
          const serverTime = await binanceService.getServerTime();
          if (serverTime) {
            setIsConnected(true);
            setError(null);
          }
        }
      } catch (err) {
        setError('API接続エラー: ' + err.message);
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  // 定期的な残高更新
  useEffect(() => {
    let intervalId;

    if (isConnected) {
      // 初回の残高取得
      fetchBalance();

      // 30秒ごとに残高を更新
      intervalId = setInterval(fetchBalance, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected]);

  // タブがアクティブになったときに再接続
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isConnected) {
        checkApiConnection();
        fetchBalance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected]);

  const checkApiConnection = async () => {
    try {
      const serverTime = await binanceService.getServerTime();
      const isConnected = !!serverTime;
      setIsConnected(isConnected);
      setError(null);
      return isConnected;
    } catch (error) {
      console.error('API接続チェックエラー:', error);
      setIsConnected(false);
      setError(error.message);
      return false;
    }
  };

  const fetchBalance = async () => {
    try {
      const balanceData = await getBalance();
      setBalance(balanceData);
      setLastSync(new Date());
      setError(null);
    } catch (error) {
      console.error('残高取得エラー:', error);
      setError(error.message);
    }
  };

  const saveApiKeys = async (apiKey, secretKey, isTestMode = false) => {
    try {
      await binanceService.saveApiKeys(apiKey, secretKey, isTestMode);
      const connected = await checkApiConnection();
      if (connected) {
        await fetchBalance();
      }
      return connected;
    } catch (error) {
      console.error('APIキー保存エラー:', error);
      setError(error.message);
      return false;
    }
  };

  const clearApiKeys = () => {
    try {
      binanceService.clearApiKeys();
      setIsConnected(false);
      setBalance(null);
      setError(null);
      return true;
    } catch (error) {
      console.error('APIキークリアエラー:', error);
      setError(error.message);
      return false;
    }
  };

  const value = {
    isConnected,
    error,
    balance,
    lastSync,
    checkApiConnection,
    fetchBalance,
    saveApiKeys,
    clearApiKeys,
    getPrice,
    binanceService
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext; 