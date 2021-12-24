export default {
  props: {
    cuid: String
  },
  computed: {
    widget() {
      return this.cuid && this.$serverConfig && this.$serverConfig[this.cuid];
    }
  },
  created() {
    //  注册服务到服务池
    if (this.cuid && this.$serverPool) {
      this.$serverPool.set(this.cuid, this);
    }
  }
};
