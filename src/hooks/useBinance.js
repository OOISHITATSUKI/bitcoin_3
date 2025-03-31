import { useState, useEffect, useCallback } from 'react';
import { binanceService } from '../services/binance';

export const useBinance = () => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    // 初回実行
    fetchPrice();

    // 1秒ごとに更新
    intervalId = setInterval(fetchPrice, 1000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return {
    price,
    loading,
    error,
    getPrice: binanceService.getPrice.bind(binanceService),
    getBalance: binanceService.getBalance.bind(binanceService),
    getServerTime: binanceService.getServerTime.bind(binanceService),
    createWebSocket: binanceService.createWebSocket.bind(binanceService)
  };
};

export default useBinance; 