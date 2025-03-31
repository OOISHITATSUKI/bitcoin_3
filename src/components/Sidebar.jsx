import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, Clock, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { id: '/', label: 'ダッシュボード', icon: <Home className="h-5 w-5" /> },
    { id: '/trading', label: 'トレーディング', icon: <Activity className="h-5 w-5" /> },
    { id: '/analytics', label: '分析・レポート', icon: <Clock className="h-5 w-5" /> },
    { id: '/settings', label: '設定', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <nav>
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.id}>
              <Link
                to={item.id}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 