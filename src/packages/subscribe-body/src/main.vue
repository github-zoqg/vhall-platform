<template>
  <div class="vmp-subscribe-body">
    <div :class="isEmbed ? 'vmp-subscribe-body-embed' : 'vmp-subscribe-body-intro'">
      <div class="subscribe-img">
        <div class="subscribe-img-box" v-if="!showVideo">
          <!-- 背景图片 未完成验证-->
          <img :src="webinarsBgImg" />
        </div>
        <div class="subscribe-img-box" v-else>
          <!-- 完成验证、并且有暖场视频 加载播放器 -->
          <vmp-air-container cuid="comPcPlayer" :oneself="true"></vmp-air-container>
        </div>
      </div>
      <div class="subscribe-language" v-if="isEmbed && languageList.length > 1 && showBottom">
        <el-dropdown @command="changeLang" trigger="click" placement="bottom">
          <span class="language__icon">
            <i class="vh-saas-iconfont vh-saas-line-multilingual"></i>
            {{ lang.label }}
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              :command="item.key"
              :key="index"
              :class="{ active: item.key == lang.key }"
              v-for="(item, index) in languageList"
            >
              {{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <div class="subscribe-img-box-embed" v-if="isEmbed && showBottom">
        <EmbedTime
          ref="embedTime"
          :sub-option="subOption"
          @authFetch="handleAuthCheck"
          @agreement="popupAgreement"
        ></EmbedTime>
      </div>
      <!--活动时间信息-->
      <div class="subscribe-img-bottom" v-if="!isEmbed">
        <bottom-tab
          v-if="showBottom"
          ref="bottomTab"
          :sub-option="subOption"
          @payMore="feeAuth"
          @authFetch="handleAuthCheck"
          @agreement="popupAgreement"
        ></bottom-tab>
      </div>
    </div>
    <div class="vmp-subscribe-body-tab" v-if="!isEmbed">
      <vmp-air-container cuid="comSubscribeTabMenu" :oneself="true"></vmp-air-container>
    </div>
    <div class="vmp-subscribe-body-live" v-if="isLiving">
      <div class="vmp-subscribe-body-live-start">
        <div class="subscribe-cover"></div>
        <span>{{ $t('player.player_1018') }}</span>
        <button class="subscribe-start" @click="livingLink">{{ $t('player.player_1013') }}</button>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useSubscribeServer, usePlayerServer } from 'middle-domain';
  import BottomTab from './components/bottomTab';
  import EmbedTime from './components/embedTime.vue';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpSubscribeBody',
    data() {
      return {
        showBottom: true,
        showVideo: false, // 显示暖场视频
        isLiving: false,
        wxQr: '',
        zfQr: '',
        lang: {},
        languageList: [],
        subOption: {
          startTime: '',
          type: 0,
          verify: 0,
          fee: 0,
          verified: 0,
          is_subscribe: 0,
          actual_start_time: '',
          show: 1,
          num: 0,
          needAgreement: false
        }
      };
    },
    components: {
      BottomTab,
      EmbedTime
    },
    computed: {
      // 背景图片
      webinarsBgImg() {
        const cover = '//cnstatic01.e.vhall.com/static/images/mobile/video_default_nologo.png';
        const { webinar } = this.roomBaseServer.state.watchInitData;
        return webinar.img_url || cover;
      },
      isWarmVideo() {
        return this.roomBaseServer.state.watchInitData.warmup.warmup_paas_record_id;
      },
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      },
      webinarId() {
        return this.roomBaseServer.state.watchInitData.webinar.id;
      },
      isEmbed() {
        // 是不是嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.subscribeServer = useSubscribeServer();
      this.playerServer = usePlayerServer();
    },
    created() {
      this.handlerInitInfo();
      if (this.isEmbed) {
        this.languageList = this.roomBaseServer.state.languages.langList;
        this.lang = this.roomBaseServer.state.languages.lang;
      }
    },
    mounted() {
      this.listenEvents();
    },
    methods: {
      listenEvents() {
        this.subscribeServer.$on('live_start', () => {
          this.subOption.type = 1;
          this.isLiving = true;
          this.$refs.bottomTab && this.$refs.bottomTab.changeTime();
        });

        this.subscribeServer.$on('pay_success', data => {
          if (data.target_id == this.userInfo.user_id) {
            this.$message({
              message: this.$t('common.common_1005'),
              showClose: true,
              type: 'success',
              customClass: 'zdy-info-box'
            });
            this.feeAuth({ type: 3 });
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickPay', { flag: false })
            );
          }
        });

        this.subscribeServer.$on('live_over', data => {
          this.subOption.type = 3;
          console.log(data);
        });
        this.playerServer.$on(VhallPlayer.PLAY, () => {
          this.showBottom = false;
        });
        this.playerServer.$on(VhallPlayer.ENDED, () => {
          this.showBottom = true;
        });
      },
      handlerInitInfo() {
        const { webinar, subscribe, join_info, warmup, agreement } =
          this.roomBaseServer.state.watchInitData;
        this.subOption.type = webinar.type;
        this.subOption.startTime = webinar.start_time;
        this.subOption.verify = webinar.verify;
        this.subOption.fee = webinar.fee || 0;
        this.subOption.verified = join_info.verified;
        this.subOption.is_subscribe = join_info.is_subscribe;
        this.subOption.actual_start_time = webinar.actual_start_time;
        this.subOption.show = subscribe.show;
        this.subOption.num = subscribe.num;
        // 自定义placeholder&&预约按钮是否展示
        this.subOption.verify_tip = webinar.verify_tip;
        this.subOption.hide_subscribe = webinar.hide_subscribe;
        if (agreement && agreement.is_open === 1 && agreement.is_agree !== 1) {
          // 当开启观看协议且没有通过时,需要显示观看验证(观看协议)
          this.subOption.needAgreement = true;
        }
        if (this.isEmbed) {
          // 嵌入的暖场视频只有免费的时候显示
          if (webinar.verify == 0 && warmup.warmup_paas_record_id && webinar.type == 2) {
            this.showVideo = true;
          }
        } else {
          if (join_info.is_subscribe == 1 && warmup.warmup_paas_record_id && webinar.type == 2) {
            this.showVideo = true;
          }
        }
      },
      feeAuth(params) {
        let data = {
          webinar_id: this.webinarId,
          refer: this.$route.query.refer,
          record_id: this.$route.query.record_id,
          visitor_id: this.roomBaseServer.state.watchInitData.visitor_id,
          ...this.$route.query,
          ...params
        };
        this.subscribeServer.watchAuth(data).then(res => {
          if (res.code === 200) {
            if (res.data.status == 'live') {
              let pageUrl = '';
              if (location.pathname.indexOf('embedclient') != -1) {
                pageUrl = '/embedclient';
              }
              window.location.href =
                window.location.origin +
                process.env.VUE_APP_ROUTER_BASE_URL +
                `/lives${pageUrl}/watch/${this.webinarId}${window.location.search}`;
            } else {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else {
            this.handleAuthErrorCode(res.code, res.msg);
          }
        });
      },
      handleAuthErrorCode(code, msg) {
        let placeHolder = '';
        switch (code) {
          case 510008: // 未登录
            window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
            break;
          case 512525: // 填写表单emitClickOpenSignUpForm
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickOpenSignUpForm')
            );
            break;
          case 512002:
          case 512522:
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            break;
          case 512531:
            // 邀请码
            placeHolder = this.subOption.verify_tip || this.$t('appointment.appointment_1024');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolder)
            );
            break;
          case 512528:
            // 密码
            placeHolder = this.subOption.verify_tip || this.$t('appointment.appointment_1022');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolder)
            );
            break;
          case 512532:
            //白名单
            placeHolder = this.subOption.verify_tip || this.$t('common.common_1006');
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickAuth', placeHolder)
            );
            break;
          case 512523:
            // 付费
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClickPay', { flag: true })
            );
            break;
          default:
            this.$message({
              message: this.$tec(code) || msg,
              showClose: true,
              // duration: 0,
              type: 'warning',
              customClass: 'zdy-info-box'
            });
            break;
        }
      },
      handleAuthCheck() {
        let type = this.subOption.verify == 6 ? 4 : this.subOption.verify;
        this.feeAuth({ type: type });
      },
      handlePlay() {},
      // 切换多语言
      changeLang(key) {
        localStorage.setItem('lang', key);
        const params = this.$route.query;
        // 如果地址栏中有语言类型，当切换语言时，对应的地址栏参数要改变
        if (params.lang) {
          params.lang = key;
          let sourceUrl =
            window.location.origin + process.env.VUE_APP_ROUTER_BASE_URL + this.$route.path;
          let queryKeys = '';
          for (const k in params) {
            queryKeys += k + '=' + params[k] + '&';
          }
          queryKeys = queryKeys.substring(0, queryKeys.length - 1);
          sourceUrl = sourceUrl + '?' + queryKeys;
          window.location.href = sourceUrl;
        } else {
          window.location.reload();
        }
      },
      livingLink() {
        this.handleAuthCheck();
      },
      popupAgreement() {
        this.roomBaseServer.$emit('POPUP_AGREEMENT');
      },
      handleAgreeWitthTerms() {
        this.subOption.needAgreement = false;
        this.handleAuthCheck();
      }
    }
  };
