const _ = require('lodash');
const baseConfig = require('./webpack.base.config');

// 插件配置
function getPlugins() {
  const plugins = [];
  // 构建文件目录
  // plugins.push();
  return plugins;
}

module.exports = _.merge(
  {
    configureWebpack: {
      // 插件
      plugins: getPlugins()
    }
  },
  baseConfig
);
