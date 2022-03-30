/**
 * confirm弹窗的单例代理
 * @notes 引用该单例实例，可以在子、孙组件使用confirm.show来唤醒外层弹窗。同时弹窗的确定、取消按钮是promise等待的，这意味着你可以const action = await confirm.show()
 * @example 如下
 * const action = await mediaSettingConfirm.show(text)
 * if(action==='confirm')console.log('success')
 */
const confirm = {
  showCb: null, // 展示回调
  actionCb: null, // 动作回调

  destroy() {
    this.showCb = null;
    this.actionCb = null;
  },

  /**
   * 注册唤醒时对应的视图操作
   * @param {Function} cb
   */
  onShow(cb) {
    this.showCb = cb;
  },

  /**
   * 唤醒弹窗
   * @param  {...any} rest
   * @returns
   */
  show(...rest) {
    if (this.showCb === null) return;

    this.showCb(...rest);

    // 等待动作dispatch回调
    return new Promise(resolve => {
      this.actionCb = action => resolve(action);
    });
  },

  /**
   * 派发动作
   * @notes 当点击确定或取消时派发一个动作，传输给show对应的promise回调,比如说你当你在点击确定是dispatchAction('confirm')，则show的then会接收到'confirm'
   * @param {String} action
   */
  dispatchAction(action) {
    if (this.showCb === null) return;

    this.actionCb(action);
  }
};

export default confirm;
