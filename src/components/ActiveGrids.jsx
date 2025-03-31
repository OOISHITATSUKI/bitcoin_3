import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import { useSystem } from '../context/SystemContext';

const { Text } = Typography;

const ActiveGrids = () => {
  const { activeGrids } = useSystem();

  const columns = [
    {
      title: '通貨ペア',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '状態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '稼働中' : '停止中'}
        </Tag>
      ),
    },
    {
      title: '価格範囲',
      key: 'priceRange',
      render: (_, record) => (
        <span>{record.lowerPrice} - {record.upperPrice}</span>
      ),
    },
    {
      title: '投資額',
      dataIndex: 'totalInvestment',
      key: 'totalInvestment',
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      title: 'グリッド数',
      dataIndex: 'gridCount',
      key: 'gridCount',
    },
    {
      title: '利益率',
      dataIndex: 'profitRate',
      key: 'profitRate',
      render: (value) => `${(value * 100).toFixed(2)}%`,
    },
    {
      title: '総利益',
      key: 'profit',
      render: (_, record) => (
        <Text type={record.totalProfit > record.totalLoss ? 'success' : 'danger'}>
          ${(record.totalProfit - record.totalLoss).toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <Card title="アクティブなグリッド" style={{ marginBottom: 16 }}>
      <Table
        dataSource={activeGrids}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default ActiveGrids; 