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
  import skins from '@/app-shared/skins/watch';
  export default {
    name: 'Entryform',
    components: {
      errorPage
    },
    data() {
      return {
        // 依据界面路由，确认当前报名表单接口调用类型：subject-专题相应；webinar-活动相应
        interfaceType:
          window.location.href.indexOf('/special/entryform') != -1 ? 'subject' : 'webinar',
        webinarOrSubjectId: this.$route.params.id,
        formOpenLinkStatus: 0
      };
    },
    beforeCreate() {
      this.entryformServer = useEntryformServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      this.interfaceType === 'webinar' ? this.initWebinarInfo() : this.initSubjectInfo();
      this.setPageConfig();
    },
    methods: {
      setPageConfig() {
        window.skins = skins;
        skins.setTheme(skins.themes.theme_default_black);
      },
      async initWebinarInfo() {
        // await this.getGrayConfig();
        this.getFormOpenLinkStatus();
        //多语言接口
        await this.roomBaseServer.getLangList(this.webinarOrSubjectId);
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
      initSubjectInfo() {
        this.entryformServer
          .verifyOpenLink({
            subject_id: this.webinarOrSubjectId,
            visit_id:
              this.roomBaseServer.state.watchInitData.visitor_id ||
              localStorage.getItem('visitorId')
          })
          .then(res => {
            // 如果当前 visitor_id 已经报名，跳转到专题页
            if (res.data.has_registed)
              return (window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/special/detail?id=${this.webinarOrSubjectId}`);
            // 如果独立链接无效，显示无效页
            if (res.data.available == 0) return (this.formOpenLinkStatus = 2);
            // 显示报名表单
            this.formOpenLinkStatus = 1;
          });
      },
      // getGrayConfig() {
      //   return this.roomBaseServer
      //     .webinarInitBefore({
      //       webinarOrSubjectId: this.webinarOrSubjectId
      //     })
      //     .then(res => {
      //       if (res.code == 200 && res.data) {
      //         sessionStorage.setItem(`V3_WAP_US_${this.webinarOrSubjectId}`, res.data.user_id);
      //       } else {
      //         console.log(`灰度ID-获取活动by用户信息失败~${res.msg}`);
      //       }
      //     })
      //     .catch(e => {
      //       console.log(`灰度ID-获取活动by用户信息失败~${e}`);
      //     });
      // },
      // 报名表单独立链接是否有效（活动下）
      getFormOpenLinkStatus() {
        this.entryformServer
          .verifyOpenLink({
            webinar_id: this.webinarOrSubjectId,
            visit_id:
              this.roomBaseServer.state.watchInitData.visitor_id ||
              localStorage.getItem('visitorId')
          })
          .then(res => {
            if (res.code == 200) {
              // 如果当前 visitor_id 已经报名，跳转到直播间
              if (res.data.has_registed) return this.getWebinarStatus();
              // 如果独立链接无效，显示无效页
              if (res.data.available == 0) return (this.formOpenLinkStatus = 2);
              // 显示报名表单
              this.formOpenLinkStatus = 1;
            } else {
              // 错误异常
              this.formOpenLinkStatus = 2;
            }
          })
          .catch(res => {
            // 错误异常
            this.formOpenLinkStatus = 2;
          });
      },
      // 获取当前活动状态，如果直播中，跳转到直播间
      getWebinarStatus() {
        // 当前是正常活动点开
        this.roomBaseServer
          .getWebinarInfo({
            webinar_id: this.webinarOrSubjectId,
            is_no_check: 1
          })
          .then(res => {
            // /v3/webinars/webinar/info 接口判断 res.data.webinar_state:  2 预告 1 直播 3 结束 5 回放 4 点播
            // webinar_type: 1.音频 2 视频 3 互动  5 定时直播
            if (res.code == 512503 || res.code == 512502) {
              // 跳转老活动
              let origin =
                process.env.NODE_ENV === 'production'
                  ? window.location.origin
                  : 'https://t-webinar.e.vhall.com';
              window.location.href = `${origin}/${this.webinarOrSubjectId}`;
              return false;
            }
            // 如果是独立链接，判断状态进行跳转
            this.gotoWebinarPage(res);
          });
      },
      // 跳转活动页
      gotoWebinarPage(res) {
        const queryString = this.$route.query.refer ? `?refer=${this.$route.query.refer}` : '';
        if (res.data.status == 'live') {
          window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.webinarOrSubjectId}${queryString}`;
        } else {
          // 如果预约或结束，跳转到预约页
          window.location.href = `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/subscribe/${this.webinarOrSubjectId}${queryString}`;
        }
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
