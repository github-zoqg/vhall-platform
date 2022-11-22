<template>
  <div class="exam-user-info">
    <div ref="ExamUserInfo"></div>
  </div>
</template>
<script>
  export default {
    name: 'ExamUserInfo',
    inject: ['examServer'],
    data() {
      return {};
    },
    mounted() {
      this.initEvent();
    },
    beforeDestroy() {
      this.removeEvent();
    },
    methods: {
      initEvent() {
        this.examServer.$on('initiated', this.initComp);
      },
      removeEvent() {
        this.examServer.$off('initiated', this.initComp);
      },
      initComp() {
        console.log('🚀 ~ file: exam-user-info.vue ~ line 18 ~ initComp ~ initComp');
        const el = this.$refs.ExamUserInfo;
        this.examServer.mount({
          type: 'userInfoEdit',
          id: '12371937',
          el,
          props: {
            id: '12371937',
            client: 'live'
          }
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .exam-user-info {
    height: 380px;
    overflow: auto;
  }
</style>
