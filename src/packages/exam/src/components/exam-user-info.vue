<template>
  <div class="exam-user-info">
    <div ref="ExamUserInfo"></div>
  </div>
</template>
<script>
  import { useExamServer } from 'middle-domain';
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
        this.examServer.mount({
          componentName: 'userInfoEdit',
          id: '12371937',
          el,
          configs: {
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
