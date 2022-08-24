export default class TaskQueue {
  constructor(params = { minTaskTime: 0, maxQueueLen: 5 }) {
    // 一次任务执行的最小总时间(毫秒)0则为不限制
    this.minTaskTime = params.minTaskTime || 0;
    // 队列最大数量(如果全是自己发起的礼物/打赏,则不受限)
    this.maxQueueLen = params.maxQueueLen || 5;
    this.queue = [];
    this.executing = false; // 当前s是否在执行状态中(两个动画执行事件需要有间隙)
    this.running = 0; //当前消费的队列长度
  }

  intervalTimer() {
    if (this.minTaskTime > 0) {
      return new Promise(resolve => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          resolve();
          console.log('intervalTimer--------->');
        }, this.minTaskTime);
      });
    } else {
      return Promise.resolve(true);
    }
  }

  /* 添加任务(是否进入队列逻辑在此,优先级为自己发起 > 总金额大小 > 发起时间) */
  async addTask(task) {
    if (!task || typeof task.playRewardEffect !== 'function') {
      console.warn('全屏特效传参错误,必须有 playRewardEffect 函数');
      return;
    }

    // 1.获取非自己发起的礼物列队位置
    const notSelfItemIdx = this.queue.findIndex(item => {
      return !item.isSelf;
    });
    // 2.如果是自己发起的
    if (task.isSelf) {
      // 所有自己的发起的效果在前,依时间顺序(此时不管金额大小)
      if (notSelfItemIdx > -1) {
        this.queue.splice(notSelfItemIdx, 0, task);
      } else {
        this.queue.push(task);
      }
    } else {
      // 3.非自己发起的按照金额大小排列
      const queue4others = this.queue.slice(notSelfItemIdx, this.queue.length - notSelfItemIdx);
      const targetIdx = queue4others.findIndex(item => {
        return parseFloat(task.gift_price) > parseFloat(item.gift_price);
      });
      if (targetIdx > -1) {
        this.queue.splice(notSelfItemIdx + targetIdx, 0, task);
      } else {
        this.queue.push(task);
      }
    }
    // 4.超过列队数量则弹出队尾
    if (this.queue.length >= this.maxQueueLen && !this.queue[this.queue.length - 1].isSelf) {
      // if (this.queue.length >= this.maxQueueLen) {
      this.queue.pop();
    }

    // 5.执行队列
    if (this.queue.length == 1 && this.running < this.maxQueueLen) {
      this.execute();
    }
  }

  /* 执行(循环) */
  async execute() {
    if (this.queue.length == 0 || this.running >= this.maxQueueLen) {
      return;
    }
    const queueTaskItem = this.queue.shift();
    console.log('this.queue.queueTaskItem-------->', queueTaskItem);
    if (queueTaskItem) {
      this.running++;
      await queueTaskItem.playRewardEffect();
      await this.sleep(this.minTaskTime * this.running);
      await queueTaskItem.removeRewardEffect();
      this.running--;
      this.execute();
    }
  }

  /**
   *
   * @param {*} ms
   * @returns
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* 清空列队 */
  clear() {
    this.queue = [];
  }
}
