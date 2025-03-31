import React from 'react';
import { Plus, Trash2, Save, AlertTriangle } from 'lucide-react';

const GridSetup = () => {
  const [grids, setGrids] = React.useState([
    {
      id: 1,
      symbol: 'BTC/USDT',
      upperPrice: 45000,
      lowerPrice: 35000,
      gridCount: 10,
      investment: 1000,
      isActive: true
    }
  ]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedGrid, setSelectedGrid] = React.useState(null);
  const [formData, setFormData] = React.useState({
    symbol: '',
    upperPrice: '',
    lowerPrice: '',
    gridCount: '',
    investment: '',
    isActive: true
  });

  const handleAddGrid = () => {
    setSelectedGrid(null);
    setFormData({
      symbol: '',
      upperPrice: '',
      lowerPrice: '',
      gridCount: '',
      investment: '',
      isActive: true
    });
    setIsEditing(true);
  };

  const handleEditGrid = (grid) => {
    setSelectedGrid(grid);
    setFormData({
      symbol: grid.symbol,
      upperPrice: grid.upperPrice,
      lowerPrice: grid.lowerPrice,
      gridCount: grid.gridCount,
      investment: grid.investment,
      isActive: grid.isActive
    });
    setIsEditing(true);
  };

  const handleDeleteGrid = (id) => {
    setGrids(grids.filter(grid => grid.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGrid) {
      setGrids(grids.map(grid =>
        grid.id === selectedGrid.id
          ? { ...grid, ...formData }
          : grid
      ));
    } else {
      setGrids([
        ...grids,
        {
          id: Math.max(...grids.map(g => g.id), 0) + 1,
          ...formData
        }
      ]);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const calculateGridSpacing = (upper, lower, count) => {
    return ((upper - lower) / (count - 1)).toFixed(2);
  };

  const calculateGridProfit = (upper, lower, count, investment) => {
    const spacing = (upper - lower) / (count - 1);
    const profitPerGrid = spacing * 0.002; // 0.2%の利益を想定
    return (profitPerGrid * count * (investment / count)).toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">グリッド設定</h2>
        <button
          onClick={handleAddGrid}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>新規グリッド</span>
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                取引ペア
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                上限価格
              </label>
              <input
                type="number"
                value={formData.upperPrice}
                onChange={(e) => setFormData({ ...formData, upperPrice: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                下限価格
              </label>
              <input
                type="number"
                value={formData.lowerPrice}
                onChange={(e) => setFormData({ ...formData, lowerPrice: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                グリッド数
              </label>
              <input
                type="number"
                value={formData.gridCount}
                onChange={(e) => setFormData({ ...formData, gridCount: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                投資額
              </label>
              <input
                type="number"
                value={formData.investment}
                onChange={(e) => setFormData({ ...formData, investment: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">有効</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-5 w-5" />
              <span>保存</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {grids.map(grid => (
            <div
              key={grid.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{grid.symbol}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      grid.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {grid.isActive ? '有効' : '無効'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditGrid(grid)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGrid(grid.id)}
                    className="p-2 text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">価格範囲</span>
                  <p className="text-sm font-medium">
                    ${grid.lowerPrice.toLocaleString()} - ${grid.upperPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">グリッド間隔</span>
                  <p className="text-sm font-medium">
                    ${calculateGridSpacing(grid.upperPrice, grid.lowerPrice, grid.gridCount)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">予想利益</span>
                  <p className="text-sm font-medium text-green-600">
                    ${calculateGridProfit(grid.upperPrice, grid.lowerPrice, grid.gridCount, grid.investment)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      投資額: ${grid.investment.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    グリッド数: {grid.gridCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GridSetup; 