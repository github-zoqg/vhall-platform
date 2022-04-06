<template>
  <div class="openlink-wrap">
    <vmp-sign-up-form v-if="formOpenLinkStatus == 1"></vmp-sign-up-form>
    <div v-if="formOpenLinkStatus == 2" class="no-open">
      <errorPage prop-type="stop_serve"></errorPage>
    </div>
  </div>
</template>

<script>
  import { useEntryformServer, useRoomBaseServer } from 'middle-domain';
  import errorPage from '../ErrorPage/index.vue';
  export default {
    name: 'Entryform',
    components: {
      errorPage
    },
    data() {
      return {
        webinar_id: this.$route.params.id,
        formOpenLinkStatus: 0
      };
    },
    beforeCreate() {
      this.entryformServer = useEntryformServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      await this.getGrayConfig();
      this.getFormOpenLinkStatus();
      //多语言接口
      await this.roomBaseServer.getLangList(this.webinar_id);
      const roomBaseState = this.roomBaseServer.state;
      document.title = roomBaseState.languages.curLang.subject;
      let lang = roomBaseState.languages.lang;
      this.$i18n.locale = lang.type;
      // if (localStorage.getItem('lang')) {
      //   this.$i18n.locale = parseInt(localStorage.getItem('lang')) == 1 ? 'zh' : 'en';
      // } else {
      //   this.$i18n.locale = 'zh';
      // }
    },
    methods: {
      // getGrayConfig() {
      //   return this.roomBaseServer
      //     .webinarInitBefore({
      //       webinar_id: this.webinar_id
      //     })
      //     .then(res => {
      //       if (res.code == 200 && res.data) {
      //         sessionStorage.setItem(`V3_WAP_US_${this.webinar_id}`, res.data.user_id);
      //       } else {
      //         console.log(`灰度ID-获取活动by用户信息失败~${res.msg}`);
      //       }
      //     })
      //     .catch(e => {
      //       console.log(`灰度ID-获取活动by用户信息失败~${e}`);
      //     });
      // },
      // 报名表单独立链接是否有效
      getFormOpenLinkStatus() {
        this.entryformServer
          .verifyOpenLink({
            webinar_id: this.webinar_id,
            visit_id: this.roomBaseServer.state.watchInitData.visitor_id
          })
          .then(res => {
            // 如果当前 visitor_id 已经报名，跳转到直播间
            if (res.data.has_registed) return this.getWebinarStatus();
            // 如果独立链接无效，显示无效页
            if (res.data.available == 0) return (this.formOpenLinkStatus = 2);
            // 显示报名表单
            this.formOpenLinkStatus = 1;
          });
      },
      // 获取当前活动状态，如果直播中，跳转到直播间
      getWebinarStatus() {
        this.entryformServer
          .watchInit({
            webinar_id: this.webinar_id
          })
          .then(res => {
            if (res.data.status == 'live') {
              this.$router.push({
                path: `/lives/watch/${this.webinar_id}`
              });
            } else if (res.data.status == 'subscribe') {
              // 如果预约或结束，跳转到预约页
              this.$router.push({
                path: `/lives/subscribe/${this.webinar_id}`
              });
            }
          })
          .catch(e => {
            if (e.code == 512503 || e.code == 512502) {
              window.location.href = `${window.location.origin}/${this.webinar_id}`;
            }
          });
      }
    }
  };
</script>

<style lang="less" scoped>
  .openlink-wrap {
    width: 100%;
    height: 100%;
  }
  .no-open {
    width: 100%;
    height: 100%;
    // background: url(../../assets/images/webinar.png) no-repeat center;
    background-size: cover;
    display: flex;
    align-items: center;
    justify-content: center;
    p {
      color: #fff;
      font: 18px/2 'Microsoft Yahei';
      text-align: center;
    }
  }
</style>
