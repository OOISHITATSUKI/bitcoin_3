import React from 'react';
import { Layout as AntLayout, Menu, Button, Tooltip } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  SettingOutlined,
  LineChartOutlined,
  RobotOutlined,
  PoweroffOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useSystem } from '../context/SystemContext';
import { useApi } from '../context/ApiContext';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const location = useLocation();
  const { isRunning, toggleSystemStatus } = useSystem();
  const { isConnected, lastSyncTime, checkApiConnection, isChecking } = useApi();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">ダッシュボード</Link>
    },
    {
      key: '/api-settings',
      icon: <SettingOutlined />,
      label: <Link to="/api-settings">API設定</Link>
    },
    {
      key: '/analytics',
      icon: <LineChartOutlined />,
      label: <Link to="/analytics">分析</Link>
    },
    {
      key: '/ai-optimization',
      icon: <RobotOutlined />,
      label: <Link to="/ai-optimization">AI最適化</Link>
    }
  ];

  // 最終同期時間のフォーマット
  const formatLastSync = (date) => {
    if (!date) return '-';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
    return `${Math.floor(diff / 86400)}日前`;
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: 10
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          background: '#001529'
        }}>
          <h1 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Crypto Bot</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: 1
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* API接続状態 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Tooltip title={isConnected ? 'API接続中' : 'API未接続'}>
                <div style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  background: isConnected ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                  color: isConnected ? '#52c41a' : '#ff4d4f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isConnected ? '#52c41a' : '#ff4d4f'
                  }} />
                  {isConnected ? 'API接続中' : 'API未接続'}
                </div>
              </Tooltip>
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

            {/* 最終同期時間 */}
            {isConnected && (
              <div style={{
                fontSize: '14px',
                color: '#8c8c8c'
              }}>
                最終同期: {formatLastSync(lastSyncTime)}
              </div>
            )}

            {/* システム状態 */}
            <Button
              type={isRunning ? 'primary' : 'default'}
              danger={isRunning}
              icon={<PoweroffOutlined />}
              onClick={toggleSystemStatus}
              disabled={!isConnected}
            >
              {isRunning ? 'システム停止' : 'システム起動'}
            </Button>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px',
          minHeight: 280,
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 