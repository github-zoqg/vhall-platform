const move = {
  methods: {
    touchstart(e) {
      if (this.mini) {
        this.videoDom = document.getElementsByClassName('wap-player-mini');
        const style = window.getComputedStyle(this.videoDom);
        this.DOMS = style;
        this.touchOffsetX = e.touches[0].pageX - parseFloat(style.left);
        this.touchOffsetY = e.touches[0].pageY - parseFloat(style.top);
      }
    },
    touchmove(e) {
      this.leftX = e.touches[0].pageX - this.touchOffsetX;
      this.topY = e.touches[0].pageY - this.touchOffsetY;
      if (this.leftX < 0) {
        this.leftX = 0;
      } else if (this.leftX > document.body.clientWidth - parseFloat(this.DOMS.width)) {
        this.leftX = document.body.clientWidth - parseFloat(this.DOMS.width);
      }
      if (this.topY < 0) {
        this.topY = 0;
      } else if (this.topY > document.body.clientHeight - parseFloat(this.DOMS.height)) {
        this.topY = document.body.clientHeight - parseFloat(this.DOMS.height);
      }
      this.videoDom.style.left = `${this.leftX}px`;
      this.videoDom.style.top = `${this.topY}px`;
    }
  }
};
export default move;
