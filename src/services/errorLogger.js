class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // 保持する最大ログ数
  }

  // エラーログの追加
  logError(error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        type: error.name
      },
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    this.logs.push(logEntry);

    // 最大ログ数を超えた場合、古いログを削除
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // コンソールにも出力
    console.error('エラーが発生しました:', logEntry);

    // サーバーにログを送信（実装が必要）
    this.sendToServer(logEntry);
  }

  // エラーログの取得
  getLogs(filter = {}) {
    let filteredLogs = [...this.logs];

    // フィルターの適用
    if (filter.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filter.startDate)
      );
    }

    if (filter.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filter.endDate)
      );
    }

    if (filter.errorType) {
      filteredLogs = filteredLogs.filter(log => 
        log.error.type === filter.errorType
      );
    }

    return filteredLogs;
  }

  // エラーの統計情報を取得
  getErrorStats() {
    const stats = {
      totalErrors: this.logs.length,
      errorTypes: {},
      recentErrors: this.logs.slice(-10),
      errorFrequency: {}
    };

    // エラータイプの集計
    this.logs.forEach(log => {
      const type = log.error.type;
      stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1;
    });

    // 時間帯ごとのエラー頻度
    this.logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      stats.errorFrequency[hour] = (stats.errorFrequency[hour] || 0) + 1;
    });

    return stats;
  }

  // エラーログのクリア
  clearLogs() {
    this.logs = [];
  }

  // サーバーへのログ送信
  async sendToServer(logEntry) {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });

      if (!response.ok) {
        throw new Error('ログの送信に失敗しました');
      }
    } catch (error) {
      console.error('ログ送信エラー:', error);
    }
  }

  // エラーパターンの分析
  analyzeErrorPatterns() {
    const patterns = {
      commonErrors: {},
      timeBasedPatterns: {},
      contextPatterns: {}
    };

    // エラーメッセージのパターン分析
    this.logs.forEach(log => {
      const message = log.error.message;
      patterns.commonErrors[message] = (patterns.commonErrors[message] || 0) + 1;
    });

    // 時間帯ごとのパターン分析
    this.logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      patterns.timeBasedPatterns[hour] = (patterns.timeBasedPatterns[hour] || 0) + 1;
    });

    // コンテキストパターンの分析
    this.logs.forEach(log => {
      const context = log.context;
      if (context.url) {
        patterns.contextPatterns[context.url] = (patterns.contextPatterns[context.url] || 0) + 1;
      }
    });

    return patterns;
  }

  // エラーの重要度評価
  evaluateErrorSeverity(error) {
    let severity = 'low';

    // エラーメッセージに基づく重要度評価
    if (error.message.includes('API Error')) {
      severity = 'high';
    } else if (error.message.includes('Network Error')) {
      severity = 'medium';
    }

    // エラーの発生頻度に基づく重要度評価
    const errorCount = this.logs.filter(log => 
      log.error.message === error.message
    ).length;

    if (errorCount > 10) {
      severity = 'high';
    } else if (errorCount > 5) {
      severity = 'medium';
    }

    return severity;
  }
}

export default ErrorLogger; 