<template>
  <!-- pc专题详情页 -->
  <div
    class="vmp-watch-subject"
    v-loading="state === 0"
    element-loading-text="加载中"
    element-loading-background="rgba(255, 255, 255, 0.1)"
  >
    <template v-if="state == 1">
      <vmp-air-container cuid="layerSubjectRoot"></vmp-air-container>
    </template>
    <template v-if="state == 2">
      <div class="vmp-watch-subject_error">
        <img src="./images/subject_null.png" alt="" />
        <p>此专题已下线</p>
      </div>
    </template>
  </div>
</template>
<script>
  import { setRequestHeaders, useSubjectServer } from 'middle-domain';
  export default {
    name: 'SubjectWatch',
    data() {
      return {
        state: 0
      };
    },
    async created() {
      if (localStorage.getItem('token')) {
        setRequestHeaders({
          token: localStorage.getItem('token') || undefined
        });
      }
      await this.initSubjectInfo();
    },
    mounted() {
      this.$i18n.locale = 'zh-CN';
    },
    methods: {
      async initSubjectInfo() {
        const subjectServer = useSubjectServer();
        try {
          const res = await subjectServer.getSubjectInfo({
            subject_id: this.$route.query.id
          });
          if (res.code !== 200) {
            this.state = 2;
            return;
          }
          this.state = 1;
        } catch (err) {
          this.state = 2;
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-watch-subject {
    width: 100%;
    height: 100%;
    background: #f7f7f7;
    &_error {
      width: 202px;
      height: 90px;
      margin: 0 auto;
      text-align: center;
      padding-top: 162px;
      img {
        width: 100%;
      }
      p {
        text-align: center;
        font-size: 16px;
        color: #1a1a1a;
        line-height: 22px;
        padding-top: 12px;
        padding-left: 20px;
      }
    }
  }
</style>
