<template>
  <div class="openlink-wrap">
    <vmp-sign-up-form v-if="formOpenLinkStatus == 1 && !isShowError"></vmp-sign-up-form>
    <div v-if="formOpenLinkStatus == 2 && !isShowError" class="no-open">
      <errorPage prop-type="stop_serve"></errorPage>
    </div>
    <div v-if="isShowError" class="no-open">
      <errorPage prop-type="stop_serve">
        <slot slot-name="body">
          <p>
            {{ isShowError }}
          </p>
        </slot>
      </errorPage>
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
        // 依据界面路由，确认当前报名表单接口调用类型：subject-专题相应；webinar-活动相应
        interfaceType:
          window.location.href.indexOf('/subject/entryform') != -1 ? 'subject' : 'webinar',
        webinarOrSubjectId: this.$route.params.id,
        formOpenLinkStatus: 0,
        isShowError: '' // 是否展示后端错误码内容
      };
    },
    beforeCreate() {
      this.entryformServer = useEntryformServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      if (this.interfaceType === 'webinar') {
        this.initWebinarInfo();
      } else {
        this.initSubjectInfo();
      }
    },
    methods: {
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
            visit_id: this.roomBaseServer.state.watchInitData.visitor_id
          })
          .then(res => {
            // 如果当前 visitor_id 已经报名，跳转到专题页
            if (res.data.has_registed)
              return (window.location.href = `//${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/special/detail/${this.webinarOrSubjectId}`);
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
      // 报名表单独立链接是否有效
      getFormOpenLinkStatus() {
        this.entryformServer
          .verifyOpenLink({
            webinar_id: this.webinarOrSubjectId,
            visit_id: this.roomBaseServer.state.watchInitData.visitor_id
          })
          .then(res => {
            if (res.code !== 200) {
              // 错误异常，显示后端返回码
              this.isShowError =
                res.code === 512821 ? this.$tec(res.code) : this.$t('message.message_1026');
            } else {
              this.isShowError = '';
              // 如果当前 visitor_id 已经报名，跳转到直播间
              if (res.data.has_registed) return this.getWebinarStatus();
              // 如果独立链接无效，显示无效页
              if (res.data.available == 0) return (this.formOpenLinkStatus = 2);
              // 显示报名表单
              this.formOpenLinkStatus = 1;
            }
          })
          .catch(res => {
            // 错误异常，显示后端返回码
            this.isShowError =
              res.code === 512821 ? this.$tec(res.code) : this.$t('message.message_1026');
          });
      },
      // 获取当前活动状态，如果直播中，跳转到直播间
      getWebinarStatus() {
        this.entryformServer
          .watchInit({
            webinar_id: this.webinarOrSubjectId
          })
          .then(res => {
            if (res.data.status == 'live') {
              window.location.href = `//${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.webinarOrSubjectId}`;
            } else if (res.data.status == 'subscribe') {
              // 如果预约或结束，跳转到预约页
              window.location.href = `//${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/subscribe/${this.webinarOrSubjectId}`;
            }
          })
          .catch(e => {
            //512502 不支持的活动类型(flash)、512503	不支持的活动类型(旧h5)
            if (e.code == 512503 || e.code == 512502) {
              window.location.href = `${window.location.origin}/${this.webinarOrSubjectId}`;
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
