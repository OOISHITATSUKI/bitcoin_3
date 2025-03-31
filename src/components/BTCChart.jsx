import React, { useState, useEffect } from 'react';
import { Card, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { binanceService } from '../services/binance';

const { Title } = Typography;

const BTCChart = () => {
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    // 初期データの生成（過去24時間分）
    const generateInitialData = () => {
      const data = [];
      const now = Date.now();
      const basePrice = 45000;
      
      for (let i = 24; i >= 0; i--) {
        const time = now - (i * 3600 * 1000); // 1時間ごと
        const variation = (Math.random() * 2000) - 1000; // ±1000の変動
        data.push({
          time: new Date(time).toLocaleTimeString(),
          price: basePrice + variation
        });
      }
      return data;
    };

    setPriceData(generateInitialData());

    // リアルタイム更新
    const updatePrice = async () => {
      try {
        const response = await binanceService.getPrice('BTCUSDT');
        const price = parseFloat(response.price);
        
        setPriceData(prev => {
          const newData = [...prev.slice(-23), {
            time: new Date().toLocaleTimeString(),
            price
          }];
          return newData;
        });
      } catch (error) {
        console.error('価格更新エラー:', error);
      }
    };

    const interval = setInterval(updatePrice, 5000); // 5秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const getYAxisDomain = () => {
    if (priceData.length === 0) return [40000, 50000];
    const prices = priceData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  return (
    <Card style={{ marginBottom: 24 }}>
      <Title level={3}>BTC/USDT チャート</Title>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={priceData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{ value: '時間', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              domain={getYAxisDomain()}
              label={{ value: '価格 (USDT)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [`$${value.toLocaleString()}`, 'BTC/USDT']}
              labelFormatter={(label) => `時間: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2196f3"
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default BTCChart; 