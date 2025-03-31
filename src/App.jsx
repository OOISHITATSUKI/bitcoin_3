import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import jaJP from 'antd/locale/ja_JP';
import { Layout } from 'antd';
import Sidebar from './components/Sidebar';
import GridSettings from './pages/GridSettings';
import ApiSettings from './pages/ApiSettings';
import Analytics from './pages/Analytics';
import AiOptimization from './pages/AiOptimization';
import { ApiProvider } from './context/ApiContext';
import { SystemProvider } from './context/SystemContext';

const { Content } = Layout;

const App = () => {
  return (
    <ConfigProvider locale={jaJP}>
      <ApiProvider>
        <SystemProvider>
          <Router>
            <Layout style={{ minHeight: '100vh' }}>
              <Sidebar />
              <Layout>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                  <Switch>
                    <Route exact path="/" render={() => <Redirect to="/grid-settings" />} />
                    <Route path="/grid-settings" component={GridSettings} />
                    <Route path="/api-settings" component={ApiSettings} />
                    <Route path="/analytics" component={Analytics} />
                    <Route path="/ai-optimization" component={AiOptimization} />
                  </Switch>
                </Content>
              </Layout>
            </Layout>
          </Router>
        </SystemProvider>
      </ApiProvider>
    </ConfigProvider>
  );
};

export default App; 