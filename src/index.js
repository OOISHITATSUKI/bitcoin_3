import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';  // antdのスタイルをインポート
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ポリフィルの初期化
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || require('buffer').Buffer;
  window.process = window.process || require('process/browser');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(); 