</script>
<style lang="less">
  .vmp-subscribe-body {
    height: 100%;
    width: 100%;
    &-intro {
      position: relative;
      .subscribe-img {
        padding-top: 56.25%;
        &-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          border-radius: 4px 4px 0 0;
        }
      }
      .subscribe-language {
        position: absolute;
        top: 20px;
        right: 30px;
        z-index: 13;
        cursor: pointer;
        .language__icon {
          color: #fff;
          &:hover {
            color: #fb3a32;
          }
        }
      }
    }
    &-embed {
      width: 100%;
      height: 100%;
      position: relative;
      .subscribe-img {
        padding-top: 56.25%;
        &-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 4px;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: fill;
          border-radius: 4px 4px 0 0;
        }
      }
      .subscribe-language {
        position: absolute;
        top: 20px;
        right: 30px;
        z-index: 13;
        cursor: pointer;
        .language__icon {
          color: #fff;
          &:hover {
            color: #fb3a32;
          }
        }
      }
    }
    &-live {
      width: 100%;
      height: 100%;
      position: fixed;
      top: 0px;
      left: 0px;
      background: rgba(0, 0, 0, 0.6);
      z-index: 35;
      &-start {
        width: 400px;
        height: 260px;
        background: #ffffff;
        border-radius: 4px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #333333;
        line-height: 20px;
        text-align: center;
        padding-top: 54px;
        box-sizing: border-box;
        margin: 20vh auto 0px auto;
        .subscribe-cover {
          display: block;
          width: 80px;
          height: 80px;
          margin: 0px auto;
          margin-bottom: 10px;
          background: url('./img/live_start.png') no-repeat;
          background-size: 100%;
          background-position: center;
        }
        span {
          display: block;
          text-align: center;
          margin-bottom: 18px;
          height: 20px;
          line-height: 20px;
        }
        .subscribe-start {
          width: 160px;
          height: 40px;
          background: #fb3a32;
          border-radius: 20px;
          font-size: 14px;
          font-family: PingFangSC-Regular, PingFang SC;
          font-weight: 400;
          color: #ffffff;
          line-height: 40px;
          border: none;
          outline: none;
        }
      }
    }
    &-tab {
      background: #2a2a2a;
      margin: 0px auto;
    }
    .subscribe-img-box-embed {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      background: rgba(0, 0, 0, 0.6);
    }
  }
  @media screen and (max-width: 1366px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 828px;
      margin: 0 auto;
    }
  }

  @media screen and (min-width: 1367px) and (max-width: 1600px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 980px;
      margin: 0 auto;
    }
  }
  @media screen and (min-width: 1601px) and (max-width: 1920px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 1228px;
      margin: 0 auto;
    }
  }
  @media screen and (min-width: 1921px) {
    .vmp-subscribe-body-intro,
    .vmp-subscribe-body-tab {
      width: 1528px;
      margin: 0 auto;
    }
  }
</style>
