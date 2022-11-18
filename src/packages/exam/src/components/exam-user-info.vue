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
      this.initComp();
    },
    methods: {
      initComp() {
        const el = this.$refs.ExamUserInfo;
        this.examServer.formServer.mount({
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
