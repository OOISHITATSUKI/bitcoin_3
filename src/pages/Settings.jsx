import React from 'react';
import { Save, Key, Bell, Shield, Database, Zap } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = React.useState({
    apiKey: '',
    apiSecret: '',
    notifications: {
      email: true,
      telegram: false,
      discord: false
    },
    security: {
      twoFactor: false,
      ipWhitelist: []
    },
    trading: {
      maxOpenOrders: 5,
      stopLoss: 2,
      takeProfit: 4,
      gridSize: 10
    },
    backup: {
      autoBackup: true,
      backupInterval: 'daily'
    }
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('保存中...');
    
    try {
      // 実際のAPIではここで設定を保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('保存しました');
    } catch (error) {
      setSaveStatus('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNotificationToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleSecurityToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [type]: !prev.security[type]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">設定</h2>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? '保存中...' : '保存'}</span>
          </button>
        </div>

        {saveStatus && (
          <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700">
            {saveStatus}
          </div>
        )}

        <div className="space-y-6">
          {/* API設定 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API設定
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', '', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Secret
                </label>
                <input
                  type="password"
                  value={settings.apiSecret}
                  onChange={(e) => handleInputChange('apiSecret', '', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* 通知設定 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              通知設定
            </h3>
            <div className="space-y-2">
              {Object.entries(settings.notifications).map(([type, enabled]) => (
                <label key={type} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleNotificationToggle(type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </section>

          {/* セキュリティ設定 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              セキュリティ設定
            </h3>
            <div className="space-y-2">
              {Object.entries(settings.security).map(([type, value]) => (
                <label key={type} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => handleSecurityToggle(type)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </section>

          {/* トレーディング設定 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              トレーディング設定
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.trading).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleInputChange('trading', key, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* バックアップ設定 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              バックアップ設定
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleInputChange('backup', 'autoBackup', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">自動バックアップ</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  バックアップ間隔
                </label>
                <select
                  value={settings.backup.backupInterval}
                  onChange={(e) => handleInputChange('backup', 'backupInterval', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings; 