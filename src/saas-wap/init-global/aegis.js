// 真对生产环境开启性能监控
if (process.env.NODE_ENV == 'production') {
  window.saas_aegis = new Aegis({
    id: 'kw0QbfKrJLLbyL9Yj0', // 上报 id
    reportAssetSpeed: true // 静态资源测速
  });
}
