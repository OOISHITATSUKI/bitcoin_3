import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Select, Switch, message, Typography } from 'antd';
import { useApi } from '../context/ApiContext';
import { useSystem } from '../context/SystemContext';

const { Title, Text } = Typography;
const { Option } = Select;

const GridSettings = () => {
  const { isConnected } = useApi();
  const { startSystem, stopSystem, isRunning } = useSystem();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('設定値:', values);
    message.success('グリッド設定を保存しました');
  };

  const handleStart = async () => {
    try {
      await startSystem();
      message.success('システムを起動しました');
    } catch (error) {
      message.error('システムの起動に失敗しました: ' + error.message);
    }
  };

  const handleStop = async () => {
    try {
      await stopSystem();
      message.success('システムを停止しました');
    } catch (error) {
      message.error('システムの停止に失敗しました: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
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
            symbol: 'BTCUSDT',
            investment: 1000,
            gridCount: 10,
            upperPrice: 50000,
            lowerPrice: 40000,
            isTestMode: true
          }}
        >
          <Form.Item
            label="取引ペア"
            name="symbol"
            rules={[{ required: true, message: '取引ペアを選択してください' }]}
          >
            <Select>
              <Option value="BTCUSDT">BTC/USDT</Option>
              <Option value="ETHUSDT">ETH/USDT</Option>
              <Option value="BNBUSDT">BNB/USDT</Option>
            </Select>
          </Form.Item>

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
            <Button type="primary" htmlType="submit">
              設定を保存
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
          <Button
            type="primary"
            onClick={handleStart}
            disabled={!isConnected || isRunning}
          >
            システムを起動
          </Button>
          <Button
            danger
            onClick={handleStop}
            disabled={!isRunning}
          >
            システムを停止
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GridSettings; 