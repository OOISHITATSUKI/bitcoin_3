class BinanceService {
  constructor() {
    this.apiKey = null;
    this.secretKey = null;
    this.isTestMode = false;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscribers = new Map();
    this.loadApiKeys();
  }

  // APIキーをローカルストレージから読み込む
  loadApiKeys() {
    try {
      const savedApiKey = localStorage.getItem('binance_api_key');
      const savedSecretKey = localStorage.getItem('binance_secret_key_encrypted');
      const savedTestMode = localStorage.getItem('test_mode') === 'true';
      
      if (savedApiKey) this.apiKey = savedApiKey;
      if (savedSecretKey) {
        // 暗号化されたシークレットキーを復号化
        this.secretKey = savedSecretKey.replace('encrypted:', '');
      }
      this.isTestMode = savedTestMode;
    } catch (error) {
      console.error('APIキーの読み込みに失敗しました:', error);
    }
  }

  // APIキーを保存
  saveApiKeys(apiKey, secretKey, isTestMode) {
    try {
      this.apiKey = apiKey;
      this.secretKey = secretKey;
      this.isTestMode = isTestMode;
      
      localStorage.setItem('binance_api_key', apiKey);
      localStorage.setItem('binance_secret_key_encrypted', 'encrypted:' + secretKey);
      localStorage.setItem('test_mode', isTestMode.toString());
      
      return true;
    } catch (error) {
      console.error('APIキーの保存に失敗しました:', error);
      return false;
    }
  }

  // APIキーをクリア
  clearApiKeys() {
    try {
      this.apiKey = null;
      this.secretKey = null;
      this.isTestMode = false;
      
      localStorage.removeItem('binance_api_key');
      localStorage.removeItem('binance_secret_key_encrypted');
      localStorage.removeItem('test_mode');
      
      return true;
    } catch (error) {
      console.error('APIキーのクリアに失敗しました:', error);
      return false;
    }
  }

  // 残高を取得
  async getBalance() {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('APIキーが設定されていません');
    }

    try {
      // テストモードの場合はモックデータを返す
      if (this.isTestMode) {
        return {
          BTC: { free: '0.00123', locked: '0' },
          USDT: { free: '3250.75', locked: '0' }
        };
      }

      // 実際のAPI呼び出し
      const response = await fetch('https://api.binance.com/api/v3/account', {
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('残高の取得に失敗しました');
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
    } catch (error) {
      console.error('残高の取得中にエラーが発生しました:', error);
      throw error;
    }
  }

  // 価格を取得
  async getPrice(symbol) {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error('価格の取得に失敗しました');
      }
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('価格の取得中にエラーが発生しました:', error);
      throw error;
    }
  }
}

export const binanceService = new BinanceService(); 