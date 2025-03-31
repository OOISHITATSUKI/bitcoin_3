import axios from 'axios';

// ブラウザ環境でも動作するハッシュ生成関数
const generateSignature = (queryString, apiSecret) => {
  // 実際のプロジェクトでは、WebCrypto APIを使用することを推奨
  const encoder = new TextEncoder();
  const keyData = encoder.encode(apiSecret);
  const messageData = encoder.encode(queryString);
  
  return crypto.subtle.sign(
    "HMAC",
    keyData,
    messageData
  ).then(signature => {
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
};

class BinanceService {
  constructor() {
    this.baseUrl = 'https://testnet.binance.vision/api/v3';
    this.wsUrl = 'wss://testnet.binance.vision/ws';
    this.apiKey = null;
    this.apiSecret = null;
    this.isTestMode = true; // デフォルトでテストモード
  }

  initialize(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.isTestMode = localStorage.getItem('binance_test_mode') === 'true';
    console.log('Binance Service initialized:', { isTestMode: this.isTestMode });
  }

  // APIキーの暗号化
  async encryptApiSecret(secret) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(secret);
      
      // 暗号化キーの生成
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt', 'decrypt']
      );

      // キーのエクスポート
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      
      // 初期化ベクトル（IV）の生成
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ivBase64 = btoa(String.fromCharCode(...iv));

      // データの暗号化
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      );

      // 暗号化データのBase64エンコード
      const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

      return {
        encrypted: encryptedBase64,
        iv: ivBase64,
        key: keyBase64
      };
    } catch (error) {
      console.error('暗号化エラー:', error);
      throw error;
    }
  }

  // APIキーの復号化
  async decryptApiSecret(encryptedData) {
    try {
      // Base64デコード
      const encrypted = Uint8Array.from(atob(encryptedData.encrypted), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
      const keyData = Uint8Array.from(atob(encryptedData.key), c => c.charCodeAt(0));

      // 暗号化キーのインポート
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['decrypt']
      );

      // データの復号化
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('復号化エラー:', error);
      throw error;
    }
  }

  async loadApiKeys() {
    try {
      const apiKey = localStorage.getItem('binance_api_key');
      const apiSecret = localStorage.getItem('binance_secret_key_encrypted');
      
      if (apiKey && apiSecret) {
        this.initialize(apiKey, apiSecret);
        return true;
      }
      return false;
    } catch (error) {
      console.error('APIキー読み込みエラー:', error);
      return false;
    }
  }

  async saveApiKeys(apiKey, apiSecret, isTestMode = false) {
    try {
      localStorage.setItem('binance_api_key', apiKey);
      localStorage.setItem('binance_secret_key_encrypted', apiSecret);
      localStorage.setItem('binance_test_mode', isTestMode.toString());
      this.initialize(apiKey, apiSecret);
      return true;
    } catch (error) {
      console.error('APIキー保存エラー:', error);
      throw error;
    }
  }

  clearApiKeys() {
    try {
      localStorage.removeItem('binance_api_key');
      localStorage.removeItem('binance_secret_key_encrypted');
      localStorage.removeItem('binance_test_mode');
      this.apiKey = null;
      this.apiSecret = null;
    } catch (error) {
      console.error('APIキークリアエラー:', error);
      throw error;
    }
  }

  // モックデータを生成
  generateMockData() {
    return {
      USDT: { free: '1000.00', locked: '0.00' },
      BTC: { free: '0.12345', locked: '0.00' },
      ETH: { free: '1.2345', locked: '0.00' }
    };
  }

  async getServerTime() {
    if (this.isTestMode) {
      return { serverTime: Date.now() };
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/time`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('サーバー時間取得エラー:', error);
      return { serverTime: Date.now() };
    }
  }

  async getBalance() {
    try {
      if (!this.apiKey) {
        throw new Error('APIキーが設定されていません');
      }

      // テストモードの場合はモックデータを返す
      if (this.isTestMode) {
        console.log('テストモード: モックデータを返します');
        return this.generateMockData();
      }

      // 実際のAPI呼び出し（現在は無効化）
      /*
      const response = await fetch(`${this.baseUrl}/account`, {
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.balances.reduce((acc, balance) => {
        if (parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0) {
          acc[balance.asset] = {
            free: balance.free,
            locked: balance.locked
          };
        }
        return acc;
      }, {});
      */

      // 開発中はモックデータを返す
      return this.generateMockData();
    } catch (error) {
      console.error('残高取得エラー:', error);
      throw error;
    }
  }

  async getPrice(symbol = 'BTCUSDT') {
    try {
      if (this.isTestMode) {
        return {
          symbol: symbol,
          price: (Math.random() * 1000 + 40000).toFixed(2)
        };
      }

      const response = await fetch(`${this.baseUrl}/ticker/price?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('価格取得エラー:', error);
      throw error;
    }
  }

  createWebSocket() {
    if (this.isTestMode) {
      console.log('テストモード: モックWebSocketを作成します');
      return this.createMockWebSocket();
    }

    try {
      const ws = new WebSocket(this.wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket接続が確立されました');
      };

      ws.onclose = () => {
        console.log('WebSocket接続が閉じられました');
      };

      ws.onerror = (error) => {
        console.error('WebSocketエラー:', error);
      };

      return ws;
    } catch (error) {
      console.error('WebSocket作成エラー:', error);
      return this.createMockWebSocket();
    }
  }

  createMockWebSocket() {
    const mockWs = {
      onmessage: null,
      onclose: null,
      onerror: null,
      onopen: null,
      send: () => {},
      close: () => {
        if (this.onclose) this.onclose();
      }
    };

    // モックデータの定期送信
    setInterval(() => {
      if (mockWs.onmessage) {
        mockWs.onmessage({
          data: JSON.stringify({
            type: 'mock',
            data: {
              symbol: 'BTCUSDT',
              price: (Math.random() * 1000 + 40000).toFixed(2),
              timestamp: Date.now()
            }
          })
        });
      }
    }, 1000);

    // 接続成功をシミュレート
    setTimeout(() => {
      if (mockWs.onopen) mockWs.onopen();
    }, 100);

    return mockWs;
  }
}

// シングルトンインスタンスを作成してエクスポート
export const binanceService = new BinanceService();

// クラス自体もエクスポート（テスト用）
export { BinanceService }; 