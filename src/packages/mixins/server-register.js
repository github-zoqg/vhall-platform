export default {
  props: {
    cuid: String
  },
  created() {
    //  注册服务到服务池
    if (this.cuid && this.$serverPool) {
      this.$serverPool.set(this.cuid, this);
    }
  }
};
