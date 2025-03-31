class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiCalls: [],
      renderTimes: [],
      memoryUsage: [],
      networkLatency: []
    };
    this.maxMetrics = 1000; // 保持する最大メトリクス数
    this.startTime = Date.now();
  }

  // API呼び出しの計測
  measureApiCall(endpoint, method, duration, success) {
    const metric = {
      timestamp: Date.now(),
      endpoint,
      method,
      duration,
      success,
      error: null
    };

    this.metrics.apiCalls.push(metric);
    this.trimMetrics('apiCalls');
  }

  // レンダリング時間の計測
  measureRenderTime(componentName, duration) {
    const metric = {
      timestamp: Date.now(),
      componentName,
      duration
    };

    this.metrics.renderTimes.push(metric);
    this.trimMetrics('renderTimes');
  }

  // メモリ使用量の計測
  measureMemoryUsage() {
    if (window.performance && window.performance.memory) {
      const metric = {
        timestamp: Date.now(),
        usedHeap: window.performance.memory.usedJSHeapSize,
        totalHeap: window.performance.memory.totalJSHeapSize,
        heapLimit: window.performance.memory.jsHeapSizeLimit
      };

      this.metrics.memoryUsage.push(metric);
      this.trimMetrics('memoryUsage');
    }
  }

  // ネットワークレイテンシの計測
  measureNetworkLatency(url, duration) {
    const metric = {
      timestamp: Date.now(),
      url,
      duration
    };

    this.metrics.networkLatency.push(metric);
    this.trimMetrics('networkLatency');
  }

  // メトリクスのトリミング
  trimMetrics(type) {
    if (this.metrics[type].length > this.maxMetrics) {
      this.metrics[type] = this.metrics[type].slice(-this.maxMetrics);
    }
  }

  // パフォーマンス統計の取得
  getPerformanceStats() {
    const stats = {
      uptime: Date.now() - this.startTime,
      apiStats: this.calculateApiStats(),
      renderStats: this.calculateRenderStats(),
      memoryStats: this.calculateMemoryStats(),
      networkStats: this.calculateNetworkStats()
    };

    return stats;
  }

  // API統計の計算
  calculateApiStats() {
    const apiCalls = this.metrics.apiCalls;
    const totalCalls = apiCalls.length;
    const successfulCalls = apiCalls.filter(call => call.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const avgDuration = apiCalls.reduce((sum, call) => sum + call.duration, 0) / totalCalls;

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      successRate: (successfulCalls / totalCalls) * 100,
      averageDuration: avgDuration,
      endpoints: this.getEndpointStats(apiCalls)
    };
  }

  // レンダリング統計の計算
  calculateRenderStats() {
    const renderTimes = this.metrics.renderTimes;
    const totalRenders = renderTimes.length;
    const avgRenderTime = renderTimes.reduce((sum, time) => sum + time.duration, 0) / totalRenders;

    return {
      totalRenders,
      averageRenderTime: avgRenderTime,
      components: this.getComponentStats(renderTimes)
    };
  }

  // メモリ統計の計算
  calculateMemoryStats() {
    const memoryUsage = this.metrics.memoryUsage;
    if (memoryUsage.length === 0) return null;

    const latest = memoryUsage[memoryUsage.length - 1];
    const avgUsedHeap = memoryUsage.reduce((sum, usage) => sum + usage.usedHeap, 0) / memoryUsage.length;

    return {
      currentUsedHeap: latest.usedHeap,
      currentTotalHeap: latest.totalHeap,
      currentHeapLimit: latest.heapLimit,
      averageUsedHeap: avgUsedHeap,
      memoryUsageTrend: this.calculateMemoryTrend(memoryUsage)
    };
  }

  // ネットワーク統計の計算
  calculateNetworkStats() {
    const networkLatency = this.metrics.networkLatency;
    const totalRequests = networkLatency.length;
    const avgLatency = networkLatency.reduce((sum, latency) => sum + latency.duration, 0) / totalRequests;

    return {
      totalRequests,
      averageLatency: avgLatency,
      endpoints: this.getEndpointLatencyStats(networkLatency)
    };
  }

  // エンドポイント統計の計算
  getEndpointStats(apiCalls) {
    const endpointStats = {};
    apiCalls.forEach(call => {
      if (!endpointStats[call.endpoint]) {
        endpointStats[call.endpoint] = {
          totalCalls: 0,
          successfulCalls: 0,
          failedCalls: 0,
          totalDuration: 0
        };
      }

      const stats = endpointStats[call.endpoint];
      stats.totalCalls++;
      if (call.success) stats.successfulCalls++;
      else stats.failedCalls++;
      stats.totalDuration += call.duration;
    });

    // 平均時間の計算
    Object.keys(endpointStats).forEach(endpoint => {
      const stats = endpointStats[endpoint];
      stats.averageDuration = stats.totalDuration / stats.totalCalls;
      stats.successRate = (stats.successfulCalls / stats.totalCalls) * 100;
    });

    return endpointStats;
  }

  // コンポーネント統計の計算
  getComponentStats(renderTimes) {
    const componentStats = {};
    renderTimes.forEach(time => {
      if (!componentStats[time.componentName]) {
        componentStats[time.componentName] = {
          totalRenders: 0,
          totalDuration: 0
        };
      }

      const stats = componentStats[time.componentName];
      stats.totalRenders++;
      stats.totalDuration += time.duration;
    });

    // 平均時間の計算
    Object.keys(componentStats).forEach(component => {
      const stats = componentStats[component];
      stats.averageDuration = stats.totalDuration / stats.totalRenders;
    });

    return componentStats;
  }

  // メモリ使用量のトレンド計算
  calculateMemoryTrend(memoryUsage) {
    if (memoryUsage.length < 2) return 'stable';

    const recentUsage = memoryUsage.slice(-10);
    const firstUsage = recentUsage[0].usedHeap;
    const lastUsage = recentUsage[recentUsage.length - 1].usedHeap;
    const change = ((lastUsage - firstUsage) / firstUsage) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  // エンドポイントレイテンシ統計の計算
  getEndpointLatencyStats(networkLatency) {
    const endpointStats = {};
    networkLatency.forEach(latency => {
      if (!endpointStats[latency.url]) {
        endpointStats[latency.url] = {
          totalRequests: 0,
          totalDuration: 0
        };
      }

      const stats = endpointStats[latency.url];
      stats.totalRequests++;
      stats.totalDuration += latency.duration;
    });

    // 平均時間の計算
    Object.keys(endpointStats).forEach(endpoint => {
      const stats = endpointStats[endpoint];
      stats.averageLatency = stats.totalDuration / stats.totalRequests;
    });

    return endpointStats;
  }

  // パフォーマンス警告の生成
  generateWarnings() {
    const warnings = [];
    const stats = this.getPerformanceStats();

    // API警告
    if (stats.apiStats.successRate < 95) {
      warnings.push({
        type: 'api',
        message: 'API呼び出しの成功率が低いです',
        severity: 'high'
      });
    }

    // レンダリング警告
    if (stats.renderStats.averageRenderTime > 100) {
      warnings.push({
        type: 'render',
        message: 'レンダリング時間が長いです',
        severity: 'medium'
      });
    }

    // メモリ警告
    if (stats.memoryStats && stats.memoryStats.memoryUsageTrend === 'increasing') {
      warnings.push({
        type: 'memory',
        message: 'メモリ使用量が増加傾向にあります',
        severity: 'high'
      });
    }

    // ネットワーク警告
    if (stats.networkStats.averageLatency > 1000) {
      warnings.push({
        type: 'network',
        message: 'ネットワークレイテンシが高いです',
        severity: 'medium'
      });
    }

    return warnings;
  }
}

export default PerformanceMonitor; 