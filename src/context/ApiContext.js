import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { binanceService } from '../services/binance';
import { message } from 'antd';
import { useBinance } from '../hooks/useBinance';

// API接続ステータスのローカルストレージキー
const API_CONNECTED_KEY = 'api_connected';
const LAST_SYNC_TIME_KEY = 'last_sync_time';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [balance, setBalance] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // APIキーの読み込みと接続確認
  useEffect(() => {
    const initializeApi = async () => {
      try {
        setIsChecking(true);
        const hasKeys = await binanceService.loadApiKeys();
        if (hasKeys) {
          const serverTime = await binanceService.getServerTime();
          if (serverTime) {
            setIsConnected(true);
            localStorage.setItem(API_CONNECTED_KEY, 'true');
            
            // 保存された最終同期時間があれば読み込む
            const savedLastSync = localStorage.getItem(LAST_SYNC_TIME_KEY);
            if (savedLastSync) {
              setLastSyncTime(new Date(parseInt(savedLastSync)));
            }
            
            // 初期残高を取得
            fetchBalance();
          } else {
            setIsConnected(false);
            localStorage.setItem(API_CONNECTED_KEY, 'false');
          }
        } else {
          setIsConnected(false);
          localStorage.setItem(API_CONNECTED_KEY, 'false');
        }
      } catch (err) {
        console.error('API初期化エラー:', err);
        setError(err.message);
        setIsConnected(false);
        localStorage.setItem(API_CONNECTED_KEY, 'false');
      } finally {
        setIsChecking(false);
      }
    };

    initializeApi();
  }, []);

  // 残高を取得する関数
  const fetchBalance = async () => {
    if (!isConnected) return;
    
    try {
      setIsChecking(true);
      const balanceData = await binanceService.getBalance();
      setBalance(balanceData);
      
      const now = Date.now();
      setLastSyncTime(new Date(now));
      localStorage.setItem(LAST_SYNC_TIME_KEY, now.toString());
      
      setError(null);
      return balanceData;
    } catch (err) {
      console.error('残高取得エラー:', err);
      setError(`残高取得エラー: ${err.message}`);
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  // API接続状態を確認
  const checkApiConnection = async () => {
    try {
      setIsChecking(true);
      const serverTime = await binanceService.getServerTime();
      const connected = !!serverTime;
      
      setIsConnected(connected);
      localStorage.setItem(API_CONNECTED_KEY, connected.toString());
      
      if (connected) {
        setError(null);
        fetchBalance();
      } else {
        setError('APIに接続できませんでした');
      }
      
      return connected;
    } catch (err) {
      console.error('API接続確認エラー:', err);
      setIsConnected(false);
      localStorage.setItem(API_CONNECTED_KEY, 'false');
      setError(`API接続エラー: ${err.message}`);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // APIキーを保存
  const saveApiKeys = async (apiKey, secretKey, isTestMode = false) => {
    try {
      setIsChecking(true);
      
      await binanceService.saveApiKeys(apiKey, secretKey, isTestMode);
      const connected = await checkApiConnection();
      
      if (connected) {
        message.success('APIキーを保存しました');
        await fetchBalance();
      } else {
        message.error('APIキーを保存しましたが、接続できませんでした');
      }
      
      return connected;
    } catch (err) {
      console.error('APIキー保存エラー:', err);
      setError(`APIキー保存エラー: ${err.message}`);
      message.error(`APIキー保存エラー: ${err.message}`);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // APIキーをクリア
  const clearApiKeys = () => {
    try {
      binanceService.clearApiKeys();
      setIsConnected(false);
      setBalance(null);
      setError(null);
      localStorage.setItem(API_CONNECTED_KEY, 'false');
      message.success('API設定をクリアしました');
      return true;
    } catch (err) {
      console.error('APIキークリアエラー:', err);
      setError(`APIキークリアエラー: ${err.message}`);
      message.error(`APIキークリアエラー: ${err.message}`);
      return false;
    }
  };

  // 定期的な残高更新
  useEffect(() => {
    let intervalId;

    if (isConnected) {
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
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected]);

  // 価格を取得
  const getPrice = useCallback(async (symbol = 'BTCUSDT') => {
    try {
      return await binanceService.getPrice(symbol);
    } catch (err) {
      console.error('価格取得エラー:', err);
      return null;
    }
  }, []);

  const value = {
    isConnected,
    isChecking,
    error,
    balance,
    lastSyncTime,
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