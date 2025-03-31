import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, Activity, CheckCircle, Eye } from 'lucide-react';
import { Card, Row, Col, Button, Typography, Statistic } from 'antd';
import { PoweroffOutlined, SyncOutlined, DollarOutlined } from '@ant-design/icons';
import { useSystem } from '../context/SystemContext';

const { Title } = Typography;

// モックデータ生成
const generateProfitHistory = () => {
  const data = [];
  let profit = 0;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dailyProfit = (Math.random() * 20) - 5;
    profit += dailyProfit;
    
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      profit: parseFloat(profit.toFixed(2)),
      dailyProfit: parseFloat(dailyProfit.toFixed(2))
    });
  }
  
  return data;
};

// モックの取引履歴生成
const generateTradeHistory = () => {
  const trades = [];
  const pairs = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'BNB/USDT'];
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const time = new Date(now.getTime() - i * 1000 * 60 * Math.floor(Math.random() * 60) - 1000 * 60 * 10);
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const isBuy = Math.random() > 0.5;
    const price = pair === 'BTC/USDT' ? 45000 + (Math.random() * 2000 - 1000) : 
                 pair === 'ETH/USDT' ? 2300 + (Math.random() * 200 - 100) :
                 pair === 'XRP/USDT' ? 0.5 + (Math.random() * 0.1 - 0.05) : 
                 300 + (Math.random() * 40 - 20);
    
    trades.push({
      id: `trade-${i}`,
      time: time,
      timeFormatted: `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`,
      pair,
      type: isBuy ? 'buy' : 'sell',
      price: parseFloat(price.toFixed(2)),
      amount: parseFloat((Math.random() * 0.1 + 0.01).toFixed(6)),
      total: parseFloat((price * (Math.random() * 0.1 + 0.01)).toFixed(2)),
      profit: isBuy ? 0 : parseFloat((Math.random() * 15 - 5).toFixed(2))
    });
  }
  
  return trades.sort((a, b) => b.time - a.time);
};

// アクティブなグリッド情報生成
const generateActiveGrids = () => {
  return [
    {
      id: 'grid-1',
      pair: 'BTC/USDT',
      startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      upperLimit: 48000,
      lowerLimit: 42000,
      gridLines: 12,
      profit: 28.45,
      trades: 14,
      status: 'active'
    },
    {
      id: 'grid-2',
      pair: 'ETH/USDT',
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      upperLimit: 2500,
      lowerLimit: 2100,
      gridLines: 8,
      profit: 12.75,
      trades: 6,
      status: 'active'
    },
    {
      id: 'grid-3',
      pair: 'XRP/USDT',
      startedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      upperLimit: 0.65,
      lowerLimit: 0.48,
      gridLines: 6,
      profit: -2.32,
      trades: 8,
      status: 'warning'
    }
  ];
};

// モック残高情報生成
const generateBalances = () => {
  return {
    'USDT': {
      total: 1245.67,
      available: 845.22,
      locked: 400.45
    },
    'BTC': {
      total: 0.02356,
      available: 0.01234,
      locked: 0.01122
    },
    'ETH': {
      total: 0.5674,
      available: 0.3245,
      locked: 0.2429
    },
    'XRP': {
      total: 125.45,
      available: 95.32,
      locked: 30.13
    }
  };
};

