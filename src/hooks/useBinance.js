import { useState, useEffect, useCallback } from 'react';
import { binanceService } from '../services/binance';
import { message } from 'antd';
import CryptoJS from 'crypto-js';

export const useBinance = () => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
  
  // APIキーのバリデーション
  const validateApiKey = (apiKey) => {
    // Binanceのテストネット用APIキーは64文字の英数字
    const apiKeyPattern = /^[A-Za-z0-9]{64}$/;
    return apiKeyPattern.test(apiKey);
  };

  // シークレットキーのバリデーション
  const validateSecretKey = (secretKey) => {
    // Binanceのテストネット用シークレットキーは64文字の英数字
    const secretKeyPattern = /^[A-Za-z0-9]{64}$/;
    return secretKeyPattern.test(secretKey);
  };

  const saveApiKeys = useCallback(async (apiKey, secretKey, isTestMode) => {
    setIsLoading(true);
    setError(null);

    try {
      // APIキーのバリデーション
      if (!validateApiKey(apiKey)) {
        throw new Error('APIキーの形式が正しくありません。64文字の英数字である必要があります。');
      }

      // シークレットキーのバリデーション（マスク表示の場合はスキップ）
      if (secretKey !== '••••••••••••••••••••••••••••••••' && !validateSecretKey(secretKey)) {
        throw new Error('シークレットキーの形式が正しくありません。64文字の英数字である必要があります。');
      }

      // キーの暗号化と保存
      if (secretKey !== '••••••••••••••••••••••••••••••••') {
        const encryptedSecretKey = CryptoJS.AES.encrypt(secretKey, 'your-encryption-key').toString();
        localStorage.setItem('binance_secret_key_encrypted', `encrypted:${encryptedSecretKey}`);
      }
      
      localStorage.setItem('binance_api_key', apiKey);
      localStorage.setItem('binance_test_mode', isTestMode.toString());

      // Binanceサービスにキーを設定
      await binanceService.saveApiKeys(apiKey, secretKey, isTestMode);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearApiKeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      localStorage.removeItem('binance_api_key');
      localStorage.removeItem('binance_secret_key_encrypted');
      localStorage.removeItem('binance_test_mode');
      await binanceService.clearApiKeys();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    binanceService,
    isLoading
  };
};

export default useBinance; 