import React, { useState, useEffect } from 'react';
import Chart from '../components/Trading/Chart';
import GridSetup from '../components/Trading/GridSetup';

const Trading = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // モックデータの生成
    const generateMockData = () => {
      const data = [];
      const now = new Date();
      for (let i = 0; i < 20; i++) {
        data.push({
          time: new Date(now - (19 - i) * 60000).toLocaleTimeString(),
          price: Math.random() * 1000 + 50000, // 50,000-51,000の範囲
          volume: Math.random() * 100 // 0-100の範囲
        });
      }
      return data;
    };

    setChartData(generateMockData());

    // 1分ごとにデータを更新
    const interval = setInterval(() => {
      setChartData(prevData => {
        const newData = [...prevData.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString(),
          price: Math.random() * 1000 + 50000,
          volume: Math.random() * 100
        });
        return newData;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">トレーディング</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <Chart data={chartData} />
          </div>
          <div className="lg:col-span-2">
            <GridSetup />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading; 