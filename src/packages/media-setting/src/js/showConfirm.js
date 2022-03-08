const confirm = {
  showCb: null,
  confirmCb: null,

  destory() {
    this.showCb = null;
    this.confirmCb = null;
  },

  onShow(cb) {
    this.showCb = cb;
  },

  show(...rest) {
    if (this.showCb === null) return;

    this.showCb(...rest);

    // 等待动作dispatch回调
    return new Promise(resolve => {
      this.confirmCb = action => resolve(action);
    });
  },

  dispatchAction(action) {
    if (this.showCb === null) return;

    this.confirmCb(action);
  }
};

export default confirm;
