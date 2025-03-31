import { useState, useEffect, useCallback } from 'react';
import { binanceService } from '../services/binance';

export const useBinance = () => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    // 初期化時にAPI接続状態をチェック
    const checkInitialConnection = async () => {
      try {
        const hasKeys = await binanceService.loadApiKeys();
        if (hasKeys) {
          const serverTime = await binanceService.getServerTime();
          setIsConnected(!!serverTime);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error('初期接続チェックエラー:', err);
        setIsConnected(false);
        setError(err.message);
      }
    };

    checkInitialConnection();
  }, []);

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const fetchPrice = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        const data = await binanceService.getPrice('BTCUSDT');
        if (mounted) {
          setPrice(data.price);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // 接続状態がtrueの場合のみ価格取得を行う
    if (isConnected) {
      // 初回実行
      fetchPrice();

      // 1秒ごとに更新
      intervalId = setInterval(fetchPrice, 1000);
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isConnected]);
  
  // サーバー時間を取得し、接続状態をチェック
  const checkApiConnection = async () => {
    setLoading(true);
    try {
      const serverTime = await binanceService.getServerTime();
      const connected = !!serverTime;
      setIsConnected(connected);
      setError(connected ? null : 'サーバーに接続できませんでした');
      return connected;
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // 残高を取得
  const getBalance = async () => {
    setLoading(true);
    try {
      const balance = await binanceService.getBalance();
      setLastSyncTime(new Date());
      return balance;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // APIキーを保存
  const saveApiKeys = async (apiKey, secretKey, isTestMode = false) => {
    setLoading(true);
    try {
      await binanceService.saveApiKeys(apiKey, secretKey, isTestMode);
      const connected = await checkApiConnection();
      return connected;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // APIキーをクリア
  const clearApiKeys = async () => {
    setLoading(true);
    try {
      binanceService.clearApiKeys();
      setIsConnected(false);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    price,
    loading,
    error,
    isConnected,
    lastSyncTime,
    checkApiConnection,
    getBalance,
    saveApiKeys,
    clearApiKeys,
    getPrice: binanceService.getPrice.bind(binanceService),
    getServerTime: binanceService.getServerTime.bind(binanceService),
    createWebSocket: binanceService.createWebSocket.bind(binanceService),
    binanceService
  };
};

export default useBinance; 