import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useApi } from './ApiContext';

const SYSTEM_RUNNING_KEY = 'system_running';
const LAST_SYNC_TIME_KEY = 'last_sync_time';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const [error, setError] = useState(null);
  const [activeGrids, setActiveGrids] = useState([]);
  
  // API Context から情報を取得
  const { isConnected, fetchBalance } = useApi();

  // 初期化時に保存された状態を読み込む
  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(SYSTEM_RUNNING_KEY) === 'true';
      const savedTime = localStorage.getItem(LAST_SYNC_TIME_KEY);
      
      // APIに接続されていない場合は稼働状態をfalseに設定
      const shouldRun = savedStatus && isConnected;
      
      setIsRunning(shouldRun);
      localStorage.setItem(SYSTEM_RUNNING_KEY, shouldRun.toString());
      
      if (savedTime) {
        setLastSyncTime(new Date(parseInt(savedTime, 10)));
      }
      
      // モックのアクティブグリッド
      setActiveGrids(getInitialActiveGrids());
    } catch (err) {
      console.error('初期化エラー:', err);
    }
  }, [isConnected]);

  // モックのアクティブグリッド初期データ
  const getInitialActiveGrids = () => [
    {
      id: 'grid-1',
      symbol: 'BTC/USDT',
      status: 'active',
      upperPrice: 48000,
      lowerPrice: 42000,
      totalInvestment: 1000,
      profitRate: 0.025,
      totalProfit: 25.45,
      totalLoss: 2.35,
      gridCount: 10
    },
    {
      id: 'grid-2',
      symbol: 'ETH/USDT',
      status: 'active',
      upperPrice: 2500,
      lowerPrice: 2200,
      totalInvestment: 500,
      profitRate: 0.012,
      totalProfit: 6.12,
      totalLoss: 0.98,
      gridCount: 6
    }
  ];

  // 残高情報の取得
  const fetchBalances = useCallback(async () => {
    if (!isConnected) {
      setError('APIに接続されていません');
      return;
    }

    try {
      // getAccountInfo の代わりに fetchBalance を使用
      const balance = await fetchBalance();
      
      if (balance) {
        // 残高データの整形
        const formattedBalance = {};
        Object.entries(balance).forEach(([asset, data]) => {
          formattedBalance[asset] = {
            total: parseFloat(data.free) + parseFloat(data.locked),
            free: parseFloat(data.free),
            locked: parseFloat(data.locked)
          };
        });
        
        setBalanceData(formattedBalance);
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem(LAST_SYNC_TIME_KEY, now.getTime().toString());
        setError(null);
      }
    } catch (err) {
      console.error('残高取得エラー:', err);
      setError('残高情報の取得に失敗しました');
    }
  }, [isConnected, fetchBalance]);

  // 定期的な残高更新
  useEffect(() => {
    let intervalId;

    if (isRunning && isConnected) {
      fetchBalances(); // 初回実行
      
      intervalId = setInterval(() => {
        fetchBalances();
      }, 60000); // 1分ごとに更新
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, isConnected, fetchBalances]);

  // システム起動
  const startSystem = useCallback(async () => {
    try {
      console.log("システム起動開始");
      
      if (!isConnected) {
        throw new Error('APIに接続されていません');
      }
      
      // 状態を先に更新
      setIsRunning(true);
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'true');
      
      // 初期残高取得（失敗しても続行）
      try {
        await fetchBalances();
      } catch (err) {
        console.warn('初期残高取得エラー:', err);
      }
      
      message.success('システムを起動しました');
      return true;
    } catch (err) {
      console.error('システム起動エラー:', err);
      // エラー時は状態を戻す
      setIsRunning(false);
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'false');
      message.error(`システムの起動に失敗しました: ${err.message}`);
      return false;
    }
  }, [isConnected, fetchBalances]);

  // システム停止
  const stopSystem = useCallback(() => {
    try {
      console.log("システム停止開始");
      
      setIsRunning(false);
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'false');
      
      message.success('システムを停止しました');
      return true;
    } catch (err) {
      console.error('システム停止エラー:', err);
      message.error(`システムの停止に失敗しました: ${err.message}`);
      return false;
    }
  }, []);

  // システムの稼働状態を切り替え
  const toggleSystemStatus = useCallback(() => {
    console.log('トグル開始:', isRunning);
    if (isRunning) {
      return stopSystem();
    } else {
      return startSystem();
    }
  }, [isRunning, startSystem, stopSystem]);

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
    activeGrids,
    toggleSystemStatus,
    startSystem,
    stopSystem,
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