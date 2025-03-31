class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
  }

  connect() {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.ws = new WebSocket('wss://stream.binance.com:9443/ws');

    this.ws.onopen = () => {
      console.log('WebSocket接続が確立されました');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.resubscribe();
    };

    this.ws.onclose = () => {
      console.log('WebSocket接続が切断されました');
      this.isConnecting = false;
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocketエラー:', error);
      this.isConnecting = false;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('メッセージのパースエラー:', error);
      }
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`再接続を試みます (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('最大再接続試行回数に達しました');
    }
  }

  subscribe(symbol, type, callback) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocketが接続されていません');
      return;
    }

    const stream = `${symbol.toLowerCase()}@${type}`;
    const subscription = {
      stream,
      callback,
      symbol,
      type
    };

    this.subscriptions.set(stream, subscription);

    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: [stream],
      id: Date.now()
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  unsubscribe(symbol, type) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const stream = `${symbol.toLowerCase()}@${type}`;
    const subscription = this.subscriptions.get(stream);

    if (subscription) {
      const unsubscribeMessage = {
        method: 'UNSUBSCRIBE',
        params: [stream],
        id: Date.now()
      };

      this.ws.send(JSON.stringify(unsubscribeMessage));
      this.subscriptions.delete(stream);
    }
  }

  resubscribe() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    for (const [stream, subscription] of this.subscriptions) {
      const subscribeMessage = {
        method: 'SUBSCRIBE',
        params: [stream],
        id: Date.now()
      };

      this.ws.send(JSON.stringify(subscribeMessage));
    }
  }

  handleMessage(data) {
    // エラーメッセージの処理
    if (data.error) {
      console.error('WebSocketエラー:', data.error);
      return;
    }

    // 購読確認メッセージの処理
    if (data.result === null && data.id) {
      console.log('購読が確認されました');
      return;
    }

    // データメッセージの処理
    const stream = data.stream;
    const subscription = this.subscriptions.get(stream);

    if (subscription && subscription.callback) {
      subscription.callback(data.data);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.subscriptions.clear();
      this.reconnectAttempts = 0;
    }
  }
}

export default WebSocketService; 