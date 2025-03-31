const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/binance',
    createProxyMiddleware({
      target: 'https://api.binance.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/binance': '/api/v3' // パスの書き換え
      },
      onProxyReq: (proxyReq, req, res) => {
        // リクエストのログ
        console.log('Proxying to Binance:', req.method, req.path);
      }
    })
  );
  
  app.use(
    '/ws/binance',
    createProxyMiddleware({
      target: 'wss://stream.binance.com:9443',
      changeOrigin: true,
      ws: true,
      pathRewrite: {
        '^/ws/binance': '/ws'
      }
    })
  );
}; 