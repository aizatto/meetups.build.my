const express = require('express');
const httpProxyMiddleware = require('http-proxy-middleware');

const PORT = 3000;

const app = express();

// backend
app.use(
  '/graphql',
  httpProxyMiddleware({
    target: 'http://localhost:3001',
  }),
);

// frontend
app.use(
  ['/'],
  httpProxyMiddleware({
    target: 'http://localhost:3002',
    ws: true,
  }),
);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Env: ${process.env.NODE_ENV}`);
  // eslint-disable-next-line no-console
  console.log(`Open in your browser http://localhost:${PORT}`);
});
