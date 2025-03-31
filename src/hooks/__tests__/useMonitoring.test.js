import { renderHook, act } from '@testing-library/react-hooks';
import useMonitoring from '../useMonitoring';

describe('useMonitoring', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('初期状態の確認', () => {
    const { result } = renderHook(() => useMonitoring());

    expect(result.current.errorStats).toBeNull();
    expect(result.current.performanceStats).toBeNull();
    expect(result.current.warnings).toEqual([]);
  });

  test('エラーログの取得', () => {
    const { result } = renderHook(() => useMonitoring());

    const logs = result.current.getErrorLogs();
    expect(Array.isArray(logs)).toBe(true);
  });

  test('エラーパターンの分析', () => {
    const { result } = renderHook(() => useMonitoring());

    const patterns = result.current.analyzeErrorPatterns();
    expect(patterns).toHaveProperty('commonErrors');
    expect(patterns).toHaveProperty('timeBasedPatterns');
    expect(patterns).toHaveProperty('contextPatterns');
  });

  test('パフォーマンス計測', () => {
    const { result } = renderHook(() => useMonitoring());

    act(() => {
      result.current.measureApiCall('/api/test', 'GET', 100, true);
      result.current.measureRenderTime('TestComponent', 50);
      result.current.measureNetworkLatency('/api/test', 200);
    });

    const stats = result.current.performanceStats;
    expect(stats).toBeTruthy();
    expect(stats.apiStats.totalCalls).toBe(1);
    expect(stats.renderStats.totalRenders).toBe(1);
    expect(stats.networkStats.totalRequests).toBe(1);
  });

  test('エラーログのクリア', () => {
    const { result } = renderHook(() => useMonitoring());

    act(() => {
      result.current.clearErrorLogs();
    });

    const logs = result.current.getErrorLogs();
    expect(logs).toHaveLength(0);
  });

  test('定期的な更新', () => {
    const { result } = renderHook(() => useMonitoring());

    // エラーログの更新（1分間隔）
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    expect(result.current.errorStats).toBeTruthy();

    // パフォーマンス統計の更新（30秒間隔）
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(result.current.performanceStats).toBeTruthy();
  });
}); 