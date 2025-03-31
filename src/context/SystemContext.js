import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useBinance } from '../hooks/useBinance';
import { message } from 'antd';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const { binanceService, error, isConnected } = useBinance();

  // 初期化時に保存された状態を読み込む
  useEffect(() => {
    const savedStatus = localStorage.getItem('system_running') === 'true';
    const savedTime = localStorage.getItem('last_sync_time');
    
    setIsRunning(savedStatus);
    if (savedTime) {
      setLastSyncTime(new Date(savedTime));
    }
  }, []);

  // 残高情報の取得
  const fetchBalances = useCallback(async () => {
    if (!isConnected) return;

    try {
      const accountInfo = await binanceService.getAccountInfo();
      
      // 残高データの整形
      const balances = {};
      accountInfo.balances.forEach(item => {
        const total = parseFloat(item.free) + parseFloat(item.locked);
        if (total > 0) {
          balances[item.asset] = {
            total,
            free: parseFloat(item.free),
            locked: parseFloat(item.locked)
          };
        }
      });
      
      setBalanceData(balances);
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now.toISOString());
    } catch (error) {
      console.error('残高取得エラー:', error);
      message.error('残高情報の取得に失敗しました');
    }
  }, [binanceService, isConnected]);

  // 定期的な残高更新
  useEffect(() => {
    if (isRunning && isConnected) {
      fetchBalances(); // 初回実行
      
      const intervalId = setInterval(() => {
        fetchBalances();
      }, 60000); // 1分ごとに更新
      
      return () => clearInterval(intervalId);
    }
  }, [isRunning, isConnected, fetchBalances]);

  // システムの稼働状態を切り替え
  const toggleSystemStatus = useCallback(async () => {
    try {
      const newStatus = !isRunning;
      
      if (newStatus) {
        // システム起動処理
        if (!isConnected) {
          throw new Error('APIに接続されていません');
        }
        await fetchBalances(); // 初期残高取得
      }
      
      setIsRunning(newStatus);
      localStorage.setItem('system_running', newStatus.toString());
      
      message.success(newStatus ? 'システムを起動しました' : 'システムを停止しました');
    } catch (error) {
      message.error(`システムの${isRunning ? '停止' : '起動'}に失敗しました: ${error.message}`);
    }
  }, [isRunning, isConnected, fetchBalances]);

  // 経過時間を計算して表示する関数
  const formatTimeSince = useCallback((date) => {
    if (!date) return '-';
    
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds}秒前`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}時間前`;
    return `${Math.floor(seconds / 86400)}日前`;
  }, []);

  const value = {
    isRunning,
    lastSyncTime,
    balanceData,
    error,
    isConnected,
    toggleSystemStatus,
    formatTimeSince,
    fetchBalances
  };

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

export default SystemContext; 