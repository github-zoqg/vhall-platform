export default {
  props: {
    cuid: String
  },
  computed: {
    widget() {
      return this.cuid && window.$serverConfig && window.$serverConfig[this.cuid];
    }
  },
  created() {
    //  注册服务到服务池
    if (this.cuid && this.componentType !== 'CONTAINER' && window.$middleEventSdk) {
      window.$middleEventSdk.serverPool.set(this.cuid, this);
    }
  }
};
