import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white p-2 rounded shadow-lg border border-gray-700 text-sm">
        <p className="mb-1">{label}</p>
        {payload.map((entry, index) => (
          entry && entry.value !== undefined && (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

const Chart = ({ data }) => {
  return (
    <div className="w-full h-[400px] bg-white rounded-lg shadow-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" name="価格" />
          <Line type="monotone" dataKey="volume" stroke="#82ca9d" name="取引量" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart; 