import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { useApi } from './ApiContext';
import { binanceService } from '../services/binance';

const SYSTEM_RUNNING_KEY = 'system_running';
const LAST_SYNC_TIME_KEY = 'last_sync_time';
const ACTIVE_GRIDS_KEY = 'active_grids';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const [error, setError] = useState(null);
  const [activeGrids, setActiveGrids] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);
  const [updateInterval, setUpdateInterval] = useState(null);
  
  const { isConnected } = useApi();

  // 初期化時に保存された状態を読み込む
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('システム初期化開始');
        const savedStatus = localStorage.getItem(SYSTEM_RUNNING_KEY) === 'true';
        const savedTime = localStorage.getItem(LAST_SYNC_TIME_KEY);
        const savedGrids = JSON.parse(localStorage.getItem(ACTIVE_GRIDS_KEY) || '[]');
        
        const shouldRun = savedStatus && isConnected;
        console.log('初期状態:', { savedStatus, isConnected, shouldRun });
        
        setIsRunning(shouldRun);
        localStorage.setItem(SYSTEM_RUNNING_KEY, shouldRun.toString());
        
        if (savedTime) {
          setLastSyncTime(new Date(parseInt(savedTime, 10)));
        }
        
        setActiveGrids(savedGrids.length > 0 ? savedGrids : getInitialActiveGrids());
        
        if (shouldRun) {
          await fetchBalances();
        }
        
        setIsInitialized(true);
        console.log('システム初期化完了');
      } catch (err) {
        console.error('初期化エラー:', err);
        setError('システムの初期化に失敗しました');
      }
    };

    initializeSystem();
  }, [isConnected]);

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
    }
  ];

  const createGrid = useCallback((gridData) => {
    try {
      console.log('グリッド作成開始:', gridData);
      
      // 新しいグリッドのID生成
      const newGrid = {
        id: `grid-${Date.now()}`,
        symbol: 'BTC/USDT', // BTCに固定
        status: 'active',
        ...gridData
      };

      setActiveGrids(prevGrids => {
        const updatedGrids = [...prevGrids, newGrid];
        // ローカルストレージに保存
        localStorage.setItem(ACTIVE_GRIDS_KEY, JSON.stringify(updatedGrids));
        return updatedGrids;
      });

      message.success('グリッドを作成しました');
      console.log('グリッド作成完了:', newGrid);
      return true;
    } catch (err) {
      console.error('グリッド作成エラー:', err);
      message.error('グリッドの作成に失敗しました');
      return false;
    }
  }, []);

  // グリッド削除機能を追加
  const deleteGrid = useCallback((gridId) => {
    try {
      console.log('グリッド削除開始:', gridId);
      
      setActiveGrids(prevGrids => {
        const updatedGrids = prevGrids.filter(grid => grid.id !== gridId);
        // ローカルストレージに保存
        localStorage.setItem(ACTIVE_GRIDS_KEY, JSON.stringify(updatedGrids));
        return updatedGrids;
      });

      message.success('グリッドを削除しました');
      console.log('グリッド削除完了:', gridId);
      return true;
    } catch (err) {
      console.error('グリッド削除エラー:', err);
      message.error('グリッドの削除に失敗しました');
      return false;
    }
  }, []);

  // グリッド編集機能を追加
  const updateGrid = useCallback((gridId, updatedData) => {
    try {
      console.log('グリッド編集開始:', { gridId, updatedData });
      
      setActiveGrids(prevGrids => {
        const updatedGrids = prevGrids.map(grid => {
          if (grid.id === gridId) {
            return {
              ...grid,
              ...updatedData,
              symbol: 'BTC/USDT', // BTCに固定
            };
          }
          return grid;
        });
        // ローカルストレージに保存
        localStorage.setItem(ACTIVE_GRIDS_KEY, JSON.stringify(updatedGrids));
        return updatedGrids;
      });

      message.success('グリッドを更新しました');
      console.log('グリッド編集完了:', { gridId, updatedData });
      return true;
    } catch (err) {
      console.error('グリッド編集エラー:', err);
      message.error('グリッドの編集に失敗しました');
      return false;
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!isConnected) {
      setError('APIに接続されていません');
      return;
    }

    try {
      console.log('残高取得開始');
      const balance = await binanceService.getBalance();
      
      if (balance) {
        console.log('取得した残高データ:', balance);
        const formattedBalance = {};
        let totalUSDT = 0;
        
        // BTCとUSDTのみを処理
        const targetAssets = ['BTC', 'USDT'];
        
        for (const asset of targetAssets) {
          const data = balance[asset];
          if (data) {
            const free = parseFloat(data.free) || 0;
            const locked = parseFloat(data.locked) || 0;
            const total = free + locked;

            formattedBalance[asset] = {
              total,
              free,
              locked
            };
            
            console.log(`処理中の資産: ${asset}, 合計: ${total}`);
            
            if (asset === 'USDT') {
              totalUSDT += total;
              console.log(`USDT残高を加算: ${total}`);
            } else if (asset === 'BTC') {
              try {
                console.log('BTC価格取得開始');
                const priceData = await binanceService.getPrice('BTCUSDT');
                if (priceData && priceData.price) {
                  const price = parseFloat(priceData.price) || 0;
                  const assetValue = total * price;
                  
                  if (!isNaN(assetValue) && isFinite(assetValue)) {
                    totalUSDT += assetValue;
                    console.log(`BTCのUSDT換算額を加算: ${assetValue}`);
                  } else {
                    console.warn('BTCの換算額が無効:', assetValue);
                  }
                } else {
                  console.warn('BTC価格データが無効:', priceData);
                }
              } catch (err) {
                console.error('BTC価格取得エラー:', err);
                throw new Error('BTC価格の取得に失敗しました');
              }
            }
          }
        }
        
        if (!isNaN(totalUSDT) && isFinite(totalUSDT)) {
          console.log('計算された総資産額:', totalUSDT);
          setTotalAssets(totalUSDT);
          setBalanceData(formattedBalance);
          
          const now = new Date();
          setLastSyncTime(now);
          localStorage.setItem(LAST_SYNC_TIME_KEY, now.getTime().toString());
          setError(null);
          
          console.log('残高取得完了:', {
            formattedBalance,
            totalAssets: totalUSDT,
            lastSync: now
          });
        } else {
          throw new Error('総資産額の計算に失敗しました');
        }
      } else {
        throw new Error('残高データの取得に失敗しました');
      }
    } catch (err) {
      console.error('残高取得エラー:', err);
      setError(`残高情報の取得に失敗しました: ${err.message}`);
    }
  }, [isConnected]);

  const startSystem = useCallback(async () => {
    try {
      if (!isConnected) {
        throw new Error('APIに接続されていません');
      }

      console.log('システム起動開始');
      setIsRunning(true);
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'true');

      // 初期残高取得
      await fetchBalances();

      // 定期的な残高更新を開始
      const intervalId = setInterval(fetchBalances, 30000); // 30秒ごとに更新
      setUpdateInterval(intervalId);

      message.success('システムを起動しました');
      console.log('システム起動完了');
    } catch (err) {
      console.error('システム起動エラー:', err);
      setIsRunning(false);
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'false');
      setError(`システムの起動に失敗しました: ${err.message}`);
      message.error(`システムの起動に失敗しました: ${err.message}`);
    }
  }, [isConnected, fetchBalances]);

  const stopSystem = useCallback(() => {
    try {
      console.log('システム停止開始');
      setIsRunning(false);
      localStorage.setItem(SYSTEM_RUNNING_KEY, 'false');

      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }

      message.success('システムを停止しました');
      console.log('システム停止完了');
    } catch (err) {
      console.error('システム停止エラー:', err);
      setError(`システムの停止に失敗しました: ${err.message}`);
      message.error(`システムの停止に失敗しました: ${err.message}`);
    }
  }, [updateInterval]);

  const value = {
    isRunning,
    lastSyncTime,
    balanceData,
    error,
    activeGrids,
    isInitialized,
    totalAssets,
    startSystem,
    stopSystem,
    fetchBalances,
    createGrid,
    deleteGrid,   // 削除機能を追加
    updateGrid    // 編集機能を追加
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