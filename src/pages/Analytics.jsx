import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, Zap, Loader, ArrowRight, ChevronDown, ChevronUp, Check, Save } from 'lucide-react';

// モックデータ生成
const generateAnalyticsData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      profit: parseFloat((Math.random() * 100 - 50).toFixed(2)),
      trades: Math.floor(Math.random() * 20),
      winRate: parseFloat((Math.random() * 30 + 50).toFixed(2)),
      volume: parseFloat((Math.random() * 1000).toFixed(2))
    });
  }
  
  return data;
};

const Analytics = () => {
  const [timeRange, setTimeRange] = React.useState('30D');
  const [selectedMetric, setSelectedMetric] = React.useState('profit');
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    // 実際のAPIではここでデータを取得
    setTimeout(() => {
      setData(generateAnalyticsData());
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  const timeRanges = [
    { id: '7D', label: '7日間' },
    { id: '30D', label: '30日間' },
    { id: '90D', label: '90日間' },
    { id: '1Y', label: '1年間' }
  ];

  const metrics = [
    { id: 'profit', label: '利益', color: '#10b981' },
    { id: 'trades', label: '取引回数', color: '#6366f1' },
    { id: 'winRate', label: '勝率', color: '#f59e0b' },
    { id: 'volume', label: '取引量', color: '#8b5cf6' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 text-white p-2 rounded shadow-lg border border-gray-700 text-xs">
          <p className="mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">分析・レポート</h2>
          <div className="flex space-x-2">
            {timeRanges.map(range => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeRange === range.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`p-4 rounded-lg border ${
                selectedMetric === metric.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="h-96">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}`}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={metrics.find(m => m.id === selectedMetric)?.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name={metrics.find(m => m.id === selectedMetric)?.label}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(metric => {
            const values = data.map(d => d[metric.id]);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const max = Math.max(...values);
            const min = Math.min(...values);

            return (
              <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">平均:</span>
                    <span className="font-medium">{avg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">最大:</span>
                    <span className="font-medium">{max.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">最小:</span>
                    <span className="font-medium">{min.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 