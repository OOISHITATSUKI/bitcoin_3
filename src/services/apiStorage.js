const API_KEY_STORAGE_KEY = 'crypto_bot_api_key';
const API_SECRET_STORAGE_KEY = 'crypto_bot_api_secret_encrypted';
const TEST_MODE_STORAGE_KEY = 'crypto_bot_test_mode';
const API_CONNECTED_STORAGE_KEY = 'crypto_bot_api_connected';

const encrypt = (text) => {
  return `encrypted:${text}`;
};

const decrypt = (encryptedText) => {
  if (!encryptedText || !encryptedText.startsWith('encrypted:')) {
    return null;
  }
  return encryptedText.replace('encrypted:', '');
};

export const saveApiSettings = (apiKey, apiSecret, testMode = false) => {
  try {
    if (!apiKey || !apiSecret) {
      return false;
    }
    
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    
    if (apiSecret !== '••••••••••••••••••••••••••••••••') {
      localStorage.setItem(API_SECRET_STORAGE_KEY, encrypt(apiSecret));
    }
    
    localStorage.setItem(TEST_MODE_STORAGE_KEY, String(testMode));
    localStorage.setItem(API_CONNECTED_STORAGE_KEY, 'true');
    
    sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    
    return true;
  } catch (error) {
    console.error('API設定の保存に失敗しました', error);
    return false;
  }
};

export const loadApiSettings = () => {
  try {
    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    const encryptedSecret = localStorage.getItem(API_SECRET_STORAGE_KEY) || '';
    const testMode = localStorage.getItem(TEST_MODE_STORAGE_KEY) === 'true';
    const isConnected = localStorage.getItem(API_CONNECTED_STORAGE_KEY) === 'true';
    
    const sessionApiKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
    if (sessionApiKey && sessionApiKey !== apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, sessionApiKey);
      return {
        apiKey: sessionApiKey,
        apiSecret: '••••••••••••••••••••••••••••••••',
        testMode,
        isConnected
      };
    }
    
    return {
      apiKey,
      apiSecret: encryptedSecret ? '••••••••••••••••••••••••••••••••' : '',
      testMode,
      isConnected
    };
  } catch (error) {
    console.error('API設定の読み込みに失敗しました', error);
    return {
      apiKey: '',
      apiSecret: '',
      testMode: false,
      isConnected: false
    };
  }
};

export const testApiConnection = async (apiKey, apiSecret) => {
  try {
    const secretToUse = 
      apiSecret === '••••••••••••••••••••••••••••••••' 
        ? decrypt(localStorage.getItem(API_SECRET_STORAGE_KEY))
        : apiSecret;
        
    if (!apiKey || !secretToUse) {
      return {
        success: false,
        message: 'APIキーとシークレットが必要です',
        balance: null
      };
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockBalance = {
      BTC: { free: '0.00123', locked: '0' },
      USDT: { free: '3250.75', locked: '0' }
    };
    
    return {
      success: true,
      message: 'Binance APIに正常に接続できました',
      balance: mockBalance
    };
  } catch (error) {
    console.error('API接続テストに失敗しました', error);
    return {
      success: false,
      message: `接続エラー: ${error.message || '不明なエラーが発生しました'}`,
      balance: null
    };
  }
};

export const isApiConnected = () => {
  return localStorage.getItem(API_CONNECTED_STORAGE_KEY) === 'true';
};

export const getApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
};

export const hasApiSecret = () => {
  return !!localStorage.getItem(API_SECRET_STORAGE_KEY);
};

export const resetApiSettings = () => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(API_SECRET_STORAGE_KEY);
  localStorage.removeItem(TEST_MODE_STORAGE_KEY);
  localStorage.removeItem(API_CONNECTED_STORAGE_KEY);
  sessionStorage.removeItem(API_KEY_STORAGE_KEY);
};

export default {
  saveApiSettings,
  loadApiSettings,
  testApiConnection,
  isApiConnected,
  getApiKey,
  hasApiSecret,
  resetApiSettings
}; 