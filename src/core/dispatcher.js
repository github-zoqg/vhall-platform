import { runInContext } from 'lodash';
import eventQueue from './eventQueue.js';
import serverPool from './serverPool.js';

/**
 *
 */
class Dispatcher {
  constructor() {
    eventQueue.registerMessageCallback(msg => this.onReceiveMsg(msg));
  }

  /**
   * 检查信令所指代的
   * @param {*} server
   * @param {*} methodName
   * @returns
   */
  checkActionAvailable(server, methodName) {
    let result = {
      available: true,
      reason: '',
      msg: ''
    };

    // check instance
    if (!server) {
      result.available = false;
      result.msg = '目标组件不存在';
      return result;
    }

    if (methodName.startsWith('emit')) {
      return result;
    }

    // check expose
    if (!server[methodName]) {
      result.available = false;
      result.msg = '目标组件未找到事件';
      return result;
    }

    // check function type
    if (typeof server[methodName] !== 'function') {
      result.available = false;
      result.msg = '该事件不是可执行的方法';
    }

    return result;
  }

  /**
   * 接受信令消息后，解析信令并执行后续操作
   * @param {Object} msg
   * @note 接受事件后，解析信令，从服务池中找到对应服务，执行信令操作
   * @returns
   */
  async onReceiveMsg(msg = {}) {
    this.run(msg);
  }

  translateMsg(msg) {
    const { cuid = null, method = '', args = [] } = msg;
    if (!cuid || !method) return;
    if (!serverPool.has(cuid)) return;
    const server = serverPool.get(cuid);

    return { cuid, server, method, args };
  }

  run(msg) {
    const { cuid, server, method, args } = this.translateMsg(msg);
    console.log(`[%c 💬 Action]`, 'color:#1989fa', msg);
    const result = this.checkActionAvailable(server, method);
    if (!result.available) {
      console.log(result.msg);
    } else if (method.startsWith('emit')) {
      const methodList = window.$serverConfig[cuid][method];
      methodList.forEach(item => this.run({ ...item, ...args, from: method }));
    } else {
      server[method](...args);
    }

    eventQueue.next();
  }
}

const dispatcher = new Dispatcher();
export default dispatcher;
