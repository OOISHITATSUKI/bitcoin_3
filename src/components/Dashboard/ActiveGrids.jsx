import React from 'react';
import { Card, Typography, Tag, Space, Button, Row, Col } from 'antd';
import { useSystem } from '../../context/SystemContext';
import { useBinance } from '../../hooks/useBinance';
import { ArrowUpRight, ArrowDownRight, DollarSign, Percent } from 'lucide-react';

const { Title, Text } = Typography;

const ActiveGrids = () => {
  const { activeGrids } = useSystem();
  const { getPrice } = useBinance();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Title level={4} style={{ margin: 0 }}>アクティブなグリッド</Title>
          <Tag color="blue">{activeGrids.length} グリッド</Tag>
        </div>
      }
      className="bg-white rounded-lg shadow-sm"
      style={{ height: '100%' }}
    >
      {activeGrids.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <Text type="secondary">アクティブなグリッドはありません</Text>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeGrids.map((grid) => (
            <Card 
              key={grid.id} 
              size="small"
              className="border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Title level={5} style={{ margin: 0 }}>{grid.symbol}</Title>
                      <Tag color={grid.status === 'active' ? 'success' : 'warning'}>
                        {grid.status === 'active' ? 'アクティブ' : '一時停止'}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Space>
                        <DollarSign size={14} />
                        <span>投資額: {formatCurrency(grid.totalInvestment)}</span>
                      </Space>
                      <Space>
                        <Percent size={14} />
                        <span>収益率: {formatPercentage(grid.profitRate)}</span>
                      </Space>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight size={14} style={{ color: '#52c41a' }} />
                      <span style={{ color: '#52c41a' }}>+{formatCurrency(grid.totalProfit)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowDownRight size={14} style={{ color: '#ff4d4f' }} />
                      <span style={{ color: '#ff4d4f' }}>-{formatCurrency(grid.totalLoss)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <Button size="small" type="primary">
                        詳細
                      </Button>
                      <Button size="small" danger>
                        停止
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActiveGrids; 