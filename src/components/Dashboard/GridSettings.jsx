import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, Select, Switch, message, Typography, Alert } from 'antd';
import { SaveOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useApi } from '../../context/ApiContext';
import { useSystem } from '../../context/SystemContext';

const { Title, Text } = Typography;
const { Option } = Select;

const GridSettings = () => {
  const [loading, setLoading] = useState(false);
  const { isConnected } = useApi();
  const { startSystem, stopSystem, isRunning } = useSystem();
  const [form] = Form.useForm();

  // グリッド間隔と予想収益を計算
  const calculateGridMetrics = (values) => {
    if (!values || !values.upperPrice || !values.lowerPrice || !values.gridCount) {
      return { gridSpacing: null, estimatedProfit: null };
    }

    // グリッド間隔の計算
    const spacing = (values.upperPrice - values.lowerPrice) / (values.gridCount - 1);
    
    // 予想収益の計算（単純なモデル）
    // 各グリッド間で価格が一往復すると約0.4%の利益
    const averageProfit = 0.004;
    const estimatedProfitRate = averageProfit * values.gridCount;
    const estimatedProfit = values.investment * estimatedProfitRate;
    
    return { 
      gridSpacing: spacing.toFixed(2), 
      estimatedProfit: estimatedProfit.toFixed(2),
      profitRate: (estimatedProfitRate * 100).toFixed(2)
    };
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // バリデーション
      if (values.lowerPrice >= values.upperPrice) {
        message.error('下限価格は上限価格より低い値を設定してください');
        setLoading(false);
        return;
      }

      console.log('グリッド設定:', values);
      
      // ここで実際のAPI呼び出しなどを行う
      await new Promise(resolve => setTimeout(resolve, 1000)); // API呼び出しの代わり
      
      const metrics = calculateGridMetrics(values);
      
      message.success(`グリッド設定を保存しました: ${values.gridCount}本、間隔:$${metrics.gridSpacing}`);
    } catch (error) {
      message.error(`設定の保存に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      setLoading(true);
      await startSystem();
      message.success('システムを起動しました');
    } catch (error) {
      message.error('システムの起動に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await stopSystem();
      message.success('システムを停止しました');
    } catch (error) {
      message.error('システムの停止に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // フォームの値が変更されたときに計算結果を更新
  const handleValuesChange = (changedValues, allValues) => {
    const { gridSpacing, estimatedProfit, profitRate } = calculateGridMetrics(allValues);
    form.setFieldsValue({ gridSpacing, estimatedProfit, profitRate });
  };

  // 初期値の設定
  const initialValues = {
    symbol: 'BTCUSDT',
    investment: 1000,
    gridCount: 10,
    upperPrice: 50000,
    lowerPrice: 40000,
    isTestMode: true
  };

  // 初期の計算結果
  const initialMetrics = calculateGridMetrics(initialValues);
  
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>グリッド取引設定</Title>
        
        {!isConnected && (
          <Alert
            message="APIに接続されていません"
            description="グリッド取引を行うには、API設定から接続を行ってください。"
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={handleValuesChange}
          initialValues={{
            ...initialValues,
            gridSpacing: initialMetrics.gridSpacing,
            estimatedProfit: initialMetrics.estimatedProfit,
            profitRate: initialMetrics.profitRate
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
              <Option value="ADAUSDT">ADA/USDT</Option>
              <Option value="SOLUSDT">SOL/USDT</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="投資額 (USDT)"
            name="investment"
            rules={[{ required: true, message: '投資額を入力してください' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={10}
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

          <Card title="計算結果" type="inner" style={{ marginBottom: '24px' }}>
            <Form.Item
              label="グリッド間隔 (USDT)"
              name="gridSpacing"
            >
              <InputNumber
                style={{ width: '100%' }}
                disabled
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            <Form.Item
              label="予想収益率"
              name="profitRate"
            >
              <InputNumber
                style={{ width: '100%' }}
                disabled
                formatter={value => `${value}%`}
              />
            </Form.Item>

            <Form.Item
              label="予想収益額 (USDT)"
              name="estimatedProfit"
            >
              <InputNumber
                style={{ width: '100%' }}
                disabled
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Card>

          <Form.Item
            label="テストモード"
            name="isTestMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              disabled={!isConnected}
            >
              設定を保存
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStart}
            loading={loading}
            disabled={!isConnected || isRunning}
          >
            システムを起動
          </Button>
          <Button
            danger
            icon={<PauseCircleOutlined />}
            onClick={handleStop}
            loading={loading}
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