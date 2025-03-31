import React from 'react';
import { Card, Space, Typography, Tag } from 'antd';
import { useSystem } from '../context/SystemContext';
import { useApi } from '../context/ApiContext';

const { Text } = Typography;

const SystemControls = () => {
  const { isRunning, lastSyncTime, formatTimeSince } = useSystem();
  const { isConnected } = useApi();

  return (
    <Card title="システム状態" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text>稼働状態:</Text>
            <Tag color={isRunning ? 'success' : 'default'}>
              {isRunning ? '稼働中' : '停止中'}
            </Tag>
          </Space>
        </div>
        
        <div>
          <Text>API接続:</Text>
          <Tag color={isConnected ? 'success' : 'error'} style={{ marginLeft: 8 }}>
            {isConnected ? '接続済み' : '未接続'}
          </Tag>
        </div>

        {lastSyncTime && (
          <div>
            <Text>最終同期:</Text>
            <Text style={{ marginLeft: 8 }}>{formatTimeSince(lastSyncTime)}</Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default SystemControls; 