const Dashboard = () => {
  const {
    isRunning,
    lastSyncTime,
    balanceData,
    error,
    isConnected,
    toggleSystemStatus,
    formatTimeSince,
    fetchBalances
  } = useSystem();

  const [profitHistory, setProfitHistory] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [activeGrids, setActiveGrids] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    isRunning: true,
    startTime: new Date(Date.now() - 72 * 60 * 60 * 1000),
    lastSync: new Date(Date.now() - 2 * 60 * 1000),
    totalProfit: 38.88,
    totalTrades: 28,
    openOrders: 24
  });
  
  useEffect(() => {
    setProfitHistory(generateProfitHistory());
    setTradeHistory(generateTradeHistory());
    setActiveGrids(generateActiveGrids());
    
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
      
      if (Math.random() > 0.7) {
        const newTrade = generateTradeHistory()[0];
        newTrade.id = `trade-new-${Date.now()}`;
        newTrade.time = new Date();
        newTrade.timeFormatted = `${newTrade.time.getHours()}:${String(newTrade.time.getMinutes()).padStart(2, '0')}`;
        
        setTradeHistory(prev => [newTrade, ...prev.slice(0, 9)]);
        
        setSystemStatus(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + 1,
          totalProfit: parseFloat((prev.totalProfit + newTrade.profit).toFixed(2))
        }));
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatCurrency = (value) => {
    return `${value.toFixed(2)}`;
  };
  
  const formatCrypto = (value, symbol) => {
    if (symbol === 'BTC' || symbol === 'ETH') {
      return `${value.toFixed(6)} ${symbol}`;
    } else {
      return `${value.toFixed(2)} ${symbol}`;
    }
  };
  
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds}秒前`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    return `${days}日前`;
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 rounded shadow-lg border border-gray-700 text-xs">
          <p className="mb-1">{label}</p>
          {payload.map((entry, index) => (
            entry && entry.value !== undefined && (
              <p key={`item-${index}`} style={{ color: entry.color }}>
                {entry.name}: {formatCurrency(entry.value)}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  // 残高の合計を計算
  const calculateTotalBalance = () => {
    return Object.entries(balanceData).reduce((total, [asset, data]) => {
      // ここでUSDT価格への換算ロジックを追加する必要があります
      if (asset === 'USDT') {
        return total + data.total;
      }
      return total;
    }, 0);
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* システムステータス */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isRunning ? '#52c41a' : '#ff4d4f',
                  marginRight: '8px'
                }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {isRunning ? 'システム稼働中' : 'システム停止中'}
              </Title>
            </div>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              type={isRunning ? 'danger' : 'primary'}
              icon={<PoweroffOutlined />}
              onClick={toggleSystemStatus}
              disabled={!isConnected}
            >
              {isRunning ? 'システムを停止' : 'システムを起動'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 残高情報 */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="総資産（USDT）"
              value={calculateTotalBalance().toFixed(2)}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="API接続状態"
              value={isConnected ? '接続済み' : '未接続'}
              valueStyle={{ color: isConnected ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="最終同期"
              value={formatTimeSince(lastSyncTime)}
              prefix={<SyncOutlined />}
            />
            <Button
              type="link"
              onClick={fetchBalances}
              disabled={!isConnected}
              style={{ padding: 0 }}
            >
              今すぐ更新
            </Button>
          </Card>
        </Col>
      </Row>

      {/* 残高詳細 */}
      <Card title="資産残高" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          {Object.entries(balanceData).map(([asset, data]) => (
            <Col span={8} key={asset}>
              <Card size="small">
                <Statistic
                  title={`${asset} 残高`}
                  value={data.total}
                  precision={8}
                  suffix={asset}
                />
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
                  利用可能: {data.free}
                  <br />
                  ロック中: {data.locked}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* エラー表示 */}
      {error && (
        <Card style={{ marginTop: '24px', backgroundColor: '#fff1f0', borderColor: '#ffa39e' }}>
          <Typography.Text type="danger">{error}</Typography.Text>
        </Card>
      )}

      {/* チャートと残高 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 損益チャート */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 px-6 py-4">
            <h3 className="text-white font-medium">30日間の損益推移</h3>
          </div>
          <div className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }} 
                    tickMargin={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `${value}`}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dailyProfit"
                    stroke="#6366f1"
                    strokeWidth={1}
                    dot={false}
                    strokeDasharray="3 3"
                    hide={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* アクティブなグリッドと取引履歴 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* アクティブなグリッド */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-medium">アクティブなグリッド</h3>
              <span className="bg-white text-indigo-600 px-2 py-0.5 rounded text-xs font-medium">
                {activeGrids.length} グリッド
              </span>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {activeGrids.map(grid => (
                  <div key={grid.id} className="border rounded-lg overflow-hidden">
                    <div className={`px-4 py-3 flex justify-between items-center ${
                      grid.status === 'warning' ? 'bg-amber-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        <span className="font-medium">{grid.pair}</span>
                        {grid.status === 'warning' && (
                          <span className="ml-2 flex items-center text-amber-600 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            レンジ外
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          grid.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(grid.profit)}
                        </span>
                        <button className="ml-2 text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 text-sm">
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                          <span className="text-gray-500 text-xs">上限価格:</span>
                          <div className="font-medium">{formatCurrency(grid.upperLimit)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">下限価格:</span>
                          <div className="font-medium">{formatCurrency(grid.lowerLimit)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">グリッド本数:</span>
                          <div className="font-medium">{grid.gridLines}</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>開始: {grid.startedAt.toLocaleDateString()}</span>
                        <span>取引回数: {grid.trades}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 最近の取引 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-700 px-6 py-4">
              <h3 className="text-white font-medium">最近の取引</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ペア
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイプ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      損益
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tradeHistory.map(trade => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {trade.timeFormatted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {trade.pair}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trade.type === 'buy' ? 
                            'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                        }`}>
                          {trade.type === 'buy' ? '買い' : '売り'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(trade.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCrypto(trade.amount, trade.pair.split('/')[0])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={trade.profit > 0 ? 'text-green-600' : trade.profit < 0 ? 'text-red-600' : 'text-gray-500'}>
                          {trade.profit !== 0 ? formatCurrency(trade.profit) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 