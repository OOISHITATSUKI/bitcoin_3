import React from 'react';
import { Card, Button, Tooltip } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useApi } from '../../context/ApiContext';

const formatTime = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

const ApiStatus = () => {
  const { isConnected, lastSyncTime, isChecking, checkApiConnection, error, balance } = useApi();

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>API接続状態</span>
          <Tooltip title="接続を確認">
            <Button
              type="text"
              icon={<SyncOutlined spin={isChecking} />}
              onClick={checkApiConnection}
              size="small"
              loading={isChecking}
              disabled={isChecking}
            />
          </Tooltip>
        </div>
      }
      style={{ marginBottom: '16px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isConnected ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          )}
          <span style={{ 
            color: isConnected ? '#52c41a' : '#ff4d4f',
            fontWeight: 500
          }}>
            {isConnected ? '接続中' : '未接続'}
          </span>
        </div>

        {lastSyncTime && (
          <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>
            最終同期: {formatTime(lastSyncTime)}
          </div>
        )}

        {error && (
          <div style={{ color: '#ff4d4f', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {balance && isConnected && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>残高情報:</div>
            {Object.entries(balance).map(([asset, { free, locked }]) => (
              <div key={asset} style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                marginBottom: '4px'
              }}>
                <span>{asset}:</span>
                <span>
                  利用可能: {parseFloat(free).toFixed(8)}
                  {locked !== '0' && ` (ロック中: ${parseFloat(locked).toFixed(8)})`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ApiStatus; 