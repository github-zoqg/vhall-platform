class EventQueue {
  constructor() {
    //事件队列
    this.queue = [];
    //通知回调函数
    this.messageCallback = null;
  }

  /**
   * 发送一个事件
   * @param {*} message
   */
  send(message = {}) {
    // 需要发送远端，目前只发送本地
    this.add(message);
  }

  /**
   * 添加一个任务到队列里
   * */
  add(message = {}) {
    const { method = '', cuid = null } = message;

    if (method && cuid) {
      this.queue.push(message);
      this.queue.length === 1 && this.next();
    }
  }

  /**
   * 注册通知回调函数
   * */
  registerMessageCallback(func) {
    if (func && typeof func === 'function') {
      this.messageCallback = func;
    }
  }

  /**
   * 开始执行队首的任务
   * */
  start() {
    let task = this.queue.length ? this.queue.shift() : null;

    ![null, '', void 0].includes(task) && this.messageCallback(task);
  }

  /**
   * 执行下一个任务
   * */
  next() {
    return this.start();
  }
}

const eventQueue = new EventQueue();
export default eventQueue;
