import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useApi } from './ApiContext';
import { message } from 'antd';

const SYSTEM_RUNNING_KEY = 'system_running';
const LAST_SYNC_TIME_KEY = 'last_sync_time';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('停止中');
  const { isConnected, fetchBalance } = useApi();
  const [activeGrids, setActiveGrids] = useState([]);

  // 初期化時に保存された状態を読み込む
  useEffect(() => {
    const savedStatus = localStorage.getItem(SYSTEM_RUNNING_KEY) === 'true';
    const savedTime = localStorage.getItem(LAST_SYNC_TIME_KEY);
    
    // APIに接続されていない場合は稼働状態をfalseに設定
    const shouldRun = savedStatus && isConnected;
    
    setIsRunning(shouldRun);
    localStorage.setItem(SYSTEM_RUNNING_KEY, shouldRun.toString());
    
    if (savedTime) {
      setLastSyncTime(new Date(parseInt(savedTime, 10)));
    }
    
    // システム状態を設定
    setStatus(shouldRun ? '稼働中' : '停止中');
    
    // モックのアクティブグリッド
    setActiveGrids(getInitialActiveGrids());
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
    } catch (error) {
      console.error('残高取得エラー:', error);
      setError(`残高情報の取得に失敗しました: ${error.message}`);
      message.error('残高情報の取得に失敗しました');
    }
  }, [isConnected, fetchBalance]);

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

  // システム開始
  const startSystem = useCallback(async () => {
    try {
      if (!isConnected) {
        throw new Error('APIに接続されていません');
      }
      
      await fetchBalances(); // 初期残高取得
      
      setIsRunning(true);
      setStatus('稼働中');
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'true');
      
      message.success('システムを起動しました');
      return true;
    } catch (error) {
      console.error('システム起動エラー:', error);
      setError(`システムの起動に失敗しました: ${error.message}`);
      message.error(`システムの起動に失敗しました: ${error.message}`);
      return false;
    }
  }, [isConnected, fetchBalances]);

  // システム停止
  const stopSystem = useCallback(() => {
    try {
      setIsRunning(false);
      setStatus('停止中');
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'false');
      
      message.success('システムを停止しました');
      return true;
    } catch (error) {
      console.error('システム停止エラー:', error);
      setError(`システムの停止に失敗しました: ${error.message}`);
      message.error(`システムの停止に失敗しました: ${error.message}`);
      return false;
    }
  }, []);

  // システムの稼働状態を切り替え
  const toggleSystemStatus = useCallback(async () => {
    try {
      // 現在の状態を取得
      const newStatus = !isRunning;
      
      // まず状態を更新してUIに反映
      setIsRunning(newStatus);
      localStorage.setItem(SYSTEM_RUNNING_KEY, newStatus.toString());
      
      if (newStatus) {
        // システム起動処理
        if (!isConnected) {
          setIsRunning(false); // 接続がなければ元に戻す
          localStorage.setItem(SYSTEM_RUNNING_KEY, 'false');
          throw new Error('APIに接続されていません');
        }
        try {
          await fetchBalances(); // 非同期処理
        } catch (e) {
          console.error('残高取得エラー:', e);
          // エラーがあっても続行
        }
      }
      
      message.success(newStatus ? 'システムを起動しました' : 'システムを停止しました');
      return true;
    } catch (error) {
      message.error(`システムの${isRunning ? '停止' : '起動'}に失敗しました: ${error.message}`);
      return false;
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
    status,
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