import { useState, useEffect, useCallback } from 'react';
import ErrorLogger from '../services/errorLogger';
import PerformanceMonitor from '../services/performanceMonitor';

const useMonitoring = () => {
  const [errorLogger] = useState(() => new ErrorLogger());
  const [performanceMonitor] = useState(() => new PerformanceMonitor());
  const [errorStats, setErrorStats] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [warnings, setWarnings] = useState([]);

  // エラーログの監視
  useEffect(() => {
    const updateErrorStats = () => {
      const stats = errorLogger.getErrorStats();
      setErrorStats(stats);
    };

    const interval = setInterval(updateErrorStats, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
  }, [errorLogger]);

  // パフォーマンス統計の監視
  useEffect(() => {
    const updatePerformanceStats = () => {
      const stats = performanceMonitor.getPerformanceStats();
      setPerformanceStats(stats);

      // 警告の更新
      const newWarnings = performanceMonitor.generateWarnings();
      setWarnings(newWarnings);
    };

    const interval = setInterval(updatePerformanceStats, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }, [performanceMonitor]);

  // メモリ使用量の監視
  useEffect(() => {
    const measureMemory = () => {
      performanceMonitor.measureMemoryUsage();
    };

    const interval = setInterval(measureMemory, 60000); // 1分ごとに計測
    return () => clearInterval(interval);
  }, [performanceMonitor]);

  // エラーログの取得
  const getErrorLogs = useCallback((filter = {}) => {
    return errorLogger.getLogs(filter);
  }, [errorLogger]);

  // エラーパターンの分析
  const analyzeErrorPatterns = useCallback(() => {
    return errorLogger.analyzeErrorPatterns();
  }, [errorLogger]);

  // エラーの重要度評価
  const evaluateErrorSeverity = useCallback((error) => {
    return errorLogger.evaluateErrorSeverity(error);
  }, [errorLogger]);

  // API呼び出しの計測
  const measureApiCall = useCallback((endpoint, method, duration, success) => {
    performanceMonitor.measureApiCall(endpoint, method, duration, success);
  }, [performanceMonitor]);

  // レンダリング時間の計測
  const measureRenderTime = useCallback((componentName, duration) => {
    performanceMonitor.measureRenderTime(componentName, duration);
  }, [performanceMonitor]);

  // ネットワークレイテンシの計測
  const measureNetworkLatency = useCallback((url, duration) => {
    performanceMonitor.measureNetworkLatency(url, duration);
  }, [performanceMonitor]);

  // エラーログのクリア
  const clearErrorLogs = useCallback(() => {
    errorLogger.clearLogs();
  }, [errorLogger]);

  return {
    errorStats,
    performanceStats,
    warnings,
    getErrorLogs,
    analyzeErrorPatterns,
    evaluateErrorSeverity,
    measureApiCall,
    measureRenderTime,
    measureNetworkLatency,
    clearErrorLogs,
    errorLogger,
    performanceMonitor
  };
};

export default useMonitoring; 