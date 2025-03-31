import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GridSettings from './pages/GridSettings';
import ApiSettings from './pages/ApiSettings';
import Analytics from './pages/Analytics';
import AiOptimization from './pages/AiOptimization';
import { ApiProvider } from './context/ApiContext';
import { SystemProvider } from './context/SystemContext';

const App = () => {
  return (
    <ConfigProvider locale={jaJP}>
      <ApiProvider>
        <SystemProvider>
          <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/grid-settings" element={<GridSettings />} />
                <Route path="/api-settings" element={<ApiSettings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/ai-optimization" element={<AiOptimization />} />
              </Routes>
            </Layout>
          </Router>
        </SystemProvider>
      </ApiProvider>
    </ConfigProvider>
  );
};

export default App; 