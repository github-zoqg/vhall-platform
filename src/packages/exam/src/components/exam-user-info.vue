<template>
  <div class="exam-user-info">
    <div ref="ExamUserInfo"></div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
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
        const { watchInitData } = useRoomBaseServer().state;
        const el = this.$refs.ExamUserInfo;
        this.examServer.mount({
          componentName: 'userInfoEdit',
          el,
          configs: {
            role: 1,
            source_id: watchInitData?.webinar?.id,
            source_type: 1,
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
