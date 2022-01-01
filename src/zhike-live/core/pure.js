import pureServer from '../pure-server/index';

// 注册纯服务
export function initPureServer() {
  for (const [key, value] of Object.entries(pureServer)) {
    const newKey = `ps.${key}`;
    window.$serverConfig[newKey] = value;
    window.$middleEventSdk.serverPool.set(newKey, value);
  }
}
