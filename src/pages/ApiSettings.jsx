import React, { useState, useCallback, useEffect } from 'react';
import { useBinance } from '../hooks/useBinance';
import { Alert, Button, Card, Checkbox, Input, Typography, message } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ApiSettings = () => {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const { saveApiKeys, clearApiKeys, error: binanceError, isLoading } = useBinance();

  // 初期値の読み込み
  useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem('binance_api_key');
      const savedTestMode = localStorage.getItem('binance_test_mode') === 'true';
      
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setSecretKey('••••••••••••••••••••••••••••••••');
        setIsTestMode(savedTestMode);
      }
    } catch (err) {
      console.error('保存されたAPIキーの読み込みに失敗:', err);
    }
  }, []);

  // 保存処理
  const handleSave = useCallback(async () => {
    if (!apiKey) {
      message.error('APIキーを入力してください');
      return;
    }

    // シークレットキーが未入力またはマスク表示でない場合のみチェック
    if (!secretKey || (secretKey !== '••••••••••••••••••••••••••••••••' && secretKey.trim() === '')) {
      message.error('シークレットキーを入力してください');
      return;
    }

    try {
      // マスク表示の場合は保存済みのシークレットキーを使用
      const secretToSave = secretKey === '••••••••••••••••••••••••••••••••'
        ? localStorage.getItem('binance_secret_key_encrypted')?.replace('encrypted:', '')
        : secretKey;

      if (!secretToSave) {
        message.error('シークレットキーが取得できません');
        return;
      }

      const success = await saveApiKeys(apiKey, secretToSave, isTestMode);
      if (success) {
        message.success('API設定を保存しました');
        setSecretKey('••••••••••••••••••••••••••••••••');
      } else {
        message.error('API設定の保存に失敗しました');
      }
    } catch (err) {
      message.error(`API設定の保存に失敗: ${err.message}`);
    }
  }, [apiKey, secretKey, isTestMode, saveApiKeys]);

  // クリア処理
  const handleClear = useCallback(async () => {
    try {
      const success = await clearApiKeys();
      if (success) {
        setApiKey('');
        setSecretKey('');
        setIsTestMode(false);
        message.success('API設定をクリアしました');
      } else {
        message.error('API設定のクリアに失敗しました');
      }
    } catch (err) {
      message.error(`API設定のクリアに失敗: ${err.message}`);
    }
  }, [clearApiKeys]);

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <SafetyCertificateOutlined style={{ fontSize: '24px' }} />
          <Title level={4} style={{ margin: 0 }}>Binance API設定</Title>
        </div>

        <Card
          type="inner"
          style={{ marginBottom: '24px', background: '#f0f5ff' }}
        >
          <Title level={5}>セキュリティ情報</Title>
          <ul style={{ paddingLeft: '20px' }}>
            <li>APIキーの権限は「現物取引」と「残高照会」のみに設定してください</li>
            <li>出金権限は絶対に付与しないでください</li>
            <li>IPアドレス制限を設定することでセキュリティが向上します</li>
            <li>APIキーは暗号化された形式で保存されます</li>
          </ul>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text>APIキー</Text>
            <Input
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Binance APIキーを入力"
              style={{ marginTop: '8px' }}
            />
          </div>

          <div>
            <Text>シークレットキー</Text>
            <Input.Password
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              placeholder="Binance シークレットキーを入力"
              style={{ marginTop: '8px' }}
            />
          </div>

          <Checkbox
            checked={isTestMode}
            onChange={e => setIsTestMode(e.target.checked)}
          >
            テストモード（実際の取引は行いません）
          </Checkbox>

          {binanceError && (
            <Alert
              message="エラー"
              description={binanceError}
              type="error"
              showIcon
            />
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button
              type="primary"
              onClick={handleSave}
              loading={isLoading}
              disabled={!apiKey}
            >
              設定を保存
            </Button>
            <Button
              onClick={handleClear}
              loading={isLoading}
            >
              設定をクリア
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiSettings; 