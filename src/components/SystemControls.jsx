import React from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useSystem } from '../context/SystemContext';
import { useApi } from '../context/ApiContext';

const { Text } = Typography;

const SystemControls = () => {
  const { isRunning, status, startSystem, stopSystem } = useSystem();
  const { isConnected } = useApi();

  return (
    <Card title="システム制御" style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <Text>ステータス: </Text>
          <Text strong>{status}</Text>
        </div>
        
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={startSystem}
            disabled={!isConnected || isRunning}
          >
            システム起動
          </Button>
          
          <Button
            danger
            icon={<StopOutlined />}
            onClick={stopSystem}
            disabled={!isRunning}
          >
            システム停止
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default SystemControls; 