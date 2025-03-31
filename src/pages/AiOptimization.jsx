import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { useApi } from '../context/ApiContext';

const { Title, Paragraph } = Typography;

const AiOptimization = () => {
  const { isConnected } = useApi();

  return (
    <div>
      <Title level={2}>AI最適化</Title>
      
      {!isConnected && (
        <Alert
          type="warning"
          message="APIに接続されていません"
          description="AI最適化機能を使用するには、API設定から接続を行ってください。"
          style={{ marginBottom: '24px' }}
        />
      )}

      <Card title="AI最適化設定" style={{ marginBottom: '24px' }}>
        <Paragraph>
          AI最適化機能は現在開発中です。以下の機能が実装される予定です：
        </Paragraph>
        <ul>
          <li>取引戦略の自動最適化</li>
          <li>市場分析と予測</li>
          <li>リスク管理の最適化</li>
          <li>ポートフォリオのバランス調整</li>
        </ul>
      </Card>

      <Card title="最適化履歴">
        <Paragraph>
          最適化履歴はまだありません。
        </Paragraph>
      </Card>
    </div>
  );
};

export default AiOptimization; 