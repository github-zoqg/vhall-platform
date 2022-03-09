const confirm = {
  showCb: null,
  actionCb: null,

  destory() {
    this.showCb = null;
    this.actionCb = null;
  },

  onShow(cb) {
    this.showCb = cb;
  },

  show(...rest) {
    if (this.showCb === null) return;

    this.showCb(...rest);

    // 等待动作dispatch回调
    return new Promise(resolve => {
      this.actionCb = action => resolve(action);
    });
  },

  dispatchAction(action) {
    if (this.showCb === null) return;

    this.actionCb(action);
  }
};

export default confirm;
