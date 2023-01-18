import { createProxyMiddleware } from 'http-proxy-middleware';

const { apiKey, endpoint } = Meteor.settings?.franceTransfert || {};

export const ftUploadProxy = createProxyMiddleware({
  target: `${endpoint}`,
  pathRewrite: { '^/api/francetransfert/upload': '^/api-public/chargementPli' },
  changeOrigin: true,
  logLevel: 'debug',
  // onProxyReq: (proxyReq, req, res) => {
  onProxyReq: (proxyReq) => {
    // console.log(req);
    // console.log(Meteor.userId());
    proxyReq.setHeader('cleAPI', apiKey);
  },
  onProxyRes(proxyRes) {
    console.info(proxyRes.headers['content-type']);
  },
});
