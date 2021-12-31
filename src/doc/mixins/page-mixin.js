export default {
  data() {
    return {
      curComponent: 'VmpChat'
    };
  },
  beforeRouteLeave(to, from, next) {
    this.curComponent = to.meta.componentName;
    next();
  },
  created() {
    this.curComponent = this.$route.meta.componentName;
  }
};
