export default {
  created() {
    this.initExamServerEvent()
  },
  beforeDestroy() {
    this.removeExamServerEvent()
  },
  methods: {
    initExamServerEvent() {
      this.examServer.$on('initiated', this.initComp)
    },
    removeExamServerEvent() {
      this.examServer.$off('initiated', this.initComp)
    }
  }
};
