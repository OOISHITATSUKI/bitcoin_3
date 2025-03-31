import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Button, Select, Switch, message, Typography, Table, Tag, Modal, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useApi } from '../context/ApiContext';
import { useSystem } from '../context/SystemContext';
import { binanceService } from '../services/binance';
import BTCChart from '../components/BTCChart';

const { Title, Text } = Typography;
const { Option } = Select;

const GridSettings = () => {
  const { isConnected } = useApi();
  const { startSystem, stopSystem, isRunning, activeGrids, createGrid, deleteGrid, updateGrid } = useSystem();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [currentPrice, setCurrentPrice] = useState(null);
  const [selectedSymbol] = useState('BTCUSDT');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingGrid, setEditingGrid] = useState(null);

  // 現在価格の取得
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await binanceService.getPrice('BTCUSDT');
        setCurrentPrice(parseFloat(price.price));
      } catch (err) {
        console.error('価格取得エラー:', err);
      }
    };

    if (isConnected) {
      fetchPrice();
      const interval = setInterval(fetchPrice, 5000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const onFinish = async (values) => {
    try {
      const gridData = {
        symbol: 'BTC/USDT',
        status: 'active',
        upperPrice: values.upperPrice,
        lowerPrice: values.lowerPrice,
        totalInvestment: values.investment,
        gridCount: values.gridCount,
        profitRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        createdAt: new Date().toISOString()
      };

      // グリッドの検証
      if (values.upperPrice <= values.lowerPrice) {
        message.error('上限価格は下限価格より大きい必要があります');
        return;
      }

      if (values.gridCount < 2) {
        message.error('グリッド数は2以上である必要があります');
        return;
      }

      // グリッドの作成
      const success = await createGrid(gridData);
      if (success) {
        form.resetFields();
      }
    } catch (err) {
      message.error('グリッド設定の保存に失敗しました: ' + err.message);
    }
  };

  const handleEdit = (grid) => {
    setEditingGrid(grid);
    editForm.setFieldsValue({
      investment: grid.totalInvestment,
      gridCount: grid.gridCount,
      upperPrice: grid.upperPrice,
      lowerPrice: grid.lowerPrice,
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = async (gridId) => {
    Modal.confirm({
      title: 'グリッドの削除',
      content: 'このグリッドを削除してもよろしいですか？',
      okText: '削除',
      okType: 'danger',
      cancelText: 'キャンセル',
      onOk: () => {
        deleteGrid(gridId);
      },
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      if (values.upperPrice <= values.lowerPrice) {
        message.error('上限価格は下限価格より大きい必要があります');
        return;
      }

      if (values.gridCount < 2) {
        message.error('グリッド数は2以上である必要があります');
        return;
      }

      const updatedData = {
        totalInvestment: values.investment,
        gridCount: values.gridCount,
        upperPrice: values.upperPrice,
        lowerPrice: values.lowerPrice,
      };

      const success = await updateGrid(editingGrid.id, updatedData);
      if (success) {
        setIsEditModalVisible(false);
        setEditingGrid(null);
        editForm.resetFields();
      }
    } catch (err) {
      message.error('グリッドの更新に失敗しました: ' + err.message);
    }
  };

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
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編集
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            削除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <BTCChart />
      
      <Card>
        <Title level={2}>グリッド取引設定</Title>
        
        {!isConnected && (
          <div style={{ marginBottom: '24px' }}>
            <Text type="warning">APIに接続されていません。API設定から接続を行ってください。</Text>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            investment: 1000,
            gridCount: 10,
            upperPrice: currentPrice ? Math.ceil(currentPrice * 1.1) : 50000,
            lowerPrice: currentPrice ? Math.floor(currentPrice * 0.9) : 40000,
            isTestMode: true
          }}
        >
          <Form.Item
            label="取引ペア"
          >
            <Input value="BTC/USDT" disabled style={{ width: '100%' }} />
          </Form.Item>

          {currentPrice && (
            <div style={{ marginBottom: '16px' }}>
              <Text>現在価格: ${currentPrice.toFixed(2)}</Text>
            </div>
          )}

          <Form.Item
            label="投資額 (USDT)"
            name="investment"
            rules={[{ required: true, message: '投資額を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={100}
              max={100000}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="グリッド数"
            name="gridCount"
            rules={[{ required: true, message: 'グリッド数を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={2}
              max={100}
            />
          </Form.Item>

          <Form.Item
            label="上限価格 (USDT)"
            name="upperPrice"
            rules={[{ required: true, message: '上限価格を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="下限価格 (USDT)"
            name="lowerPrice"
            rules={[{ required: true, message: '下限価格を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="テストモード"
            name="isTestMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={!isConnected}>
              グリッドを作成
            </Button>
          </Form.Item>
        </Form>

        <Table
          dataSource={activeGrids}
          columns={columns}
          rowKey="id"
          pagination={false}
          style={{ marginTop: '24px' }}
        />

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
          <Button
            type="primary"
            onClick={startSystem}
            disabled={!isConnected || isRunning}
          >
            システムを起動
          </Button>
          <Button
            danger
            onClick={stopSystem}
            disabled={!isRunning}
          >
            システムを停止
          </Button>
        </div>
      </Card>

      <Modal
        title="グリッド設定の編集"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingGrid(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            label="投資額 (USDT)"
            name="investment"
            rules={[{ required: true, message: '投資額を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={100}
              max={100000}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            label="グリッド数"
            name="gridCount"
            rules={[{ required: true, message: 'グリッド数を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={2}
              max={100}
            />
          </Form.Item>

          <Form.Item
            label="上限価格 (USDT)"
            name="upperPrice"
            rules={[{ required: true, message: '上限価格を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="下限価格 (USDT)"
            name="lowerPrice"
            rules={[{ required: true, message: '下限価格を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              更新
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GridSettings; 