import axios from 'axios';
import CryptoJS from 'crypto-js';

// ストレージキーの定数
const STORAGE_KEYS = {
  API_KEY: 'binance_api_key',
  SECRET_KEY: 'binance_secret_key',
  TEST_MODE: 'binance_test_mode'
};

// ブラウザ環境でも動作するハッシュ生成関数
const generateSignature = (queryString, apiSecret) => {
  return CryptoJS.HmacSHA256(queryString, apiSecret).toString();
};

class BinanceService {
  constructor() {
    this.baseUrl = '/api/v3'; // プロキシ用のベースURL
    this.wsUrl = 'wss://testnet.binance.vision/ws';
    this.apiKey = null;
    this.apiSecret = null;
    this.isTestMode = true;
    this.loadApiKeys();
  }

  // APIキーの検証
  validateApiKey(apiKey) {
    if (!apiKey) return false;
    // APIキーは英数字のみを含む文字列
    return /^[A-Za-z0-9]+$/.test(apiKey);
  }

  // シークレットキーの検証
  validateSecretKey(secretKey) {
    if (!secretKey) return false;
    // シークレットキーは64文字の英数字
    return /^[A-Za-z0-9]{64}$/.test(secretKey);
  }

  initialize(apiKey, apiSecret, isTestMode = true) {
    if (!this.validateApiKey(apiKey)) {
      throw new Error('無効なAPIキーです。英数字のみを使用してください。');
    }
    if (!this.validateSecretKey(apiSecret)) {
      throw new Error('シークレットキーの形式が正しくありません。64文字の英数字である必要があります。');
    }

    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.isTestMode = isTestMode;
    console.log('Binance Service initialized:', { isTestMode: this.isTestMode });
  }

  loadApiKeys() {
    try {
      const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      const secretKey = localStorage.getItem(STORAGE_KEYS.SECRET_KEY);
      const isTestMode = localStorage.getItem(STORAGE_KEYS.TEST_MODE) === 'true';

      console.log('APIキー読み込み:', { hasApiKey: !!apiKey, hasSecretKey: !!secretKey, isTestMode });

      if (this.validateApiKey(apiKey) && this.validateSecretKey(secretKey)) {
        this.apiKey = apiKey;
        this.apiSecret = secretKey;
        this.isTestMode = isTestMode;
        console.log('APIキー読み込み完了');
        return true;
      }

      console.log('有効なAPIキーが見つかりません');
      return false;
    } catch (error) {
      console.error('APIキー読み込みエラー:', error);
      return false;
    }
  }

  async saveApiKeys(apiKey, secretKey, isTestMode = true) {
    try {
      console.log('APIキー保存開始:', { apiKey, isTestMode });

      // APIキーの検証
      if (!this.validateApiKey(apiKey)) {
        throw new Error('無効なAPIキーです。英数字のみを使用してください。');
      }

      // シークレットキーの検証
      if (!this.validateSecretKey(secretKey)) {
        throw new Error('シークレットキーの形式が正しくありません。64文字の英数字である必要があります。');
      }

      // 接続テスト
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = generateSignature(queryString, secretKey);

      try {
        console.log('接続テスト開始');
        const response = await axios.get(`${this.baseUrl}/account`, {
          headers: {
            'X-MBX-APIKEY': apiKey
          },
          params: {
            timestamp,
            signature
          },
          timeout: 10000
        });

        if (response.status === 200) {
          console.log('接続テスト成功');
          // ローカルストレージに保存
          localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
          localStorage.setItem(STORAGE_KEYS.SECRET_KEY, secretKey);
          localStorage.setItem(STORAGE_KEYS.TEST_MODE, isTestMode.toString());

          // サービスの状態を更新
          this.apiKey = apiKey;
          this.apiSecret = secretKey;
          this.isTestMode = isTestMode;

          console.log('APIキー保存完了');
          return true;
        } else {
          throw new Error('APIサーバーからの応答が無効です');
        }
      } catch (error) {
        console.error('接続テストエラー:', error);
        if (error.response) {
          throw new Error(`API接続エラー: ${error.response.data.msg || '不明なエラー'}`);
        }
        throw new Error('APIサーバーへの接続に失敗しました');
      }
    } catch (error) {
      console.error('APIキー保存エラー:', error);
      throw error;
    }
  }

  clearApiKeys() {
    try {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
      localStorage.removeItem(STORAGE_KEYS.SECRET_KEY);
      localStorage.setItem(STORAGE_KEYS.TEST_MODE, 'true');
      
      this.apiKey = null;
      this.apiSecret = null;
      this.isTestMode = true;
      
      return true;
    } catch (error) {
      console.error('APIキークリアエラー:', error);
      return false;
    }
  }

  // モックデータをより現実的な値に更新
  generateMockData() {
    const mockBTCAmount = (Math.random() * 0.1 + 0.05).toFixed(8); // 0.05 - 0.15 BTC
    const mockUSDTAmount = (Math.random() * 5000 + 5000).toFixed(2); // 5000 - 10000 USDT
    
    return {
      USDT: { free: mockUSDTAmount, locked: '0.00' },
      BTC: { free: mockBTCAmount, locked: '0.00' }
    };
  }

  async getServerTime() {
    if (this.isTestMode) {
      return { serverTime: Date.now() };
    }
    
    try {
      const response = await axios.get(`${this.baseUrl}/time`);
      return response.data;
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
      
      if (!this.apiSecret) {
        throw new Error('APIシークレットキーが設定されていません');
      }

      // テストモードの場合はモックデータを返す
      if (this.isTestMode) {
        console.log('テストモード: モックデータを返します');
        return this.generateMockData();
      }

      // 実際のAPI呼び出し
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      
      // 署名の生成
      const signature = await generateSignature(queryString, this.apiSecret);
      
      const response = await axios.get(`${this.baseUrl}/account?${queryString}&signature=${signature}`, {
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
      
      // 残高のフィルタリング（残高がある通貨のみ）
      return response.data.balances.reduce((acc, balance) => {
        if (parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0) {
          acc[balance.asset] = {
            free: balance.free,
            locked: balance.locked
          };
        }
        return acc;
      }, {});
    } catch (error) {
      console.error('残高取得エラー:', error);
      throw new Error('APIサーバーへの接続に失敗しました: ' + (error.response?.data?.msg || error.message));
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

      const response = await axios.get(`${this.baseUrl}/ticker/price?symbol=${symbol}`);
      return response.data;
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

  async getAccountInfo() {
    try {
      if (!this.apiKey) {
        throw new Error('APIキーが設定されていません');
      }

      // テストモードの場合はモックデータを返す
      if (this.isTestMode) {
        return {
          makerCommission: 10,
          takerCommission: 10,
          buyerCommission: 0,
          sellerCommission: 0,
          canTrade: true,
          canWithdraw: false,
          canDeposit: false,
          updateTime: Date.now(),
          accountType: "SPOT",
          balances: [
            { asset: "BTC", free: "0.12345", locked: "0.00000" },
            { asset: "ETH", free: "1.23456", locked: "0.00000" },
            { asset: "USDT", free: "1000.00", locked: "0.00000" }
          ]
        };
      }

      // 実際のAPI呼び出し
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = await this.generateSignature(queryString, this.apiSecret);
      
      const response = await fetch(`${this.baseUrl}/account?${queryString}&signature=${signature}`, {
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('アカウント情報取得エラー:', error);
      throw error;
    }
  }
}

// シングルトンインスタンスを作成してエクスポート
export const binanceService = new BinanceService();

// クラス自体もエクスポート（テスト用）
export { BinanceService }; 